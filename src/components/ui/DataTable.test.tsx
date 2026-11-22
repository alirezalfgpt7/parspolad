import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable, type Column } from './DataTable.tsx';

interface Row {
  id: number;
  name: string;
  email: string;
}

const rows: Row[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
}));

const columns: Column<Row>[] = [
  { key: 'name', header: 'Name', render: (row) => row.name },
  { key: 'email', header: 'Email', hideable: true, render: (row) => row.email },
];

describe('DataTable', () => {
  it('offers the five-row page size and lets users hide optional columns', () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        tableLabel="Users"
        pageSize={10}
      />,
    );

    fireEvent.change(screen.getByRole('combobox', { name: 'تعداد ردیف در هر صفحه' }), {
      target: { value: '5' },
    });
    expect(screen.getAllByRole('row')).toHaveLength(6);

    fireEvent.click(screen.getByText('ستون‌ها'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Email' }));

    expect(screen.queryByRole('columnheader', { name: 'Email' })).toBeNull();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeTruthy();
  });
});
