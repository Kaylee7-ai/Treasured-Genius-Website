'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { signOutAction } from '@/app/admin/login/actions';
import AdminAutoRefresh from '@/components/AdminAutoRefresh';

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          TREASURED <i>GENIUS</i>
          <small>PRIVATE OWNER WORKSPACE</small>
        </Link>
        <nav aria-label="Owner workspace">
          <Link href="/admin">Overview</Link>
          <Link href="/admin/requests">Customer requests</Link>
          <Link href="/admin/products">Products & designs</Link>
          <Link href="/admin/settings">Business settings</Link>
          <Link href="/shop" target="_blank" rel="noreferrer">View public gallery ↗</Link>
        </nav>
        <form action={signOutAction}>
          <button type="submit" className="admin-signout">Sign out</button>
        </form>
      </aside>
      <main className="admin-main"><AdminAutoRefresh />{children}</main>
    </div>
  );
}
