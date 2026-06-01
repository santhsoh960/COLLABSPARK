'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Bell,
  MessageCircle,
  Search,
  Menu,
  X,
  LogOut,
  User,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

// ============================================================
// Landing Navbar (for unauthenticated users)
// ============================================================
export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark/90 backdrop-blur-lg border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🔥</span>
            <span className="text-xl sm:text-2xl font-bold font-heading gradient-text group-hover:opacity-90 transition-opacity">
              CollabSpark
            </span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="btn-outline text-sm px-4 py-2 sm:px-5 sm:py-2.5"
            >
              Login
            </Link>
            <Link href="/signup" className="btn-gradient text-sm px-4 py-2 sm:px-5 sm:py-2.5">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// App Navbar (for authenticated users)
// ============================================================
export function AppNavbar() {
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch unread counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!profile) return;

      const [notifResult, msgResult] = await Promise.all([
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('is_read', false),
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', profile.id)
          .eq('is_read', false),
      ]);

      setUnreadNotifications(notifResult.count || 0);
      setUnreadMessages(msgResult.count || 0);
    };

    fetchUnreadCounts();

    // Subscribe to realtime updates
    const notifChannel = supabase
      .channel('navbar-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile?.id}`,
        },
        () => {
          setUnreadNotifications((prev) => prev + 1);
        }
      )
      .subscribe();

    const msgChannel = supabase
      .channel('navbar-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${profile?.id}`,
        },
        () => {
          setUnreadMessages((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [profile, supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/discover?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-lg border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/discover"
            className="flex items-center gap-2 shrink-0"
          >
            <span className="text-xl">🔥</span>
            <span className="text-lg font-bold font-heading gradient-text hidden sm:block">
              CollabSpark
            </span>
          </Link>

          {/* Search Bar — hidden on mobile */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-md mx-6"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search by name, city, or creator type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-dark-hover border border-dark-border text-sm text-white placeholder-muted focus:outline-none focus:border-coral/50 transition-colors"
              />
            </div>
          </form>

          {/* Right side icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl hover:bg-dark-hover transition-colors"
            >
              <Bell className="w-5 h-5 text-muted hover:text-white transition-colors" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-coral text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Link>

            {/* Messages */}
            <Link
              href="/messages"
              className="relative p-2 rounded-xl hover:bg-dark-hover transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-muted hover:text-white transition-colors" />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-hover transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-orange-warm overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                      {profile?.display_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <ChevronDown className="w-3 h-3 text-muted hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-dark-card border border-dark-border shadow-2xl animate-scale-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-dark-border">
                    <p className="text-sm font-semibold truncate">
                      {profile?.display_name || 'Creator'}
                    </p>
                    <p className="text-xs text-muted truncate">
                      @{profile?.username || 'username'}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/my-profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-dark-hover transition-colors"
                      onClick={() => setProfileDropdown(false)}
                    >
                      <User className="w-4 h-4 text-muted" />
                      My Profile
                    </Link>
                    <Link
                      href="/my-collabs"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-dark-hover transition-colors"
                      onClick={() => setProfileDropdown(false)}
                    >
                      <Sparkles className="w-4 h-4 text-muted" />
                      My Collabs
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        signOut();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-coral hover:bg-dark-hover transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-dark-hover transition-colors md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-hover border border-dark-border text-sm text-white placeholder-muted focus:outline-none focus:border-coral/50"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
