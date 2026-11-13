import type { Metadata } from 'next';
import Link from 'next/link';
import { isStoreConfigured } from '@/lib/supabase/config';
import { getOwnerEmails } from '@/lib/store/owner';
import { signInAction } from './actions';

export const metadata: Metadata = {
  title: 'Owner Login',
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const configured = isStoreConfigured() && getOwnerEmails().length > 0;
  const messages: Record<string, string> = {
    'not-authorized': 'This account is not authorised for the owner workspace.',
    invalid: 'The email or password could not be verified.',
    'not-configured': 'Owner access is not configured yet. Please complete the setup steps in the project README.',
  };

  return (
    <main className="admin-login-page">
      <Link href="/" className="store-brand">TREASURED <i>GENIUS</i></Link>
      <section className="admin-login-card">
        <p className="eyebrow">PRIVATE BUSINESS ACCESS</p>
        <h1>Owner sign in</h1>
        <p>Sign in with the account created and authorised by the Treasured Genius owner.</p>
        {reason && <p className="admin-error" role="alert">{messages[reason] ?? messages.invalid}</p>}
        {!configured ? (
          <div className="admin-notice">
            <strong>Owner workspace is not connected yet.</strong>
            <p>Add the Treasured Genius Supabase URL, publishable key, server-only secret key and authorised owner email to the deployment environment. Then apply the database migration and create the owner Auth account.</p>
          </div>
        ) : (
          <form action={signInAction}>
            <label>Email address<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
            <label>Password<input name="password" type="password" autoComplete="current-password" required minLength={8} maxLength={128} /></label>
            <button className="admin-primary" type="submit">Sign in securely ↗</button>
          </form>
        )}
      </section>
    </main>
  );
}
