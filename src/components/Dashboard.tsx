import React, { useState, useEffect, useRef } from 'react';
import Button from '@atlaskit/button/new';
import Avatar from '@atlaskit/avatar';
import Lozenge from '@atlaskit/lozenge';
import Badge from '@atlaskit/badge';
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { Equipment, Checkout, Category, User, ActivityEntry } from '../types';
import CheckOutModal from './CheckOutModal';
import CheckInModal from './CheckInModal';

type Props = {
  equipment: Equipment[];
  checkouts: Checkout[];
  categories: Category[];
  users: User[];
  role: 'super_admin' | 'manager';
  onCheckOut: (co: Omit<Checkout, 'id'>) => void;
  onCheckIn: (checkoutId: string, note: string) => void;
  onSendReminder: (checkoutId: string) => void;
  onAddActivity: (entry: Omit<ActivityEntry, 'id'>) => void;
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
};

function EquipmentCard({ item, checkout, borrower, onCheckOut, onCheckIn, onSendReminder }: CardProps) {
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
    <div
      ref={cardRef}
      style={{
        background: 'white',
        borderRadius: '3px',
        boxShadow: '0 1px 0 rgba(9,30,66,0.25)',
        marginBottom: '8px',
        cursor: 'grab',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.12s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 8px rgba(9,30,66,0.25)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 0 rgba(9,30,66,0.25)')}
    >
      {/* Trello-style colored label strip at top */}
      <div style={{ height: '6px', background: labelColor, borderRadius: '3px 3px 0 0' }} />

      <div style={{ padding: '6px 8px 8px' }}>
        {/* Title */}
        <div style={{ fontWeight: 500, fontSize: '14px', color: '#172B4D', lineHeight: '1.4', marginBottom: '4px' }}>
          {item.name}{' '}
          <span style={{ color: '#5E6C84', fontWeight: 400, fontSize: '12px' }}>{item.tagNumber}</span>
        </div>

        {/* Condition note */}
        {item.conditionNotes.length > 0 && (
          <div style={{ fontSize: '11px', color: '#97A0AF', fontStyle: 'italic', marginBottom: '4px' }}>
            📋 {item.conditionNotes[item.conditionNotes.length - 1]}
          </div>
        )}

        {/* Due date / overdue row */}
        {checkout && (
          <div style={{ marginBottom: '6px' }}>
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
          </div>
        )}

        {/* Bottom row: avatar + action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {borrower && (
              <Tooltip content={borrower.fullName}>
                <Avatar size="small" name={borrower.fullName} />
              </Tooltip>
            )}
            {borrower && (
              <span style={{ fontSize: '11px', color: '#5E6C84' }}>{borrower.fullName}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            {isCheckedOut ? (
              <>
                <button
                  onClick={onCheckIn}
                  style={{
                    background: '#0052CC', color: 'white', border: 'none', borderRadius: '3px',
                    padding: '2px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Return
                </button>
                <button
                  onClick={onSendReminder}
                  style={{
                    background: '#F4F5F7', color: '#172B4D', border: 'none', borderRadius: '3px',
                    padding: '2px 8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Remind
                </button>
              </>
            ) : (
              <button
                onClick={onCheckOut}
                style={{
                  background: '#0052CC', color: 'white', border: 'none', borderRadius: '3px',
                  padding: '2px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Check Out
              </button>
            )}
          </div>
        </div>
      </div>
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
  onCheckOut: (item: Equipment) => void;
  onCheckIn: (item: Equipment) => void;
  onSendReminder: (item: Equipment) => void;
};

function Column({ id, title, color, items, checkouts, users, onCheckOut, onCheckIn, onSendReminder }: ColumnProps) {
  const colRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
    <div style={{ width: '272px', flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
      {/* List header */}
      <div style={{
        padding: '10px 12px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: '3px 3px 0 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Color dot */}
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: '14px', color: '#172B4D' }}>{title}</span>
          {overdueInCol > 0 && (
            <span style={{
              background: '#FF5630', color: 'white',
              borderRadius: '3px', padding: '0px 5px', fontSize: '11px', fontWeight: 700,
            }}>
              {overdueInCol}
            </span>
          )}
        </div>
        <span style={{
          color: '#5E6C84', fontSize: '12px', fontWeight: 600,
          background: 'rgba(9,30,66,0.08)', borderRadius: '50%',
          width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {items.length}
        </span>
      </div>

      {/* Card list */}
      <div
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
          <div style={{
            textAlign: 'center', color: 'rgba(9,30,66,0.35)',
            fontSize: '12px', padding: '16px 8px', fontStyle: 'italic',
          }}>
            No items
          </div>
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
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ equipment, checkouts, categories, users, role, onCheckOut, onCheckIn, onSendReminder }: Props) {
  const [checkOutItem, setCheckOutItem] = useState<Equipment | null>(null);
  const [checkInItem, setCheckInItem] = useState<Equipment | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const checkedOutItems = equipment.filter(e => e.status === 'checked_out');

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
            items: checkedOutItems,
          },
          ...categories.map(cat => ({
            id: cat.id,
            title: cat.name,
            color: cat.color,
            items: equipment.filter(e => e.categoryId === cat.id && e.status !== 'archived'),
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
            />
          </div>
        ))}
      </div>

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
