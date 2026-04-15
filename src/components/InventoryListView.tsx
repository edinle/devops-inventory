import React from 'react';
import Button from '@atlaskit/button/new';
import DynamicTable from '@atlaskit/dynamic-table';
import Lozenge from '@atlaskit/lozenge';
import { Box, Text } from '@atlaskit/primitives';
import type { Category, Checkout, Equipment, User } from '../types';

type Props = {
  equipment: Equipment[];
  categories: Category[];
  checkouts: Checkout[];
  users: User[];
  query: string;
  statusFilter: 'all' | 'active' | 'available' | 'checked_out' | 'archived';
  role: 'super_admin' | 'manager';
  onArchive: (id: string, reason: string) => void;
};

function statusMeta(status: Equipment['status']) {
  if (status === 'available') return { label: 'Available', appearance: 'success' as const };
  if (status === 'checked_out') return { label: 'Checked out', appearance: 'inprogress' as const };
  return { label: 'Archived', appearance: 'removed' as const };
}

export default function InventoryListView({
  equipment,
  categories,
  checkouts,
  users,
  query,
  statusFilter,
  role,
  onArchive,
}: Props) {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = equipment.filter((item) => {
    if (statusFilter === 'active' && item.status === 'archived') {
      return false;
    }
    if (statusFilter !== 'all' && statusFilter !== 'active' && item.status !== statusFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const categoryName = categories.find((category) => category.id === item.categoryId)?.name ?? '';

    return (
      item.name.toLowerCase().includes(normalizedQuery)
      || item.tagNumber.toLowerCase().includes(normalizedQuery)
      || categoryName.toLowerCase().includes(normalizedQuery)
    );
  });

  const head = {
    cells: [
      { key: 'name', content: 'Equipment', width: 22 },
      { key: 'tag', content: 'Tag', width: 10 },
      { key: 'category', content: 'Category', width: 16 },
      { key: 'status', content: 'Status', width: 12 },
      { key: 'borrower', content: 'Borrower', width: 16 },
      { key: 'due', content: 'Due', width: 12 },
      { key: 'notes', content: 'Latest note', width: 20 },
      { key: 'actions', content: '', width: 12 },
    ],
  };

  const rows = filtered.map((item) => {
    const category = categories.find((entry) => entry.id === item.categoryId);
    const checkout = checkouts.find((entry) => entry.equipmentId === item.id);
    const borrower = checkout ? users.find((user) => user.id === checkout.userId) : undefined;
    const meta = statusMeta(item.status);

    return {
      key: item.id,
      cells: [
        {
          key: 'name',
          content: (
            <Text as="strong" weight="semibold" color="inherit">
              {item.name}
            </Text>
          ),
        },
        { key: 'tag', content: item.tagNumber },
        { key: 'category', content: category?.name ?? '—' },
        {
          key: 'status',
          content: (
            <Lozenge appearance={meta.appearance}>
              {meta.label}
            </Lozenge>
          ),
        },
        { key: 'borrower', content: borrower?.fullName ?? '—' },
        {
          key: 'due',
          content: checkout
            ? new Date(checkout.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '—',
        },
        {
          key: 'notes',
          content: item.archivedReason ?? item.conditionNotes[item.conditionNotes.length - 1] ?? '—',
        },
        {
          key: 'actions',
          content: role === 'super_admin' && item.status !== 'archived' ? (
            <Button
              appearance="subtle"
              spacing="compact"
              onClick={() => {
                const reason = window.prompt('Reason for archiving this item');
                if (reason && reason.trim()) {
                  onArchive(item.id, reason.trim());
                }
              }}
            >
              Archive
            </Button>
          ) : null,
        },
      ],
    };
  });

  return (
    <Box style={{ padding: 24 }}>
      <DynamicTable head={head} rows={rows} rowsPerPage={12} defaultPage={1} isFixedSize />
    </Box>
  );
}
