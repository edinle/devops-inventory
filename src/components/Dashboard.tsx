import React, { useState, useEffect, useRef } from 'react';
import Button, { IconButton } from '@atlaskit/button/new';
import Avatar from '@atlaskit/avatar';
import Tooltip from '@atlaskit/tooltip';
import Lozenge from '@atlaskit/lozenge';
import Badge from '@atlaskit/badge';
import { Box, Inline, Text } from '@atlaskit/primitives';
import AddIcon from '@atlaskit/icon/core/add';
import ShowMoreHorizontalIcon from '@atlaskit/icon/core/show-more-horizontal';
import CheckMarkIcon from '@atlaskit/icon/core/check-mark';
import CrossIcon from '@atlaskit/icon/core/cross';
import { resolveAtlaskitIcon } from '../utils/resolveAtlaskitIcon';
import type { Equipment, Checkout, Category, User, ActivityEntry } from '../types';
import CheckOutModal from './CheckOutModal';
import CheckInModal from './CheckInModal';
import CardDetailModal from './CardDetailModal';
import AddItemModal from './AddItemModal';

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
  onEditItem: (id: string, name: string, categoryId: string) => void;
  onUpdateCategory: (id: string, name: string, color: string, bgColor?: string) => void;
};

// Left-accent label colors
const LABEL_OVERDUE     = '#FF5630';
const LABEL_CHECKED_OUT = '#36B37E';
const LABEL_AVAILABLE   = '#DFE1E6';

// Accent / dot colour palette
const ACCENT_PALETTE = [
  '#0052CC', '#1868DB', '#00875A', '#36B37E',
  '#FF991F', '#FFAB00', '#FF5630', '#DE350B',
  '#6554C0', '#8777D9', '#00B8D9', '#00A3BF',
  '#6B7780', '#172B4D',
];

// Background colour palette — light, column-friendly tones
const BG_PALETTE = [
  '#EEF1F8', // default blue-gray
  '#EAF0FF', // periwinkle
  '#E8F4FD', // sky blue
  '#E6F9F0', // mint
  '#F0EEFF', // lavender
  '#FFF4E5', // warm cream
  '#FFF0EC', // salmon blush
  '#FFF8E6', // butter yellow
  '#F5F5F5', // light gray
  '#FFFFFF', // white
  '#FFFBF0', // ivory
  '#F9EFF9', // pink mist
  '#E6FAF8', // teal blush
  '#EDF5EC', // sage
];

