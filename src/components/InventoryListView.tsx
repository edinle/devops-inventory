import React from 'react';
import Button, { IconButton } from '@atlaskit/button/new';
import DynamicTable from '@atlaskit/dynamic-table';
import Lozenge from '@atlaskit/lozenge';
import { Box, Pressable, Text } from '@atlaskit/primitives';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import Tooltip from '@atlaskit/tooltip';
import AddIcon from '@atlaskit/icon/core/add';
import CheckCircleIcon from '@atlaskit/icon/core/check-circle';
import EditIcon from '@atlaskit/icon/core/edit';
import CrossIcon from '@atlaskit/icon/core/cross';
import EmailIcon from '@atlaskit/icon/core/email';
import { resolveAtlaskitIcon } from '../utils/resolveAtlaskitIcon';
import type { Category, Checkout, Equipment, User } from '../types';
import CheckOutModal from './CheckOutModal';
import CheckInModal from './CheckInModal';

type Props = {
  equipment: Equipment[];
  categories: Category[];
  checkouts: Checkout[];
  users: User[];
  query: string;
  statusFilter: 'all' | 'active' | 'available' | 'checked_out' | 'archived';
  onStatusFilterChange: (status: 'all' | 'available' | 'archived') => void;
  role: 'super_admin' | 'manager';
  onCheckOut: (co: Omit<Checkout, 'id'>) => void;
  onCheckIn: (checkoutId: string, note: string) => void;
  onSendReminder: (checkoutId: string) => void;
  onArchive: (id: string, reason: string) => void;
  onEditItem: (id: string, name: string, categoryId: string) => void;
};

// ─── Edit Item Modal ──────────────────────────────────────────────────────────
type EditModalProps = {
  item: Equipment;
  categories: Category[];
  onClose: () => void;
  onConfirm: (name: string, categoryId: string) => void;
};

