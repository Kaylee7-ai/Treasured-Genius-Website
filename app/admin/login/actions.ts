'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getOwnerEmails } from '@/lib/store/owner';

export async function signInAction(formData: FormData) {
  const emailValue = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
    || password.length < 8
    || password.length > 128
  ) {
    redirect('/admin/login?reason=invalid');
  }

  if (!getOwnerEmails().includes(emailValue)) {
    redirect('/admin/login?reason=not-authorized');
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/admin/login?reason=not-configured');

  const { error } = await supabase.auth.signInWithPassword({
    email: emailValue,
    password,
  });

  if (error) redirect('/admin/login?reason=invalid');
  redirect('/admin');
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect('/admin/login');
}
