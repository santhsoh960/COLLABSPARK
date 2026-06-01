import Link from 'next/link';
import { LandingNavbar } from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowRight,
  Sparkles,
  Search,
  Handshake,
  Users,
  Star,
  Quote,
} from 'lucide-react';
import { CREATOR_TYPES } from '@/lib/types';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    city: 'Mumbai',
    type: 'Dancer 💃',
    quote:
      'Found an amazing videographer through CollabSpark! Our dance reel got 2M views. This platform is a game changer for creators.',
    avatar: 'PS',
  },
  {
    name: 'Rahul Verma',
    city: 'Delhi',
    type: 'Comedian 😂',
    quote:
      'I was struggling to find editors for my sketches. CollabSpark connected me with the perfect video editor in my city within days!',
    avatar: 'RV',
  },
  {
    name: 'Ananya Krishnan',
    city: 'Bangalore',
    type: 'Singer 🎤',
    quote:
      'As a musician, finding the right collaborator is everything. CollabSpark made it so easy to connect with videographers and dancers.',
    avatar: 'AK',
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-dark">
      <LandingNavbar />

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-coral/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-warm/10 rounded-full blur-[150px] animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/10 border border-coral/20 text-coral text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              India&apos;s #1 Creator Collaboration Platform
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Find Your Perfect{' '}
              <span className="gradient-text">Collab Partner</span>{' '}
              <span className="inline-block">🔥</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with creators, dancers, editors, and more in your city.
              Stop waiting for the right collab — go find it.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="btn-gradient text-base px-8 py-4 rounded-2xl flex items-center gap-2 group w-full sm:w-auto justify-center"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="btn-outline text-base px-8 py-4 rounded-2xl w-full sm:w-auto text-center"
              >
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS */}
      {/* ============================================ */}
      <section id="how-it-works" className="py-20 sm:py-28 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              How <span className="gradient-text">CollabSpark</span> Works
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Three simple steps to find your next collaboration partner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                emoji: '🎭',
                title: 'Create Your Profile',
                description:
                  'Tell us who you are, what you create, and what kind of collaborator you\'re looking for.',
                step: '01',
              },
              {
                icon: Search,
                emoji: '🔍',
                title: 'Discover Creators',
                description:
                  'Browse and filter creators by content type, city, and follower count. Find your perfect match.',
                step: '02',
              },
              {
                icon: Handshake,
                emoji: '🤝',
                title: 'Send a Collab Request',
                description:
                  'Connect with creators, share your collab idea, and create something amazing together.',
                step: '03',
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="glass-card p-8 text-center group hover:border-coral/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-coral flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                    {item.emoji}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-xs font-bold text-coral">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CREATOR TYPES */}
      {/* ============================================ */}
      <section className="py-20 sm:py-28 bg-dark-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Find Every Type of{' '}
              <span className="gradient-text">Creator</span>
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Whatever content you create, there&apos;s a collaborator waiting
              for you
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto animate-fade-in">
            {CREATOR_TYPES.map((type, index) => (
              <Link
                key={type.value}
                href="/signup"
                className="creator-pill text-sm hover:scale-105 transition-transform duration-200 cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {type.emoji} {type.value}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SOCIAL PROOF / TESTIMONIALS */}
      {/* ============================================ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Trusted by Creators
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Join{' '}
              <span className="gradient-text">10,000+</span> Creators
            </h2>
            <p className="text-muted">
              Already on CollabSpark, making amazing content together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="glass-card p-6 hover:border-coral/20 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Quote className="w-8 h-8 text-coral/30 mb-4" />
                <p className="text-sm text-muted leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-coral flex items-center justify-center text-sm font-bold text-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted">
                      {testimonial.city} • {testimonial.type}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA SECTION */}
      {/* ============================================ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="glass-card p-10 sm:p-16 relative overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
            <div className="relative">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
                Ready to Find Your{' '}
                <span className="gradient-text">Perfect Collab?</span>
              </h2>
              <p className="text-muted mb-8 max-w-lg mx-auto">
                Join thousands of Indian creators who are already collaborating
                and growing together on CollabSpark.
              </p>
              <Link
                href="/signup"
                className="btn-gradient text-base px-10 py-4 rounded-2xl inline-flex items-center gap-2 group"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
