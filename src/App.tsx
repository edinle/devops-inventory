import React, { useState } from 'react';
import { FlagGroup } from '@atlaskit/flag';
import Flag from '@atlaskit/flag';
import type { Equipment, Checkout, User, Manager, ActivityEntry, Category } from './types';
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
import AppTopNavigation from './components/AppTopNavigation';
import AppSideNavigation, { type AppView } from './components/AppSideNavigation';
import AppPageHeader from './components/AppPageHeader';
import InventoryListView from './components/InventoryListView';
import Settings from './components/Settings';
import AuditMode from './components/AuditMode';
import { Box, Text, xcss } from '@atlaskit/primitives';
import './app-shell.css';

type FlagData = { id: string; title: string; description: string; type: 'success' | 'info' };

const CURRENT_MANAGER = MANAGERS[0];

export default function App() {
  const [equipment, setEquipment] = useState<Equipment[]>(EQUIPMENT);
  const [checkouts, setCheckouts] = useState<Checkout[]>(CHECKOUTS);
  const [users, setUsers] = useState<User[]>(USERS);
  const [managers, setManagers] = useState<Manager[]>(MANAGERS);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>(ACTIVITY_LOG);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [flags, setFlags] = useState<FlagData[]>([]);
  const [activeView, setActiveView] = useState<AppView>('board');
  const [inventoryQuery, setInventoryQuery] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<'all' | 'active' | 'available' | 'checked_out' | 'archived'>('all');

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

  function handleEditUser(id: string, user: Omit<User, 'id'>) {
    setUsers(prev => prev.map(u => u.id === id ? { ...user, id } : u));
    addFlag({ type: 'success', title: 'Student Updated', description: user.fullName });
  }

  function handleAddManager(email: string) {
    setManagers(prev => [...prev, { id: `m-${Date.now()}`, name: email.split('@')[0], email, role: 'manager' }]);
    addFlag({ type: 'success', title: 'Manager Added', description: email });
  }

  function handleEditManager(id: string, manager: Omit<Manager, 'id'>) {
    setManagers(prev => prev.map(m => m.id === id ? { ...manager, id } : m));
    addFlag({ type: 'success', title: 'Manager Updated', description: manager.email });
  }

  function handleRemoveManager(id: string) {
    setManagers(prev => prev.filter(m => m.id !== id));
    addFlag({ type: 'info', title: 'Manager Removed', description: '' });
  }

  function handleUpdateProfile(manager: Omit<Manager, 'id'>) {
    setManagers(prev => prev.map(m => m.id === CURRENT_MANAGER.id ? { ...manager, id: CURRENT_MANAGER.id } : m));
    addFlag({ type: 'success', title: 'Profile Updated', description: manager.email });
  }

  function handleUpdateCategory(id: string, name: string, color: string, bgColor?: string) {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name, color, ...(bgColor ? { bgColor } : {}) } : c));
    addFlag({ type: 'success', title: 'Category Updated', description: `${name} column updated` });
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

  function handleEditItem(id: string, name: string, categoryId: string) {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, name, categoryId } : e));
    addActivity({ timestamp: new Date().toISOString(), equipmentId: id, action: 'note', actorName: CURRENT_MANAGER.name, note: `Item updated: name="${name}"` });
    addFlag({ type: 'success', title: 'Item Updated', description: name });
  }

  function handleAddGeneralNote(equipmentId: string, note: string) {
    setEquipment(prev => prev.map(e => e.id === equipmentId ? { ...e, conditionNotes: [...e.conditionNotes, note] } : e));
    addActivity({ timestamp: new Date().toISOString(), equipmentId, action: 'note', actorName: CURRENT_MANAGER.name, note });
    addFlag({ type: 'success', title: 'Note Added', description: note.length > 48 ? `${note.slice(0, 48)}…` : note });
  }

  const overdueCount = checkouts.filter(c => c.isOverdue).length;

  const statusOptions = [
    { label: 'Active items', value: 'active' },
    { label: 'All items', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'Checked out', value: 'checked_out' },
    { label: 'Archived', value: 'archived' },
  ] as const;

  const selectedStatusOption = statusOptions.find(option => option.value === inventoryStatusFilter) ?? null;

  const headerConfig = {
    board: {
      breadcrumbs: ['Inventory', 'Board'],
      title: `Queues (${overdueCount} overdue)`,
      primaryActionLabel: 'Inventory list',
      secondaryActionLabel: 'Identity and access',
      onPrimaryAction: () => setActiveView('inventory' as AppView),
      onSecondaryAction: () => setActiveView('iam' as AppView),
    },
    inventory: {
      breadcrumbs: ['Inventory', 'List view'],
      title: 'Inventory list',
      primaryActionLabel: 'Board view',
      secondaryActionLabel: 'Reports',
      onPrimaryAction: () => setActiveView('board' as AppView),
      onSecondaryAction: () => setActiveView('activity' as AppView),
    },
    iam: {
      breadcrumbs: ['Administration', 'Identity and access'],
      title: 'Identity and access management',
      primaryActionLabel: 'Inventory list',
      secondaryActionLabel: 'Reports',
      onPrimaryAction: () => setActiveView('inventory' as AppView),
      onSecondaryAction: () => setActiveView('activity' as AppView),
    },
    activity: {
      breadcrumbs: ['Inventory', 'Reports'],
      title: 'Reports and activity',
      primaryActionLabel: 'Inventory list',
      secondaryActionLabel: 'Identity and access',
      onPrimaryAction: () => setActiveView('inventory' as AppView),
      onSecondaryAction: () => setActiveView('iam' as AppView),
    },
    settings: {
      breadcrumbs: ['Administration', 'Project settings'],
      title: 'Project settings',
      primaryActionLabel: 'Inventory list',
      secondaryActionLabel: 'Reports',
      onPrimaryAction: () => setActiveView('inventory' as AppView),
      onSecondaryAction: () => setActiveView('activity' as AppView),
    },
    audit: {
      breadcrumbs: ['Administration', 'Equipment Audit'],
      title: 'Equipment Audit',
      primaryActionLabel: 'Inventory list',
      secondaryActionLabel: 'Reports',
      onPrimaryAction: () => setActiveView('inventory' as AppView),
      onSecondaryAction: () => setActiveView('activity' as AppView),
    },
  } as const;

  const currentHeader = headerConfig[activeView];

  return (
    <Box
      xcss={xcss({ height: '100vh' })}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#F7F8F9',
      }}
    >
      <AppTopNavigation onCreate={() => setActiveView('inventory')} />

      <div className="app-main">
        <AppSideNavigation activeView={activeView} onSelect={setActiveView} />

        <div className="app-content">
          <AppPageHeader
            breadcrumbs={currentHeader.breadcrumbs}
            title={currentHeader.title}
            primaryActionLabel={currentHeader.primaryActionLabel}
            secondaryActionLabel={currentHeader.secondaryActionLabel}
            onPrimaryAction={currentHeader.onPrimaryAction}
            onSecondaryAction={currentHeader.onSecondaryAction}
            filterPlaceholder={activeView === 'inventory' ? 'Search by equipment, tag, or category' : undefined}
            filterValue={activeView === 'inventory' ? inventoryQuery : undefined}
            onFilterChange={activeView === 'inventory' ? setInventoryQuery : undefined}
            selectPlaceholder={activeView === 'inventory' ? 'Choose a status' : undefined}
            selectOptions={activeView === 'inventory' ? [...statusOptions] : undefined}
            selectedOption={activeView === 'inventory' ? selectedStatusOption : undefined}
            onSelectChange={activeView === 'inventory'
              ? (option) => {
                if (option) {
                  setInventoryStatusFilter(option.value as 'all' | 'active' | 'available' | 'checked_out' | 'archived');
                }
              }
              : undefined}
          />

          <div className="app-view-slot">
            {activeView === 'board' && (
              <Dashboard
                equipment={equipment}
                checkouts={checkouts}
                categories={categories}
                users={users}
                activityLog={activityLog}
                role={CURRENT_MANAGER.role}
                onCheckOut={handleCheckOut}
                onCheckIn={handleCheckIn}
                onSendReminder={handleSendReminder}
                onAddEquipment={handleAddEquipment}
                onAddActivity={addActivity}
                onAddGeneralNote={handleAddGeneralNote}
                onEditItem={handleEditItem}
                onUpdateCategory={handleUpdateCategory}
              />
            )}

            {activeView === 'inventory' && (
              <InventoryListView
                equipment={equipment}
                categories={categories}
                checkouts={checkouts}
                users={users}
                query={inventoryQuery}
                statusFilter={inventoryStatusFilter}
                onStatusFilterChange={setInventoryStatusFilter}
                role={CURRENT_MANAGER.role}
                onCheckOut={handleCheckOut}
                onCheckIn={handleCheckIn}
                onSendReminder={handleSendReminder}
                onArchive={handleArchive}
                onEditItem={handleEditItem}
                onAddEquipment={handleAddEquipment}
              />
            )}

            {activeView === 'iam' && (
              <div className="app-pane">
                <UserManagement
                  users={users}
                  managers={managers}
                  role={CURRENT_MANAGER.role}
                  onAddUser={handleAddUser}
                  onEditUser={handleEditUser}
                  onAddManager={handleAddManager}
                  onEditManager={handleEditManager}
                  onRemoveManager={handleRemoveManager}
                />
              </div>
            )}

            {activeView === 'activity' && (
              <div className="app-pane">
                <ActivityLog log={activityLog} equipment={equipment} users={users} />
              </div>
            )}

            {activeView === 'settings' && (
              <div className="app-pane">
                <Settings 
                  currentManager={CURRENT_MANAGER}
                  onUpdateProfile={handleUpdateProfile}
                />
              </div>
            )}

            {activeView === 'audit' && (
              <div className="app-pane">
                <AuditMode 
                  equipment={equipment}
                  categories={categories}
                  users={users}
                  currentRole={CURRENT_MANAGER.role}
                />
              </div>
            )}
          </div>
        </div>
      </div>

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
