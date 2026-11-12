'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getOwnerEmails } from '@/lib/store/owner';
const schema = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128) });
export async function signInAction(formData: FormData) {
  const parsed = schema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) redirect('/admin/login?reason=invalid');
  const email = parsed.data.email.toLowerCase();
  if (!getOwnerEmails().includes(email)) redirect('/admin/login?reason=not-authorized');
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/admin/login?reason=not-configured');
  const { error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error) redirect('/admin/login?reason=invalid');
  redirect('/admin');
}
export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect('/admin/login');
}
