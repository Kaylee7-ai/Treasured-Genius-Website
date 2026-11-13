'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 60_000);
    return () => window.clearInterval(timer);
  }, [router]);

  return <div className="admin-live-status"><span /> Dashboard refreshes every minute</div>;
}
