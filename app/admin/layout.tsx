import type { Metadata } from 'next';
import Link from 'next/link';
import { requireStoreOwner } from '@/lib/store/owner';
import { signOutAction } from './login/actions';
export const metadata: Metadata = { title: 'Private Store Admin', robots: { index: false, follow: false, noarchive: true } };
export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireStoreOwner();
  return <div className="admin-shell"><aside className="admin-sidebar"><Link href="/admin" className="admin-brand">TREASURED <i>GENIUS</i><small>PRIVATE STORE</small></Link><nav><Link href="/admin">Products</Link><Link href="/shop" target="_blank">View shop ↗</Link></nav><form action={signOutAction}><button type="submit" className="admin-signout">Sign out</button></form></aside><main className="admin-main">{children}</main></div>;
}
