import React, { useEffect, useRef, useState } from 'react';
import { Headset, MessageCircle, Send, X } from 'lucide-react';
import { ApiError, apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';

interface LiveChatMessage {
  id: number;
  sender_type: 'customer' | 'agent' | 'system';
  sender_name: string | null;
  body: string;
  created_at: string;
}

interface LiveChatConversation {
  id: number;
  customer_name: string;
  status: 'open' | 'closed';
}

interface VisitorSession {
  conversation: LiveChatConversation;
  token: string;
}

interface VisitorHistory {
  data: {
    conversation: LiveChatConversation;
    messages: LiveChatMessage[];
  };
}

interface StartedConversation extends VisitorHistory {
  data: VisitorHistory['data'] & { visitor_token: string };
}

const SESSION_KEY = 'ppa_live_chat_session';

function readSavedSession(): VisitorSession | null {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    const parsed: unknown = JSON.parse(saved);
    if (
      typeof parsed !== 'object'
      || parsed === null
      || !('token' in parsed)
      || typeof parsed.token !== 'string'
      || !('conversation' in parsed)
      || typeof parsed.conversation !== 'object'
      || parsed.conversation === null
      || !('id' in parsed.conversation)
      || typeof parsed.conversation.id !== 'number'
      || !('customer_name' in parsed.conversation)
      || typeof parsed.conversation.customer_name !== 'string'
      || !('status' in parsed.conversation)
      || (parsed.conversation.status !== 'open' && parsed.conversation.status !== 'closed')
    ) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return {
      token: parsed.token,
      conversation: parsed.conversation as LiveChatConversation,
    };
  } catch {
    return null;
  }
}

