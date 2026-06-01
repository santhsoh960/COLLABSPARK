// ============================================================
// CollabSpark — TypeScript Types & Constants
// ============================================================

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  age: number | null;
  bio: string | null;
  creator_types: string[] | null;
  platforms: string[] | null;
  follower_range: string | null;
  looking_for: string[] | null;
  instagram: string | null;
  youtube: string | null;
  other_social: string | null;
  collab_note: string | null;
  profile_views: number;
  collabs_done: number;
  created_at: string;
  updated_at: string;
}

export interface CollabRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  collab_type: string | null;
  message: string | null;
  contact_info: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  // Joined fields
  sender?: Profile;
  receiver?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // Joined fields
  sender?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'collab_request' | 'accepted' | 'declined' | 'profile_view';
  from_user_id: string | null;
  reference_id: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
  // Joined fields
  from_user?: Profile;
}

export interface Conversation {
  conversation_id: string;
  other_user: Profile;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

// ============================================================
// Constants
// ============================================================

export const CREATOR_TYPES = [
  { value: 'Dancer', emoji: '💃' },
  { value: 'Singer', emoji: '🎤' },
  { value: 'Comedian', emoji: '😂' },
  { value: 'Videographer', emoji: '🎥' },
  { value: 'Photographer', emoji: '📸' },
  { value: 'Video Editor', emoji: '✂️' },
  { value: 'Makeup Artist', emoji: '💄' },
  { value: 'Fitness Creator', emoji: '💪' },
  { value: 'Food Blogger', emoji: '🍕' },
  { value: 'Vlogger', emoji: '📹' },
  { value: 'Poet', emoji: '✍️' },
  { value: 'Musician', emoji: '🎸' },
  { value: 'Actor', emoji: '🎬' },
  { value: 'Animator', emoji: '🎨' },
  { value: 'Other', emoji: '🌟' },
] as const;

export const PLATFORMS = [
  'Instagram',
  'YouTube',
  'YouTube Shorts',
  'TikTok',
  'Moj',
  'Josh',
  'Snapchat',
] as const;

export const FOLLOWER_RANGES = [
  { value: 'Just Starting (0–1K)', label: 'Just Starting', range: '0–1K' },
  { value: 'Growing (1K–10K)', label: 'Growing', range: '1K–10K' },
  { value: 'Mid-tier (10K–100K)', label: 'Mid-tier', range: '10K–100K' },
  { value: 'Established (100K–1M)', label: 'Established', range: '100K–1M' },
  { value: 'Top Creator (1M+)', label: 'Top Creator', range: '1M+' },
] as const;

export const INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Chandigarh',
  'Indore',
  'Bhopal',
  'Patna',
  'Kochi',
] as const;

export const COLLAB_TYPES = [
  'Instagram Reel',
  'YouTube Video',
  'Short Film',
  'Photo Shoot',
  'Music Video',
  'Podcast',
  'Dance Video',
  'Comedy Sketch',
  'Other',
] as const;

export function getCreatorEmoji(type: string): string {
  const found = CREATOR_TYPES.find(
    (ct) => ct.value.toLowerCase() === type.toLowerCase()
  );
  return found?.emoji || '🌟';
}

export function generateConversationId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

export function getFollowerBadgeColor(range: string | null): string {
  if (!range) return 'bg-gray-600';
  if (range.includes('1M+')) return 'bg-purple-600';
  if (range.includes('100K')) return 'bg-yellow-600';
  if (range.includes('10K')) return 'bg-blue-600';
  if (range.includes('1K')) return 'bg-green-600';
  return 'bg-gray-600';
}

export function getFollowerLabel(range: string | null): string {
  if (!range) return '';
  const found = FOLLOWER_RANGES.find((fr) => fr.value === range);
  return found ? found.range : range;
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}