// ─── Card ────────────────────────────────────────────────────────────────────

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
  const isOverdue    = checkout?.isOverdue ?? false;
  const accentColor  = isOverdue ? LABEL_OVERDUE : isCheckedOut ? LABEL_CHECKED_OUT : LABEL_AVAILABLE;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', item.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(item.id);
      }}
      onDragEnd={onDragEnd}
      onClick={() => { if (!isDragging) onOpenDetails(); }}
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
          boxShadow: '0 1px 3px rgba(31,45,61,0.10), 0 4px 14px rgba(31,45,61,0.08)',
          border: '1px solid #E6EAF4',
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {/* Left accent bar */}
        <Box style={{ width: 5, background: accentColor, flexShrink: 0 }} />

        {/* Card body */}
        <Box style={{ padding: '12px 14px', flex: 1, minWidth: 0 }}>

          {/* Name + overdue lozenge */}
          <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <Text as="strong" weight="semibold" size="medium" color="color.text">
              {item.name}
            </Text>
            {isOverdue && (
              <Box style={{ flexShrink: 0 }}>
                <Lozenge appearance="removed">Overdue</Lozenge>
              </Box>
            )}
          </Box>

          {/* Tag number */}
          <Box style={{ marginBottom: 10 }}>
            <Text size="small" color="color.text.subtlest">{item.tagNumber}</Text>
          </Box>

          {/* Condition note */}
          {item.conditionNotes.length > 0 && (
            <Box
              style={{
                marginBottom: 12,
                background: '#F7F8FC',
                borderRadius: 8,
                padding: '7px 10px',
                borderLeft: '3px solid #DFE1E6',
              }}
            >
              <Text as="em" size="small" color="color.text.subtle">
                {item.conditionNotes[item.conditionNotes.length - 1]}
              </Text>
            </Box>
          )}

          {/* Borrower + actions */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 4 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              {borrower ? (
                <>
                  <Tooltip content={borrower.fullName}>
                    <Avatar size="small" name={borrower.fullName} />
                  </Tooltip>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="small" color="color.text.subtle">{borrower.fullName}</Text>
                  </Box>
                </>
              ) : (
                <Box style={{ height: 24 }} />
              )}
            </Box>

            <Box style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {isCheckedOut ? (
                <>
                  <Button appearance="default" spacing="compact"
                    onClick={(e) => { e.stopPropagation(); onCheckIn(); }}>
                    Return
                  </Button>
                  <Button appearance="warning" spacing="compact"
                    onClick={(e) => { e.stopPropagation(); onSendReminder(); }}>
                    Remind
                  </Button>
                </>
              ) : (
                <Button appearance="primary" spacing="compact"
                  onClick={(e) => { e.stopPropagation(); onCheckOut(); }}>
                  Check Out
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
}

// ─── Column ──────────────────────────────────────────────────────────────────

type ColumnProps = {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  items: Equipment[];
  checkouts: Checkout[];
  users: User[];
  isEditable?: boolean;
  draggingItemId?: string | null;
  onDropItem: (itemId: string, destinationColumnId: string) => void;
  onAddCard: (columnId: string) => void;
  onDragStartCard: (itemId: string) => void;
  onDragEndCard: () => void;
  onCheckOut: (item: Equipment) => void;
  onCheckIn: (item: Equipment) => void;
  onSendReminder: (item: Equipment) => void;
  onOpenDetails: (item: Equipment) => void;
  onUpdateColumn?: (id: string, name: string, color: string, bgColor: string) => void;
};

function Column({
  id,
  title,
  color,
  bgColor,
  items,
  checkouts,
  users,
  isEditable = false,
  draggingItemId,
  onDropItem,
  onAddCard,
  onDragStartCard,
  onDragEndCard,
  onCheckOut,
  onCheckIn,
  onSendReminder,
  onOpenDetails,
  onUpdateColumn,
}: ColumnProps) {
  const colRef           = useRef<HTMLDivElement>(null);
  const nameInputRef     = useRef<HTMLInputElement>(null);
  const accentPickerRef  = useRef<HTMLDivElement>(null);
  const bgPickerRef      = useRef<HTMLDivElement>(null);

  const [isDragOver,         setIsDragOver]         = useState(false);
  const [isEditingName,      setIsEditingName]       = useState(false);
  const [draftName,          setDraftName]           = useState(title);
  const [showAccentPicker,   setShowAccentPicker]    = useState(false);
  const [showBgPicker,       setShowBgPicker]        = useState(false);
  const [draftColor,         setDraftColor]          = useState(color);
  const [draftBgColor,       setDraftBgColor]        = useState(bgColor);

  const MoreH = resolveAtlaskitIcon(ShowMoreHorizontalIcon);
  const Check = resolveAtlaskitIcon(CheckMarkIcon);
  const Cross = resolveAtlaskitIcon(CrossIcon);
  const Add   = resolveAtlaskitIcon(AddIcon);

  const overdueInCol = items.filter(item =>
    checkouts.find(c => c.equipmentId === item.id)?.isOverdue
  ).length;

  useEffect(() => { setDraftName(title); },   [title]);
  useEffect(() => { setDraftColor(color); },  [color]);
  useEffect(() => { setDraftBgColor(bgColor); }, [bgColor]);

  useEffect(() => {
    if (isEditingName) nameInputRef.current?.select();
  }, [isEditingName]);

  // Close pickers on outside click
  useEffect(() => {
    if (!showAccentPicker && !showBgPicker) return;
    function handle(e: MouseEvent) {
      if (showAccentPicker && accentPickerRef.current && !accentPickerRef.current.contains(e.target as Node))
        setShowAccentPicker(false);
      if (showBgPicker && bgPickerRef.current && !bgPickerRef.current.contains(e.target as Node))
        setShowBgPicker(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showAccentPicker, showBgPicker]);

  function commitName() {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== title) {
      onUpdateColumn?.(id, trimmed, draftColor, draftBgColor);
    } else {
      setDraftName(title);
    }
    setIsEditingName(false);
  }

  function commitAccentColor(c: string) {
    setDraftColor(c);
    setShowAccentPicker(false);
    onUpdateColumn?.(id, draftName.trim() || title, c, draftBgColor);
  }

  function commitBgColor(c: string) {
    setDraftBgColor(c);
    setShowBgPicker(false);
    onUpdateColumn?.(id, draftName.trim() || title, draftColor, c);
  }

  function handleNameKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter')  commitName();
    if (e.key === 'Escape') { setDraftName(title); setIsEditingName(false); }
  }

  return (
    <Box
      style={{
        width: 300,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: draftBgColor,
        borderRadius: 14,
      }}
    >
      {/* ── Column header ── */}
      <Box style={{ padding: '12px 12px 8px', position: 'relative' }}>
        <Inline space="space.100" alignBlock="center" spread="space-between">

          {/* Left side: accent dot + [bg swatch] + name */}
          <Inline space="space.075" alignBlock="center" grow="fill">

            {/* Accent colour dot */}
            {isEditable ? (
              <Box style={{ position: 'relative', flexShrink: 0 }}>
                <Tooltip content="Change accent color">
                  <button
                    onClick={() => { setShowAccentPicker(v => !v); setShowBgPicker(false); }}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: draftColor,
                      border: '2px solid rgba(255,255,255,0.8)',
                      boxShadow: `0 0 0 2px ${draftColor}66`,
                      cursor: 'pointer',
                      padding: 0,
                      outline: 'none',
                    }}
                  />
                </Tooltip>

                {showAccentPicker && (
                  <Box
                    ref={accentPickerRef}
                    style={{
                      position: 'absolute', top: 24, left: 0, zIndex: 500,
                      background: '#fff', borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(9,30,66,0.22)',
                      border: '1px solid #E6EAF4',
                      padding: 10,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 24px)',
                      gap: 6,
                    }}
                  >
                    <Box style={{ gridColumn: '1 / -1', marginBottom: 4 }}>
                      <Text size="small" weight="medium" color="color.text.subtle">Accent colour</Text>
                    </Box>
                    {ACCENT_PALETTE.map(c => (
                      <Tooltip key={c} content={c}>
                        <button
                          onClick={() => commitAccentColor(c)}
                          style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: c,
                            border: c === draftColor ? '3px solid #172B4D' : '2px solid rgba(0,0,0,0.08)',
                            cursor: 'pointer', padding: 0, outline: 'none',
                            transition: 'transform 0.1s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.18)')}
                          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Box style={{
                width: 12, height: 12, borderRadius: '50%',
                background: color, flexShrink: 0,
                boxShadow: `0 0 0 3px ${color}33`,
              }} />
            )}

            {/* Background colour swatch */}
            {isEditable && (
              <Box style={{ position: 'relative', flexShrink: 0 }}>
                <Tooltip content="Change column background">
                  <button
                    onClick={() => { setShowBgPicker(v => !v); setShowAccentPicker(false); }}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      background: draftBgColor,
                      border: '2px solid rgba(0,0,0,0.18)',
                      cursor: 'pointer',
                      padding: 0,
                      outline: 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }}
                  />
                </Tooltip>

                {showBgPicker && (
                  <Box
                    ref={bgPickerRef}
                    style={{
                      position: 'absolute', top: 24, left: 0, zIndex: 500,
                      background: '#fff', borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(9,30,66,0.22)',
                      border: '1px solid #E6EAF4',
                      padding: 10,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 24px)',
                      gap: 6,
                    }}
                  >
                    <Box style={{ gridColumn: '1 / -1', marginBottom: 4 }}>
                      <Text size="small" weight="medium" color="color.text.subtle">Column background</Text>
                    </Box>
                    {BG_PALETTE.map(c => (
                      <Tooltip key={c} content={c}>
                        <button
                          onClick={() => commitBgColor(c)}
                          style={{
                            width: 24, height: 24, borderRadius: 4,
                            background: c,
                            border: c === draftBgColor ? '3px solid #172B4D' : '2px solid rgba(0,0,0,0.12)',
                            cursor: 'pointer', padding: 0, outline: 'none',
                            transition: 'transform 0.1s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.18)')}
                          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* Column name */}
            {isEditable && isEditingName ? (
              <Box style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                <input
                  ref={nameInputRef}
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  onBlur={commitName}
                  style={{
                    flex: 1,
                    fontSize: 14, fontWeight: 700, color: '#172B4D',
                    border: 'none', borderBottom: '2px solid #0052CC',
                    background: 'transparent', outline: 'none',
                    padding: '2px 0', minWidth: 0, lineHeight: 1.4,
                  }}
                />
                <button onMouseDown={e => { e.preventDefault(); commitName(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#00875A', display: 'flex' }}>
                  <Check label="Save" size="small" />
                </button>
                <button onMouseDown={e => { e.preventDefault(); setDraftName(title); setIsEditingName(false); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#FF5630', display: 'flex' }}>
                  <Cross label="Cancel" size="small" />
                </button>
              </Box>
            ) : (
              <Box
                style={{ color: '#172B4D', flex: 1, minWidth: 0 }}
                onClick={isEditable ? () => setIsEditingName(true) : undefined}
              >
                <Text as="strong" weight="bold" size="medium" color="inherit">
                  {isEditable ? draftName || title : title}
                </Text>
                {isEditable && <Text size="small" color="color.text.subtlest"> ✎</Text>}
              </Box>
            )}
          </Inline>

          {/* Right: badges + more */}
          <Inline space="space.050" alignBlock="center">
            {overdueInCol > 0 && <Badge appearance="important">{overdueInCol}</Badge>}
            <Badge>{items.length}</Badge>
            <IconButton appearance="subtle" icon={MoreH} label="List actions" />
          </Inline>
        </Inline>
      </Box>

      {/* ── Card list ── */}
      <Box
        ref={colRef}
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setIsDragOver(false);
          const itemId = e.dataTransfer.getData('text/plain');
          if (itemId) onDropItem(itemId, id);
        }}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 10px 10px',
          background: isDragOver ? 'rgba(9,30,66,0.06)' : 'transparent',
          borderRadius: '0 0 12px 12px',
          minHeight: 40,
          transition: 'background 0.15s',
        }}
      >
        {items.length === 0 ? (
          <Box style={{
            textAlign: 'center', color: 'rgba(9,30,66,0.35)',
            fontSize: 12, padding: '16px 8px', fontStyle: 'italic',
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
        <Box style={{ paddingTop: 6 }}>
          <Button appearance="subtle" spacing="compact" iconBefore={Add} onClick={() => onAddCard(id)}>
            Add a card
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

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
  onEditItem,
  onUpdateCategory,
}: Props) {
  const [checkOutItem,        setCheckOutItem]        = useState<Equipment | null>(null);
  const [checkInItem,         setCheckInItem]         = useState<Equipment | null>(null);
  const [detailItem,          setDetailItem]          = useState<Equipment | null>(null);
  const [draggingItemId,      setDraggingItemId]      = useState<string | null>(null);
  const [itemColumnOverrides, setItemColumnOverrides] = useState<Record<string, string>>({});
  const [columnItems,         setColumnItems]         = useState<Record<string, string[]>>({});
  const [addCardColumnId,     setAddCardColumnId]     = useState<string | null>(null);

  const checkedOutItems = equipment.filter(e => e.status === 'checked_out');

  function getColumnForItem(item: Equipment): string {
    if (item.status === 'checked_out') return 'checked-out';
    return itemColumnOverrides[item.id] ?? item.categoryId;
  }

  useEffect(() => {
    setColumnItems(prev => {
      const next: Record<string, string[]> = {};

      const checkedOutIds    = equipment.filter(i => i.status === 'checked_out').map(i => i.id);
      const existingCheckedOut = (prev['checked-out'] ?? []).filter(id => checkedOutIds.includes(id));
      const newCheckedOut      = checkedOutIds.filter(id => !existingCheckedOut.includes(id));
      next['checked-out']      = [...existingCheckedOut, ...newCheckedOut];

      categories.forEach(cat => {
        const ids      = equipment
          .filter(i => i.status !== 'archived' && i.status !== 'checked_out' && getColumnForItem(i) === cat.id)
          .map(i => i.id);
        const existing = (prev[cat.id] ?? []).filter(id => ids.includes(id));
        const added    = ids.filter(id => !existing.includes(id));
        next[cat.id]   = [...existing, ...added];
      });

      return next;
    });
  }, [equipment, categories, itemColumnOverrides]);

  function handleDropItem(equipmentId: string, destColId: string) {
    const item = equipment.find(e => e.id === equipmentId);
    if (!item || item.status === 'archived') return;

    const isCheckedOutCol = destColId === 'checked-out';
    const isCategoryCol   = categories.some(c => c.id === destColId);

    if (item.status === 'checked_out') {
      if (!isCategoryCol) return;
      setDraggingItemId(null); setCheckInItem(item); return;
    }
    if (isCheckedOutCol) {
      setDraggingItemId(null); setCheckOutItem(item); return;
    }
    const srcColId = getColumnForItem(item);
    if (srcColId === destColId || !isCategoryCol) return;

    setItemColumnOverrides(prev => ({ ...prev, [equipmentId]: destColId }));
    setColumnItems(prev => {
      const next = { ...prev };
      next[srcColId]  = (next[srcColId]  ?? []).filter(id => id !== equipmentId);
      next[destColId] = [...(next[destColId] ?? []).filter(id => id !== equipmentId), equipmentId];
      return next;
    });
  }

  // Opens the Add Item modal pre-set to this column's category
  function handleAddCard(columnId: string) {
    if (columnId === 'checked-out') return;
    setAddCardColumnId(columnId);
  }

  function handleAddItem({ name, tagNumber, categoryId }: {
    name: string; tagNumber: string; categoryId: string; conditionNotes: string;
  }) {
    onAddEquipment({ name, tagNumber, categoryId, status: 'available' });
    setAddCardColumnId(null);
  }

  function handleCheckOut(co: Omit<Checkout, 'id'>) {
    onCheckOut(co); setCheckOutItem(null);
  }

  function handleCheckIn(checkoutId: string, note: string) {
    onCheckIn(checkoutId, note); setCheckInItem(null);
  }

  function handleReminder(item: Equipment) {
    const co = checkouts.find(c => c.equipmentId === item.id);
    if (co) onSendReminder(co.id);
  }

  const checkInCheckout = checkInItem ? checkouts.find(c => c.equipmentId === checkInItem.id) : null;
  const checkInBorrower = checkInCheckout ? users.find(u => u.id === checkInCheckout.userId) : undefined;

  const columns = [
    {
      id: 'checked-out',
      title: 'Checked Out',
      color: '#172B4D',
      bgColor: '#EEF1F8',
      isEditable: false,
      items: (columnItems['checked-out'] ?? checkedOutItems.map(i => i.id))
        .map(id => equipment.find(i => i.id === id))
        .filter((i): i is Equipment => Boolean(i)),
    },
    ...categories.map(cat => ({
      id: cat.id,
      title: cat.name,
      color: cat.color,
      bgColor: cat.bgColor,
      isEditable: role === 'super_admin',
      items: (columnItems[cat.id] ?? equipment
        .filter(i => i.status !== 'archived' && i.status !== 'checked_out' && getColumnForItem(i) === cat.id)
        .map(i => i.id))
        .map(id => equipment.find(i => i.id === id))
        .filter((i): i is Equipment => Boolean(i)),
    })),
  ];

  return (
    <>
      <div
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'auto',
          display: 'flex',
          alignItems: 'flex-start',
          padding: '16px 16px 18px',
          gap: '12px',
          background: 'radial-gradient(circle at top right, #A95CC5 0%, #7A4DB8 38%, #344EAD 100%)',
        }}
      >
        {columns.map(col => (
          <div
            key={col.id}
            style={{
              borderRadius: 14,
              width: 300,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 120,
              height: 'fit-content',
              boxShadow: '0 10px 24px rgba(17,31,67,0.24)',
            }}
          >
            <Column
              id={col.id}
              title={col.title}
              color={col.color}
              bgColor={col.bgColor}
              items={col.items}
              checkouts={checkouts}
              users={users}
              isEditable={col.isEditable}
              draggingItemId={draggingItemId}
              onDropItem={handleDropItem}
              onAddCard={handleAddCard}
              onDragStartCard={setDraggingItemId}
              onDragEndCard={() => setDraggingItemId(null)}
              onCheckOut={setCheckOutItem}
              onCheckIn={setCheckInItem}
              onSendReminder={handleReminder}
              onOpenDetails={setDetailItem}
              onUpdateColumn={onUpdateCategory}
            />
          </div>
        ))}
      </div>

      {/* Add Item modal — opened from "Add a card" */}
      {addCardColumnId && (
        <AddItemModal
          categories={categories}
          defaultCategoryId={addCardColumnId}
          onClose={() => setAddCardColumnId(null)}
          onConfirm={handleAddItem}
        />
      )}

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
