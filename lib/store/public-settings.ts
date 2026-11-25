import { createSupabaseServerClient } from '@/lib/supabase/server';

export type PublicBusinessSettings = {
  contactPhone: string;
  openingHours: string;
  deliveryInformation: string;
  serviceInformation: string;
  nfcMobilePayments: boolean;
};

export const defaultBusinessSettings: PublicBusinessSettings = {
  contactPhone: '+233 27 701 8939',
  openingHours: 'Listed opening time: 8:00 am. Please confirm the day’s hours with the shop.',
  deliveryInformation: 'Ask the team about current delivery and collection options.',
  serviceInformation: '',
  nfcMobilePayments: true,
};

export async function getPublicBusinessSettings(): Promise<PublicBusinessSettings> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return defaultBusinessSettings;

  try {
    const { data } = await supabase.from('settings').select('key,value').in('key', [
      'contact_phone',
      'opening_hours',
      'delivery_information',
      'service_information',
      'nfc_mobile_payments',
    ]);

    const readString = (key: string, fallback: string) => {
      const value = data?.find((row) => row.key === key)?.value;
      return typeof value === 'string' ? value : fallback;
    };
    const nfcValue = data?.find((row) => row.key === 'nfc_mobile_payments')?.value;

    return {
      contactPhone: readString('contact_phone', defaultBusinessSettings.contactPhone),
      openingHours: readString('opening_hours', defaultBusinessSettings.openingHours),
      deliveryInformation: readString('delivery_information', defaultBusinessSettings.deliveryInformation),
      serviceInformation: readString('service_information', defaultBusinessSettings.serviceInformation),
      nfcMobilePayments: typeof nfcValue === 'boolean' ? nfcValue : defaultBusinessSettings.nfcMobilePayments,
    };
  } catch {
    return defaultBusinessSettings;
  }
}
