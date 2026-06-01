'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppNavbar } from '@/components/Navbar';
import {
  type CollabRequest,
  type Profile,
  timeAgo,
} from '@/lib/types';
import {
  Handshake,
  Inbox,
  Send,
  Trash2,
  Check,
  X,
} from 'lucide-react';

type RequestWithProfiles = CollabRequest & {
  sender: Profile | null;
  receiver: Profile | null;
};

export default function MyCollabsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [received, setReceived] = useState<RequestWithProfiles[]>([]);
  const [sent, setSent] = useState<RequestWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;

      const [receivedRes, sentRes] = await Promise.all([
        supabase
          .from('collab_requests')
          .select(
            '*, sender:profiles!collab_requests_sender_id_fkey(*), receiver:profiles!collab_requests_receiver_id_fkey(*)'
          )
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('collab_requests')
          .select(
            '*, sender:profiles!collab_requests_sender_id_fkey(*), receiver:profiles!collab_requests_receiver_id_fkey(*)'
          )
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      setReceived((receivedRes.data || []) as RequestWithProfiles[]);
      setSent((sentRes.data || []) as RequestWithProfiles[]);
      setLoading(false);
    };

    fetchRequests();
  }, [user, supabase]);

  const handleAccept = async (reqId: string) => {
    await supabase
      .from('collab_requests')
      .update({ status: 'accepted' })
      .eq('id', reqId);

    setReceived((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'accepted' as const } : r))
    );

    // Find the request to notify sender
    const req = received.find((r) => r.id === reqId);
    if (req) {
      await supabase.from('notifications').insert({
        user_id: req.sender_id,
        type: 'accepted',
        from_user_id: user?.id,
        reference_id: reqId,
        message: 'accepted your collab request!',
      });
    }
  };

  const handleDecline = async (reqId: string) => {
    await supabase
      .from('collab_requests')
      .update({ status: 'declined' })
      .eq('id', reqId);

    setReceived((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'declined' as const } : r))
    );

    const req = received.find((r) => r.id === reqId);
    if (req) {
      await supabase.from('notifications').insert({
        user_id: req.sender_id,
        type: 'declined',
        from_user_id: user?.id,
        reference_id: reqId,
        message: 'declined your collab request',
      });
    }
  };

  const handleWithdraw = async (reqId: string) => {
    await supabase.from('collab_requests').delete().eq('id', reqId);
    setSent((prev) => prev.filter((r) => r.id !== reqId));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-400/20 text-yellow-400',
      accepted: 'bg-accent/20 text-accent',
      declined: 'bg-red-400/20 text-red-400',
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {status}
      </span>
    );
  };

  const requests = activeTab === 'received' ? received : sent;

  return (
    <main className="min-h-screen bg-dark">
      <AppNavbar />

      <div className="pt-20 page-container max-w-3xl">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2 mb-6">
          <Handshake className="w-6 h-6 text-coral" />
          My Collab Requests
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-card rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'received'
                ? 'bg-gradient-coral text-white'
                : 'text-muted hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Received ({received.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'sent'
                ? 'bg-gradient-coral text-white'
                : 'text-muted hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            Sent ({sent.length})
          </button>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="w-40 h-4 skeleton" />
                  <div className="w-24 h-3 skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">
              {activeTab === 'received' ? '📥' : '📤'}
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">
              No {activeTab === 'received' ? 'Received' : 'Sent'} Requests
            </h3>
            <p className="text-muted text-sm mb-6">
              {activeTab === 'received'
                ? 'When someone sends you a collab request, it will appear here!'
                : 'Your sent collab requests will appear here.'}
            </p>
            <Link href="/discover" className="btn-gradient text-sm">
              Discover Creators
            </Link>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {requests.map((req) => {
              const otherUser =
                activeTab === 'received' ? req.sender : req.receiver;

              return (
                <div
                  key={req.id}
                  className="glass-card p-4 sm:p-5 transition-all hover:border-dark-hover"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Avatar */}
                    <Link
                      href={`/profile/${otherUser?.username}`}
                      className="shrink-0"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral to-orange-warm overflow-hidden">
                        {otherUser?.avatar_url ? (
                          <img
                            src={otherUser.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {otherUser?.display_name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/profile/${otherUser?.username}`}
                          className="font-semibold text-sm hover:text-coral transition-colors"
                        >
                          {otherUser?.display_name}
                        </Link>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        @{otherUser?.username} • {req.collab_type}
                      </p>

                      {req.message && (
                        <p className="text-sm text-muted mt-2 bg-dark-hover/50 rounded-lg px-3 py-2">
                          &ldquo;{req.message}&rdquo;
                        </p>
                      )}

                      <p className="text-xs text-muted mt-2">
                        {timeAgo(req.created_at)}
                      </p>

                      {/* Action buttons */}
                      {activeTab === 'received' && req.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleAccept(req.id)}
                            className="px-4 py-1.5 rounded-lg bg-accent/20 text-accent text-xs font-medium hover:bg-accent/30 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Accept
                          </button>
                          <button
                            onClick={() => handleDecline(req.id)}
                            className="px-4 py-1.5 rounded-lg bg-red-400/10 text-red-400 text-xs font-medium hover:bg-red-400/20 transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Decline
                          </button>
                        </div>
                      )}

                      {activeTab === 'sent' && req.status === 'pending' && (
                        <button
                          onClick={() => handleWithdraw(req.id)}
                          className="mt-3 px-4 py-1.5 rounded-lg bg-dark-hover text-muted text-xs font-medium hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