export const LiveChatWidget: React.FC = () => {
  const language = useAppStore((state) => state.language);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<VisitorSession | null>(readSavedSession);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [draft, setDraft] = useState('');
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const isPersian = language === 'fa';

  useEffect(() => {
    if (!open || !session) return;

    let active = true;
    let fetching = false;
    const loadMessages = async () => {
      if (fetching) return;
      fetching = true;
      try {
        const response = await apiRequest<VisitorHistory>(
          `/live-chat/conversations/${session.conversation.id}/messages`,
          {
            cache: 'no-store',
            headers: { 'X-Chat-Token': session.token },
          },
        );
        if (active) {
          setMessages(response.data.messages);
          setSession((current) => current
            ? { ...current, conversation: response.data.conversation }
            : current);
          setError('');
        }
      } catch (cause) {
        if (!active) return;
        if (cause instanceof ApiError && cause.status === 404) {
          localStorage.removeItem(SESSION_KEY);
          setSession(null);
          setMessages([]);
          setError(isPersian ? 'گفتگوی قبلی در دسترس نیست؛ گفتگوی جدیدی آغاز کنید.' : 'The previous chat is unavailable. Start a new conversation.');
        } else {
          setError(cause instanceof Error ? cause.message : 'دریافت پیام‌ها ناموفق بود.');
        }
      } finally {
        fetching = false;
      }
    };

    void loadMessages();
    const intervalId = window.setInterval(() => void loadMessages(), 4000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [open, session?.conversation.id, session?.token, isPersian]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, open]);

  const startConversation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (starting) return;
    setStarting(true);
    setError('');
    try {
      const response = await apiRequest<StartedConversation>(
        '/live-chat/conversations',
        {
          method: 'POST',
          body: JSON.stringify({ customer_name: customerName.trim() || undefined }),
        },
      );
      const nextSession = {
        conversation: response.data.conversation,
        token: response.data.visitor_token,
      };
      setSession(nextSession);
      setMessages(response.data.messages);
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      } catch (cause) {
        console.error('Unable to persist the live-chat session in local storage.', cause);
      }
      setCustomerName('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'شروع گفتگو ناموفق بود.');
    } finally {
      setStarting(false);
    }
  };

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || !draft.trim() || sending || session.conversation.status === 'closed') return;
    setSending(true);
    setError('');
    try {
      await apiRequest(`/live-chat/conversations/${session.conversation.id}/messages`, {
        method: 'POST',
        headers: { 'X-Chat-Token': session.token },
        body: JSON.stringify({ body: draft.trim() }),
      });
      setDraft('');
      const response = await apiRequest<VisitorHistory>(
        `/live-chat/conversations/${session.conversation.id}/messages`,
        {
          cache: 'no-store',
          headers: { 'X-Chat-Token': session.token },
        },
      );
      setMessages(response.data.messages);
      setSession((current) => current
        ? { ...current, conversation: response.data.conversation }
        : current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ارسال پیام ناموفق بود.');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (value: string) => new Intl.DateTimeFormat(
    isPersian ? 'fa-IR' : 'en-US',
    { hour: '2-digit', minute: '2-digit' },
  ).format(new Date(value));

  return (
    <div className="fixed bottom-5 right-5 z-70 flex flex-col items-end gap-3">
      {open && (
        <section
          aria-label={isPersian ? 'گفتگوی آنلاین' : 'Live chat'}
          className="theme-solid-surface flex h-[min(34rem,calc(100dvh-7rem))] w-88 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl border border-(--theme-border) bg-(--theme-surface) text-(--theme-text) shadow-2xl"
        >
          <header
            className="flex items-center justify-between border-b border-(--theme-border) px-4 py-3"
            style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 7%, var(--theme-surface))' }}
          >
            <div className="flex items-center gap-3">
              <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-(--theme-primary) text-(--theme-primary-foreground)">
                <Headset className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -inset-e-0.5 h-3 w-3 rounded-full border-2 border-(--theme-surface) bg-emerald-500" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-(--theme-text)">{isPersian ? 'پشتیبانی آنلاین' : 'Online support'}</h2>
                <p className="text-[11px] text-(--theme-text-muted)">
                  {session?.conversation.status === 'closed'
                    ? (isPersian ? 'گفتگو بسته شده' : 'Conversation closed')
                    : (isPersian ? 'پیام شما را پاسخ می‌دهیم' : 'We are here to help')}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={isPersian ? 'بستن گفتگو' : 'Close chat'} className="rounded-full p-2 text-(--theme-text-muted) transition hover:bg-(--theme-surface-muted) hover:text-(--theme-text)">
              <X className="h-4 w-4" />
            </button>
          </header>

          {!session ? (
            <form onSubmit={startConversation} className="flex flex-1 flex-col justify-between p-5">
              <div className="rounded-2xl rounded-es-sm bg-(--theme-surface-muted) p-4 text-sm leading-7 text-(--theme-text)">
                {isPersian
                  ? 'سلام! به پشتیبانی آنلاین پارس پولاد خوش آمدید. برای ارتباط با کارشناسان، گفتگوی خود را آغاز کنید.'
                  : 'Hello! Welcome to Pars Poolad online support. Start a conversation to reach our team.'}
              </div>
              <div className="space-y-3">
                <label htmlFor="live-chat-name" className="block text-xs font-medium text-(--theme-text-muted)">
                  {isPersian ? 'نام شما (اختیاری)' : 'Your name (optional)'}
                </label>
                <input
                  id="live-chat-name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  maxLength={120}
                  autoComplete="name"
                  className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2.5 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) focus:border-(--theme-primary) focus:outline-none"
                />
                {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
                <button type="submit" disabled={starting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--theme-primary) px-4 py-3 text-sm font-semibold text-(--theme-primary-foreground) transition hover:bg-(--theme-primary-hover) disabled:opacity-60">
                  <MessageCircle className="h-4 w-4" />
                  {starting
                    ? (isPersian ? 'در حال اتصال...' : 'Connecting...')
                    : (isPersian ? 'شروع گفتگو' : 'Start chat')}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto bg-(--theme-surface-muted) p-4">
                {messages.map((message) => {
                  const isCustomer = message.sender_type === 'customer';
                  const isSystem = message.sender_type === 'system';
                  return (
                    <div key={message.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                      <article className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                        isSystem
                          ? 'border border-(--theme-border) bg-(--theme-surface) text-(--theme-text-muted)'
                          : isCustomer
                            ? 'rounded-es-sm border border-(--theme-border) bg-(--theme-surface) text-(--theme-text) shadow-sm'
                            : 'rounded-ee-sm bg-(--theme-primary) text-(--theme-primary-foreground)'
                      }`}>
                        {message.sender_type === 'agent' && message.sender_name && (
                          <p className="mb-1 text-[10px] font-bold opacity-80">{message.sender_name}</p>
                        )}
                        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">{message.body}</p>
                        <time className="mt-1 block text-end text-[10px] opacity-70">{formatMessageTime(message.created_at)}</time>
                      </article>
                    </div>
                  );
                })}
                {error && <p role="alert" className="rounded-lg bg-red-500/10 p-2 text-xs text-red-600 dark:text-red-300">{error}</p>}
                {session.conversation.status === 'closed' && (
                  <p className="text-center text-xs text-(--theme-text-muted)">{isPersian ? 'این گفتگو بسته شده است.' : 'This conversation is closed.'}</p>
                )}
                <div ref={endRef} />
              </div>
              <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-(--theme-border) bg-(--theme-surface) p-3">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  maxLength={2000}
                  rows={1}
                  disabled={sending || session.conversation.status === 'closed'}
                  aria-label={isPersian ? 'متن پیام' : 'Message'}
                  placeholder={isPersian ? 'پیام خود را بنویسید...' : 'Write a message...'}
                  className="max-h-28 min-h-10 flex-1 resize-y rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2.5 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) focus:border-(--theme-primary) focus:outline-none"
                />
                <button type="submit" disabled={sending || !draft.trim() || session.conversation.status === 'closed'} aria-label={isPersian ? 'ارسال پیام' : 'Send message'} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-(--theme-primary) text-(--theme-primary-foreground) transition hover:bg-(--theme-primary-hover) disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={isPersian ? (open ? 'بستن پشتیبانی آنلاین' : 'باز کردن پشتیبانی آنلاین') : (open ? 'Close online support' : 'Open online support')}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-(--theme-primary) text-(--theme-primary-foreground) shadow-xl transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};
