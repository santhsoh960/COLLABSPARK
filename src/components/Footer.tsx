import Link from 'next/link';
import { InstagramIcon, YoutubeIcon, TwitterIcon } from '@/components/SocialIcons';

export default function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔥</span>
              <span className="text-xl font-bold font-heading gradient-text">
                CollabSpark
              </span>
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-md">
              India&apos;s #1 platform for content creators to find
              collaboration partners. Connect with dancers, singers, editors,
              videographers and more in your city.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center hover:border-coral/40 hover:bg-coral/10 transition-all"
              >
                <InstagramIcon className="w-4 h-4 text-muted hover:text-coral" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center hover:border-coral/40 hover:bg-coral/10 transition-all"
              >
                <YoutubeIcon className="w-4 h-4 text-muted hover:text-coral" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center hover:border-coral/40 hover:bg-coral/10 transition-all"
              >
                <TwitterIcon className="w-4 h-4 text-muted hover:text-coral" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/discover"
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  Discover Creators
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} CollabSpark. Made with ❤️ for Indian
            creators.
          </p>
          <p className="text-xs text-muted">
            Find your perfect collab partner 🔥
          </p>
        </div>
      </div>
    </footer>
  );
}
