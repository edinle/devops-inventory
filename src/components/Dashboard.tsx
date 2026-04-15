import React, { useState, useEffect, useRef } from 'react';
import Button, { IconButton } from '@atlaskit/button/new';
import Avatar from '@atlaskit/avatar';
import Tooltip from '@atlaskit/tooltip';
import Lozenge from '@atlaskit/lozenge';
import Badge from '@atlaskit/badge';
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Box, Inline, Text } from '@atlaskit/primitives';
import AddIcon from '@atlaskit/icon/core/add';
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
  onCheckOut: () => void;
  onCheckIn: () => void;
  onSendReminder: () => void;
  onOpenDetails: () => void;
};

function EquipmentCard({ item, checkout, borrower, onCheckOut, onCheckIn, onSendReminder, onOpenDetails }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isCheckedOut = item.status === 'checked_out';
  const isOverdue = checkout?.isOverdue ?? false;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    return draggable({ element: el, getInitialData: () => ({ equipmentId: item.id }) });
  }, [item.id]);

  const labelColor = isOverdue ? LABEL_OVERDUE : isCheckedOut ? LABEL_CHECKED_OUT : LABEL_AVAILABLE;

  return (
    <Box
      ref={cardRef}
      style={{
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 1px 0 rgba(9,30,66,0.25)',
        marginBottom: 8,
        cursor: 'grab',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.12s, transform 0.12s',
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(9,30,66,0.25)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.boxShadow = '0 1px 0 rgba(9,30,66,0.25)';
        e.currentTarget.style.transform = 'translateY(0px)';
      }}
      onClick={onOpenDetails}
    >
      {/* Trello-style colored label strip at top */}
      <Box style={{ height: 6, background: labelColor }} />

      <Box style={{ padding: '8px 10px 10px' }}>
        {/* Title */}
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

        {/* Condition note */}
        {item.conditionNotes.length > 0 && (
          <Box style={{ marginTop: 4, color: '#97A0AF' }}>
            <Text as="em" size="small" color="inherit">
              {item.conditionNotes[item.conditionNotes.length - 1]}
            </Text>
          </Box>
        )}

        {/* Due date / overdue row */}
        {checkout && (
          <Box style={{ marginTop: 8, marginBottom: 8 }}>
            {isOverdue ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                background: LABEL_OVERDUE, color: 'white',
                borderRadius: '3px', padding: '1px 6px', fontSize: '11px', fontWeight: 600,
              }}>
                ⏰ Overdue — {new Date(checkout.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ) : (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                background: '#E3FCEF', color: '#006644',
                borderRadius: '3px', padding: '1px 6px', fontSize: '11px', fontWeight: 500,
              }}>
                📅 Due {new Date(checkout.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </Box>
        )}

        {/* Bottom row: avatar + action buttons */}
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
  );
}

type ColumnProps = {
  id: string;
  title: string;
  color: string;
  items: Equipment[];
  checkouts: Checkout[];
  users: User[];
  onCheckOut: (item: Equipment) => void;
  onCheckIn: (item: Equipment) => void;
  onSendReminder: (item: Equipment) => void;
  onOpenDetails: (item: Equipment) => void;
};

function Column({ id, title, color, items, checkouts, users, onCheckOut, onCheckIn, onSendReminder, onOpenDetails }: ColumnProps) {
  const colRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const MoreH = resolveAtlaskitIcon(ShowMoreHorizontalIcon);
  const Add = resolveAtlaskitIcon(AddIcon);

  useEffect(() => {
    const el = colRef.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      getData: () => ({ columnId: id }),
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
      onDrop: () => setIsDragOver(false),
    });
  }, [id]);

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
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 8px 8px',
          background: isDragOver ? 'rgba(255,255,255,0.4)' : 'transparent',
          borderRadius: '0 0 3px 3px',
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
                onCheckOut={() => onCheckOut(item)}
                onCheckIn={() => onCheckIn(item)}
                onSendReminder={() => onSendReminder(item)}
                onOpenDetails={() => onOpenDetails(item)}
              />
            );
          })
        )}
        <Box style={{ paddingTop: 4 }}>
          <Button appearance="subtle" spacing="compact" iconBefore={Add}>
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
  onAddActivity,
  onAddGeneralNote,
}: Props) {
  const [checkOutItem, setCheckOutItem] = useState<Equipment | null>(null);
  const [checkInItem, setCheckInItem] = useState<Equipment | null>(null);
  const [detailItem, setDetailItem] = useState<Equipment | null>(null);
  const [itemColumnOverrides, setItemColumnOverrides] = useState<Record<string, string>>({});
  const [columnItems, setColumnItems] = useState<Record<string, string[]>>({});
  const boardRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        const equipmentId = (source.data as { equipmentId?: string })?.equipmentId;
        const destination = location.current.dropTargets[0];
        const destinationColumnId = (destination?.data as { columnId?: string })?.columnId;

        if (!equipmentId || !destinationColumnId) return;

        const item = equipment.find(entry => entry.id === equipmentId);
        if (!item || item.status === 'archived') return;

        // Checked out items stay in their queue, and available items cannot be dropped into checked out.
        if (item.status === 'checked_out' || destinationColumnId === 'checked-out') return;

        const sourceColumnId = getColumnForItem(item);
        if (sourceColumnId === destinationColumnId) return;

        const isValidCategory = categories.some(category => category.id === destinationColumnId);
        if (!isValidCategory) return;

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
      },
    });
  }, [equipment, categories, itemColumnOverrides]);

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
        ref={boardRef}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          alignItems: 'flex-start',
          padding: '12px 16px',
          gap: '12px',
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
              background: '#ebecf0',
              borderRadius: '3px',
              width: '272px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 88px)',
            }}
          >
            <Column
              id={col.id}
              title={col.title}
              color={col.color}
              items={col.items}
              checkouts={checkouts}
              users={users}
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
