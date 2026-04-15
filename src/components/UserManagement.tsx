import React, { useState } from 'react';
import Button from '@atlaskit/button/new';
import DynamicTable from '@atlaskit/dynamic-table';
import ModalDialog, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import Form, { Field, ErrorMessage } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Lozenge from '@atlaskit/lozenge';
import Avatar from '@atlaskit/avatar';
import SectionMessage from '@atlaskit/section-message';
import { Anchor, Box, Flex, Inline, Stack, Text } from '@atlaskit/primitives';
import type { User, Manager } from '../types';
import EditUserModal from './EditUserModal';

type Props = {
  users: User[];
  managers: Manager[];
  role: 'super_admin' | 'manager';
  onAddUser: (u: Omit<User, 'id'>) => void;
  onEditUser: (id: string, user: Omit<User, 'id'>) => void;
  onAddManager: (email: string) => void;
  onEditManager: (id: string, manager: Omit<Manager, 'id'>) => void;
  onRemoveManager: (id: string) => void;
};

function AddUserModal({ onClose, onAdd }: { onClose: () => void; onAdd: (u: Omit<User, 'id'>) => void }) {
  const [form, setForm] = useState({ fullName: '', bruinCardNumber: '', publication: '', phone: '', email: '' });

  const handleSubmit = () => {
    if (!form.fullName || !form.bruinCardNumber || !form.email) return;
    onAdd(form);
  };

  return (
    <ModalDialog onClose={onClose} width="medium">
      <ModalHeader hasCloseButton>
        <ModalTitle>Add Regular User</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <SectionMessage appearance="information">
          Regular users have no system login. They are assignable profiles only and receive text/email notifications.
        </SectionMessage>
        <Box style={{ marginTop: 16 }}>
          <Form onSubmit={handleSubmit}>
            {({ formProps }) => (
              <form {...formProps}>
                <Field name="fullName" label="Full Name" isRequired>
                  {() => (
                    <TextField
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: (e.target as HTMLInputElement).value })}
                      placeholder="e.g., Alex Chen"
                    />
                  )}
                </Field>
                <Field name="bruinCard" label="Bruin Card Number" isRequired>
                  {() => (
                    <TextField
                      value={form.bruinCardNumber}
                      onChange={(e) => setForm({ ...form, bruinCardNumber: (e.target as HTMLInputElement).value })}
                      placeholder="e.g., 905123456"
                    />
                  )}
                </Field>
                <Field name="publication" label="Publication Affiliation" isRequired>
                  {() => (
                    <TextField
                      value={form.publication}
                      onChange={(e) => setForm({ ...form, publication: (e.target as HTMLInputElement).value })}
                      placeholder="e.g., Daily Bruin"
                    />
                  )}
                </Field>
                <Field name="phone" label="Phone Number" isRequired>
                  {() => (
                    <TextField
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: (e.target as HTMLInputElement).value })}
                      placeholder="e.g., (310) 555-0101"
                    />
                  )}
                </Field>
                <Field name="email" label="Email Address" isRequired>
                  {() => (
                    <TextField
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: (e.target as HTMLInputElement).value })}
                      placeholder="e.g., student@g.ucla.edu"
                    />
                  )}
                </Field>
              </form>
            )}
          </Form>
        </Box>
      </ModalBody>
      <ModalFooter>
        <Button appearance="subtle" onClick={onClose}>Cancel</Button>
        <Button
          appearance="primary"
          onClick={handleSubmit}
          isDisabled={!form.fullName || !form.bruinCardNumber || !form.email}
        >
          Add User
        </Button>
      </ModalFooter>
    </ModalDialog>
  );
}

