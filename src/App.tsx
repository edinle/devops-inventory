import React, { useState } from 'react';
import Tabs, { Tab, TabList, TabPanel } from '@atlaskit/tabs';
import { FlagGroup } from '@atlaskit/flag';
import Flag from '@atlaskit/flag';
import Avatar from '@atlaskit/avatar';
import Badge from '@atlaskit/badge';
import type { Equipment, Checkout, User, Manager, ActivityEntry } from './types';
import {
  CATEGORIES,
  EQUIPMENT,
  CHECKOUTS,
  USERS,
  MANAGERS,
  ACTIVITY_LOG,
} from './data/mockData';
import Dashboard from './components/Dashboard';
import ActivityLog from './components/ActivityLog';
import UserManagement from './components/UserManagement';
import EquipmentManagement from './components/EquipmentManagement';

type FlagData = { id: string; title: string; description: string; type: 'success' | 'info' };

const CURRENT_MANAGER = MANAGERS[0];

export default function App() {
  const [equipment, setEquipment] = useState<Equipment[]>(EQUIPMENT);
  const [checkouts, setCheckouts] = useState<Checkout[]>(CHECKOUTS);
  const [users, setUsers] = useState<User[]>(USERS);
  const [managers, setManagers] = useState<Manager[]>(MANAGERS);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>(ACTIVITY_LOG);
  const [flags, setFlags] = useState<FlagData[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);

  function addFlag(f: Omit<FlagData, 'id'>) {
    const id = Date.now().toString();
    setFlags(prev => [...prev, { ...f, id }]);
    setTimeout(() => setFlags(prev => prev.filter(x => x.id !== id)), 4000);
  }

  function addActivity(entry: Omit<ActivityEntry, 'id'>) {
    setActivityLog(prev => [{ ...entry, id: `a-${Date.now()}` }, ...prev]);
  }

  function handleCheckOut(co: Omit<Checkout, 'id'>) {
    const id = `co-${Date.now()}`;
    setCheckouts(prev => [...prev, { ...co, id }]);
    setEquipment(prev => prev.map(e => e.id === co.equipmentId ? { ...e, status: 'checked_out' } : e));
    const borrower = users.find(u => u.id === co.userId);
    const item = equipment.find(e => e.id === co.equipmentId);
    addActivity({ timestamp: new Date().toISOString(), equipmentId: co.equipmentId, action: 'check_out', actorName: CURRENT_MANAGER.name, userId: co.userId, note: co.conditionNoteOut || undefined });
    addFlag({ type: 'success', title: 'Checked Out', description: `${item?.name} ${item?.tagNumber} → ${borrower?.fullName ?? 'user'}` });
  }

  function handleCheckIn(checkoutId: string, note: string) {
    const co = checkouts.find(c => c.id === checkoutId);
    if (!co) return;
    setCheckouts(prev => prev.filter(c => c.id !== checkoutId));
    setEquipment(prev => prev.map(e => e.id === co.equipmentId
      ? { ...e, status: 'available', conditionNotes: note ? [...e.conditionNotes, note] : e.conditionNotes }
      : e));
    const item = equipment.find(e => e.id === co.equipmentId);
    addActivity({ timestamp: new Date().toISOString(), equipmentId: co.equipmentId, action: 'check_in', actorName: CURRENT_MANAGER.name, userId: co.userId, note: note || undefined });
    addFlag({ type: 'success', title: 'Returned', description: `${item?.name} ${item?.tagNumber} is now available` });
  }

  function handleSendReminder(checkoutId: string) {
    const co = checkouts.find(c => c.id === checkoutId);
    if (!co) return;
    const item = equipment.find(e => e.id === co.equipmentId);
    const borrower = users.find(u => u.id === co.userId);
    addActivity({ timestamp: new Date().toISOString(), equipmentId: co.equipmentId, action: 'reminder', actorName: CURRENT_MANAGER.name, userId: co.userId });
    addFlag({ type: 'info', title: 'Reminder Sent', description: `Twilio SMS + email → ${borrower?.fullName} for ${item?.name} ${item?.tagNumber}` });
  }

  function handleAddUser(u: Omit<User, 'id'>) {
    setUsers(prev => [...prev, { ...u, id: `u-${Date.now()}` }]);
    addFlag({ type: 'success', title: 'Student Added', description: u.fullName });
  }

  function handleAddManager(email: string) {
    setManagers(prev => [...prev, { id: `m-${Date.now()}`, name: email.split('@')[0], email, role: 'manager' }]);
    addFlag({ type: 'success', title: 'Manager Added', description: email });
  }

  function handleRemoveManager(id: string) {
    setManagers(prev => prev.filter(m => m.id !== id));
    addFlag({ type: 'info', title: 'Manager Removed', description: '' });
  }

  function handleAddEquipment(e: Omit<Equipment, 'id' | 'conditionNotes'>) {
    const newItem: Equipment = { ...e, id: `eq-${Date.now()}`, conditionNotes: [] };
    setEquipment(prev => [...prev, newItem]);
    addActivity({ timestamp: new Date().toISOString(), equipmentId: newItem.id, action: 'added', actorName: CURRENT_MANAGER.name });
    addFlag({ type: 'success', title: 'Item Added', description: `${e.name} ${e.tagNumber}` });
  }

  function handleArchive(id: string, reason: string) {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, status: 'archived', archivedReason: reason } : e));
    addActivity({ timestamp: new Date().toISOString(), equipmentId: id, action: 'archived', actorName: CURRENT_MANAGER.name, note: reason });
    addFlag({ type: 'info', title: 'Item Archived', description: reason });
  }

  const overdueCount = checkouts.filter(c => c.isOverdue).length;
  const isDashboard = selectedTab === 0;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1D7EBF' }}>
      {/* Top nav — Trello-style */}
      <div style={{
        height: '44px', flexShrink: 0,
        background: 'rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px', gap: '12px',
      }}>
        {/* Left: logo + board name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: '#FFD100', color: '#0052CC',
            fontWeight: 900, fontSize: '11px', padding: '3px 6px', borderRadius: '3px', letterSpacing: '0.5px',
          }}>UCLA</div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>Photo Studio IMS</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>·</span>
          {/* Tab switcher inline in nav */}
          {['Board', 'Activity Log', 'Users', 'Equipment'].map((label, i) => (
            <button
              key={i}
              onClick={() => setSelectedTab(i)}
              style={{
                background: selectedTab === i ? 'rgba(255,255,255,0.3)' : 'transparent',
                border: 'none', borderRadius: '3px',
                color: 'white', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500,
                padding: '4px 10px',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Right: overdue badge + user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {overdueCount > 0 && (
            <span style={{ background: '#FF5630', color: 'white', borderRadius: '3px', padding: '2px 8px', fontSize: '12px', fontWeight: 700 }}>
              ⚠ {overdueCount} overdue
            </span>
          )}
          <span style={{
            background: 'rgba(255,209,0,0.2)', color: '#FFD100',
            padding: '2px 7px', borderRadius: '3px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const,
          }}>
            {CURRENT_MANAGER.role === 'super_admin' ? 'Super Admin' : 'Manager'}
          </span>
          <Avatar size="small" name={CURRENT_MANAGER.name} />
          <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>{CURRENT_MANAGER.name}</span>
        </div>
      </div>

      {/* Board name bar (only on board view) */}
      {isDashboard && (
        <div style={{
          height: '40px', flexShrink: 0,
          background: 'rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: '16px',
        }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '17px' }}>Equipment Board</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            {[
              { label: 'Total', value: equipment.filter(e => e.status !== 'archived').length },
              { label: 'Out', value: checkouts.length },
              { label: 'Available', value: equipment.filter(e => e.status === 'available').length },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: '3px',
                padding: '2px 10px', color: 'white', fontSize: '12px',
                display: 'flex', gap: '5px', alignItems: 'center',
              }}>
                <strong>{s.value}</strong> {s.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {selectedTab === 0 && (
          <Dashboard
            equipment={equipment}
            checkouts={checkouts}
            categories={CATEGORIES}
            users={users}
            role={CURRENT_MANAGER.role}
            onCheckOut={handleCheckOut}
            onCheckIn={handleCheckIn}
            onSendReminder={handleSendReminder}
            onAddActivity={addActivity}
          />
        )}
        {selectedTab !== 0 && (
          <div style={{ flex: 1, overflowY: 'auto', background: '#F4F5F7' }}>
            <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto' }}>
              {selectedTab === 1 && <ActivityLog log={activityLog} equipment={equipment} users={users} />}
              {selectedTab === 2 && (
                <UserManagement
                  users={users}
                  managers={managers}
                  role={CURRENT_MANAGER.role}
                  onAddUser={handleAddUser}
                  onAddManager={handleAddManager}
                  onRemoveManager={handleRemoveManager}
                />
              )}
              {selectedTab === 3 && (
                <EquipmentManagement
                  equipment={equipment}
                  categories={CATEGORIES}
                  role={CURRENT_MANAGER.role}
                  onAddEquipment={handleAddEquipment}
                  onArchive={handleArchive}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <FlagGroup onDismissed={(id) => setFlags(prev => prev.filter(f => f.id !== id))}>
        {flags.map(f => (
          <Flag
            key={f.id} id={f.id} title={f.title} description={f.description}
            icon={
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 24, height: 24, borderRadius: '50%',
                background: f.type === 'success' ? '#36B37E' : '#0052CC',
                color: 'white', fontWeight: 700, fontSize: 13,
              }}>
                {f.type === 'success' ? '✓' : 'i'}
              </span>
            }
          />
        ))}
      </FlagGroup>
    </div>
  );
}
