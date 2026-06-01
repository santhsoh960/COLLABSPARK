'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Camera,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
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

export default function SetupProfilePage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');

  // Step 2
  const [creatorTypes, setCreatorTypes] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [followerRange, setFollowerRange] = useState('');
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  // Step 3
  const [instagramHandle, setInstagramHandle] = useState('');
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [otherSocial, setOtherSocial] = useState('');
  const [collabNote, setCollabNote] = useState('');

  // Username availability check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();

      setUsernameStatus(data ? 'taken' : 'available');
    }, 500);

    return () => clearTimeout(timer);
  }, [username, supabase]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) newErrors.displayName = 'Display name is required';
    if (!username.trim()) newErrors.username = 'Username is required';
    else if (username.length < 3)
      newErrors.username = 'Username must be at least 3 characters';
    else if (usernameStatus === 'taken')
      newErrors.username = 'Username is already taken';
    else if (!/^[a-zA-Z0-9_]+$/.test(username))
      newErrors.username = 'Only letters, numbers, and underscores';
    if (!city) newErrors.city = 'Please select your city';
    if (!age) newErrors.age = 'Age is required';
    else if (parseInt(age) < 13 || parseInt(age) > 60)
      newErrors.age = 'Age must be between 13 and 60';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (creatorTypes.length === 0)
      newErrors.creatorTypes = 'Select at least one creator type';
    if (platforms.length === 0)
      newErrors.platforms = 'Select at least one platform';
    if (!followerRange) newErrors.followerRange = 'Select your follower range';
    if (lookingFor.length === 0)
      newErrors.lookingFor = 'Select at least one type you\'re looking for';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
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

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let avatarUrl = null;

      // Upload avatar if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // Insert profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        username: username.toLowerCase(),
        display_name: displayName,
        avatar_url: avatarUrl,
        city,
        age: parseInt(age),
        bio,
        creator_types: creatorTypes,
        platforms,
        follower_range: followerRange,
        looking_for: lookingFor,
        instagram: instagramHandle || null,
        youtube: youtubeChannel || null,
        other_social: otherSocial || null,
        collab_note: collabNote || null,
      });

      if (profileError) throw profileError;

      await refreshProfile();
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="text-center animate-fade-in max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-heading text-3xl font-bold mb-3">
            You&apos;re All Set!
          </h1>
          <p className="text-muted mb-8">
            Your profile is ready. Start discovering creators and find your
            perfect collab partner.
          </p>
          <button
            onClick={() => router.push('/discover')}
            className="btn-gradient text-base px-8 py-4 rounded-2xl"
          >
            Go to Discover 🔍
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />

      <div className="relative w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-xl font-bold font-heading gradient-text">
              CollabSpark
            </span>
          </div>
          <h2 className="font-heading text-xl font-semibold mt-3">
            Set Up Your Profile
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8 px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                  s <= step
                    ? 'bg-gradient-to-r from-coral to-orange-warm'
                    : 'bg-dark-border'
                }`}
              />
            </div>
          ))}
          <span className="text-xs text-muted ml-2">
            Step {step} of 3
          </span>
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 sm:p-8">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="font-heading font-semibold text-lg mb-1">
                Basic Info
              </h3>

              {/* Avatar Upload */}
              <div className="flex justify-center">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-dark-hover border-2 border-dashed border-dark-border overflow-hidden group-hover:border-coral/50 transition-colors">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-[10px]">Upload</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="What should creators call you?"
                  className={`input-dark text-sm ${errors.displayName ? 'border-red-500' : ''}`}
                />
                {errors.displayName && (
                  <p className="text-xs text-red-400 mt-1">{errors.displayName}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))
                    }
                    placeholder="your_username"
                    className={`input-dark pl-8 pr-10 text-sm ${
                      errors.username ? 'border-red-500' : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && (
                      <Loader2 className="w-4 h-4 text-muted animate-spin" />
                    )}
                    {usernameStatus === 'available' && (
                      <Check className="w-4 h-4 text-accent" />
                    )}
                    {usernameStatus === 'taken' && (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
                {usernameStatus === 'available' && (
                  <p className="text-xs text-accent mt-1">
                    @{username} is available ✅
                  </p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="text-xs text-red-400 mt-1">
                    @{username} is taken ❌
                  </p>
                )}
                {errors.username && usernameStatus !== 'taken' && (
                  <p className="text-xs text-red-400 mt-1">{errors.username}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium mb-1.5">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`input-dark text-sm ${errors.city ? 'border-red-500' : ''}`}
                >
                  <option value="">Select your city</option>
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-xs text-red-400 mt-1">{errors.city}</p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age"
                  min={13}
                  max={60}
                  className={`input-dark text-sm ${errors.age ? 'border-red-500' : ''}`}
                />
                {errors.age && (
                  <p className="text-xs text-red-400 mt-1">{errors.age}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 200))}
                  placeholder="Tell creators about yourself..."
                  rows={3}
                  className="input-dark text-sm resize-none"
                />
                <p className="text-xs text-muted mt-1">{bio.length}/200</p>
              </div>

              <button onClick={nextStep} className="btn-gradient w-full py-3 text-sm flex items-center justify-center gap-2">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Creator Info */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="font-heading font-semibold text-lg mb-1">
                Creator Info
              </h3>

              {/* I am a... */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  I am a... <span className="text-muted">(pick up to 3)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CREATOR_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        toggleArrayItem(creatorTypes, setCreatorTypes, type.value, 3)
                      }
                      className={`creator-pill text-xs ${
                        creatorTypes.includes(type.value) ? 'active' : ''
                      }`}
                    >
                      {type.emoji} {type.value}
                    </button>
                  ))}
                </div>
                {errors.creatorTypes && (
                  <p className="text-xs text-red-400 mt-1">{errors.creatorTypes}</p>
                )}
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  I create content on...
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() =>
                        toggleArrayItem(platforms, setPlatforms, platform)
                      }
                      className={`creator-pill text-xs ${
                        platforms.includes(platform) ? 'active' : ''
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
                {errors.platforms && (
                  <p className="text-xs text-red-400 mt-1">{errors.platforms}</p>
                )}
              </div>

              {/* Follower Range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Follower Count Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOLLOWER_RANGES.map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() => setFollowerRange(range.value)}
                      className={`creator-pill text-xs ${
                        followerRange === range.value ? 'active' : ''
                      }`}
                    >
                      {range.label} ({range.range})
                    </button>
                  ))}
                </div>
                {errors.followerRange && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.followerRange}
                  </p>
                )}
              </div>

              {/* Looking for */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  I am looking for...
                </label>
                <div className="flex flex-wrap gap-2">
                  {CREATOR_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        toggleArrayItem(lookingFor, setLookingFor, type.value)
                      }
                      className={`creator-pill text-xs ${
                        lookingFor.includes(type.value) ? 'active' : ''
                      }`}
                    >
                      {type.emoji} {type.value}
                    </button>
                  ))}
                </div>
                {errors.lookingFor && (
                  <p className="text-xs text-red-400 mt-1">{errors.lookingFor}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-outline flex-1 py-3 text-sm flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={nextStep}
                  className="btn-gradient flex-1 py-3 text-sm flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Social Links */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="font-heading font-semibold text-lg mb-1">
                Social Links <span className="text-muted text-sm font-normal">(optional)</span>
              </h3>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Instagram Handle
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@your_instagram"
                    className="input-dark pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  YouTube Channel
                </label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={youtubeChannel}
                    onChange={(e) => setYoutubeChannel(e.target.value)}
                    placeholder="youtube.com/c/yourchannel"
                    className="input-dark pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Other Social Link
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={otherSocial}
                    onChange={(e) => setOtherSocial(e.target.value)}
                    placeholder="Any other link..."
                    className="input-dark pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Anything else to add?
                </label>
                <textarea
                  value={collabNote}
                  onChange={(e) => setCollabNote(e.target.value)}
                  placeholder="Leave a note for potential collaborators..."
                  rows={3}
                  className="input-dark text-sm resize-none"
                />
              </div>

              {errors.submit && (
                <div className="bg-red-400/10 text-red-400 text-sm px-4 py-3 rounded-xl">
                  {errors.submit}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn-outline flex-1 py-3 text-sm flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-gradient flex-1 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Complete Profile ✨'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
