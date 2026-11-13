'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStoreOwner } from '@/lib/store/owner';

const allowedStatuses = new Set([
  'new',
  'reviewing',
  'quote_sent',
  'awaiting_customer_approval',
  'approved',
  'payment_confirmed',
  'in_production',
  'ready_for_collection',
  'delivered',
  'cancelled',
]);

export async function updateCustomRequestAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();
  const rawQuote = String(formData.get('quoted_price_ghs') ?? '').trim();
  const adminNotes = String(formData.get('admin_notes') ?? '').trim().slice(0, 4000);

  if (!/^[0-9a-f-]{36}$/i.test(id) || !allowedStatuses.has(status)) {
    redirect('/admin/requests?error=invalid-update');
  }

  let quote: number | null = null;
  if (rawQuote) {
    quote = Number(rawQuote);
    if (!Number.isFinite(quote) || quote < 0 || quote > 10000000) {
      redirect(`/admin/requests/${id}?error=invalid-quote`);
    }
  }

  const { supabase } = await requireStoreOwner();
  const { error } = await supabase.from('custom_requests').update({
    status,
    quoted_price_ghs: quote,
    admin_notes: adminNotes || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id);

  if (error) redirect(`/admin/requests/${id}?error=save-failed`);

  revalidatePath('/admin');
  revalidatePath('/admin/requests');
  revalidatePath(`/admin/requests/${id}`);
  redirect(`/admin/requests/${id}?saved=1`);
}
