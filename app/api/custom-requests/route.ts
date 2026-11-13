import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const STATUSES = ['new'];
const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
};

function clean(value: unknown, max = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function sendOwnerNotification(requestCode: string, details: {
  customerName: string;
  customerPhone: string;
  productLabel: string;
  designType: string;
  quantity: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.STORE_OWNER_NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !to || !from) return;

  const text = [
    `A new Treasured Genius custom request has arrived: ${requestCode}`,
    '',
    `Customer: ${details.customerName}`,
    `Phone: ${details.customerPhone}`,
    `Requested item: ${details.productLabel}`,
    `Design: ${details.designType}`,
    `Quantity: ${details.quantity}`,
    '',
    'Sign in to the Treasured Genius owner workspace to review the details and private artwork.',
  ].join('\n');

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New custom request ${requestCode}`,
        text,
      }),
      cache: 'no-store',
    });
  } catch {
    // The enquiry is already saved; notification failures must not discard a request.
  }
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({
      error: 'The secure online request inbox is not configured yet. Please send the request through WhatsApp instead.',
    }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: quietly ignore automated submissions that fill this field.
  if (clean(body.websiteUrl, 200)) {
    return NextResponse.json({ ok: true, requestCode: 'TG-RECEIVED' });
  }

  const requestKey = clean(body.requestKey, 64);
  const customerName = clean(body.customerName, 120);
  const customerPhone = clean(body.customerPhone, 40);
  const customerEmail = clean(body.customerEmail, 254);
  const productLabel = clean(body.productLabel, 160);
  const productId = clean(body.productId, 64);
  const itemDescription = clean(body.itemDescription, 2000);
  const designType = clean(body.designType, 120);
  const artworkDescription = clean(body.artworkDescription, 2000);
  const designPlacement = clean(body.designPlacement, 120);
  const occasion = clean(body.occasion, 120);
  const requestedDate = clean(body.requestedDate, 10);
  const extraNotes = clean(body.extraNotes, 3000);
  const quantity = Number(body.quantity);
  const artworkPaths = Array.isArray(body.artworkPaths)
    ? body.artworkPaths.filter((path): path is string => typeof path === 'string')
    : [];

  if (
    !validUuid(requestKey)
    || customerName.length < 2
    || customerPhone.length < 7
    || productLabel.length < 2
    || !designType
    || !Number.isInteger(quantity) || quantity < 1 || quantity > 500
    || itemDescription.length > 2000
    || artworkDescription.length > 2000
    || extraNotes.length > 3000
    || (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
    || (requestedDate && !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate))
    || artworkPaths.length > MAX_FILES
    || artworkPaths.some((path) => !path.startsWith(`incoming/${requestKey}/`)
      || path.includes('..') || path.slice(`incoming/${requestKey}/`.length).includes('/'))
  ) {
    return NextResponse.json({ error: 'Please check the required fields and attached files.' }, { status: 400 });
  }

  const requestCode = `TG-${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;

  if (artworkPaths.length) {
    const folder = `incoming/${requestKey}`;
    const { data: uploadedFiles, error: listError } = await supabase.storage
      .from('tg-custom-artwork')
      .list(folder, { limit: MAX_FILES });

    if (listError || !uploadedFiles) {
      return NextResponse.json({ error: 'We could not verify the artwork upload. Please try again.' }, { status: 400 });
    }

    const uploadedNames = new Map(uploadedFiles.map((file) => [file.name, file]));
    for (const path of artworkPaths) {
      const fileName = path.slice(`incoming/${requestKey}/`.length);
      const file = uploadedNames.get(fileName);
      const size = Number(file?.metadata?.size ?? 0);
      const contentType = String(file?.metadata?.mimetype ?? '');
      if (!file || size <= 0 || size > MAX_FILE_BYTES || !MIME_EXTENSIONS[contentType]) {
        await supabase.storage.from('tg-custom-artwork').remove(artworkPaths);
        return NextResponse.json({ error: 'One of the uploaded files is invalid or too large.' }, { status: 400 });
      }
    }
  }

  let linkedProductId: string | null = null;
  if (productId && validUuid(productId)) {
    const { data: product } = await supabase.from('products')
      .select('id,name').eq('id', productId).eq('is_active', true).maybeSingle();
    if (product) {
      linkedProductId = product.id;
    }
  }

  const { error: insertError } = await supabase.from('custom_requests').insert({
    request_code: requestCode,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail || null,
    product_id: linkedProductId,
    product_label: productLabel,
    item_description: itemDescription || null,
    design_type: designType,
    artwork_description: artworkDescription || null,
    design_placement: designPlacement || null,
    quantity,
    occasion: occasion || null,
    requested_date: requestedDate || null,
    extra_notes: extraNotes || null,
    artwork_paths: artworkPaths,
    status: STATUSES[0],
  });

  if (insertError) {
    if (artworkPaths.length) {
      await supabase.storage.from('tg-custom-artwork').remove(artworkPaths);
    }
    return NextResponse.json({ error: 'We could not save the request. Please try again or contact the shop.' }, { status: 500 });
  }

  await sendOwnerNotification(requestCode, {
    customerName,
    customerPhone,
    productLabel,
    designType,
    quantity,
  });

  return NextResponse.json({ ok: true, requestCode });
}
