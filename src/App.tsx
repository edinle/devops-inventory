import React, { useState } from 'react';
import { FlagGroup } from '@atlaskit/flag';
import Flag from '@atlaskit/flag';
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
import TrelloTopNav from './components/TrelloTopNav';
import { Box, Text, xcss } from '@atlaskit/primitives';

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

  function handleAddGeneralNote(equipmentId: string, note: string) {
    setEquipment(prev => prev.map(e => e.id === equipmentId ? { ...e, conditionNotes: [...e.conditionNotes, note] } : e));
    addActivity({ timestamp: new Date().toISOString(), equipmentId, action: 'note', actorName: CURRENT_MANAGER.name, note });
    addFlag({ type: 'success', title: 'Note Added', description: note.length > 48 ? `${note.slice(0, 48)}…` : note });
  }

  const overdueCount = checkouts.filter(c => c.isOverdue).length;
  const isDashboard = selectedTab === 0;

  return (
    <Box
      xcss={xcss({ height: '100vh' })}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background:
          'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.18) 100%), linear-gradient(135deg, #0079BF 0%, #026AA7 100%)',
      }}
    >
      <TrelloTopNav
        workspaceName="Workspaces"
        boardName="Equipment Board"
        userName={CURRENT_MANAGER.name}
      />

      <Box style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {selectedTab === 0 && (
          <Dashboard
            equipment={equipment}
            checkouts={checkouts}
            categories={CATEGORIES}
            users={users}
            activityLog={activityLog}
            role={CURRENT_MANAGER.role}
            onCheckOut={handleCheckOut}
            onCheckIn={handleCheckIn}
            onSendReminder={handleSendReminder}
            onAddActivity={addActivity}
            onAddGeneralNote={handleAddGeneralNote}
          />
        )}
        {selectedTab !== 0 && (
          <Box style={{ flex: 1, overflowY: 'auto', background: '#F4F5F7' }}>
            <Box style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
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
            </Box>
          </Box>
        )}
      </Box>

      <FlagGroup onDismissed={(id) => setFlags(prev => prev.filter(f => f.id !== id))}>
        {flags.map(f => (
          <Flag
            key={f.id} id={f.id} title={f.title} description={f.description}
            icon={
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: f.type === 'success' ? '#36B37E' : '#0052CC',
                  color: 'white',
                }}
              >
                <Text as="strong" size="small" weight="bold" color="inherit">
                  {f.type === 'success' ? '✓' : 'i'}
                </Text>
              </Box>
            }
          />
        ))}
      </FlagGroup>
    </Box>
  );
}
