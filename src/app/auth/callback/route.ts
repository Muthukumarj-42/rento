import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, onboarding_completed')
          .eq('id', user.id)
          .single();

        if (!profile) {
          // Create new user profile automatically
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            role: 'customer',
            onboarding_completed: false,
          });
          return NextResponse.redirect(`${origin}/onboarding`);
        }

        if (!profile.onboarding_completed) {
           return NextResponse.redirect(`${origin}/onboarding`);
        }

        const role = profile.role;
        if (role === 'owner') return NextResponse.redirect(`${origin}/owner`);
        if (role === 'admin') return NextResponse.redirect(`${origin}/admin`);
        
        return NextResponse.redirect(`${origin}/browse`);
      }

      return NextResponse.redirect(`${origin}/browse`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
