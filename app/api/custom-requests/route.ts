import { createHmac, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
};

function text(value: FormDataEntryValue | null, max = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function fileHasValidSignature(file: File, bytes: Uint8Array) {
  const type = file.type;
  if (type === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === 'image/png') {
    return bytes.length >= 8
      && bytes[0] === 0x89 && bytes[1] === 0x50
      && bytes[2] === 0x4e && bytes[3] === 0x47
      && bytes[4] === 0x0d && bytes[5] === 0x0a
      && bytes[6] === 0x1a && bytes[7] === 0x0a;
  }
  if (type === 'image/webp') {
    return bytes.length >= 12
      && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF'
      && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  }
  if (type === 'image/avif') {
    return bytes.length >= 12
      && String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp'
      && ['avif', 'avis', 'mif1'].includes(String.fromCharCode(...bytes.slice(8, 12)));
  }
  if (type === 'application/pdf') {
    return bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';
  }
  return false;
}

function getRateLimitHash(request: Request) {
  const secret = process.env.CUSTOM_REQUEST_RATE_LIMIT_SECRET
    ?? process.env.SUPABASE_SECRET_KEY
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) return null;

  const forwarded = request.headers.get('x-vercel-forwarded-for')
    ?? request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')
    ?? 'unknown';
  const address = forwarded.split(',')[0].trim().slice(0, 100) || 'unknown';

  return createHmac('sha256', secret).update(address).digest('hex');
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

  const textBody = [
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
        text: textBody,
      }),
      cache: 'no-store',
    });
  } catch {
    // The request has already been saved; email failures must not discard it.
  }
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({
      error: 'The secure online request inbox is not configured yet. Please send your request through WhatsApp instead.',
    }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'The request could not be read. Please try again.' }, { status: 400 });
  }

  // Honeypot: quietly ignore automated submissions that fill this hidden field.
  if (text(form.get('websiteUrl'), 200)) {
    return NextResponse.json({ ok: true, requestCode: 'TG-RECEIVED' });
  }

  const customerName = text(form.get('customerName'), 120);
  const customerPhone = text(form.get('customerPhone'), 40);
  const customerEmail = text(form.get('customerEmail'), 254);
  const productLabel = text(form.get('productLabel'), 160);
  const productId = text(form.get('productId'), 64);
  const itemDescription = text(form.get('itemDescription'), 2000);
  const designType = text(form.get('designType'), 120);
  const artworkDescription = text(form.get('artworkDescription'), 2000);
  const designPlacement = text(form.get('designPlacement'), 120);
  const occasion = text(form.get('occasion'), 120);
  const requestedDate = text(form.get('requestedDate'), 10);
  const extraNotes = text(form.get('extraNotes'), 3000);
  const quantity = Number(form.get('quantity'));
  const files = form.getAll('artwork').filter(
    (entry): entry is File => typeof File !== 'undefined' && entry instanceof File && entry.size > 0,
  );

  if (
    customerName.length < 2
    || customerPhone.length < 7
    || productLabel.length < 2
    || !designType
    || !Number.isInteger(quantity) || quantity < 1 || quantity > 500
    || (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
    || (requestedDate && !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate))
    || (productId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId))
    || files.length > MAX_FILES
    || files.some((file) => !MIME_EXTENSIONS[file.type] || file.size > MAX_FILE_BYTES)
    || files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_BYTES
  ) {
    return NextResponse.json({ error: 'Please check the required fields and attached files.' }, { status: 400 });
  }

  if (designType === 'My own artwork' && !artworkDescription) {
    return NextResponse.json({ error: 'Please describe your artwork.' }, { status: 400 });
  }
  if (productLabel === 'Something else' && !itemDescription) {
    return NextResponse.json({ error: 'Please describe the item you have in mind.' }, { status: 400 });
  }

  const ipHash = getRateLimitHash(request);
  if (!ipHash) {
    return NextResponse.json({ error: 'Secure request protection is not configured. Please use WhatsApp for now.' }, { status: 503 });
  }

  const { data: allowed, error: rateLimitError } = await supabase.rpc(
    'check_custom_request_rate_limit',
    { p_ip_hash: ipHash },
  );
  if (rateLimitError || allowed !== true) {
    const status = rateLimitError ? 503 : 429;
    return NextResponse.json({
      error: rateLimitError
        ? 'The secure request inbox is temporarily unavailable. Please contact the shop.'
        : 'Too many requests have been sent from this connection. Please try again later.',
    }, { status });
  }

  let linkedProductId: string | null = null;
  if (productId) {
    const { data: product } = await supabase.from('products')
      .select('id').eq('id', productId).eq('is_active', true).maybeSingle();
    if (product) linkedProductId = product.id;
  }

  const requestCode = `TG-${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
  const artworkPaths: string[] = [];

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!fileHasValidSignature(file, bytes)) {
      if (artworkPaths.length) {
        await supabase.storage.from('tg-custom-artwork').remove(artworkPaths);
      }
      return NextResponse.json({ error: 'One of the selected files does not match its file type.' }, { status: 400 });
    }

    const path = `requests/${requestCode}/${randomUUID()}.${MIME_EXTENSIONS[file.type]}`;
    const { error: uploadError } = await supabase.storage.from('tg-custom-artwork')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      if (artworkPaths.length) {
        await supabase.storage.from('tg-custom-artwork').remove(artworkPaths);
      }
      return NextResponse.json({ error: 'An artwork file could not be saved securely. Please try again.' }, { status: 500 });
    }
    artworkPaths.push(path);
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
    status: 'new',
  });

  if (insertError) {
    if (artworkPaths.length) {
      await supabase.storage.from('tg-custom-artwork').remove(artworkPaths);
    }
    return NextResponse.json({ error: 'We could not save your request. Please try again or contact the shop.' }, { status: 500 });
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
