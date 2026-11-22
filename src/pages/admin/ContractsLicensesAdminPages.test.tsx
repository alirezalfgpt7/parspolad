import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { apiRequest } from '../../services/api.ts';
import type { Contract, License } from '../../types/index.ts';
import { ContractsAdminPage } from './ContractsAdminPage.tsx';
import { LicensesAdminPage } from './LicensesAdminPage.tsx';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  apiRequest: vi.fn(),
}));

vi.mock('../../services/api.ts', () => ({ apiRequest: mocks.apiRequest }));
vi.mock('../../store/useAppStore.ts', () => ({ useAppStore: () => ({ addToast: mocks.addToast }) }));

const contract: Contract = {
  id: 1,
  contract_number: 'PPA-1404-01',
  title_fa: 'پیمان نمونه',
  title_en: 'Sample contract',
  client_fa: 'کارفرمای نمونه',
  client_en: 'Sample client',
  amount_billion_irr: 120,
  start_year: 1404,
  end_year: 1405,
  status: 'active',
  scope_fa: 'شرح قرارداد',
  scope_en: 'Contract scope',
  document_url: undefined,
  requires_auth: false,
};

const license: License = {
  id: 2,
  code: 'ISO-9001',
  title_fa: 'گواهینامه نمونه',
  title_en: 'Sample certificate',
  issuer_fa: 'مرجع نمونه',
  issuer_en: 'Sample issuer',
  issue_date: '1404/01/01',
  expiry_date: '1407/01/01',
  category: 'iso',
  image_url: '/certificates/sample.jpg',
  document_url: undefined,
  requires_auth: false,
};

describe('separate contract and license admin pages', () => {
  beforeEach(() => {
    mocks.apiRequest.mockImplementation((path: string) => {
      if (path === '/admin/contracts/1') return Promise.resolve({ data: contract });
      if (path === '/admin/licenses/2') return Promise.resolve({ data: license });
      if (path.startsWith('/admin/contracts?')) {
        return Promise.resolve({ data: [contract], meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 } });
      }
      if (path.startsWith('/admin/licenses?')) {
        return Promise.resolve({ data: [license], meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 } });
      }
      return Promise.resolve({});
    });
  });

  afterEach(cleanup);

  it('searches and changes the server-side page size for contracts', async () => {
    render(<ContractsAdminPage />);

    await screen.findByText('پیمان نمونه');
    expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining('per_page=10'));

    fireEvent.change(screen.getByRole('combobox', { name: 'تعداد ردیف در هر صفحه' }), {
      target: { value: '20' },
    });
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining('per_page=20'));
    });

    fireEvent.change(screen.getByRole('searchbox', { name: 'جست‌وجوی قراردادها' }), {
      target: { value: 'PPA-1404' },
    });
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining('q=PPA-1404'));
    });
  });

  it('loads contract details only when editing', async () => {
    render(<ContractsAdminPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'ویرایش پیمان نمونه' }));
    await screen.findByLabelText('شرح فارسی قرارداد (اختیاری)');
    expect(apiRequest).toHaveBeenCalledWith('/admin/contracts/1');
  });

  it('shows licenses in a searchable paginated table and loads details when editing', async () => {
    render(<LicensesAdminPage />);

    await screen.findByRole('columnheader', { name: 'کد استاندارد' });
    expect(screen.getByText('گواهینامه نمونه')).toBeTruthy();
    expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining('per_page=10'));

    fireEvent.change(screen.getByRole('searchbox', { name: 'جست‌وجوی گواهینامه‌ها' }), {
      target: { value: 'ISO-9001' },
    });
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining('q=ISO-9001'));
    });

    fireEvent.click(screen.getByRole('button', { name: 'ویرایش گواهینامه نمونه' }));
    await screen.findByText('تاریخ انقضا (اختیاری)');
    expect(apiRequest).toHaveBeenCalledWith('/admin/licenses/2');
  });
});
