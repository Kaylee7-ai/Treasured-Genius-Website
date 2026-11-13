import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getOwnerEmails } from '@/lib/store/owner';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || getOwnerEmails().length === 0) {
    return NextResponse.redirect(new URL('/admin/login?reason=not-configured', request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase();

  if (error || !email || !getOwnerEmails().includes(email)) {
    return NextResponse.redirect(new URL('/admin/login?reason=not-authorized', request.url));
  }

  return response;
}

export const config = { matcher: ['/admin/:path*'] };
