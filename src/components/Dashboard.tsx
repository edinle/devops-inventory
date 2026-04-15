import React, { useState, useEffect, useRef } from 'react';
import Button, { IconButton } from '@atlaskit/button/new';
import Avatar from '@atlaskit/avatar';
import Tooltip from '@atlaskit/tooltip';
import Badge from '@atlaskit/badge';
import { Box, Inline, Text } from '@atlaskit/primitives';
import AddIcon from '@atlaskit/icon/core/add';
import ClockIcon from '@atlaskit/icon/core/clock';
import StatusWarningIcon from '@atlaskit/icon/core/status-warning';
import ShowMoreHorizontalIcon from '@atlaskit/icon/core/show-more-horizontal';
import { resolveAtlaskitIcon } from '../utils/resolveAtlaskitIcon';
import type { Equipment, Checkout, Category, User, ActivityEntry } from '../types';
import CheckOutModal from './CheckOutModal';
import CheckInModal from './CheckInModal';
import CardDetailModal from './CardDetailModal';

type Props = {
  equipment: Equipment[];
  checkouts: Checkout[];
  categories: Category[];
  users: User[];
  activityLog: ActivityEntry[];
  role: 'super_admin' | 'manager';
  onCheckOut: (co: Omit<Checkout, 'id'>) => void;
  onCheckIn: (checkoutId: string, note: string) => void;
  onSendReminder: (checkoutId: string) => void;
  onAddEquipment: (e: Omit<Equipment, 'id' | 'conditionNotes'>) => void;
  onAddActivity: (entry: Omit<ActivityEntry, 'id'>) => void;
  onAddGeneralNote: (equipmentId: string, note: string) => void;
};

// Trello-style label strip colors
const LABEL_OVERDUE = '#FF5630';
const LABEL_CHECKED_OUT = '#36B37E';
const LABEL_AVAILABLE = '#DFE1E6';

type CardProps = {
  item: Equipment;
  checkout?: Checkout;
  borrower?: User;
  isDragging?: boolean;
  onDragStart: (itemId: string) => void;
  onDragEnd: () => void;
  onCheckOut: () => void;
  onCheckIn: () => void;
  onSendReminder: () => void;
  onOpenDetails: () => void;
};

function EquipmentCard({
  item,
  checkout,
  borrower,
  isDragging,
  onDragStart,
  onDragEnd,
  onCheckOut,
  onCheckIn,
  onSendReminder,
  onOpenDetails,
}: CardProps) {
  const isCheckedOut = item.status === 'checked_out';
  const isOverdue = checkout?.isOverdue ?? false;
  const Clock = resolveAtlaskitIcon(ClockIcon);
  const Warning = resolveAtlaskitIcon(StatusWarningIcon);

  const labelColor = isOverdue ? LABEL_OVERDUE : isCheckedOut ? LABEL_CHECKED_OUT : LABEL_AVAILABLE;
  const handleOpenDetails = () => {
    if (!isDragging) {
      onOpenDetails();
    }
  };

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', item.id);
        event.dataTransfer.effectAllowed = 'move';
        onDragStart(item.id);
      }}
      onDragEnd={onDragEnd}
      onClick={handleOpenDetails}
      style={{
        marginBottom: 10,
        cursor: 'grab',
        opacity: isDragging ? 0.45 : 1,
        transform: isDragging ? 'scale(0.98)' : 'none',
        transition: 'opacity 0.12s ease, transform 0.12s ease',
      }}
    >
      <Box
        style={{
          background: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(9, 30, 66, 0.18), 0 4px 12px rgba(9, 30, 66, 0.08)',
          border: '1px solid rgba(9, 30, 66, 0.08)',
          overflow: 'hidden',
        }}
      >
        <Box style={{ height: 6, background: labelColor }} />

        <Box style={{ padding: '10px 12px 12px' }}>
        <Inline space="space.050" alignBlock="center">
          <Box style={{ color: '#172B4D' }}>
            <Text as="strong" weight="semibold" size="medium" color="inherit">
              {item.name}
            </Text>
          </Box>
          <Box style={{ color: '#5E6C84' }}>
            <Text as="span" weight="medium" size="small" color="inherit">
              {item.tagNumber}
            </Text>
          </Box>
        </Inline>

        {item.conditionNotes.length > 0 && (
          <Box style={{ marginTop: 4, color: '#97A0AF' }}>
            <Text as="em" size="small" color="inherit">
              {item.conditionNotes[item.conditionNotes.length - 1]}
            </Text>
          </Box>
        )}

        {checkout && (
          <Box style={{ marginTop: 8, marginBottom: 8 }}>
            {isOverdue ? (
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#FF5630',
                  color: '#FFFFFF',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <Warning label="Overdue" spacing="spacious" />
                <span>Overdue {new Date(checkout.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </Box>
            ) : (
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#E3FCEF',
                  color: '#006644',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <Clock label="Due" spacing="spacious" />
                <span>Due {new Date(checkout.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </Box>
            )}
          </Box>
        )}

        <Inline space="space.100" alignBlock="center" spread="space-between">
          <Inline space="space.050" alignBlock="center">
            {borrower && (
              <Tooltip content={borrower.fullName}>
                <Avatar size="small" name={borrower.fullName} />
              </Tooltip>
            )}
            {borrower && (
              <Box style={{ color: '#5E6C84' }}>
                <Text as="span" size="small" color="inherit">
                  {borrower.fullName}
                </Text>
              </Box>
            )}
          </Inline>

          <Inline space="space.050" alignBlock="center">
            {isCheckedOut ? (
              <>
                <Button
                  appearance="primary"
                  spacing="compact"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCheckIn();
                  }}
                >
                  Return
                </Button>
                <Button
                  appearance="subtle"
                  spacing="compact"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendReminder();
                  }}
                >
                  Remind
                </Button>
              </>
            ) : (
              <Button
                appearance="primary"
                spacing="compact"
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckOut();
                }}
              >
                Check Out
              </Button>
            )}
          </Inline>
        </Inline>
        </Box>
      </Box>
    </div>
  );
}

