'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppNavbar } from '@/components/Navbar';
import {
  Camera,
  ArrowLeft,
  Loader2,
  Link2,
} from 'lucide-react';
import { InstagramIcon as Instagram, YoutubeIcon as Youtube } from '@/components/SocialIcons';
import {
  CREATOR_TYPES,
  PLATFORMS,
  FOLLOWER_RANGES,
  INDIAN_CITIES,
} from '@/lib/types';

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [creatorTypes, setCreatorTypes] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [followerRange, setFollowerRange] = useState('');
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [instagramHandle, setInstagramHandle] = useState('');
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [otherSocial, setOtherSocial] = useState('');
  const [collabNote, setCollabNote] = useState('');

  // Pre-fill with existing profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setCity(profile.city || '');
      setAge(profile.age?.toString() || '');
      setBio(profile.bio || '');
      setCreatorTypes(profile.creator_types || []);
      setPlatforms(profile.platforms || []);
      setFollowerRange(profile.follower_range || '');
      setLookingFor(profile.looking_for || []);
      setInstagramHandle(profile.instagram || '');
      setYoutubeChannel(profile.youtube || '');
      setOtherSocial(profile.other_social || '');
      setCollabNote(profile.collab_note || '');
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleArrayItem = (
    arr: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    item: string,
    max?: number
  ) => {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item));
    } else if (!max || arr.length < max) {
      setter([...arr, item]);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    setError('');

    try {
      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${profile.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          avatar_url: avatarUrl,
          city,
          age: age ? parseInt(age) : null,
          bio,
          creator_types: creatorTypes,
          platforms,
          follower_range: followerRange,
          looking_for: lookingFor,
          instagram: instagramHandle || null,
          youtube: youtubeChannel || null,
          other_social: otherSocial || null,
          collab_note: collabNote || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => router.push('/my-profile'), 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <main className="min-h-screen bg-dark">
        <AppNavbar />
        <div className="pt-20 page-container flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark">
      <AppNavbar />

      <div className="pt-20 page-container max-w-2xl">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="font-heading text-2xl font-bold mb-6">Edit Profile</h1>

        {success && (
          <div className="bg-accent/10 text-accent text-sm px-4 py-3 rounded-xl mb-4 animate-fade-in">
            ✅ Profile updated successfully! Redirecting...
          </div>
        )}

        <div className="glass-card p-6 sm:p-8 space-y-6 animate-fade-in">
          {/* Avatar */}
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 rounded-full bg-dark-hover border-2 border-dashed border-dark-border overflow-hidden group-hover:border-coral/50 transition-colors">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">Upload</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-dark text-sm" />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-1.5">City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="input-dark text-sm">
              <option value="">Select city</option>
              {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} min={13} max={60} className="input-dark text-sm" />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))} rows={3} className="input-dark text-sm resize-none" />
            <p className="text-xs text-muted mt-1">{bio.length}/200</p>
          </div>

          {/* Creator Types */}
          <div>
            <label className="block text-sm font-medium mb-2">I am a... (up to 3)</label>
            <div className="flex flex-wrap gap-2">
              {CREATOR_TYPES.map((type) => (
                <button key={type.value} type="button" onClick={() => toggleArrayItem(creatorTypes, setCreatorTypes, type.value, 3)}
                  className={`creator-pill text-xs ${creatorTypes.includes(type.value) ? 'active' : ''}`}>
                  {type.emoji} {type.value}
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium mb-2">I create content on...</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <button key={platform} type="button" onClick={() => toggleArrayItem(platforms, setPlatforms, platform)}
                  className={`creator-pill text-xs ${platforms.includes(platform) ? 'active' : ''}`}>
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Follower Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Follower Count Range</label>
            <div className="flex flex-wrap gap-2">
              {FOLLOWER_RANGES.map((range) => (
                <button key={range.value} type="button" onClick={() => setFollowerRange(range.value)}
                  className={`creator-pill text-xs ${followerRange === range.value ? 'active' : ''}`}>
                  {range.label} ({range.range})
                </button>
              ))}
            </div>
          </div>

          {/* Looking for */}
          <div>
            <label className="block text-sm font-medium mb-2">I am looking for...</label>
            <div className="flex flex-wrap gap-2">
              {CREATOR_TYPES.map((type) => (
                <button key={type.value} type="button" onClick={() => toggleArrayItem(lookingFor, setLookingFor, type.value)}
                  className={`creator-pill text-xs ${lookingFor.includes(type.value) ? 'active' : ''}`}>
                  {type.emoji} {type.value}
                </button>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Instagram Handle</label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="text" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="@your_instagram" className="input-dark pl-10 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">YouTube Channel</label>
            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="text" value={youtubeChannel} onChange={(e) => setYoutubeChannel(e.target.value)} placeholder="youtube.com/c/yourchannel" className="input-dark pl-10 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Other Social Link</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="text" value={otherSocial} onChange={(e) => setOtherSocial(e.target.value)} className="input-dark pl-10 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Collab Note</label>
            <textarea value={collabNote} onChange={(e) => setCollabNote(e.target.value)} rows={2} placeholder="Note for potential collaborators..." className="input-dark text-sm resize-none" />
          </div>

          {error && (
            <div className="bg-red-400/10 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <button onClick={handleSave} disabled={loading} className="btn-gradient w-full py-3 text-sm disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            ) : (
              'Save Changes ✨'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
