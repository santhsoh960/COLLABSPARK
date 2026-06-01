'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppNavbar } from '@/components/Navbar';
import CollabRequestModal from '@/components/CollabRequestModal';
import {
  MapPin,
  Calendar,
  Eye,
  Handshake,
  Link2,
  Share2,
  MessageCircle,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { InstagramIcon as Instagram, YoutubeIcon as Youtube } from '@/components/SocialIcons';
import {
  type Profile,
  getCreatorEmoji,
  getFollowerLabel,
  getFollowerBadgeColor,
} from '@/lib/types';

export default function CreatorProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user } = useAuth();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProfile(data);
        // Increment profile views if not own profile
        if (user && data.id !== user.id) {
          await supabase
            .from('profiles')
            .update({ profile_views: (data.profile_views || 0) + 1 })
            .eq('id', data.id);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [username, user, supabase]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-dark">
        <AppNavbar />
        <div className="pt-20 page-container max-w-4xl">
          <div className="glass-card p-8 animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-32 h-32 rounded-full skeleton shrink-0 mx-auto md:mx-0" />
              <div className="flex-1 space-y-4">
                <div className="w-48 h-6 skeleton" />
                <div className="w-24 h-4 skeleton" />
                <div className="w-32 h-4 skeleton" />
                <div className="w-full h-16 skeleton" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-dark">
        <AppNavbar />
        <div className="pt-20 page-container text-center py-20">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="font-heading text-2xl font-bold mb-2">
            Creator Not Found
          </h2>
          <p className="text-muted mb-6">
            The profile you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/discover" className="btn-gradient text-sm">
            Browse Creators
          </Link>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const isOwnProfile = user?.id === profile.id;
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-dark">
      <AppNavbar />

      <div className="pt-20 page-container max-w-4xl">
        {/* Back button */}
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discover
        </Link>

        {/* Profile Card */}
        <div className="glass-card p-6 sm:p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Avatar */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-coral to-orange-warm p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-dark-card">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/40">
                      {profile.display_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold">
                    {profile.display_name}
                  </h1>
                  <p className="text-muted text-sm">@{profile.username}</p>
                </div>

                {/* Follower badge */}
                {profile.follower_range && (
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getFollowerBadgeColor(
                      profile.follower_range
                    )}`}
                  >
                    {getFollowerLabel(profile.follower_range)} followers
                  </span>
                )}
              </div>

              {/* City */}
              {profile.city && (
                <div className="flex items-center gap-1.5 justify-center md:justify-start mt-2 text-sm text-muted">
                  <MapPin className="w-4 h-4" />
                  {profile.city}, India
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-muted mt-3 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Creator type pills */}
              {profile.creator_types && profile.creator_types.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                  {profile.creator_types.map((type) => (
                    <span key={type} className="creator-pill text-sm">
                      {getCreatorEmoji(type)} {type}
                    </span>
                  ))}
                </div>
              )}

              {/* Social links */}
              <div className="flex items-center gap-3 justify-center md:justify-start mt-4">
                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center hover:border-pink-500/40 hover:bg-pink-500/10 transition-all"
                  >
                    <Instagram className="w-4 h-4 text-pink-400" />
                  </a>
                )}
                {profile.youtube && (
                  <a
                    href={profile.youtube.startsWith('http') ? profile.youtube : `https://${profile.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center hover:border-red-500/40 hover:bg-red-500/10 transition-all"
                  >
                    <Youtube className="w-4 h-4 text-red-400" />
                  </a>
                )}
                {profile.other_social && (
                  <a
                    href={profile.other_social.startsWith('http') ? profile.other_social : `https://${profile.other_social}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center hover:border-blue-500/40 hover:bg-blue-500/10 transition-all"
                  >
                    <Link2 className="w-4 h-4 text-blue-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted mb-1">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold">{memberSince}</p>
            <p className="text-xs text-muted">Member since</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted mb-1">
              <Eye className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold">{profile.profile_views || 0}</p>
            <p className="text-xs text-muted">Profile views</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted mb-1">
              <Handshake className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold">{profile.collabs_done || 0}</p>
            <p className="text-xs text-muted">Collabs</p>
          </div>
        </div>

        {/* Looking for section */}
        {profile.looking_for && profile.looking_for.length > 0 && (
          <div className="glass-card p-6 mt-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="font-heading font-semibold text-lg mb-3">
              Looking to Collab With
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.looking_for.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1.5 rounded-full text-sm bg-accent/10 text-accent border border-accent/20"
                >
                  {getCreatorEmoji(type)} {type}
                </span>
              ))}
            </div>
            {profile.collab_note && (
              <p className="text-sm text-muted mt-4 italic">
                &ldquo;{profile.collab_note}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <button
              onClick={() => setShowCollabModal(true)}
              className="btn-gradient flex-1 py-3.5 text-sm flex items-center justify-center gap-2"
            >
              <Handshake className="w-4 h-4" />
              Send Collab Request 🤝
            </button>
            <Link
              href={`/messages?user=${profile.id}`}
              className="btn-outline flex-1 py-3.5 text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Link>
            <button
              onClick={handleCopyLink}
              className="btn-outline py-3.5 px-4 text-sm flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-accent" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share
                </>
              )}
            </button>
          </div>
        )}

        {isOwnProfile && (
          <div className="mt-6 animate-fade-in">
            <Link
              href="/my-profile"
              className="btn-gradient inline-flex items-center gap-2 py-3 px-6 text-sm"
            >
              Go to My Profile
            </Link>
          </div>
        )}
      </div>

      {/* Collab Modal */}
      {showCollabModal && profile && (
        <CollabRequestModal
          recipient={profile}
          isOpen={showCollabModal}
          onClose={() => setShowCollabModal(false)}
        />
      )}
    </main>
  );
}
