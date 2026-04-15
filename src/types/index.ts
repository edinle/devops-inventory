export type Role = 'super_admin' | 'manager';

export type EquipmentStatus = 'available' | 'checked_out' | 'archived';

export type Category = {
  id: string;
  name: string;
  color: string;   // hex accent color (dot + card left bar)
  bgColor: string; // hex background color for the column
};

export type Equipment = {
  id: string;
  name: string;
  tagNumber: string;
  categoryId: string;
  status: EquipmentStatus;
  conditionNotes: string[];
  archivedReason?: string;
};

export type Checkout = {
  id: string;
  equipmentId: string;
  userId: string;
  checkedOutAt: string; // ISO string
  dueAt: string;        // ISO string
  conditionNoteOut?: string;
  isOverdue: boolean;
};

export type User = {
  id: string;
  fullName: string;
  bruinCardNumber: string;
  publication: string;
  phone: string;
  email: string;
};

export type Manager = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type ActivityEntry = {
  id: string;
  timestamp: string;
  equipmentId: string;
  action: 'check_out' | 'check_in' | 'reminder' | 'note' | 'added' | 'archived';
  actorName: string;
  userId?: string;
  note?: string;
};

export type AuditItem = {
  equipmentId: string;
  status: 'pending' | 'verified' | 'missing';
  verifiedAt?: string;
};

export type AuditSession = {
  id: string;
  startedAt: string;
  completedAt?: string;
  items: AuditItem[];
};
