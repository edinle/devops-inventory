import React from 'react';
import DynamicTable from '@atlaskit/dynamic-table';
import Lozenge from '@atlaskit/lozenge';
import Badge from '@atlaskit/badge';
import { Box, Flex, Stack, Text } from '@atlaskit/primitives';
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
              <Box style={{ color: '#5E6C84' }}>
                <Text size="small" color="inherit">
                  {new Date(entry.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </Box>
            ),
          },
          {
            key: 'item',
            content: item
              ? (
                <Text weight="medium" color="inherit">
                  {item.name} {item.tagNumber}
                </Text>
              )
              : (
                <Box style={{ color: '#97A0AF' }}>
                  <Text size="small" color="inherit">
                    —
                  </Text>
                </Box>
              ),
          },
          {
            key: 'action',
            content: <Lozenge appearance={meta.appearance}>{meta.label}</Lozenge>,
          },
          {
            key: 'user',
            content: user
              ? <Text color="inherit">{user.fullName}</Text>
              : (
                <Box style={{ color: '#97A0AF' }}>
                  <Text size="small" color="inherit">
                    —
                  </Text>
                </Box>
              ),
          },
          {
            key: 'actor',
            content: (
              <Box style={{ color: '#5E6C84' }}>
                <Text size="small" color="inherit">
                  {entry.actorName}
                </Text>
              </Box>
            ),
          },
          {
            key: 'note',
            content: entry.note
              ? (
                <Box style={{ color: '#5E6C84' }}>
                  <Text as="em" size="small" color="inherit">
                    {entry.note}
                  </Text>
                </Box>
              )
              : (
                <Box style={{ color: '#97A0AF' }}>
                  <Text size="small" color="inherit">
                    —
                  </Text>
                </Box>
              ),
          },
        ],
      };
    });

  return (
    <Box>
      <Box style={{ marginBottom: 12 }}>
        <Flex gap="space.200" alignItems="center" justifyContent="space-between">
          <Stack space="space.050">
            <Box style={{ color: '#172B4D' }}>
              <Text as="strong" weight="semibold" size="large" color="inherit">
                Activity Log
              </Text>
            </Box>
            <Box style={{ color: '#5E6C84' }}>
              <Text size="small" color="inherit">
                Read-only audit trail of all equipment events. Retained for minimum 3 years.
              </Text>
            </Box>
          </Stack>
          <Badge appearance="primary">{log.length} entries</Badge>
        </Flex>
      </Box>
      <DynamicTable
        head={head}
        rows={rows}
        rowsPerPage={20}
        defaultPage={1}
        isFixedSize
        defaultSortKey="timestamp"
        defaultSortOrder="DESC"
      />
    </Box>
  );
}
