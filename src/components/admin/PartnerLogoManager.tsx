import React, { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Partner } from '../../types/index.ts';
import { ConfirmDialog } from '../ui/ConfirmDialog.tsx';
import { FileUploader } from '../ui/FileUploader.tsx';
import { PagePreloader } from '../common/PagePreloader.tsx';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';

interface PartnerDraft {
  name_fa: string;
  name_en: string;
  logo_url: string;
  sector_fa: string;
  website: string;
}

const emptyDraft: PartnerDraft = { name_fa: '', name_en: '', logo_url: '', sector_fa: 'همکار راهبردی', website: '' };

export const PartnerLogoManager: React.FC = () => {
  const { addToast, fetchBootstrap } = useAppStore();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [draft, setDraft] = useState<PartnerDraft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const loadPartners = useCallback(async () => {
    const response = await apiRequest<{ data: Partner[] }>('/admin/partners?per_page=100');
    setPartners(response.data);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPartners()
      .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : 'دریافت لوگوها ناموفق بود.'))
      .finally(() => setLoading(false));
  }, [loadPartners]);

  const refreshAfterChange = async () => {
    await Promise.all([loadPartners(), fetchBootstrap()]);
    setLoadError('');
  };

  const addPartner = async () => {
    if (!draft.name_fa.trim() || !draft.name_en.trim() || !draft.logo_url) {
      addToast('error', 'نام فارسی، نام انگلیسی و لوگو را تکمیل کنید.');
      return;
    }

    setSaving(true);
    try {
      await apiRequest('/admin/partners', {
        method: 'POST',
        body: JSON.stringify({
          ...draft,
          is_active: true,
        }),
      });
      setDraft(emptyDraft);
      await refreshAfterChange();
      addToast('success', 'لوگوی همکار به اسلایدر صفحه اصلی اضافه شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'افزودن لوگو ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setDraft({
      name_fa: partner.name_fa,
      name_en: partner.name_en,
      logo_url: partner.logo_url,
      sector_fa: partner.sector_fa || '',
      website: partner.website || '',
    });
  };

  const savePartner = async () => {
    if (!editingPartner) return;
    if (!draft.name_fa.trim() || !draft.name_en.trim() || !draft.logo_url.trim()) {
      addToast('error', 'نام فارسی، نام انگلیسی و لوگو الزامی هستند.');
      return;
    }

    setSaving(true);
    try {
      await apiRequest(`/admin/partners/${editingPartner.id}`, {
        method: 'PUT',
        body: JSON.stringify(draft),
      });
      setEditingPartner(null);
      setDraft(emptyDraft);
      await refreshAfterChange();
      addToast('success', 'اطلاعات و لوگوی همکار بروزرسانی شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ویرایش لوگو ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const togglePartner = async (partner: Partner) => {
    try {
      await apiRequest(`/admin/partners/${partner.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !partner.is_active }),
      });
      await refreshAfterChange();
      addToast('success', partner.is_active ? 'لوگو از اسلایدر پنهان شد.' : 'لوگو در اسلایدر نمایش داده می‌شود.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'تغییر وضعیت لوگو ناموفق بود.');
    }
  };

  const deletePartner = async () => {
    if (!partnerToDelete) return;

    setDeleting(true);
    try {
      await apiRequest(`/admin/partners/${partnerToDelete.id}`, { method: 'DELETE' });
      setPartnerToDelete(null);
      await refreshAfterChange();
      addToast('success', 'لوگو از فهرست همکاران حذف شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف لوگو ناموفق بود.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-base font-extrabold">لوگوهای اسلایدر صفحه اصلی</h2>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            لوگوهای فعال در نوار متحرک همکاران نمایش داده می‌شوند. فایل‌ها از فضای رسانه‌ای همین سامانه بارگذاری می‌شوند.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium">
            نام فارسی
            <input
              value={draft.name_fa}
              onChange={(event) => setDraft((current) => ({ ...current, name_fa: event.target.value }))}
              maxLength={255}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <label className="text-xs font-medium">
            نام انگلیسی
            <input
              dir="ltr"
              value={draft.name_en}
              onChange={(event) => setDraft((current) => ({ ...current, name_en: event.target.value }))}
              maxLength={255}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <FileUploader
            folder="partners"
            accept=".png,.jpg,.jpeg,.webp,.gif"
            currentUrl={draft.logo_url}
            label="بارگذاری لوگو"
            onUploaded={(logo_url) => setDraft((current) => ({ ...current, logo_url }))}
          />
          {editingPartner && (
            <>
              <label className="text-xs font-medium">
                حوزه فعالیت
                <input
                  value={draft.sector_fa}
                  onChange={(event) => setDraft((current) => ({ ...current, sector_fa: event.target.value }))}
                  maxLength={255}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </label>
              <label className="text-xs font-medium">
                وب‌سایت
                <input
                  dir="ltr"
                  type="url"
                  value={draft.website}
                  onChange={(event) => setDraft((current) => ({ ...current, website: event.target.value }))}
                  maxLength={2048}
                  placeholder="https://example.com"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </label>
            </>
          )}
          <div className="flex items-end">
            <button
              type="button"
              onClick={editingPartner ? savePartner : addPartner}
              disabled={saving}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-(--theme-primary) px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {editingPartner ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {saving ? 'در حال ذخیره...' : editingPartner ? 'ذخیره ویرایش' : 'افزودن به اسلایدر'}
            </button>
          </div>
          {editingPartner && (
            <button
              type="button"
              onClick={() => {
                setEditingPartner(null);
                setDraft(emptyDraft);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
              انصراف از ویرایش
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold">فهرست لوگوها</h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {partners.filter((partner) => partner.is_active).length} فعال از {partners.length}
          </span>
        </div>

        {loadError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{loadError}</p>}
        {loading ? (
          <PagePreloader label="در حال دریافت فهرست لوگوها..." />
        ) : partners.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700">
            هنوز لوگویی به اسلایدر اضافه نشده است.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
              >
                <div className="grid h-14 w-16 shrink-0 place-items-center rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                  <ZeroBrokenImage src={partner.logo_url} alt="" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{partner.name_fa}</p>
                  <p dir="ltr" className="mt-1 truncate text-start text-[10px] text-slate-500">{partner.name_en}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{partner.is_active ? 'نمایش در صفحه اصلی' : 'پنهان از صفحه اصلی'}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => beginEdit(partner)}
                    aria-label={`ویرایش ${partner.name_fa}`}
                    title="ویرایش لوگو و مشخصات"
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-(--theme-primary) dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePartner(partner)}
                    aria-label={partner.is_active ? `پنهان‌کردن ${partner.name_fa}` : `نمایش ${partner.name_fa}`}
                    title={partner.is_active ? 'پنهان کردن از اسلایدر' : 'نمایش در اسلایدر'}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-(--theme-primary) dark:hover:bg-slate-800"
                  >
                    {partner.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartnerToDelete(partner)}
                    aria-label={`حذف ${partner.name_fa}`}
                    title="حذف لوگو"
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(partnerToDelete)}
        onClose={() => setPartnerToDelete(null)}
        onConfirm={deletePartner}
        title="حذف لوگو"
        message={`آیا از حذف لوگوی «${partnerToDelete?.name_fa ?? ''}» مطمئن هستید؟`}
        confirmLabel="حذف لوگو"
        loading={deleting}
      />
    </div>
  );
};
