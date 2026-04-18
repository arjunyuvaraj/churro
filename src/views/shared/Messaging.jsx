import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import { SkeletonLine } from '../../components/Skeleton';
import { useAuth } from '../../lib/useAuth';
import { useConversations, useMessages, sendMessage, getOrCreateConversation } from '../../lib/useMessages';

export function ConversationList() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { data: conversations, loading } = useConversations(auth?.currentUser?.uid);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Messages</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">Your conversations</h1>
          <p className="mt-2 text-text-secondary">Chat with organizers and participants about tasks.</p>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2">
                <SkeletonLine width="60%" height="20px" />
                <SkeletonLine width="80%" height="16px" />
              </div>
            ))}
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <PageState
            title="No conversations yet"
            description="When you apply for a task or someone messages you, conversations will appear here."
          />
        )}

        <div className="space-y-3">
          {conversations.map((convo) => (
            <button
              key={convo.id}
              type="button"
              onClick={() => navigate(`/messages/${convo.id}`)}
              className="w-full rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/50 hover:shadow-soft card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-bold text-text-primary truncate">{convo.taskTitle || 'Task conversation'}</h3>
                  <p className="mt-1 text-sm text-text-secondary truncate">
                    {convo.lastMessage || 'No messages yet'}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {convo.participantNames?.filter((n) => n !== auth?.firstName).join(', ')}
                  </p>
                </div>
                {convo.lastMessageAt && (
                  <span className="shrink-0 text-xs text-text-secondary">
                    {new Date(convo.lastMessageAt?.toDate?.() || convo.lastMessageAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export function ChatView() {
  const { conversationId } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const { data: messages, loading } = useMessages(conversationId);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage({
        conversationId,
        senderUid: auth.currentUser.uid,
        senderName: auth.firstName || 'User',
        text: text.trim()
      });
      setText('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Chat header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border hover:bg-surface"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading font-bold text-text-primary truncate">Chat</h1>
            <p className="text-xs text-text-secondary truncate">Keep it friendly and safe</p>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <SkeletonLine width="200px" height="40px" />
              </div>
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex h-48 items-center justify-center text-center text-sm text-text-secondary">
            No messages yet. Say hello!
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.senderUid === auth?.currentUser?.uid;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                isOwn
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-card border border-border text-text-primary rounded-bl-md'
              }`}>
                {!isOwn && <p className="mb-1 text-xs font-semibold opacity-70">{msg.senderName}</p>}
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Shared image" className="mt-2 rounded-xl max-w-full" />
                )}
                <p className={`mt-1 text-[10px] ${isOwn ? 'text-white/60' : 'text-text-secondary'}`}>
                  {msg.createdAt?.toDate?.()
                    ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '...'}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="sticky bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <form onSubmit={handleSend} className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white disabled:opacity-50 transition-transform hover:scale-105"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
