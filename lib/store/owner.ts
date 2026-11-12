import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export function getOwnerEmails() {
  return (process.env.STORE_OWNER_EMAILS ?? '').split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
}
export async function requireStoreOwner() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/admin/login?reason=not-configured');
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase();
  if (!user || !email || !getOwnerEmails().includes(email)) redirect('/admin/login?reason=not-authorized');
  return { supabase, user };
}
