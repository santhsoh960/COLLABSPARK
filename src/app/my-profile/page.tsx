'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppNavbar } from '@/components/Navbar';
import {
  MapPin,
  Calendar,
  Eye,
  Handshake,
  Link2,
  Edit3,
  Send,
  Inbox,
} from 'lucide-react';
import { InstagramIcon as Instagram, YoutubeIcon as Youtube } from '@/components/SocialIcons';
import {
  type CollabRequest,
  type Profile,
  getCreatorEmoji,
  getFollowerLabel,
  getFollowerBadgeColor,
  timeAgo,
} from '@/lib/types';

export default function MyProfilePage() {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [recentRequests, setRecentRequests] = useState<
    (CollabRequest & { sender: Profile | null; receiver: Profile | null })[]
  >([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [sentCount, setSentCount] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const [sentResult, receivedResult, recentResult] = await Promise.all([
        supabase
          .from('collab_requests')
          .select('id', { count: 'exact', head: true })
          .eq('sender_id', user.id),
        supabase
          .from('collab_requests')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', user.id),
        supabase
          .from('collab_requests')
          .select(
            '*, sender:profiles!collab_requests_sender_id_fkey(*), receiver:profiles!collab_requests_receiver_id_fkey(*)'
          )
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setSentCount(sentResult.count || 0);
      setReceivedCount(receivedResult.count || 0);
      setRecentRequests(
        (recentResult.data || []) as (CollabRequest & {
          sender: Profile | null;
          receiver: Profile | null;
        })[]
      );
      setRequestsLoading(false);
    };

    fetchStats();
  }, [user, supabase]);

  if (!profile) {
    return (
      <main className="min-h-screen bg-dark">
        <AppNavbar />
        <div className="pt-20 page-container text-center py-20">
          <div className="w-8 h-8 border-2 border-coral/30 border-t-coral rounded-full animate-spin mx-auto" />
        </div>
      </main>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString(
    'en-IN',
    { month: 'long', year: 'numeric' }
  );

  return (
    <main className="min-h-screen bg-dark">
      <AppNavbar />

      <div className="pt-20 page-container max-w-4xl">
        {/* Profile Header */}
        <div className="glass-card p-6 sm:p-8 animate-fade-in relative">
          {/* Edit button */}
          <Link
            href="/my-profile/edit"
            className="absolute top-4 right-4 btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Edit3 className="w-3 h-3" />
            Edit Profile
          </Link>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
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

            <div className="flex-1 text-center md:text-left">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold">
                {profile.display_name}
              </h1>
              <p className="text-muted text-sm">@{profile.username}</p>

              {profile.city && (
                <div className="flex items-center gap-1.5 justify-center md:justify-start mt-2 text-sm text-muted">
                  <MapPin className="w-4 h-4" />
                  {profile.city}, India
                </div>
              )}

              {profile.bio && (
                <p className="text-sm text-muted mt-3">{profile.bio}</p>
              )}

              {profile.creator_types && profile.creator_types.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                  {profile.creator_types.map((type) => (
                    <span key={type} className="creator-pill text-sm">
                      {getCreatorEmoji(type)} {type}
                    </span>
                  ))}
                </div>
              )}

              {profile.follower_range && (
                <span
                  className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold text-white ${getFollowerBadgeColor(
                    profile.follower_range
                  )}`}
                >
                  {getFollowerLabel(profile.follower_range)} followers
                </span>
              )}

              {/* Social links */}
              <div className="flex items-center gap-3 justify-center md:justify-start mt-4">
                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center hover:border-pink-500/40 transition-all"
                  >
                    <Instagram className="w-4 h-4 text-pink-400" />
                  </a>
                )}
                {profile.youtube && (
                  <a
                    href={profile.youtube.startsWith('http') ? profile.youtube : `https://${profile.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center hover:border-red-500/40 transition-all"
                  >
                    <Youtube className="w-4 h-4 text-red-400" />
                  </a>
                )}
                {profile.other_social && (
                  <a
                    href={profile.other_social.startsWith('http') ? profile.other_social : `https://${profile.other_social}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-dark-hover border border-dark-border flex items-center justify-center hover:border-blue-500/40 transition-all"
                  >
                    <Link2 className="w-4 h-4 text-blue-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="glass-card p-4 text-center">
            <Calendar className="w-4 h-4 text-muted mx-auto mb-1" />
            <p className="text-sm font-semibold">{memberSince}</p>
            <p className="text-xs text-muted">Member since</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Eye className="w-4 h-4 text-muted mx-auto mb-1" />
            <p className="text-sm font-semibold">{profile.profile_views || 0}</p>
            <p className="text-xs text-muted">Profile views</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Send className="w-4 h-4 text-muted mx-auto mb-1" />
            <p className="text-sm font-semibold">{sentCount}</p>
            <p className="text-xs text-muted">Requests sent</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Inbox className="w-4 h-4 text-muted mx-auto mb-1" />
            <p className="text-sm font-semibold">{receivedCount}</p>
            <p className="text-xs text-muted">Requests received</p>
          </div>
        </div>

        {/* Recent Collab Requests */}
        <div className="glass-card p-6 mt-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
              <Handshake className="w-5 h-5 text-coral" />
              Recent Collab Requests
            </h3>
            <Link
              href="/my-collabs"
              className="text-xs text-coral hover:underline"
            >
              View All →
            </Link>
          </div>

          {requestsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-8 h-8 rounded-full skeleton" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-32 h-3 skeleton" />
                    <div className="w-20 h-3 skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentRequests.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">
              No collab requests yet. Start discovering creators! 🔍
            </p>
          ) : (
            <div className="space-y-2">
              {recentRequests.map((req) => {
                const isSent = req.sender_id === user?.id;
                const otherUser = isSent ? req.receiver : req.sender;

                return (
                  <Link
                    key={req.id}
                    href={`/profile/${otherUser?.username}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-hover transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-orange-warm overflow-hidden shrink-0">
                      {otherUser?.avatar_url ? (
                        <img
                          src={otherUser.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {otherUser?.display_name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {isSent ? 'Sent to' : 'From'}{' '}
                        {otherUser?.display_name}
                      </p>
                      <p className="text-xs text-muted">
                        {req.collab_type} • {timeAgo(req.created_at)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'accepted'
                          ? 'bg-accent/20 text-accent'
                          : req.status === 'declined'
                          ? 'bg-red-400/20 text-red-400'
                          : 'bg-yellow-400/20 text-yellow-400'
                      }`}
                    >
                      {req.status}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
