import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ownerEmails = () => (process.env.STORE_OWNER_EMAILS ?? '').split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname === '/admin/login') return NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !ownerEmails().length) return NextResponse.redirect(new URL('/admin/login?reason=not-configured', request.url));
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll: (items) => {
      items.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    },
  }});
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !ownerEmails().includes(user.email.toLowerCase())) return NextResponse.redirect(new URL('/admin/login?reason=not-authorized', request.url));
  return response;
}
export const config = { matcher: ['/admin/:path*'] };
