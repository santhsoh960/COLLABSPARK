'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Profile, getCreatorEmoji, getFollowerLabel, getFollowerBadgeColor } from '@/lib/types';

interface CreatorCardProps {
  profile: Profile;
  onCollabClick?: (profile: Profile) => void;
}

export default function CreatorCard({ profile, onCollabClick }: CreatorCardProps) {
  return (
    <div className="creator-card group relative flex flex-col" id={`creator-card-${profile.username}`}>
      {/* Follower badge */}
      {profile.follower_range && (
        <div
          className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${getFollowerBadgeColor(
            profile.follower_range
          )}`}
        >
          {getFollowerLabel(profile.follower_range)}
        </div>
      )}

      {/* Avatar + Info */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coral to-orange-warm p-0.5 mb-3">
          <div className="w-full h-full rounded-full overflow-hidden bg-dark-card">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/60">
                {profile.display_name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>

        <h3 className="font-heading font-semibold text-base truncate max-w-full">
          {profile.display_name || 'Creator'}
        </h3>
        <p className="text-xs text-muted">@{profile.username}</p>

        {profile.city && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted">
            <MapPin className="w-3 h-3" />
            {profile.city}
          </div>
        )}
      </div>

      {/* Creator type pills */}
      {profile.creator_types && profile.creator_types.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center mb-3">
          {profile.creator_types.slice(0, 3).map((type) => (
            <span
              key={type}
              className="creator-pill text-xs"
            >
              {getCreatorEmoji(type)} {type}
            </span>
          ))}
        </div>
      )}

      {/* Looking for */}
      {profile.looking_for && profile.looking_for.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1 text-center">
            Looking for
          </p>
          <div className="flex flex-wrap gap-1 justify-center">
            {profile.looking_for.slice(0, 2).map((type) => (
              <span
                key={type}
                className="px-2 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent border border-accent/20"
              >
                {getCreatorEmoji(type)} {type}
              </span>
            ))}
            {profile.looking_for.length > 2 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-dark-hover text-muted">
                +{profile.looking_for.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p className="text-xs text-muted text-center line-clamp-2 mb-4 flex-1">
          {profile.bio}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/profile/${profile.username}`}
          className="flex-1 btn-outline text-xs py-2 text-center"
        >
          View Profile
        </Link>
        <button
          onClick={() => onCollabClick?.(profile)}
          className="flex-1 btn-gradient text-xs py-2"
        >
          Collab 🤝
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Skeleton Card for loading states
// ============================================================
export function CreatorCardSkeleton() {
  return (
    <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full skeleton mb-3" />
        <div className="w-24 h-4 skeleton mb-1.5" />
        <div className="w-16 h-3 skeleton mb-1" />
        <div className="w-20 h-3 skeleton mb-4" />
      </div>
      <div className="flex gap-1.5 justify-center mb-3">
        <div className="w-16 h-6 skeleton rounded-full" />
        <div className="w-20 h-6 skeleton rounded-full" />
      </div>
      <div className="w-full h-3 skeleton mb-1" />
      <div className="w-3/4 h-3 skeleton mx-auto mb-4" />
      <div className="flex gap-2">
        <div className="flex-1 h-8 skeleton rounded-xl" />
        <div className="flex-1 h-8 skeleton rounded-xl" />
      </div>
    </div>
  );
}
