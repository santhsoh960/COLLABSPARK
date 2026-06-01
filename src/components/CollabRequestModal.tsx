'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { COLLAB_TYPES, type Profile } from '@/lib/types';

interface CollabRequestModalProps {
  recipient: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export default function CollabRequestModal({
  recipient,
  isOpen,
  onClose,
}: CollabRequestModalProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [collabType, setCollabType] = useState('');
  const [message, setMessage] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Create collab request
      const { error: reqError } = await supabase
        .from('collab_requests')
        .insert({
          sender_id: user.id,
          receiver_id: recipient.id,
          collab_type: collabType,
          message,
          contact_info: contactInfo,
          status: 'pending',
        });

      if (reqError) throw reqError;

      // Create notification for recipient
      await supabase.from('notifications').insert({
        user_id: recipient.id,
        type: 'collab_request',
        from_user_id: user.id,
        message: `sent you a collab request`,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCollabType('');
        setMessage('');
        setContactInfo('');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send request';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-orange-warm overflow-hidden">
              {recipient.avatar_url ? (
                <img
                  src={recipient.avatar_url}
                  alt={recipient.display_name || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {recipient.display_name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-heading font-semibold text-sm">
                Send Collab Request
              </h3>
              <p className="text-xs text-muted">
                to {recipient.display_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-dark-hover transition-colors"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center animate-fade-in">
            <div className="text-5xl mb-3">🎉</div>
            <h4 className="font-heading font-semibold text-lg mb-1">
              Request Sent!
            </h4>
            <p className="text-sm text-muted">
              {recipient.display_name} will be notified about your collab
              request.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Collab Type */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                What kind of collab?
              </label>
              <select
                value={collabType}
                onChange={(e) => setCollabType(e.target.value)}
                required
                className="input-dark text-sm"
              >
                <option value="">Select type...</option>
                {COLLAB_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Describe your collab idea
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={300}
                rows={3}
                placeholder="e.g. I want to make a dance + comedy reel for Diwali..."
                className="input-dark text-sm resize-none"
              />
              <p className="text-xs text-muted mt-1">
                {message.length}/300 characters
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Your preferred way to connect
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Instagram DM / WhatsApp / Email..."
                className="input-dark text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-outline text-sm py-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-gradient text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send Request 🤝'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
