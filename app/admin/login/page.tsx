import type { Metadata } from 'next';
import Link from 'next/link';
import { isStoreConfigured } from '@/lib/supabase/config';
import { signInAction } from './actions';
export const metadata: Metadata = { title: 'Owner Login', robots: { index: false, follow: false } };
export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const ready = isStoreConfigured() && Boolean(process.env.STORE_OWNER_EMAILS?.trim());
  const message = reason === 'not-authorized' ? 'This account is not on the owner access list.' : reason === 'invalid' ? 'The email or password could not be verified.' : '';
  return <main className="admin-login-page"><Link href="/" className="store-brand">TREASURED <i>GENIUS</i></Link><section className="admin-login-card"><p className="eyebrow">PRIVATE ACCESS</p><h1>Owner sign in</h1>{!ready ? <div className="admin-notice"><strong>Store admin is not configured yet.</strong><p>Add the Supabase project URL, anon key and STORE_OWNER_EMAILS to the deployment environment, then run the database migration.</p></div> : <><p>Sign in with an authorised owner account.</p>{message && <p className="admin-error" role="alert">{message}</p>}<form action={signInAction}><label>Email address<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label><button className="admin-primary" type="submit">Sign in securely ↗</button></form></>}</section></main>;
}