export default function UserManagement({ users, managers, role, onAddUser, onEditUser, onAddManager, onEditManager, onRemoveManager }: Props) {
  const [showAddUser, setShowAddUser] = useState(false);
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);

  const userHead = {
    cells: [
      { key: 'name', content: 'Name', width: 20 },
      { key: 'bruin', content: 'Bruin Card', width: 15 },
      { key: 'pub', content: 'Publication', width: 18 },
      { key: 'phone', content: 'Phone', width: 16 },
      { key: 'email', content: 'Email', width: 22 },
      { key: 'actions', content: 'Actions', width: 12 },
    ],
  };

  const userRows = users.map(u => ({
    key: u.id,
    cells: [
      {
        key: 'name',
        content: (
          <Inline space="space.100" alignBlock="center">
            <Avatar size="small" name={u.fullName} />
            <Text as="strong" weight="semibold" color="inherit">
              {u.fullName}
            </Text>
          </Inline>
        ),
      },
      {
        key: 'bruin',
        content: (
          <Box style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace' }}>
            <Text size="small" color="inherit">
              {u.bruinCardNumber}
            </Text>
          </Box>
        ),
      },
      { key: 'pub', content: u.publication },
      { key: 'phone', content: u.phone },
      {
        key: 'email',
        content: (
          <Anchor href={`mailto:${u.email}`}>
            {u.email}
          </Anchor>
        ),
      },
      {
        key: 'actions',
        content: (
          <Button
            appearance="subtle"
            spacing="compact"
            onClick={() => setEditUser(u)}
          >
            Edit
          </Button>
        ),
      },
    ],
  }));

  return (
    <Box>
      {/* Regular Users */}
      <Box style={{ marginBottom: 32 }}>
        <Box style={{ marginBottom: 12 }}>
          <Flex gap="space.200" alignItems="center" justifyContent="space-between">
          <Stack space="space.050">
            <Box style={{ color: '#172B4D' }}>
              <Text as="strong" weight="semibold" size="large" color="inherit">
                Regular Users (Students)
              </Text>
            </Box>
            <Box style={{ color: '#5E6C84' }}>
              <Text size="small" color="inherit">
                Borrowers — no login access. Receive SMS/email notifications via Twilio.
              </Text>
            </Box>
          </Stack>
          <Button appearance="primary" onClick={() => setShowAddUser(true)}>
            Add Student
          </Button>
          </Flex>
        </Box>
        <DynamicTable head={userHead} rows={userRows} rowsPerPage={10} defaultPage={1} isFixedSize />
      </Box>

      {/* Manager Accounts (Super Admin only) */}
      {role === 'super_admin' && (
        <Box>
          <Stack space="space.050">
            <Box style={{ color: '#172B4D' }}>
              <Text as="strong" weight="semibold" size="large" color="inherit">
                Manager Accounts
              </Text>
            </Box>
            <Box style={{ color: '#5E6C84' }}>
              <Text size="small" color="inherit">
                Add or remove manager login accounts. Managers can check in/out equipment and send reminders.
              </Text>
            </Box>
          </Stack>
          <Box style={{ marginTop: 12, marginBottom: 16 }}>
            <Flex gap="space.100" alignItems="center">
            <Box style={{ flex: 1 }}>
              <TextField
                value={newManagerEmail}
                onChange={(e) => setNewManagerEmail((e.target as HTMLInputElement).value)}
                placeholder="manager@ucla.edu"
              />
            </Box>
            <Button
              appearance="primary"
              onClick={() => { if (newManagerEmail) { onAddManager(newManagerEmail); setNewManagerEmail(''); } }}
              isDisabled={!newManagerEmail}
            >
              Add Manager
            </Button>
            </Flex>
          </Box>
          <Stack space="space.100">
            {managers.map(m => (
              <Box
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#F4F5F7',
                  borderRadius: 10,
                  border: '1px solid #DFE1E6',
                }}
              >
                <Inline space="space.150" alignBlock="center">
                  <Avatar size="small" name={m.name} />
                  <Stack space="space.0">
                    <Box style={{ color: '#172B4D' }}>
                      <Text as="strong" weight="semibold" color="inherit">
                        {m.name}
                      </Text>
                    </Box>
                    <Box style={{ color: '#5E6C84' }}>
                      <Text size="small" color="inherit">
                        {m.email}
                      </Text>
                    </Box>
                  </Stack>
                  <Lozenge appearance={m.role === 'super_admin' ? 'new' : 'default'}>
                    {m.role === 'super_admin' ? 'Super Admin' : 'Manager'}
                  </Lozenge>
                </Inline>
                {m.role !== 'super_admin' && (
                  <Button appearance="subtle" onClick={() => onRemoveManager(m.id)}>
                    Remove
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onAdd={(u) => { onAddUser(u); setShowAddUser(false); }}
        />
      )}

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onConfirm={(user) => {
            onEditUser(editUser.id, user);
            setEditUser(null);
          }}
        />
      )}
    </Box>
  );
}
