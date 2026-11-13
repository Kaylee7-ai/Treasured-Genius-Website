'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStoreOwner } from '@/lib/store/owner';

function readText(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}

export async function saveStoreSettingsAction(formData: FormData) {
  const contactPhone = readText(formData, 'contact_phone', 40);
  const openingHours = readText(formData, 'opening_hours', 300);
  const deliveryInformation = readText(formData, 'delivery_information', 1000);
  const serviceInformation = readText(formData, 'service_information', 1000);
  const nfcPayments = formData.get('nfc_mobile_payments') === 'on';

  if (!contactPhone || contactPhone.length < 7) {
    redirect('/admin/settings?error=invalid-phone');
  }

  const { supabase } = await requireStoreOwner();
  const values = [
    { key: 'contact_phone', value: contactPhone },
    { key: 'opening_hours', value: openingHours },
    { key: 'delivery_information', value: deliveryInformation },
    { key: 'service_information', value: serviceInformation },
    { key: 'nfc_mobile_payments', value: nfcPayments },
  ];

  const { error } = await supabase.from('settings').upsert(values, { onConflict: 'key' });
  if (error) redirect('/admin/settings?error=save-failed');

  revalidatePath('/');
  revalidatePath('/admin/settings');
  redirect('/admin/settings?saved=1');
}
