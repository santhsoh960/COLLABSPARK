'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppNavbar } from '@/components/Navbar';
import {
  type Notification,
  type Profile,
  timeAgo,
} from '@/lib/types';
import {
  Bell,
  Handshake,
  Check,
  X,
  Eye,
  Flame,
  Trash2,
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [notifications, setNotifications] = useState<(Notification & { from_user: Profile | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*, from_user:profiles!notifications_from_user_id_fkey(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setNotifications(data as (Notification & { from_user: Profile | null })[]);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel('notifications-page')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        async (payload) => {
          // Fetch the full notification with joined profile
          const { data } = await supabase
            .from('notifications')
            .select('*, from_user:profiles!notifications_from_user_id_fkey(*)')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setNotifications((prev) => [data as Notification & { from_user: Profile | null }, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleAcceptCollab = async (notif: Notification & { from_user: Profile | null }) => {
    if (!notif.reference_id) {
      // Update the collab request by looking it up from sender
      await supabase
        .from('collab_requests')
        .update({ status: 'accepted' })
        .eq('sender_id', notif.from_user_id)
        .eq('receiver_id', user?.id)
        .eq('status', 'pending');
    } else {
      await supabase
        .from('collab_requests')
        .update({ status: 'accepted' })
        .eq('id', notif.reference_id);
    }

    // Send notification to sender
    await supabase.from('notifications').insert({
      user_id: notif.from_user_id,
      type: 'accepted',
      from_user_id: user?.id,
      reference_id: notif.reference_id,
      message: 'accepted your collab request!',
    });

    // Mark this notification as read
    await markAsRead(notif.id);

    // Update UI
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notif.id ? { ...n, is_read: true, type: 'accepted' as const } : n
      )
    );
  };

  const handleDeclineCollab = async (notif: Notification & { from_user: Profile | null }) => {
    if (!notif.reference_id) {
      await supabase
        .from('collab_requests')
        .update({ status: 'declined' })
        .eq('sender_id', notif.from_user_id)
        .eq('receiver_id', user?.id)
        .eq('status', 'pending');
    } else {
      await supabase
        .from('collab_requests')
        .update({ status: 'declined' })
        .eq('id', notif.reference_id);
    }

    // Send notification
    await supabase.from('notifications').insert({
      user_id: notif.from_user_id,
      type: 'declined',
      from_user_id: user?.id,
      reference_id: notif.reference_id,
      message: 'declined your collab request',
    });

    await markAsRead(notif.id);
  };

  const clearAllNotifications = async () => {
    if (!user) return;
    await supabase.from('notifications').delete().eq('user_id', user.id);
    setNotifications([]);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'collab_request':
        return <Handshake className="w-5 h-5 text-coral" />;
      case 'accepted':
        return <Check className="w-5 h-5 text-accent" />;
      case 'declined':
        return <X className="w-5 h-5 text-red-400" />;
      case 'profile_view':
        return <Eye className="w-5 h-5 text-blue-400" />;
      default:
        return <Flame className="w-5 h-5 text-orange-400" />;
    }
  };

  const getNotifText = (notif: Notification & { from_user: Profile | null }) => {
    const name = notif.from_user?.display_name || 'Someone';
    switch (notif.type) {
      case 'collab_request':
        return (
          <>
            <span className="font-semibold">{name}</span> sent you a collab
            request
          </>
        );
      case 'accepted':
        return (
          <>
            <span className="font-semibold">{name}</span> accepted your collab
            request! ✅
          </>
        );
      case 'declined':
        return (
          <>
            <span className="font-semibold">{name}</span> declined your collab
            request
          </>
        );
      case 'profile_view':
        return <>Someone viewed your profile 👀</>;
      default:
        return notif.message;
    }
  };

  return (
    <main className="min-h-screen bg-dark">
      <AppNavbar />

      <div className="pt-20 page-container max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-coral" />
              Notifications
            </h1>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-xs text-muted hover:text-coral transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="glass-card p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 skeleton" />
                  <div className="w-1/4 h-3 skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="font-heading text-xl font-semibold mb-2">
              No Notifications Yet
            </h3>
            <p className="text-muted text-sm">
              When someone sends you a collab request or views your profile,
              you&apos;ll see it here!
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                className={`glass-card p-4 transition-all duration-200 cursor-pointer hover:border-dark-hover ${
                  !notif.is_read ? 'border-coral/20 bg-coral/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <Link
                    href={
                      notif.from_user
                        ? `/profile/${notif.from_user.username}`
                        : '#'
                    }
                    className="shrink-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-orange-warm overflow-hidden">
                      {notif.from_user?.avatar_url ? (
                        <img
                          src={notif.from_user.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                          {notif.from_user?.display_name?.[0]?.toUpperCase() ||
                            '?'}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      {getNotifIcon(notif.type)}
                      <p
                        className={`text-sm leading-relaxed ${
                          !notif.is_read ? 'font-medium' : 'text-muted'
                        }`}
                      >
                        {getNotifText(notif)}
                      </p>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {timeAgo(notif.created_at)}
                    </p>

                    {/* Accept/Decline buttons for collab requests */}
                    {notif.type === 'collab_request' && !notif.is_read && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptCollab(notif);
                          }}
                          className="px-4 py-1.5 rounded-lg bg-accent/20 text-accent text-xs font-medium hover:bg-accent/30 transition-colors"
                        >
                          Accept ✅
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeclineCollab(notif);
                          }}
                          className="px-4 py-1.5 rounded-lg bg-red-400/10 text-red-400 text-xs font-medium hover:bg-red-400/20 transition-colors"
                        >
                          Decline ❌
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Unread dot */}
                  {!notif.is_read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-coral shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
