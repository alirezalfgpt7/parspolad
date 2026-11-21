import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Circle, LoaderCircle, MessageSquare, RefreshCw, Search, Send, X } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
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
  unread_by_admin: number;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  closed_at: string | null;
}

interface ConversationListResponse {
  data: LiveChatConversation[];
}

interface ConversationMessagesResponse {
  data: {
    conversation: LiveChatConversation;
    messages: LiveChatMessage[];
  };
}

export const LiveChatAdminPage: React.FC = () => {
  const { language, user } = useAppStore();
  const isPersian = language === 'fa';
  const canManage = Boolean(user?.permissions.includes('messages.manage'));
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed'>('open');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<LiveChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<LiveChatConversation | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState('');
  const selectedIdRef = useRef<number | null>(null);

  const loadConversations = useCallback(async () => {
    const params = new URLSearchParams({ status: statusFilter });
    if (search) params.set('q', search);
    try {
      const response = await apiRequest<ConversationListResponse>(
        `/admin/live-chat/conversations?${params.toString()}`,
        { cache: 'no-store' },
      );
      setConversations(response.data);
      setSelectedId((current) => {
        if (current && response.data.some((conversation) => conversation.id === current)) return current;
        return response.data[0]?.id ?? null;
      });
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'دریافت گفتگوها ناموفق بود.');
    } finally {
      setLoadingList(false);
    }
  }, [search, statusFilter]);

  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      const response = await apiRequest<ConversationMessagesResponse>(
        `/admin/live-chat/conversations/${conversationId}/messages`,
        { cache: 'no-store' },
      );
      if (selectedIdRef.current !== conversationId) return;
      setSelectedConversation(response.data.conversation);
      setMessages(response.data.messages);
      setError('');
    } catch (cause) {
      if (selectedIdRef.current === conversationId) {
        setError(cause instanceof Error ? cause.message : 'دریافت پیام‌های گفتگو ناموفق بود.');
      }
    }
  }, []);

  useEffect(() => {
    void loadConversations();
    const intervalId = window.setInterval(() => void loadConversations(), 6000);
    return () => window.clearInterval(intervalId);
  }, [loadConversations]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    setSelectedConversation(null);
    setMessages([]);
    if (selectedId === null) return;
    void loadMessages(selectedId);
    const intervalId = window.setInterval(() => void loadMessages(selectedId), 4000);
    return () => window.clearInterval(intervalId);
  }, [loadMessages, selectedId]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedId === null || !draft.trim() || sending || selectedConversation?.status !== 'open') return;
    setSending(true);
    setError('');
    try {
      await apiRequest(`/admin/live-chat/conversations/${selectedId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: draft.trim() }),
      });
      setDraft('');
      await Promise.all([loadMessages(selectedId), loadConversations()]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ارسال پاسخ ناموفق بود.');
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async () => {
    if (!selectedConversation || updatingStatus) return;
    const nextStatus = selectedConversation.status === 'open' ? 'closed' : 'open';
    setUpdatingStatus(true);
    setError('');
    try {
      await apiRequest(`/admin/live-chat/conversations/${selectedConversation.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      await loadConversations();
      setSelectedId(null);
      setSelectedConversation(null);
      setMessages([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تغییر وضعیت گفتگو ناموفق بود.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (value: string | null, detailed = false) => {
    if (!value) return '';
    return new Intl.DateTimeFormat(
      isPersian ? 'fa-IR' : 'en-US',
      detailed
        ? { dateStyle: 'medium', timeStyle: 'short' }
        : { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' },
    ).format(new Date(value));
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-(--theme-text)">{isPersian ? 'گفتگوی آنلاین' : 'Live chat'}</h1>
          <p className="mt-1 text-sm text-(--theme-text-muted)">
            {isPersian ? 'مشاهده و پاسخ‌گویی به گفتگوهای بازدیدکنندگان سایت' : 'View and reply to website visitor conversations'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadConversations()}
          className="inline-flex items-center gap-2 rounded-xl border border-(--theme-border) bg-(--theme-surface) px-3 py-2 text-sm text-(--theme-text) hover:bg-(--theme-surface-muted)"
        >
          <RefreshCw className="h-4 w-4" />
          {isPersian ? 'به‌روزرسانی' : 'Refresh'}
        </button>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="grid min-h-[min(42rem,calc(100dvh-14rem))] overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow) lg:grid-cols-[21rem_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-(--theme-border) lg:border-b-0 lg:border-e">
          <div className="space-y-3 border-b border-(--theme-border) p-4">
            <div className="flex gap-2">
              {(['open', 'closed'] as const).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  aria-pressed={statusFilter === status}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                    statusFilter === status
                      ? 'bg-(--theme-primary) text-(--theme-primary-foreground)'
                      : 'bg-(--theme-surface-muted) text-(--theme-text-muted) hover:text-(--theme-text)'
                  }`}
                >
                  {status === 'open' ? (isPersian ? 'باز' : 'Open') : (isPersian ? 'بسته‌شده' : 'Closed')}
                </button>
              ))}
            </div>
            <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3">
              <Search className="h-4 w-4 shrink-0 text-(--theme-text-muted)" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={isPersian ? 'جستجوی نام...' : 'Search by name...'}
                aria-label={isPersian ? 'جستجوی گفتگوها' : 'Search conversations'}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setSearch(''); }} aria-label={isPersian ? 'پاک کردن جستجو' : 'Clear search'}>
                  <X className="h-4 w-4 text-(--theme-text-muted)" />
                </button>
              )}
            </form>
          </div>

          <div className="min-h-40 flex-1 overflow-y-auto">
            {loadingList && conversations.length === 0 ? (
              <div className="grid h-32 place-items-center text-(--theme-text-muted)"><LoaderCircle className="h-5 w-5 animate-spin" /></div>
            ) : conversations.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-(--theme-text-muted)">
                <MessageSquare className="mx-auto mb-3 h-8 w-8 opacity-40" />
                {isPersian ? 'گفتگویی در این بخش وجود ندارد.' : 'No conversations found.'}
              </div>
            ) : conversations.map((conversation) => (
              <button
                type="button"
                key={conversation.id}
                onClick={() => setSelectedId(conversation.id)}
                className={`block w-full border-b border-(--theme-border) px-4 py-3 text-start transition hover:bg-(--theme-surface-muted) ${
                  selectedId === conversation.id ? 'bg-(--theme-primary)/10' : ''
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-(--theme-text)">{conversation.customer_name}</span>
                  <span className="shrink-0 text-[10px] text-(--theme-text-muted)">{formatDate(conversation.last_message_at || conversation.created_at)}</span>
                </span>
                <span className="mt-1 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-(--theme-text-muted)">{conversation.last_message || (isPersian ? 'بدون پیام' : 'No messages')}</span>
                  {conversation.unread_by_admin > 0 && (
                    <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-(--theme-primary) px-1 text-[10px] font-bold text-(--theme-primary-foreground)">{conversation.unread_by_admin}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[24rem] min-w-0 flex-col">
          {!selectedConversation ? (
            <div className="grid flex-1 place-items-center p-8 text-center text-sm text-(--theme-text-muted)">
              {isPersian ? 'برای مشاهده پیام‌ها یک گفتگو را انتخاب کنید.' : 'Select a conversation to view its messages.'}
            </div>
          ) : (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-(--theme-border) px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-(--theme-text)">{selectedConversation.customer_name}</h2>
                  <p className="mt-0.5 text-xs text-(--theme-text-muted)">
                    {isPersian ? 'شروع گفتگو:' : 'Started:'} {formatDate(selectedConversation.created_at, true)}
                  </p>
                </div>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => void changeStatus()}
                    disabled={updatingStatus}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                      selectedConversation.status === 'open'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-(--theme-surface-muted) text-(--theme-text)'
                    }`}
                  >
                    {selectedConversation.status === 'open' ? <Check className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
                    {updatingStatus
                      ? (isPersian ? 'در حال ذخیره...' : 'Saving...')
                      : selectedConversation.status === 'open'
                        ? (isPersian ? 'بستن گفتگو' : 'Close conversation')
                        : (isPersian ? 'بازگشایی گفتگو' : 'Reopen conversation')}
                  </button>
                )}
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto bg-(--theme-surface-muted)/60 p-4 sm:p-6">
                {messages.map((message) => {
                  const isVisitor = message.sender_type === 'customer';
                  const isSystem = message.sender_type === 'system';
                  return (
                    <div key={message.id} className={`flex ${isVisitor ? 'justify-end' : 'justify-start'}`}>
                      <article className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        isSystem
                          ? 'border border-(--theme-border) bg-(--theme-surface-muted) text-(--theme-text)'
                          : isVisitor
                            ? 'rounded-ee-sm border border-(--theme-card-border) bg-(--theme-card-surface) text-(--theme-text) shadow-(--theme-card-shadow)'
                            : 'rounded-es-sm bg-(--theme-primary) text-(--theme-primary-foreground)'
                      }`}>
                        <div className="mb-1.5 flex items-center justify-between gap-5">
                          <span className="text-[11px] font-bold opacity-80">
                            {isVisitor
                              ? selectedConversation.customer_name
                              : isSystem
                                ? (isPersian ? 'سیستم' : 'System')
                                : message.sender_name || (isPersian ? 'پشتیبانی' : 'Support')}
                          </span>
                          <time className="text-[10px] opacity-70">{formatDate(message.created_at)}</time>
                        </div>
                        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7">{message.body}</p>
                      </article>
                    </div>
                  );
                })}
              </div>

              {selectedConversation.status === 'open' && canManage ? (
                <form onSubmit={sendReply} className="flex items-end gap-3 border-t border-(--theme-border) p-3 sm:p-4">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    rows={2}
                    maxLength={2000}
                    aria-label={isPersian ? 'متن پاسخ' : 'Reply message'}
                    placeholder={isPersian ? 'پاسخ خود را بنویسید...' : 'Write your reply...'}
                    className="max-h-36 min-h-12 flex-1 resize-y rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2.5 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
                  />
                  <button type="submit" disabled={sending || !draft.trim()} className="inline-flex h-12 items-center gap-2 rounded-xl bg-(--theme-btn-bg) px-4 text-sm font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover) disabled:opacity-50">
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">{sending ? (isPersian ? 'در حال ارسال' : 'Sending') : (isPersian ? 'ارسال' : 'Send')}</span>
                  </button>
                </form>
              ) : selectedConversation.status === 'closed' ? (
                <p className="border-t border-(--theme-border) p-4 text-center text-xs text-(--theme-text-muted)">
                  {isPersian ? 'این گفتگو بسته شده است. برای پاسخ‌گویی، آن را بازگشایی کنید.' : 'This conversation is closed. Reopen it to reply.'}
                </p>
              ) : (
                <p className="border-t border-(--theme-border) p-4 text-center text-xs text-(--theme-text-muted)">
                  {isPersian ? 'دسترسی لازم برای پاسخ‌گویی به گفتگو را ندارید.' : 'You do not have permission to reply to conversations.'}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};
