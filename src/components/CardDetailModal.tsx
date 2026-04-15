import React, { useMemo, useState } from 'react';
import ModalDialog, { ModalBody, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import TextArea from '@atlaskit/textarea';
import Avatar from '@atlaskit/avatar';
import Lozenge from '@atlaskit/lozenge';
import { Box, Flex, Inline, Stack, Text } from '@atlaskit/primitives';
import type { ActivityEntry, Checkout, Equipment, User } from '../types';

type Props = {
  equipment: Equipment;
  checkouts: Checkout[];
  users: User[];
  activityLog: ActivityEntry[];
  onClose: () => void;
  onAddGeneralNote: (equipmentId: string, note: string) => void;
};

function formatWhen(ts: string) {
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function describeActivity(entry: ActivityEntry, borrower?: User) {
  switch (entry.action) {
    case 'check_out':
      return borrower ? `checked out to ${borrower.fullName}` : 'checked out';
    case 'check_in':
      return borrower ? `returned by ${borrower.fullName}` : 'checked in';
    case 'reminder':
      return borrower ? `sent a reminder to ${borrower.fullName}` : 'sent a reminder';
    case 'archived':
      return 'archived this item';
    case 'added':
      return 'added this item';
    case 'note':
      return 'added a note';
    default:
      return entry.action;
  }
}

export default function CardDetailModal({ equipment, checkouts, users, activityLog, onClose, onAddGeneralNote }: Props) {
  const [noteDraft, setNoteDraft] = useState('');

  const currentCheckout = useMemo(
    () => checkouts.find((c) => c.equipmentId === equipment.id) ?? null,
    [checkouts, equipment.id],
  );
  const currentBorrower = useMemo(
    () => (currentCheckout ? users.find((u) => u.id === currentCheckout.userId) : undefined),
    [currentCheckout, users],
  );

  const itemActivity = useMemo(
    () =>
      activityLog
        .filter((a) => a.equipmentId === equipment.id)
        .slice()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [activityLog, equipment.id],
  );

  const notesByUser = useMemo(() => {
    const map = new Map<string, { user: User; notes: { when: string; note: string }[] }>();
    for (const entry of itemActivity) {
      if (!entry.userId || !entry.note) continue;
      const u = users.find((x) => x.id === entry.userId);
      if (!u) continue;
      const existing = map.get(u.id) ?? { user: u, notes: [] };
      existing.notes.push({ when: entry.timestamp, note: entry.note });
      map.set(u.id, existing);
    }
    return [...map.values()];
  }, [itemActivity, users]);

  function handleAddNote() {
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    onAddGeneralNote(equipment.id, trimmed);
    setNoteDraft('');
  }

  return (
    <ModalDialog onClose={onClose} width="xlarge">
      <ModalHeader hasCloseButton>
        <ModalTitle>
          <Inline space="space.100" alignBlock="center">
            <Text as="strong" weight="semibold" size="large" color="inherit">
              {equipment.name} {equipment.tagNumber}
            </Text>
            {equipment.status === 'checked_out' ? (
              <Lozenge appearance="inprogress">Checked out</Lozenge>
            ) : equipment.status === 'archived' ? (
              <Lozenge appearance="removed">Archived</Lozenge>
            ) : (
              <Lozenge appearance="success">Available</Lozenge>
            )}
          </Inline>
        </ModalTitle>
      </ModalHeader>

      <ModalBody>
        <Box style={{ minHeight: 420 }}>
          <Flex gap="space.300">
          {/* Left panel */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Stack space="space.300">
              <Box
                style={{
                  background: 'rgba(9,30,66,0.06)',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Stack space="space.100">
                  <Text as="strong" weight="semibold" size="medium" color="inherit">
                    Current status
                  </Text>
                  <Text size="small" color="inherit">
                    {currentBorrower
                      ? `Checked out to ${currentBorrower.fullName} • Due ${new Date(currentCheckout!.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : equipment.status === 'archived'
                        ? `Archived • ${equipment.archivedReason ?? ''}`
                        : 'Available'}
                  </Text>
                </Stack>
              </Box>

              <Box>
                <Stack space="space.100">
                  <Text as="strong" weight="semibold" size="medium" color="inherit">
                    General notes
                  </Text>

                  <Box style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Box style={{ flex: 1 }}>
                      <TextArea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Add a more detailed note…"
                        minimumRows={6}
                      />
                    </Box>
                    <Button appearance="primary" onClick={handleAddNote} isDisabled={!noteDraft.trim()}>
                      Save
                    </Button>
                  </Box>

                  {equipment.conditionNotes.length === 0 ? (
                    <Text size="small" color="inherit">
                      No general notes yet.
                    </Text>
                  ) : (
                    <Box style={{ marginTop: 8 }}>
                      <Stack space="space.100">
                        {equipment.conditionNotes
                          .slice()
                          .reverse()
                          .map((n, idx) => (
                            <Box
                              key={`${idx}-${n}`}
                              style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(9,30,66,0.12)',
                                borderRadius: 8,
                                padding: 10,
                              }}
                            >
                              <Text size="small" color="inherit">
                                {n}
                              </Text>
                            </Box>
                          ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Box>
                <Stack space="space.100">
                  <Text as="strong" weight="semibold" size="medium" color="inherit">
                    Notes by borrower
                  </Text>
                  {notesByUser.length === 0 ? (
                    <Text size="small" color="inherit">
                      No borrower-specific notes yet.
                    </Text>
                  ) : (
                    <Stack space="space.200">
                      {notesByUser.map(({ user, notes }) => (
                        <Box
                          key={user.id}
                          style={{
                            border: '1px solid rgba(9,30,66,0.12)',
                            borderRadius: 10,
                            padding: 12,
                          }}
                        >
                          <Inline space="space.100" alignBlock="center">
                            <Avatar size="small" name={user.fullName} />
                            <Text as="strong" weight="semibold" size="medium" color="inherit">
                              {user.fullName}
                            </Text>
                          </Inline>
                          <Box style={{ marginTop: 10 }}>
                            <Stack space="space.100">
                              {notes
                                .slice()
                                .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
                                .map((n, idx) => (
                                  <Box key={`${idx}-${n.when}`} style={{ paddingLeft: 4 }}>
                                    <Text size="small" color="inherit">
                                      <Box style={{ display: 'inline', color: 'rgba(9,30,66,0.55)' }}>
                                        {formatWhen(n.when)} •{' '}
                                      </Box>
                                      <Box style={{ display: 'inline' }}>{n.note}</Box>
                                    </Text>
                                  </Box>
                                ))}
                            </Stack>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Right panel: activity */}
          <Box style={{ width: 360, flexShrink: 0 }}>
            <Stack space="space.150">
              <Text as="strong" weight="semibold" size="medium" color="inherit">
                Comments and activity
              </Text>

              <Box
                style={{
                  border: '1px solid rgba(9,30,66,0.12)',
                  borderRadius: 10,
                  padding: 10,
                  background: 'rgba(255,255,255,0.06)',
                }}
              >
                <Stack space="space.100">
                  {itemActivity.length === 0 ? (
                    <Text size="small" color="inherit">
                      No activity yet.
                    </Text>
                  ) : (
                    itemActivity.slice(0, 12).map((entry) => {
                      const borrower = entry.userId ? users.find((u) => u.id === entry.userId) : undefined;
                      const secondary = describeActivity(entry, borrower);
                      return (
                        <Box key={entry.id} style={{ padding: '8px 6px', borderRadius: 8 }}>
                          <Inline space="space.100" alignBlock="start">
                            <Avatar size="small" name={entry.actorName} />
                            <Box style={{ minWidth: 0 }}>
                              <Inline space="space.050" alignBlock="center">
                                <Text as="strong" weight="semibold" size="small" color="inherit">
                                  {entry.actorName}
                                </Text>
                                <Text size="small" color="inherit">
                                  {secondary}
                                </Text>
                              </Inline>
                              <Text size="small" color="inherit">
                                <Box style={{ display: 'inline', color: 'rgba(9,30,66,0.55)' }}>
                                  {formatWhen(entry.timestamp)}
                                </Box>
                              </Text>
                              {entry.note && (
                                <Box style={{ marginTop: 4 }}>
                                  <Text size="small" color="inherit">
                                    {entry.note}
                                  </Text>
                                </Box>
                              )}
                            </Box>
                          </Inline>
                        </Box>
                      );
                    })
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>
          </Flex>
        </Box>
      </ModalBody>
    </ModalDialog>
  );
}

