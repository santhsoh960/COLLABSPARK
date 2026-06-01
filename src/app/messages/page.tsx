'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppNavbar } from '@/components/Navbar';
import {
  type Profile,
  type Conversation,
  generateConversationId,
  timeAgo,
} from '@/lib/types';
import {
  Send,
  ArrowLeft,
  MessageCircle,
  Search,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('user');
  const { user } = useAuth();
  const supabase = createClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    // Get all messages involving this user
    const { data: allMessages } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!allMessages) return;

    // Group by conversation
    const convMap = new Map<string, { messages: ChatMessage[]; otherUserId: string }>();

    for (const msg of allMessages) {
      const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const convId = generateConversationId(user.id, otherUserId);

      if (!convMap.has(convId)) {
        convMap.set(convId, { messages: [], otherUserId });
      }
      convMap.get(convId)!.messages.push(msg);
    }

    // Fetch all other user profiles
    const otherUserIds = Array.from(new Set(Array.from(convMap.values()).map((c) => c.otherUserId)));

    if (otherUserIds.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', otherUserIds);

    const profileMap = new Map<string, Profile>();
    profiles?.forEach((p) => profileMap.set(p.id, p));

    const convList: Conversation[] = [];
    convMap.forEach((conv, convId) => {
      const otherUser = profileMap.get(conv.otherUserId);
      if (!otherUser) return;

      const lastMsg = conv.messages[0];
      const unread = conv.messages.filter(
        (m) => m.receiver_id === user.id && !m.is_read
      ).length;

      convList.push({
        conversation_id: convId,
        other_user: otherUser,
        last_message: lastMsg.content,
        last_message_time: lastMsg.created_at,
        unread_count: unread,
      });
    });

    convList.sort(
      (a, b) =>
        new Date(b.last_message_time).getTime() -
        new Date(a.last_message_time).getTime()
    );

    setConversations(convList);
    setLoading(false);

    // Auto-open conversation if target user specified
    if (targetUserId) {
      const targetConv = convList.find(
        (c) => c.other_user.id === targetUserId
      );
      if (targetConv) {
        setActiveConversation(targetConv);
        setMobileShowChat(true);
      } else {
        // Create new conversation with target user
        const { data: targetProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (targetProfile) {
          const newConv: Conversation = {
            conversation_id: generateConversationId(user.id, targetUserId),
            other_user: targetProfile,
            last_message: '',
            last_message_time: new Date().toISOString(),
            unread_count: 0,
          };
          setActiveConversation(newConv);
          setMobileShowChat(true);
        }
      }
    }
  }, [user, supabase, targetUserId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversation || !user) return;

    const fetchMessages = async () => {
      const convId = activeConversation.conversation_id;

      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        scrollToBottom();

        // Mark unread messages as read
        const unreadIds = data
          .filter((m) => m.receiver_id === user.id && !m.is_read)
          .map((m) => m.id);

        if (unreadIds.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadIds);
        }
      }
    };

    fetchMessages();

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`chat-${activeConversation.conversation_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation.conversation_id}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();

          // Mark as read if we're the receiver
          if (newMsg.receiver_id === user.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, user, supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeConversation || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    const convId = activeConversation.conversation_id;

    await supabase.from('messages').insert({
      conversation_id: convId,
      sender_id: user.id,
      receiver_id: activeConversation.other_user.id,
      content,
    });

    setSending(false);
    inputRef.current?.focus();
  };

  const openConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    setMobileShowChat(true);
  };

  const filteredConversations = conversations.filter((c) =>
    c.other_user.display_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    c.other_user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-dark">
      <AppNavbar />

      <div className="pt-16 h-screen flex">
        {/* Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-dark-border flex flex-col bg-dark-card/50 ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-dark-border">
            <h2 className="font-heading text-lg font-semibold flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-coral" />
              Messages
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="input-dark pl-10 text-sm py-2"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-1 p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-full skeleton shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="w-24 h-3 skeleton" />
                      <div className="w-32 h-3 skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm text-muted">
                  No messages yet. Send a collab request to start chatting! 🚀
                </p>
              </div>
            ) : (
              <div className="space-y-0.5 p-1">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.conversation_id}
                    onClick={() => openConversation(conv)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                      activeConversation?.conversation_id ===
                      conv.conversation_id
                        ? 'bg-coral/10 border border-coral/20'
                        : 'hover:bg-dark-hover'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-orange-warm overflow-hidden shrink-0">
                      {conv.other_user.avatar_url ? (
                        <img
                          src={conv.other_user.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                          {conv.other_user.display_name?.[0]?.toUpperCase() ||
                            '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate">
                          {conv.other_user.display_name}
                        </p>
                        <span className="text-[10px] text-muted shrink-0 ml-2">
                          {timeAgo(conv.last_message_time)}
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate">
                        {conv.last_message}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 bg-coral text-[10px] font-bold text-white rounded-full flex items-center justify-center shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div
          className={`flex-1 flex flex-col ${
            !mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-dark-border bg-dark-card/50">
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-dark-hover"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Link
                  href={`/profile/${activeConversation.other_user.username}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-coral to-orange-warm overflow-hidden">
                    {activeConversation.other_user.avatar_url ? (
                      <img
                        src={activeConversation.other_user.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                        {activeConversation.other_user.display_name?.[0]?.toUpperCase() ||
                          '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {activeConversation.other_user.display_name}
                    </p>
                    <p className="text-xs text-muted">View Profile</p>
                  </div>
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-muted text-sm">
                    <p>No messages yet. Say hello! 👋</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="group max-w-[75%]">
                          <div
                            className={
                              isMine ? 'message-sent' : 'message-received'
                            }
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p
                            className={`text-[10px] text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                              isMine ? 'text-right' : ''
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString(
                              'en-IN',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                            {isMine && (
                              <span className="ml-1">
                                {msg.is_read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={sendMessage}
                className="p-4 border-t border-dark-border bg-dark-card/50"
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input-dark flex-1 text-sm py-2.5"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="btn-gradient p-2.5 rounded-xl disabled:opacity-30"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="text-6xl mb-4">💬</div>
                <h3 className="font-heading text-xl font-semibold mb-2">
                  Select a Conversation
                </h3>
                <p className="text-sm text-muted">
                  Choose a conversation from the sidebar or start a new one from
                  a creator&apos;s profile.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-dark">
        <div className="pt-16 h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
        </div>
      </main>
    }>
      <MessagesContent />
    </Suspense>
  );
}
