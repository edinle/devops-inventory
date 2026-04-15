import type { Category, Equipment, User, Manager, ActivityEntry, Checkout } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'cat-cameras', name: 'Cameras', color: '#0052CC' },
  { id: 'cat-lenses', name: 'Lenses', color: '#6554C0' },
  { id: 'cat-projectors', name: 'Projectors', color: '#00875A' },
  { id: 'cat-recorders', name: 'Recorders', color: '#FF8B00' },
  { id: 'cat-lighting', name: 'Lighting', color: '#DE350B' },
  { id: 'cat-audio', name: 'Audio', color: '#0065FF' },
];

export const EQUIPMENT: Equipment[] = [
  { id: 'eq-1', name: 'Nikon D850', tagNumber: '#1', categoryId: 'cat-cameras', status: 'checked_out', conditionNotes: [] },
  { id: 'eq-2', name: 'Nikon D850', tagNumber: '#2', categoryId: 'cat-cameras', status: 'available', conditionNotes: [] },
  { id: 'eq-3', name: 'Nikon D850', tagNumber: '#3', categoryId: 'cat-cameras', status: 'checked_out', conditionNotes: ['Minor scratch on body'] },
  { id: 'eq-4', name: 'Nikon D850', tagNumber: '#4', categoryId: 'cat-cameras', status: 'available', conditionNotes: [] },
  { id: 'eq-5', name: 'Canon EOS R5', tagNumber: '#1', categoryId: 'cat-cameras', status: 'available', conditionNotes: [] },
  { id: 'eq-6', name: 'Sony A7 IV', tagNumber: '#1', categoryId: 'cat-cameras', status: 'available', conditionNotes: [] },
  { id: 'eq-7', name: 'Nikon 24-70mm f/2.8', tagNumber: '#1', categoryId: 'cat-lenses', status: 'available', conditionNotes: [] },
  { id: 'eq-8', name: 'Nikon 24-70mm f/2.8', tagNumber: '#2', categoryId: 'cat-lenses', status: 'checked_out', conditionNotes: [] },
  { id: 'eq-9', name: 'Canon 50mm f/1.4', tagNumber: '#1', categoryId: 'cat-lenses', status: 'available', conditionNotes: [] },
  { id: 'eq-10', name: 'Sigma 85mm f/1.4', tagNumber: '#1', categoryId: 'cat-lenses', status: 'available', conditionNotes: [] },
  { id: 'eq-11', name: 'Epson PowerLite 2250U', tagNumber: '#1', categoryId: 'cat-projectors', status: 'available', conditionNotes: [] },
  { id: 'eq-12', name: 'Epson PowerLite 2250U', tagNumber: '#2', categoryId: 'cat-projectors', status: 'checked_out', conditionNotes: [] },
  { id: 'eq-13', name: 'Sony UWP-D21 Recorder', tagNumber: '#1', categoryId: 'cat-recorders', status: 'available', conditionNotes: [] },
  { id: 'eq-14', name: 'Zoom H6 Recorder', tagNumber: '#1', categoryId: 'cat-recorders', status: 'checked_out', conditionNotes: [] },
  { id: 'eq-15', name: 'Godox SL-60W LED', tagNumber: '#1', categoryId: 'cat-lighting', status: 'available', conditionNotes: [] },
  { id: 'eq-16', name: 'Godox SL-60W LED', tagNumber: '#2', categoryId: 'cat-lighting', status: 'available', conditionNotes: [] },
  { id: 'eq-17', name: 'Rode NTG3 Shotgun Mic', tagNumber: '#1', categoryId: 'cat-audio', status: 'available', conditionNotes: [] },
  { id: 'eq-18', name: 'Sony PCM-D100', tagNumber: '#1', categoryId: 'cat-recorders', status: 'archived', conditionNotes: [], archivedReason: 'Broken SD card slot' },
];

const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
const twoDaysAgo = new Date(now);
twoDaysAgo.setDate(now.getDate() - 2);
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);
tomorrow.setHours(12, 0, 0, 0);
const overdueDate = new Date(now);
overdueDate.setDate(now.getDate() - 1);
overdueDate.setHours(12, 0, 0, 0);

