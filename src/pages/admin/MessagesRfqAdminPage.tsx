import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { ContactMessage } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';

export const MessagesRfqAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const load = () => {
    apiRequest<{ data: ContactMessage[] }>('/admin/messages').then((r) => setMessages(r.data)).catch(() => {});
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
              await apiRequest(`/admin/messages/${m.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: val }),
              });
              addToast('success', 'وضعیت پیام بروزرسانی شد.');
              load();
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-extrabold">مدیریت پیام‌های تماس، استعلام‌های RFQ و تیکت‌ها</h1>
      <DataTable data={messages} columns={cols} searchKeys={[(m) => m.name, (m) => m.subject, (m) => m.company || '']} />
    </div>
  );
};