type ColumnProps = {
  id: string;
  title: string;
  color: string;
  items: Equipment[];
  checkouts: Checkout[];
  users: User[];
  isDropDisabled?: boolean;
  draggingItemId?: string | null;
  onDropItem: (itemId: string, destinationColumnId: string) => void;
  onAddCard: (columnId: string) => void;
  onDragStartCard: (itemId: string) => void;
  onDragEndCard: () => void;
  onCheckOut: (item: Equipment) => void;
  onCheckIn: (item: Equipment) => void;
  onSendReminder: (item: Equipment) => void;
  onOpenDetails: (item: Equipment) => void;
};

function Column({
  id,
  title,
  color,
  items,
  checkouts,
  users,
  draggingItemId,
  onDropItem,
  onAddCard,
  onDragStartCard,
  onDragEndCard,
  onCheckOut,
  onCheckIn,
  onSendReminder,
  onOpenDetails,
}: ColumnProps) {
  const colRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const MoreH = resolveAtlaskitIcon(ShowMoreHorizontalIcon);
  const Add = resolveAtlaskitIcon(AddIcon);

  const overdueInCol = items.filter(item => checkouts.find(c => c.equipmentId === item.id)?.isOverdue).length;

  return (
    <Box style={{ width: 272, flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
      {/* List header */}
      <Box style={{ padding: '10px 10px 8px' }}>
        <Inline space="space.100" alignBlock="center" spread="space-between">
          <Inline space="space.100" alignBlock="center">
            <Box style={{ width: 10, height: 10, borderRadius: 999, background: color, flexShrink: 0 }} />
            <Box style={{ color: '#172B4D' }}>
              <Text as="strong" weight="bold" size="medium" color="inherit">
                {title}
              </Text>
            </Box>
            {overdueInCol > 0 && <Badge appearance="important">{overdueInCol}</Badge>}
          </Inline>

          <Inline space="space.050" alignBlock="center">
            <Badge>{items.length}</Badge>
            <IconButton appearance="subtle" icon={MoreH} label="List actions" />
          </Inline>
        </Inline>
      </Box>

      {/* Card list */}
      <Box
        ref={colRef}
        onDragOver={(event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setIsDragOver(false);
          const itemId = event.dataTransfer.getData('text/plain');
          if (itemId) {
            onDropItem(itemId, id);
          }
        }}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 8px 8px',
          background: isDragOver ? 'rgba(9,30,66,0.08)' : 'transparent',
          borderRadius: '0 0 8px 8px',
          minHeight: '40px',
          transition: 'background 0.15s',
        }}
      >
        {items.length === 0 ? (
          <Box style={{
            textAlign: 'center', color: 'rgba(9,30,66,0.35)',
            fontSize: '12px', padding: '16px 8px', fontStyle: 'italic',
          }}>
            No items
          </Box>
        ) : (
          items.map(item => {
            const checkout = checkouts.find(c => c.equipmentId === item.id);
            const borrower = checkout ? users.find(u => u.id === checkout.userId) : undefined;
            return (
              <EquipmentCard
                key={item.id}
                item={item}
                checkout={checkout}
                borrower={borrower}
                isDragging={draggingItemId === item.id}
                onDragStart={onDragStartCard}
                onDragEnd={onDragEndCard}
                onCheckOut={() => onCheckOut(item)}
                onCheckIn={() => onCheckIn(item)}
                onSendReminder={() => onSendReminder(item)}
                onOpenDetails={() => onOpenDetails(item)}
              />
            );
          })
        )}
        <Box style={{ paddingTop: 4 }}>
          <Button appearance="subtle" spacing="compact" iconBefore={Add} onClick={() => onAddCard(id)}>
            Add a card
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default function Dashboard({
  equipment,
  checkouts,
  categories,
  users,
  activityLog,
  role,
  onCheckOut,
  onCheckIn,
  onSendReminder,
  onAddEquipment,
  onAddActivity,
  onAddGeneralNote,
}: Props) {
  const [checkOutItem, setCheckOutItem] = useState<Equipment | null>(null);
  const [checkInItem, setCheckInItem] = useState<Equipment | null>(null);
  const [detailItem, setDetailItem] = useState<Equipment | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [itemColumnOverrides, setItemColumnOverrides] = useState<Record<string, string>>({});
  const [columnItems, setColumnItems] = useState<Record<string, string[]>>({});

  const checkedOutItems = equipment.filter(e => e.status === 'checked_out');

  function getColumnForItem(item: Equipment): string {
    if (item.status === 'checked_out') return 'checked-out';
    return itemColumnOverrides[item.id] ?? item.categoryId;
  }

  useEffect(() => {
    setColumnItems(prev => {
      const next: Record<string, string[]> = {};

      const checkedOutIds = equipment
        .filter(item => item.status === 'checked_out')
        .map(item => item.id);

      const existingCheckedOut = (prev['checked-out'] ?? []).filter(id => checkedOutIds.includes(id));
      const newCheckedOut = checkedOutIds.filter(id => !existingCheckedOut.includes(id));
      next['checked-out'] = [...existingCheckedOut, ...newCheckedOut];

      categories.forEach(category => {
        const ids = equipment
          .filter(item => item.status !== 'archived' && item.status !== 'checked_out' && getColumnForItem(item) === category.id)
          .map(item => item.id);

        const existing = (prev[category.id] ?? []).filter(id => ids.includes(id));
        const added = ids.filter(id => !existing.includes(id));
        next[category.id] = [...existing, ...added];
      });

      return next;
    });
  }, [equipment, categories, itemColumnOverrides]);

  function handleDropItem(equipmentId: string, destinationColumnId: string) {
    const item = equipment.find(entry => entry.id === equipmentId);
    if (!item || item.status === 'archived') return;

    const isCheckedOutColumn = destinationColumnId === 'checked-out';
    const isCategoryColumn = categories.some(category => category.id === destinationColumnId);

    if (item.status === 'checked_out') {
      if (!isCategoryColumn) return;
      setDraggingItemId(null);
      setCheckInItem(item);
      return;
    }

    if (isCheckedOutColumn) {
      setDraggingItemId(null);
      setCheckOutItem(item);
      return;
    }

    const sourceColumnId = getColumnForItem(item);
    if (sourceColumnId === destinationColumnId) return;

    if (!isCategoryColumn) return;

    setItemColumnOverrides(prev => ({
      ...prev,
      [equipmentId]: destinationColumnId,
    }));

    setColumnItems(prev => {
      const next: Record<string, string[]> = { ...prev };
      next[sourceColumnId] = (next[sourceColumnId] ?? []).filter(id => id !== equipmentId);
      next[destinationColumnId] = [...(next[destinationColumnId] ?? []).filter(id => id !== equipmentId), equipmentId];
      return next;
    });
  }

  function handleAddCard(columnId: string) {
    if (columnId === 'checked-out') return;
    const category = categories.find(entry => entry.id === columnId);
    if (!category) return;

    const name = window.prompt(`New item name for ${category.name}`)?.trim();
    if (!name) return;
    const tagNumber = window.prompt('Tag number (e.g. #20)')?.trim();
    if (!tagNumber) return;

    onAddEquipment({
      name,
      tagNumber,
      categoryId: category.id,
      status: 'available',
    });
  }

  function handleCheckOut(co: Omit<Checkout, 'id'>) {
    onCheckOut(co);
    setCheckOutItem(null);
  }

  function handleCheckIn(checkoutId: string, note: string) {
    onCheckIn(checkoutId, note);
    setCheckInItem(null);
  }

  function handleReminder(item: Equipment) {
    const co = checkouts.find(c => c.equipmentId === item.id);
    if (co) onSendReminder(co.id);
  }

  const checkInCheckout = checkInItem ? checkouts.find(c => c.equipmentId === checkInItem.id) : null;
  const checkInBorrower = checkInCheckout ? users.find(u => u.id === checkInCheckout.userId) : undefined;

  return (
    <>
      {/* Board area — Trello's scrollable horizontal list container */}
      <div
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          alignItems: 'flex-start',
          padding: '14px 16px',
          gap: '12px',
          background: 'linear-gradient(135deg, #0B66E4 0%, #0052CC 100%)',
        }}
      >
        {/* Each "list" is a Trello list container */}
        {[
          {
            id: 'checked-out',
            title: 'Checked Out',
            color: '#172B4D',
            items: (columnItems['checked-out'] ?? checkedOutItems.map(item => item.id))
              .map(id => equipment.find(item => item.id === id))
              .filter((item): item is Equipment => Boolean(item)),
          },
          ...categories.map(cat => ({
            id: cat.id,
            title: cat.name,
            color: cat.color,
            items: (columnItems[cat.id] ?? equipment
              .filter(item => item.status !== 'archived' && item.status !== 'checked_out' && getColumnForItem(item) === cat.id)
              .map(item => item.id))
              .map(id => equipment.find(item => item.id === id))
              .filter((item): item is Equipment => Boolean(item)),
          })),
        ].map(col => (
          <div
            key={col.id}
            style={{
              background: '#DFE1E6',
              borderRadius: '10px',
              width: '272px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 88px)',
              boxShadow: '0 6px 16px rgba(9,30,66,0.18)',
            }}
          >
            <Column
              id={col.id}
              title={col.title}
              color={col.color}
              items={col.items}
              checkouts={checkouts}
              users={users}
              draggingItemId={draggingItemId}
              onDropItem={handleDropItem}
              onAddCard={handleAddCard}
              onDragStartCard={setDraggingItemId}
              onDragEndCard={() => setDraggingItemId(null)}
              onCheckOut={setCheckOutItem}
              onCheckIn={setCheckInItem}
              onSendReminder={handleReminder}
              onOpenDetails={setDetailItem}
            />
          </div>
        ))}
      </div>

      {detailItem && (
        <CardDetailModal
          equipment={detailItem}
          checkouts={checkouts}
          users={users}
          activityLog={activityLog}
          onClose={() => setDetailItem(null)}
          onAddGeneralNote={onAddGeneralNote}
        />
      )}

      {checkOutItem && (
        <CheckOutModal
          equipment={checkOutItem}
          onClose={() => setCheckOutItem(null)}
          onConfirm={handleCheckOut}
        />
      )}
      {checkInItem && checkInCheckout && (
        <CheckInModal
          equipment={checkInItem}
          checkout={checkInCheckout}
          borrower={checkInBorrower}
          onClose={() => setCheckInItem(null)}
          onConfirm={(note) => handleCheckIn(checkInCheckout.id, note)}
        />
      )}
    </>
  );
}