export const CHECKOUTS: Checkout[] = [
  {
    id: 'co-1',
    equipmentId: 'eq-1',
    userId: 'u-1',
    checkedOutAt: twoDaysAgo.toISOString(),
    dueAt: overdueDate.toISOString(),
    conditionNoteOut: '',
    isOverdue: true,
  },
  {
    id: 'co-2',
    equipmentId: 'eq-3',
    userId: 'u-2',
    checkedOutAt: yesterday.toISOString(),
    dueAt: tomorrow.toISOString(),
    conditionNoteOut: 'Camera strap missing',
    isOverdue: false,
  },
  {
    id: 'co-3',
    equipmentId: 'eq-8',
    userId: 'u-3',
    checkedOutAt: yesterday.toISOString(),
    dueAt: overdueDate.toISOString(),
    conditionNoteOut: '',
    isOverdue: true,
  },
  {
    id: 'co-4',
    equipmentId: 'eq-12',
    userId: 'u-1',
    checkedOutAt: now.toISOString(),
    dueAt: tomorrow.toISOString(),
    conditionNoteOut: '',
    isOverdue: false,
  },
  {
    id: 'co-5',
    equipmentId: 'eq-14',
    userId: 'u-4',
    checkedOutAt: now.toISOString(),
    dueAt: tomorrow.toISOString(),
    conditionNoteOut: '',
    isOverdue: false,
  },
];

export const USERS: User[] = [
  { id: 'u-1', fullName: 'Alex Chen', bruinCardNumber: '905123456', publication: 'Daily Bruin', phone: '(310) 555-0101', email: 'alex.chen@g.ucla.edu' },
  { id: 'u-2', fullName: 'Maya Patel', bruinCardNumber: '905234567', publication: 'UCLA Radio', phone: '(310) 555-0102', email: 'maya.patel@g.ucla.edu' },
  { id: 'u-3', fullName: 'Jordan Williams', bruinCardNumber: '905345678', publication: 'Bruin TV', phone: '(310) 555-0103', email: 'jordan.w@g.ucla.edu' },
  { id: 'u-4', fullName: 'Sam Torres', bruinCardNumber: '905456789', publication: 'The Bruin', phone: '(310) 555-0104', email: 'sam.torres@g.ucla.edu' },
  { id: 'u-5', fullName: 'Riley Kim', bruinCardNumber: '905567890', publication: 'Daily Bruin', phone: '(310) 555-0105', email: 'riley.kim@g.ucla.edu' },
  { id: 'u-6', fullName: 'Morgan Davis', bruinCardNumber: '905678901', publication: 'Bruin TV', phone: '(310) 555-0106', email: 'morgan.d@g.ucla.edu' },
];

export const MANAGERS: Manager[] = [
  { id: 'm-1', name: 'Edin Le', email: 'edinle@ucla.edu', role: 'super_admin' },
  { id: 'm-2', name: 'Jessica Park', email: 'jpark@ucla.edu', role: 'manager' },
  { id: 'm-3', name: 'Daniel Nguyen', email: 'dnguyen@ucla.edu', role: 'manager' },
];

export const ACTIVITY_LOG: ActivityEntry[] = [
  { id: 'a-1', timestamp: now.toISOString(), equipmentId: 'eq-14', action: 'check_out', actorName: 'Jessica Park', userId: 'u-4' },
  { id: 'a-2', timestamp: now.toISOString(), equipmentId: 'eq-12', action: 'check_out', actorName: 'Daniel Nguyen', userId: 'u-1' },
  { id: 'a-3', timestamp: yesterday.toISOString(), equipmentId: 'eq-3', action: 'check_out', actorName: 'Jessica Park', userId: 'u-2', note: 'Camera strap missing' },
  { id: 'a-4', timestamp: yesterday.toISOString(), equipmentId: 'eq-8', action: 'check_out', actorName: 'Daniel Nguyen', userId: 'u-3' },
  { id: 'a-5', timestamp: twoDaysAgo.toISOString(), equipmentId: 'eq-1', action: 'check_out', actorName: 'Jessica Park', userId: 'u-1' },
  { id: 'a-6', timestamp: twoDaysAgo.toISOString(), equipmentId: 'eq-5', action: 'check_in', actorName: 'Daniel Nguyen', userId: 'u-5' },
  { id: 'a-7', timestamp: twoDaysAgo.toISOString(), equipmentId: 'eq-1', action: 'reminder', actorName: 'Jessica Park', userId: 'u-1' },
  { id: 'a-8', timestamp: twoDaysAgo.toISOString(), equipmentId: 'eq-9', action: 'check_in', actorName: 'Jessica Park', userId: 'u-6' },
];
