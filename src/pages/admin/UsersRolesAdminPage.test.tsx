import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UsersRolesAdminPage } from './UsersRolesAdminPage.tsx';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
}));

vi.mock('../../services/api.ts', () => ({
  apiRequest: vi.fn((path: string) => {
    if (path.startsWith('/admin/users?')) {
      return Promise.resolve({
        users: [],
        users_meta: { last_page: 1, total: 0 },
        roles: [{
          id: 1,
          name: 'operator',
          label_fa: 'اپراتور',
          label_en: 'Operator',
          permissions: [],
          users_count: 0,
        }],
        permissions: ['analytics.view', 'projects.view'],
      });
    }

    return Promise.resolve({});
  }),
}));

vi.mock('../../store/useAppStore.ts', () => ({
  useAppStore: () => ({
    addToast: mocks.addToast,
    language: 'fa',
    user: { role: 'super-admin' },
  }),
}));

describe('UsersRolesAdminPage', () => {
  afterEach(cleanup);

  it('searches individual permissions by their Persian label or identifier', async () => {
    render(<UsersRolesAdminPage />);

    await screen.findByText('مشاهدهٔ آمار و تحلیل‌ها');
    expect(screen.getByText('مشاهدهٔ پروژه‌ها')).toBeTruthy();

    fireEvent.change(screen.getByRole('searchbox', { name: 'جست‌وجوی دسترسی‌ها' }), {
      target: { value: 'پروژه‌ها' },
    });

    expect(screen.getByText('مشاهدهٔ پروژه‌ها')).toBeTruthy();
    expect(screen.queryByText('مشاهدهٔ آمار و تحلیل‌ها')).toBeNull();
  });
});
