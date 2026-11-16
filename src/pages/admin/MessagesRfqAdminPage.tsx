import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { ContactMessage } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { Trash2 } from 'lucide-react';

export const MessagesRfqAdminPage: React.FC = () => {
  const { addToast, user } = useAppStore();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const canManageMessages = Boolean(user?.permissions.includes('messages.manage'));

  const load = async () => {
    try {
      const response = await apiRequest<{ data: ContactMessage[] }>('/admin/messages');
      setMessages(response.data);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'بارگذاری پیام‌ها ناموفق بود.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cols: Column<ContactMessage>[] = [
    {
      key: 'sender',
      header: 'فرستنده و شرکت',
      render: (m) => (
        <div>
          <div className="font-bold">{m.name}</div>
          <div className="text-xs text-slate-500">{m.company || m.email} · {m.phone}</div>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'موضوع و شرح',
      render: (m) => (
        <div className="max-w-md">
          <div className="font-semibold text-xs text-[var(--theme-primary)]">{m.type.toUpperCase()} · {m.subject}</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{m.message}</p>
        </div>
      ),
    },
    {
      key: 'status',
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
      key: 'actions',
      header: 'عملیات',
      render: (message) => canManageMessages ? (
        <button type="button" onClick={() => setDeleteTarget(message)} aria-label="حذف پیام" className="rounded p-1.5 text-red-600 hover:bg-red-50">
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
      <h1 className="text-lg font-extrabold">مدیریت پیام‌های تماس، استعلام‌های RFQ و تیکت‌ها</h1>
      <DataTable data={messages} columns={cols} searchKeys={[(m) => m.name, (m) => m.subject, (m) => m.company || '']} />
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
