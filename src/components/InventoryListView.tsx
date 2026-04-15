import React from 'react';
import Button from '@atlaskit/button/new';
import DynamicTable from '@atlaskit/dynamic-table';
import Lozenge from '@atlaskit/lozenge';
import { Box, Pressable, Text } from '@atlaskit/primitives';
import type { Category, Checkout, Equipment, User } from '../types';

type Props = {
  equipment: Equipment[];
  categories: Category[];
  checkouts: Checkout[];
  users: User[];
  query: string;
  statusFilter: 'all' | 'active' | 'available' | 'checked_out' | 'archived';
  onStatusFilterChange: (status: 'all' | 'available' | 'archived') => void;
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
  onStatusFilterChange,
  role,
  onArchive,
}: Props) {
  const [sortKey, setSortKey] = React.useState<string>('name');
  const [sortOrder, setSortOrder] = React.useState<'ASC' | 'DESC'>('ASC');
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
      { key: 'name', content: 'Equipment', width: 22, isSortable: true },
      { key: 'tag', content: 'Tag', width: 10, isSortable: true },
      { key: 'category', content: 'Category', width: 16, isSortable: true },
      { key: 'status', content: 'Status', width: 12, isSortable: true },
      { key: 'borrower', content: 'Borrower', width: 16, isSortable: true },
      { key: 'due', content: 'Due', width: 12, isSortable: true },
      { key: 'notes', content: 'Latest note', width: 20, isSortable: true },
      { key: 'actions', content: '', width: 12 },
    ],
  };

  const tableData = filtered.map((item) => {
    const category = categories.find((entry) => entry.id === item.categoryId);
    const checkout = checkouts.find((entry) => entry.equipmentId === item.id);
    const borrower = checkout ? users.find((user) => user.id === checkout.userId) : undefined;
    const meta = statusMeta(item.status);
    const dueDate = checkout ? new Date(checkout.dueAt) : null;
    const dueLabel = dueDate
      ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '—';
    const noteValue = item.archivedReason ?? item.conditionNotes[item.conditionNotes.length - 1] ?? '—';

    return {
      item,
      categoryName: category?.name ?? '',
      borrowerName: borrower?.fullName ?? '',
      dueDate,
      noteValue,
      meta,
      dueLabel,
      borrower,
    };
  });

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

  const sortedData = [...tableData].sort((a, b) => {
    let result = 0;

    if (sortKey === 'name') {
      result = collator.compare(a.item.name, b.item.name);
    } else if (sortKey === 'tag') {
      result = collator.compare(a.item.tagNumber, b.item.tagNumber);
    } else if (sortKey === 'category') {
      result = collator.compare(a.categoryName, b.categoryName);
    } else if (sortKey === 'status') {
      result = collator.compare(a.meta.label, b.meta.label);
    } else if (sortKey === 'borrower') {
      result = collator.compare(a.borrowerName || 'zzzz', b.borrowerName || 'zzzz');
    } else if (sortKey === 'due') {
      if (!a.dueDate && !b.dueDate) result = 0;
      else if (!a.dueDate) result = 1;
      else if (!b.dueDate) result = -1;
      else result = a.dueDate.getTime() - b.dueDate.getTime();
    } else if (sortKey === 'notes') {
      result = collator.compare(a.noteValue, b.noteValue);
    }

    return sortOrder === 'ASC' ? result : -result;
  });

  const rows = sortedData.map((entry) => {
    const { item, categoryName, meta, borrower, dueLabel, noteValue } = entry;

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
        { key: 'category', content: categoryName || '—' },
        {
          key: 'status',
          content: (
            <Lozenge appearance={meta.appearance}>
              {meta.label}
            </Lozenge>
          ),
        },
        { key: 'borrower', content: borrower?.fullName ?? '—' },
        { key: 'due', content: dueLabel },
        {
          key: 'notes',
          content: noteValue,
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

  const tabItems: Array<{ key: 'all' | 'available' | 'archived'; label: string; count: number }> = [
    { key: 'all', label: 'All', count: equipment.length },
    { key: 'available', label: 'Available', count: equipment.filter((item) => item.status === 'available').length },
    { key: 'archived', label: 'Archived', count: equipment.filter((item) => item.status === 'archived').length },
  ];

  const selectedTab: 'all' | 'available' | 'archived' = statusFilter === 'available' || statusFilter === 'archived'
    ? statusFilter
    : 'all';

  return (
    <Box style={{ padding: 24 }}>
      <Box style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {tabItems.map((tab) => {
          const isActive = selectedTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onClick={() => onStatusFilterChange(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 999,
                border: `1px solid ${isActive ? '#0C66E4' : '#DFE1E6'}`,
                background: isActive ? '#E9F2FF' : '#FFFFFF',
                color: isActive ? '#0C66E4' : '#42526E',
                padding: '6px 12px',
              }}
            >
              <Text as="span" size="small" weight="medium" color="inherit">
                {tab.label}
              </Text>
              <Box
                style={{
                  minWidth: 20,
                  padding: '0 6px',
                  borderRadius: 999,
                  background: isActive ? '#0C66E4' : '#F1F2F4',
                  color: isActive ? '#FFFFFF' : '#42526E',
                  textAlign: 'center',
                }}
              >
                <Text as="span" size="small" weight="medium" color="inherit">
                  {tab.count}
                </Text>
              </Box>
            </Pressable>
          );
        })}
      </Box>

      <DynamicTable
        head={head}
        rows={rows}
        rowsPerPage={12}
        defaultPage={1}
        isFixedSize
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={(data) => {
          const nextSortKey = data?.key;
          const nextSortOrder = data?.sortOrder;
          if (!nextSortKey || !nextSortOrder) {
            return;
          }
          setSortKey(nextSortKey);
          setSortOrder(nextSortOrder);
        }}
      />
    </Box>
  );
}
