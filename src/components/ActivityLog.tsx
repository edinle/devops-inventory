import React from 'react';
import DynamicTable from '@atlaskit/dynamic-table';
import Lozenge from '@atlaskit/lozenge';
import type { ActivityEntry, Equipment, User } from '../types';

type Props = {
  log: ActivityEntry[];
  equipment: Equipment[];
  users: User[];
};

const actionMeta: Record<string, { label: string; appearance: 'default' | 'success' | 'inprogress' | 'moved' | 'new' | 'removed' }> = {
  check_out: { label: 'Check Out', appearance: 'inprogress' },
  check_in: { label: 'Check In', appearance: 'success' },
  reminder: { label: 'Reminder Sent', appearance: 'moved' },
  note: { label: 'Note Added', appearance: 'default' },
  added: { label: 'Item Added', appearance: 'new' },
  archived: { label: 'Item Archived', appearance: 'removed' },
};

export default function ActivityLog({ log, equipment, users }: Props) {
  const head = {
    cells: [
      { key: 'timestamp', content: 'Timestamp', isSortable: true, width: 18 },
      { key: 'item', content: 'Equipment', isSortable: false, width: 22 },
      { key: 'action', content: 'Action', isSortable: true, width: 16 },
      { key: 'user', content: 'Borrower', isSortable: false, width: 20 },
      { key: 'actor', content: 'Manager', isSortable: false, width: 16 },
      { key: 'note', content: 'Note', isSortable: false, width: 18 },
    ],
  };

  const rows = [...log]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map((entry, idx) => {
      const item = equipment.find(e => e.id === entry.equipmentId);
      const user = entry.userId ? users.find(u => u.id === entry.userId) : undefined;
      const meta = actionMeta[entry.action] ?? { label: entry.action, appearance: 'default' };

      return {
        key: entry.id ?? idx.toString(),
        cells: [
          {
            key: 'timestamp',
            content: (
              <span style={{ fontSize: '12px', color: '#5E6C84' }}>
                {new Date(entry.timestamp).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                })}
              </span>
            ),
          },
          {
            key: 'item',
            content: item
              ? <span style={{ fontWeight: 500 }}>{item.name} {item.tagNumber}</span>
              : <span style={{ color: '#97A0AF' }}>—</span>,
          },
          {
            key: 'action',
            content: <Lozenge appearance={meta.appearance}>{meta.label}</Lozenge>,
          },
          {
            key: 'user',
            content: user
              ? <span>{user.fullName}</span>
              : <span style={{ color: '#97A0AF' }}>—</span>,
          },
          {
            key: 'actor',
            content: <span style={{ color: '#5E6C84' }}>{entry.actorName}</span>,
          },
          {
            key: 'note',
            content: entry.note
              ? <span style={{ fontStyle: 'italic', fontSize: '12px', color: '#5E6C84' }}>{entry.note}</span>
              : <span style={{ color: '#97A0AF' }}>—</span>,
          },
        ],
      };
    });

  return (
    <div>
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: '#172B4D' }}>Activity Log</h3>
          <p style={{ margin: '4px 0 0', color: '#5E6C84', fontSize: '13px' }}>
            Read-only audit trail of all equipment events. Retained for minimum 3 years.
          </p>
        </div>
        <span style={{
          background: '#DEEBFF',
          color: '#0052CC',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 500,
        }}>
          {log.length} entries
        </span>
      </div>
      <DynamicTable
        head={head}
        rows={rows}
        rowsPerPage={20}
        defaultPage={1}
        isFixedSize
        defaultSortKey="timestamp"
        defaultSortOrder="DESC"
      />
    </div>
  );
}
