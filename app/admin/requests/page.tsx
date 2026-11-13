import Link from 'next/link';
import { requireStoreOwner } from '@/lib/store/owner';

const labels: Record<string, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  quote_sent: 'Quote sent',
  awaiting_customer_approval: 'Awaiting approval',
  approved: 'Approved',
  payment_confirmed: 'Payment confirmed',
  in_production: 'In production',
  ready_for_collection: 'Ready for collection',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireStoreOwner();
  let query = supabase.from('custom_requests')
    .select('id,request_code,customer_name,customer_phone,product_label,quantity,status,created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (params.status && Object.hasOwn(labels, params.status)) {
    query = query.eq('status', params.status);
  }

  const { data: requests, error } = await query;

  return (
    <section className="admin-content">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">CUSTOMER ENQUIRIES</p>
          <h1>Custom requests</h1>
          <p>Review submitted ideas, artwork, quotations and production progress.</p>
        </div>
      </div>

      <div className="request-filters">
        <Link className={!params.status ? 'selected' : ''} href="/admin/requests">All requests</Link>
        <Link className={params.status === 'new' ? 'selected' : ''} href="/admin/requests?status=new">New</Link>
        <Link className={params.status === 'reviewing' ? 'selected' : ''} href="/admin/requests?status=reviewing">Reviewing</Link>
        <Link className={params.status === 'in_production' ? 'selected' : ''} href="/admin/requests?status=in_production">In production</Link>
        <Link className={params.status === 'ready_for_collection' ? 'selected' : ''} href="/admin/requests?status=ready_for_collection">Ready</Link>
      </div>

      {error && <p className="admin-error">Requests could not be loaded. Check that the Treasured Genius database migration has been applied.</p>}

      <div className="admin-table-wrap">
        <table className="admin-table request-table">
          <thead><tr><th>Reference</th><th>Customer</th><th>Requested item</th><th>Quantity</th><th>Status</th><th>Received</th><th /></tr></thead>
          <tbody>
            {(requests ?? []).map((request) => (
              <tr key={request.id}>
                <td><strong>{request.request_code}</strong></td>
                <td><strong>{request.customer_name}</strong><small>{request.customer_phone}</small></td>
                <td>{request.product_label}</td>
                <td>{request.quantity}</td>
                <td><span className={`request-status status-${request.status}`}>{labels[request.status] ?? request.status}</span></td>
                <td>{new Date(request.created_at).toLocaleString('en-GH', {
                  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Accra',
                })}</td>
                <td><Link className="admin-table-link" href={`/admin/requests/${request.id}`}>Open ↗</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!requests?.length && !error && (
          <div className="admin-empty">
            <h2>No requests found.</h2>
            <p>New customer enquiries will appear here after the secure inbox is connected.</p>
          </div>
        )}
      </div>
    </section>
  );
}
