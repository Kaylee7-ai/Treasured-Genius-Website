import { requireStoreOwner } from '@/lib/store/owner';
import { saveStoreSettingsAction } from './actions';

function settingValue(rows: { key: string; value: unknown }[] | null, key: string, fallback = '') {
  const value = rows?.find((row) => row.key === key)?.value;
  return typeof value === 'string' ? value : fallback;
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireStoreOwner();
  const { data: settings, error } = await supabase
    .from('settings').select('key,value')
    .in('key', [
      'contact_phone',
      'opening_hours',
      'delivery_information',
      'service_information',
      'nfc_mobile_payments',
    ]);

  const nfc = settings?.find((row) => row.key === 'nfc_mobile_payments')?.value === true;
  const errors: Record<string, string> = {
    'invalid-phone': 'Please enter a valid contact number.',
    'save-failed': 'Settings could not be saved. Check the database connection and try again.',
  };

  return (
    <section className="admin-content">
      <p className="eyebrow">PUBLIC WEBSITE INFORMATION</p>
      <h1>Business settings</h1>
      <p className="admin-intro">
        Keep the contact details and service information shown to customers up to date.
        Only publish details that the business has confirmed.
      </p>

      {params.saved && <p className="admin-success" role="status">Business information saved.</p>}
      {params.error && <p className="admin-error" role="alert">{errors[params.error] ?? 'Something went wrong.'}</p>}
      {error && <p className="admin-error">Settings could not be loaded. Apply the Treasured Genius database migration first.</p>}

      <form action={saveStoreSettingsAction} className="admin-settings-form">
        <label>
          Public contact / WhatsApp number
          <input name="contact_phone" type="tel" required maxLength={40}
            defaultValue={settingValue(settings, 'contact_phone', '+233277018939')} />
        </label>
        <label>
          Opening hours
          <textarea name="opening_hours" rows={3} maxLength={300}
            defaultValue={settingValue(settings, 'opening_hours', 'Listed opening time: 8:00 am. Please confirm the day’s hours with the shop.')}
            placeholder="For example: Monday–Saturday, 8:00 am–6:00 pm; Sunday, closed." />
        </label>
        <label>
          Delivery and collection information
          <textarea name="delivery_information" rows={4} maxLength={1000}
            defaultValue={settingValue(settings, 'delivery_information')}
            placeholder="Describe verified delivery areas, collection arrangements, fees or how customers should enquire." />
        </label>
        <label>
          Services and business description
          <textarea name="service_information" rows={4} maxLength={1000}
            defaultValue={settingValue(settings, 'service_information')}
            placeholder="Describe the printing, craft and custom-design services currently offered." />
        </label>
        <div className="admin-checks">
          <label>
            <input type="checkbox" name="nfc_mobile_payments" defaultChecked={nfc} />
            NFC mobile payments accepted
          </label>
        </div>
        <button className="admin-primary" type="submit">Save business information ↗</button>
      </form>
    </section>
  );
}
