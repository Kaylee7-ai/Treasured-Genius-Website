import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireStoreOwner } from '@/lib/store/owner';
import { updateCustomRequestAction } from '../actions';

const statuses = [
  ['new', 'New'],
  ['reviewing', 'Reviewing request'],
  ['quote_sent', 'Quotation sent'],
  ['awaiting_customer_approval', 'Awaiting customer approval'],
  ['approved', 'Approved'],
  ['payment_confirmed', 'Payment confirmed'],
  ['in_production', 'In production'],
  ['ready_for_collection', 'Ready for collection'],
  ['delivered', 'Delivered'],
  ['cancelled', 'Cancelled'],
];

export default async function CustomRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { supabase } = await requireStoreOwner();
  const { data: request, error } = await supabase.from('custom_requests')
    .select('*').eq('id', id).maybeSingle();

  if (error || !request) notFound();

  const artwork = await Promise.all((request.artwork_paths ?? []).map(async (path: string) => {
    const { data } = await supabase.storage.from('tg-custom-artwork')
      .createSignedUrl(path, 60 * 30);
    return { path, signedUrl: data?.signedUrl ?? null };
  }));

  const phone = request.customer_phone.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Hello ${request.customer_name}, this is Treasured Genius regarding your custom request ${request.request_code}.`
  );

  return (
    <section className="admin-content">
      <Link href="/admin/requests" className="admin-back">← All customer requests</Link>
      <div className="admin-heading request-detail-heading">
        <div>
          <p className="eyebrow">CUSTOM REQUEST · {request.request_code}</p>
          <h1>{request.product_label}</h1>
          <p>Received {new Date(request.created_at).toLocaleString('en-GH', {
            dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Accra',
          })}</p>
        </div>
        <a className="admin-primary" href={`https://wa.me/${phone}?text=${message}`}
          target="_blank" rel="noreferrer">Message customer ↗</a>
      </div>

      {query.saved && <p className="admin-success" role="status">Request updated.</p>}
      {query.error && <p className="admin-error" role="alert">The request could not be updated. Check the quotation and status fields.</p>}

      <div className="request-detail-grid">
        <div className="request-detail-card">
          <p className="eyebrow">CUSTOMER DETAILS</p>
          <dl>
            <dt>Name</dt><dd>{request.customer_name}</dd>
            <dt>Phone</dt><dd>{request.customer_phone}</dd>
            {request.customer_email && <><dt>Email</dt><dd>{request.customer_email}</dd></>}
            <dt>Quantity</dt><dd>{request.quantity}</dd>
            <dt>Occasion</dt><dd>{request.occasion || 'Not specified'}</dd>
            <dt>Requested date</dt><dd>{request.requested_date || 'Not specified'}</dd>
          </dl>
        </div>
        <div className="request-detail-card">
          <p className="eyebrow">CUSTOMISATION DETAILS</p>
          <dl>
            <dt>Item</dt><dd>{request.product_label}</dd>
            {request.item_description && <><dt>Other item description</dt><dd>{request.item_description}</dd></>}
            <dt>Design</dt><dd>{request.design_type}</dd>
            {request.artwork_description && <><dt>Artwork instructions</dt><dd>{request.artwork_description}</dd></>}
            <dt>Placement</dt><dd>{request.design_placement || 'Not specified'}</dd>
            <dt>Extra instructions</dt><dd>{request.extra_notes || 'None'}</dd>
          </dl>
        </div>
      </div>

      <div className="request-detail-card artwork-card">
        <p className="eyebrow">CUSTOMER ARTWORK · PRIVATE FILES</p>
        {artwork.length ? (
          <div className="request-artwork-list">
            {artwork.map((file, index) => (
              <div className="request-artwork-item" key={file.path}>
                <span>Attachment {index + 1} · {file.path.split('/').pop()}</span>
                {file.signedUrl
                  ? <a href={file.signedUrl} target="_blank" rel="noreferrer">Open securely ↗</a>
                  : <small>Preview unavailable</small>}
              </div>
            ))}
          </div>
        ) : <p className="admin-muted">No file was attached. The customer may still provide artwork in a follow-up conversation.</p>}
        <p className="admin-muted">These file links expire after 30 minutes and are not public gallery URLs.</p>
      </div>

      <form action={updateCustomRequestAction} className="request-update-form">
        <input type="hidden" name="id" value={request.id} />
        <p className="eyebrow">OWNER WORKFLOW</p>
        <h2>Update this request</h2>
        <div className="admin-form-row">
          <label>Status
            <select name="status" defaultValue={request.status}>
              {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Quotation (GH₵) · optional
            <input name="quoted_price_ghs" type="number" min="0" step="0.01"
              defaultValue={request.quoted_price_ghs ?? ''} />
          </label>
        </div>
        <label>Private staff notes
          <textarea name="admin_notes" rows={4} maxLength={4000}
            defaultValue={request.admin_notes ?? ''}
            placeholder="Record supplier checks, production notes, follow-up actions or internal reminders." />
        </label>
        <button className="admin-primary" type="submit">Save request update ↗</button>
      </form>
    </section>
  );
}
