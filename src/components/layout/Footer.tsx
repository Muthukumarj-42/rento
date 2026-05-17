import Link from 'next/link';
import { Share2, MessageCircle, Send, PlayCircle, MapPin, Phone, Mail } from 'lucide-react';

const FOOTER_LINKS = {
  Platform: [
    { label: 'Browse All', href: '/browse' },
    { label: 'List an Item', href: '/owner/listings/new' },
    { label: 'Become an Owner', href: '/owner' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Connect: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press Kit', href: '/press' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Safety & Trust', href: '/safety' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Community Guidelines', href: '/guidelines' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-black text-white">Rento</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              India&apos;s modern rental marketplace. Rent anything nearby from trusted, verified owners. Starting from ₹299/day.
            </p>
            <div className="flex flex-col gap-2 text-sm mb-6">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-blue-500 flex-shrink-0" />
                <span>Coimbatore, Tamil Nadu, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-blue-500 flex-shrink-0" />
                <a href="tel:+91-XXXXXXXXXX" className="hover:text-white transition-colors">+91 XXXXXXXXXX</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-blue-500 flex-shrink-0" />
                <a href="mailto:hello@rento.in" className="hover:text-white transition-colors">hello@rento.in</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {[
                { Icon: MessageCircle, href: 'https://instagram.com/rento.in' },
                { Icon: Send, href: 'https://twitter.com/rentoin' },
                { Icon: Share2, href: 'https://facebook.com/rento.in' },
                { Icon: PlayCircle, href: 'https://youtube.com/@rento' },
              ].map(({ Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-blue-600 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 text-sm">{title}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© 2024 Rento. All rights reserved. Built for India.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <span className="text-gray-600">🇮🇳 India · ₹ INR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