function EditItemModal({ item, categories, onClose, onConfirm }: EditModalProps) {
  const [name, setName] = React.useState(item.name);
  const [categoryId, setCategoryId] = React.useState(item.categoryId);

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));
  const selectedCategory = categoryOptions.find((o) => o.value === categoryId) ?? null;

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed, categoryId);
  }

  return (
    <Modal onClose={onClose} width="small">
      <ModalHeader>
        <ModalTitle>Edit Item</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Box>
            <Text as="span" size="small" weight="medium">Item name</Text>
            <Box style={{ marginTop: 4 }}>
              <TextField
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Equipment name"
                autoFocus
              />
            </Box>
          </Box>
          <Box>
            <Text as="span" size="small" weight="medium">Category</Text>
            <Box style={{ marginTop: 4 }}>
              <Select
                options={categoryOptions}
                value={selectedCategory}
                onChange={(opt) => { if (opt) setCategoryId(opt.value); }}
                placeholder="Select category"
              />
            </Box>
          </Box>
        </Box>
      </ModalBody>
      <ModalFooter>
        <Button appearance="subtle" onClick={onClose}>Cancel</Button>
        <Button appearance="primary" onClick={handleSubmit} isDisabled={!name.trim()}>
          Save changes
        </Button>
      </ModalFooter>
    </Modal>
  );
}

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
  onCheckOut,
  onCheckIn,
  onSendReminder,
  onArchive,
  onEditItem,
}: Props) {
  const [sortKey, setSortKey] = React.useState<string>('name');
  const [sortOrder, setSortOrder] = React.useState<'ASC' | 'DESC'>('ASC');
  const [checkOutItem, setCheckOutItem] = React.useState<Equipment | null>(null);
  const [checkInItem, setCheckInItem] = React.useState<Equipment | null>(null);
  const [editItem, setEditItem] = React.useState<Equipment | null>(null);
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
      { key: 'actions', content: 'Actions', width: 12 },
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
          content: (
            <Box style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-start' }}>
              {/* Check Out — only for available items */}
              {item.status === 'available' && (
                <Tooltip content="Check Out">
                  <IconButton 
                    appearance="primary" 
                    spacing="compact" 
                    onClick={() => setCheckOutItem(item)}
                    icon={resolveAtlaskitIcon(AddIcon)}
                    label="Check Out"
                  />
                </Tooltip>
              )}

              {/* Check In + Remind — only for checked-out items */}
              {item.status === 'checked_out' && (
                <>
                  <Tooltip content="Check In">
                    <IconButton 
                      appearance="default" 
                      spacing="compact" 
                      onClick={() => setCheckInItem(item)}
                      icon={resolveAtlaskitIcon(CheckCircleIcon)}
                      label="Check In"
                    />
                  </Tooltip>
                  <Tooltip content="Send Reminder">
                    <IconButton 
                      appearance="subtle" 
                      spacing="compact"
                      onClick={() => {
                        const checkout = checkouts.find((entry) => entry.equipmentId === item.id);
                        if (checkout) {
                          onSendReminder(checkout.id);
                        }
                      }}
                      icon={resolveAtlaskitIcon(EmailIcon)}
                      label="Send Reminder"
                    />
                  </Tooltip>
                </>
              )}

              {/* Edit — available to all roles, not on archived items */}
              {item.status !== 'archived' && (
                <Tooltip content="Edit Item">
                  <IconButton
                    appearance="subtle"
                    spacing="compact"
                    onClick={() => setEditItem(item)}
                    icon={resolveAtlaskitIcon(EditIcon)}
                    label="Edit Item"
                  />
                </Tooltip>
              )}

              {/* Archive — super_admin only, not on already-archived items */}
              {role === 'super_admin' && item.status !== 'archived' && (
                <Tooltip content="Archive Item">
                  <IconButton
                    appearance="subtle"
                    spacing="compact"
                    onClick={() => {
                      const reason = window.prompt('Reason for archiving this item');
                      if (reason && reason.trim()) {
                        onArchive(item.id, reason.trim());
                      }
                    }}
                    icon={resolveAtlaskitIcon(CrossIcon)}
                    label="Archive Item"
                  />
                </Tooltip>
              )}
            </Box>
          ),
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

  const checkInCheckout = checkInItem ? checkouts.find((entry) => entry.equipmentId === checkInItem.id) ?? null : null;
  const checkInBorrower = checkInCheckout ? users.find((entry) => entry.id === checkInCheckout.userId) : undefined;

  return (
    <>
      <style>{`
        .inventory-table-container {
          overflow-x: auto;
          position: relative;
        }
        .inventory-table-container [data-testid="dynamic-table"] {
          min-width: 800px;
        }
        .inventory-table-container th:last-child,
        .inventory-table-container td:last-child {
          position: sticky;
          right: 0;
          background: white;
          box-shadow: -2px 0 4px rgba(0,0,0,0.1);
          z-index: 1;
        }
        .inventory-table-container th:last-child {
          z-index: 2;
        }
      `}</style>
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

      <div className="inventory-table-container">
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
      </div>
      </Box>

      {checkOutItem && (
        <CheckOutModal
          equipment={checkOutItem}
          onClose={() => setCheckOutItem(null)}
          onConfirm={(checkout) => {
            onCheckOut(checkout);
            setCheckOutItem(null);
          }}
        />
      )}

      {checkInItem && checkInCheckout && (
        <CheckInModal
          equipment={checkInItem}
          checkout={checkInCheckout}
          borrower={checkInBorrower}
          onClose={() => setCheckInItem(null)}
          onConfirm={(note) => {
            onCheckIn(checkInCheckout.id, note);
            setCheckInItem(null);
          }}
        />
      )}

      {editItem && (
        <EditItemModal
          item={editItem}
          categories={categories}
          onClose={() => setEditItem(null)}
          onConfirm={(name, categoryId) => {
            onEditItem(editItem.id, name, categoryId);
            setEditItem(null);
          }}
        />
      )}
    </>
  );
}
