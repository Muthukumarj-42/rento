import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { CategoryGrid } from '@/components/landing/CategoryGrid';
import { FeaturedProducts } from '@/components/landing/FeaturedProducts';
import { PopularNearYou } from '@/components/landing/PopularNearYou';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { TrustSafety } from '@/components/landing/TrustSafety';
import { Testimonials } from '@/components/landing/Testimonials';
import { OwnerCTA } from '@/components/landing/OwnerCTA';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Rento — Rent Anything Nearby in Coimbatore',
  description: 'Rent cameras, drones, bikes, tools, event equipment, and more from verified owners near you in Coimbatore. Secure payments, starting from ₹299/day.',
  alternates: {
    canonical: 'https://rento.in',
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_completed')
      .eq('id', user.id)
      .single();

    if (!profile?.onboarding_completed) {
      redirect('/onboarding');
    } else if (profile.role === 'owner') {
      redirect('/owner');
    } else {
      redirect('/browse');
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CategoryGrid />
        <FeaturedProducts />
        <PopularNearYou />
        <HowItWorks />
        <TrustSafety />
        <OwnerCTA />
        <Testimonials />
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
