import React, { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { ContactMessage } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { MessageSquare, Trash2 } from 'lucide-react';

const MESSAGE_PAGE_SIZES = [5, 10, 20, 50] as const;

interface AdminTicket extends ContactMessage {
  ticket_messages: Array<{ id: number; author_name: string; author_type: string; body: string; is_internal: boolean; created_at: string }>;
  ticket_history: Array<{ id: number; action: string; old_value: Record<string, unknown> | null; new_value: Record<string, unknown> | null; created_at: string }>;
  assignee?: { id: number; name: string } | null;
}

export const MessagesRfqAdminPage: React.FC = () => {
  const { addToast, user } = useAppStore();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState<number>(10);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const loadRequest = useRef(0);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticket, setTicket] = useState<AdminTicket | null>(null);
  const [ticketReply, setTicketReply] = useState('');
  const [assigneeIdText, setAssigneeIdText] = useState('');
  const [internalReply, setInternalReply] = useState(false);
  const canManageMessages = Boolean(user?.permissions.includes('messages.manage'));

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = async (targetPage = page) => {
    const requestId = ++loadRequest.current;
    const params = new URLSearchParams({
      page: String(targetPage),
      per_page: String(perPage),
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    if (appliedSearch) params.set('q', appliedSearch);
    setLoading(true);
    try {
      const response = await apiRequest<{ data: ContactMessage[]; meta: { last_page: number; total: number } }>(
        `/admin/messages?${params.toString()}`,
      );
      if (requestId !== loadRequest.current) return;
      if (targetPage > response.meta.last_page) {
        setPage(Math.max(1, response.meta.last_page));
        return;
      }
      setMessages(response.data);
      setLastPage(response.meta.last_page);
      setTotal(response.meta.total);
    } catch (error) {
      if (requestId === loadRequest.current) {
        addToast('error', error instanceof Error ? error.message : 'بارگذاری پیام‌ها ناموفق بود.');
      }
    } finally {
      if (requestId === loadRequest.current) setLoading(false);
    }
  };

  useEffect(() => {
    void load(page);
  }, [page, perPage, appliedSearch, sortBy, sortOrder]);

  useEffect(() => {
    if (selectedTicketId === null) {
      setTicket(null);
      return;
    }
    apiRequest<{ data: AdminTicket }>(`/admin/tickets/${selectedTicketId}`)
      .then((response) => {
        setTicket(response.data);
        setAssigneeIdText(response.data.assignee_id?.toString() ?? '');
      })
      .catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'دریافت گفتگو ناموفق بود.'));
  }, [selectedTicketId, addToast]);

  const updateTicket = async (data: { ticket_status?: string; priority?: string; assignee_id?: number | null }) => {
    if (!ticket) return;
    try {
      const response = await apiRequest<{ data: AdminTicket }>(`/admin/tickets/${ticket.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setTicket((current) => current ? { ...current, ...response.data } : current);
      addToast('success', 'تنظیمات تیکت بروزرسانی شد.');
      await load();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'بروزرسانی تیکت ناموفق بود.');
    }
  };

  const sendTicketReply = async () => {
    if (!ticket || !ticketReply.trim()) return;
    try {
      await apiRequest(`/admin/tickets/${ticket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: ticketReply, is_internal: internalReply }),
      });
      setTicketReply('');
      const response = await apiRequest<{ data: AdminTicket }>(`/admin/tickets/${ticket.id}`);
      setTicket(response.data);
      addToast('success', internalReply ? 'یادداشت داخلی ثبت شد.' : 'پاسخ به مشتری ارسال شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ارسال پاسخ تیکت ناموفق بود.');
    }
  };

  const cols: Column<ContactMessage>[] = [
    {
      key: 'sender',
      sortKey: 'name',
      header: 'فرستنده و شرکت',
      render: (m) => (
        <div>
          <div className="font-bold text-(--theme-text)">{m.name}</div>
          <div className="text-xs text-(--theme-text-muted)">{m.company || m.email} · {m.phone}</div>
        </div>
      ),
    },
    {
      key: 'subject',
      sortKey: 'subject',
      hideable: true,
      header: 'موضوع و شرح',
      render: (m) => (
        <div className="max-w-md">
          <div className="text-xs font-semibold text-(--theme-primary-ink)">{m.type.toUpperCase()} · {m.subject}</div>
          <p className="mt-1 text-xs text-(--theme-text-muted)">{m.message}</p>
        </div>
      ),
    },
    {
      key: 'status',
      sortKey: 'status',
      hideable: true,
      header: 'وضعیت پیگیری',
      render: (m) => (
        <div className="w-36">
          <SearchableSelect
            options={[
              { value: 'new', label: 'جدید' },
              { value: 'reviewed', label: 'بررسی‌شده' },
              { value: 'replied', label: 'پاسخ‌داده‌شده' },
            ]}
            value={m.status}
            onChange={async (val) => {
              try {
                await apiRequest(`/admin/messages/${m.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({ status: val }),
                });
                addToast('success', 'وضعیت پیام بروزرسانی شد.');
                await load();
              } catch (error) {
                addToast('error', error instanceof Error ? error.message : 'بروزرسانی پیام ناموفق بود.');
              }
            }}
          />
        </div>
      ),
    },
    {
      key: 'ticket',
      hideable: true,
      header: 'پیگیری تیکت',
      render: (message) => message.type === 'ticket' ? (
        <div className="space-y-1">
          <div className="font-mono text-[11px] text-(--theme-text-muted)">{message.tracking_number}</div>
          <button type="button" onClick={() => setSelectedTicketId(message.id)} className="text-xs font-semibold text-(--theme-link) hover:underline">
            مشاهده گفتگو
          </button>
        </div>
      ) : null,
    },
    {
      key: 'actions',
      header: 'عملیات',
      render: (message) => canManageMessages ? (
        <button type="button" onClick={() => setDeleteTarget(message)} aria-label="حذف پیام" className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null,
    },
  ];

  const removeMessage = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiRequest(`/admin/messages/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      addToast('success', 'پیام به‌صورت نرم حذف شد.');
      await load();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف پیام ناموفق بود.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        icon={MessageSquare}
        eyebrow="Customer support"
        title="مدیریت پیام‌های تماس، استعلام‌های RFQ و تیکت‌ها"
        description="درخواست‌های همکاری و استعلام قیمت، پیام‌های فرم تماس و گفتگوهای پیگیری تیکت را بررسی و پاسخ دهید."
      />
      <DataTable
        data={messages}
        columns={cols}
        rowKey={(message) => message.id}
        tableLabel="فهرست پیام‌ها و تیکت‌ها"
        pageSize={perPage}
        pageSizeOptions={MESSAGE_PAGE_SIZES}
        onPageSizeChange={(size) => {
          setPerPage(size);
          setPage(1);
        }}
        currentPage={page}
        lastPage={lastPage}
        total={total}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="جست‌وجوی فرستنده، موضوع یا شرکت..."
        searchLabel="جست‌وجوی پیام‌ها"
        sortBy={sortBy}
        sortDirection={sortOrder}
        onSortChange={(field, direction) => {
          setSortBy(field);
          setSortOrder(direction);
          setPage(1);
        }}
        loading={loading}
        emptyText={appliedSearch ? 'پیامی با این جست‌وجو پیدا نشد.' : 'پیامی برای نمایش وجود ندارد.'}
      />
      {ticket && (
        <section className="space-y-4 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-(--theme-text)">{ticket.subject}</h2>
              <p className="mt-1 text-xs text-(--theme-text-muted)">{ticket.tracking_number} · {ticket.name} · {ticket.email} · {ticket.phone}</p>
            </div>
            <button type="button" onClick={() => setSelectedTicketId(null)} className="text-xs text-(--theme-text-muted) hover:underline">بستن</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <select value={ticket.ticket_status ?? 'open'} onChange={(event) => updateTicket({ ticket_status: event.target.value })} disabled={!canManageMessages} className="rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)">
              <option value="open">باز</option><option value="in_progress">در حال بررسی</option><option value="waiting_customer">منتظر مشتری</option><option value="resolved">حل‌شده</option><option value="closed">بسته</option>
            </select>
            <select value={ticket.priority ?? 'normal'} onChange={(event) => updateTicket({ priority: event.target.value })} disabled={!canManageMessages} className="rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)">
              <option value="low">کم</option><option value="normal">عادی</option><option value="high">زیاد</option><option value="urgent">فوری</option>
            </select>
            <div className="flex gap-2">
              <input type="number" min="1" value={assigneeIdText} disabled={!canManageMessages} onChange={(event) => setAssigneeIdText(event.target.value)} placeholder="شناسه مسئول" className="min-w-0 flex-1 rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
              <button type="button" disabled={!canManageMessages} onClick={() => updateTicket({ assignee_id: assigneeIdText ? Number(assigneeIdText) : null })} className="rounded-xl border border-(--theme-border) bg-(--theme-surface) px-3 py-2 text-xs text-(--theme-text) hover:bg-(--theme-surface-muted) disabled:opacity-50">ثبت مسئول</button>
            </div>
          </div>
          <div className="max-h-80 space-y-3 overflow-auto">
            {ticket.ticket_messages?.map((message) => (
              <article key={message.id} className={`rounded-xl p-3 text-sm ${message.is_internal ? 'border border-amber-300/60 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100' : 'border border-(--theme-border) bg-(--theme-surface-muted) text-(--theme-text)'}`}>
                <div className="mb-1 flex justify-between text-xs text-(--theme-text-muted)"><span>{message.author_name}{message.is_internal ? ' · داخلی' : ''}</span><time>{new Date(message.created_at).toLocaleString('fa-IR')}</time></div>
                <p className="whitespace-pre-wrap">{message.body}</p>
              </article>
            ))}
          </div>
          {canManageMessages && (
            <div className="space-y-2">
              <textarea value={ticketReply} onChange={(event) => setTicketReply(event.target.value)} rows={3} placeholder="پاسخ یا یادداشت داخلی" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
              <label className="flex items-center gap-2 text-xs text-(--theme-text)"><input type="checkbox" checked={internalReply} onChange={(event) => setInternalReply(event.target.checked)} className="accent-(--theme-primary)" />یادداشت داخلی (برای مشتری نمایش داده نشود)</label>
              <button type="button" onClick={sendTicketReply} disabled={!ticketReply.trim()} className="rounded-xl bg-(--theme-btn-bg) px-4 py-2 text-xs font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover) disabled:opacity-50">ثبت پاسخ</button>
            </div>
          )}
          {ticket.ticket_history?.length > 0 && (
            <details className="text-xs text-(--theme-text)">
              <summary className="cursor-pointer font-semibold">تاریخچه تغییرات</summary>
              <ul className="mt-2 space-y-1 text-(--theme-text-muted)">{ticket.ticket_history.map((event) => <li key={event.id}>{event.action} · {new Date(event.created_at).toLocaleString('fa-IR')}</li>)}</ul>
            </details>
          )}
        </section>
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={removeMessage}
        loading={deleting}
        message="این پیام به‌صورت نرم حذف می‌شود و از فهرست خارج خواهد شد. ادامه می‌دهید؟"
      />
    </div>
  );
};
