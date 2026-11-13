import Link from 'next/link';
import { requireStoreOwner } from '@/lib/store/owner';

const VERCEL_PROJECT_URL = 'https://vercel.com/kaylee7-ai/treasured-genius-website';

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

export default async function AdminHome() {
  const { supabase, user } = await requireStoreOwner();
  const [
    { count: requestCount },
    { count: newCount },
    { count: productionCount },
    { count: productCount },
    { count: publishedCount },
    { data: recentRequests },
  ] = await Promise.all([
    supabase.from('custom_requests').select('id', { count: 'exact', head: true }),
    supabase.from('custom_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('custom_requests').select('id', { count: 'exact', head: true }).eq('status', 'in_production'),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('custom_requests')
      .select('id,request_code,customer_name,product_label,status,created_at')
      .order('created_at', { ascending: false }).limit(6),
  ]);

  return (
    <section className="admin-content">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">TREASURED GENIUS · OWNER WORKSPACE</p>
          <h1>Business overview</h1>
          <p>Signed in as {user.email}. Here is the latest activity in your online store.</p>
        </div>
        <Link href="/shop" className="admin-secondary" target="_blank">View public website ↗</Link>
      </div>

      <div className="admin-stats admin-stats-five">
        <div><span>Total custom requests</span><strong>{requestCount ?? 0}</strong></div>
        <div><span>New requests</span><strong>{newCount ?? 0}</strong></div>
        <div><span>In production</span><strong>{productionCount ?? 0}</strong></div>
        <div><span>All gallery items</span><strong>{productCount ?? 0}</strong></div>
        <div><span>Published gallery items</span><strong>{publishedCount ?? 0}</strong></div>
      </div>

      <div className="admin-overview-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div><p className="eyebrow">LATEST CUSTOMER ACTIVITY</p><h2>Recent requests</h2></div>
            <Link href="/admin/requests">View all ↗</Link>
          </div>
          {recentRequests?.length ? (
            <div className="recent-request-list">
              {recentRequests.map((request) => (
                <Link href={`/admin/requests/${request.id}`} className="recent-request" key={request.id}>
                  <span><strong>{request.request_code}</strong><small>{request.customer_name} · {request.product_label}</small></span>
                  <span className={`request-status status-${request.status}`}>{labels[request.status] ?? request.status}</span>
                </Link>
              ))}
            </div>
          ) : <p className="admin-muted">New custom requests will appear here when the secure inbox is connected.</p>}
        </section>

        <section className="admin-panel admin-quick-actions">
          <p className="eyebrow">KEEP YOUR WEBSITE CURRENT</p>
          <h2>Quick actions</h2>
          <Link href="/admin/products/new" className="admin-action-card">
            <strong>Add a product or sample gift</strong>
            <span>Upload photographs, details and personalisation options ↗</span>
          </Link>
          <Link href="/admin/requests" className="admin-action-card">
            <strong>Review customer requests</strong>
            <span>Open artwork, send quotations and update progress ↗</span>
          </Link>
          <Link href="/admin/products" className="admin-action-card">
            <strong>Manage the public gallery</strong>
            <span>Publish, hide or update existing examples ↗</span>
          </Link>
          <Link href="/admin/settings" className="admin-action-card">
            <strong>Update business information</strong>
            <span>Contact number, opening details and delivery information ↗</span>
          </Link>
        </section>
      </div>

      <section className="admin-panel admin-analytics-panel">
        <div><p className="eyebrow">WEBSITE TRAFFIC</p><h2>Visitor analytics</h2>
          <p className="admin-muted">Track page views, popular pages, referrals and visitor trends in Vercel Web Analytics.</p></div>
        <a className="admin-secondary" href={VERCEL_PROJECT_URL} target="_blank" rel="noreferrer">Open Vercel project ↗</a>
      </section>
      <p className="admin-footnote">Customer enquiries and gallery activity are tracked in this workspace. Visitor statistics are provided by the connected Vercel Analytics dashboard.</p>
    </section>
  );
}
