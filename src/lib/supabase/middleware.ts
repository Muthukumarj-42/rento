import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl || 'https://dummy.supabase.co',
    supabaseKey || 'dummy_anon_key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/owner', '/admin', '/onboarding', '/browse', '/profile'];
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Role-based access control & Onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_completed')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'customer';
    const hasCompletedOnboarding = profile?.onboarding_completed ?? false;

    // Redirect to onboarding if not completed and trying to access protected paths (other than /onboarding)
    if (!hasCompletedOnboarding && !request.nextUrl.pathname.startsWith('/onboarding')) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }

    // Prevent access to onboarding if already completed
    if (hasCompletedOnboarding && request.nextUrl.pathname.startsWith('/onboarding')) {
      const url = request.nextUrl.clone();
      url.pathname = role === 'owner' ? '/owner' : '/browse';
      return NextResponse.redirect(url);
    }

    if (request.nextUrl.pathname.startsWith('/owner') && role !== 'owner' && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'unauthorized_owner');
      return NextResponse.redirect(url);
    }

    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(url);
    }
  } else if (user && request.nextUrl.pathname === '/') {
     // Logged in users shouldn't see the landing page, redirect them based on their role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', user.id)
        .single();
      
      const role = profile?.role || 'customer';
      const hasCompletedOnboarding = profile?.onboarding_completed ?? false;

      const url = request.nextUrl.clone();
      if (!hasCompletedOnboarding) {
        url.pathname = '/onboarding';
      } else {
        url.pathname = role === 'owner' ? '/owner' : '/browse';
      }
      return NextResponse.redirect(url);
  }

  return supabaseResponse;
};
