import React, { useState } from 'react';
import Button from '@atlaskit/button/new';
import DynamicTable from '@atlaskit/dynamic-table';
import ModalDialog, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import Form, { Field, ErrorMessage } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Lozenge from '@atlaskit/lozenge';
import Avatar from '@atlaskit/avatar';
import SectionMessage from '@atlaskit/section-message';
import type { User, Manager } from '../types';

type Props = {
  users: User[];
  managers: Manager[];
  role: 'super_admin' | 'manager';
  onAddUser: (u: Omit<User, 'id'>) => void;
  onAddManager: (email: string) => void;
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
        <div style={{ marginTop: '16px' }}>
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
        </div>
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

export default function UserManagement({ users, managers, role, onAddUser, onAddManager, onRemoveManager }: Props) {
  const [showAddUser, setShowAddUser] = useState(false);
  const [newManagerEmail, setNewManagerEmail] = useState('');

  const userHead = {
    cells: [
      { key: 'name', content: 'Name', width: 22 },
      { key: 'bruin', content: 'Bruin Card', width: 15 },
      { key: 'pub', content: 'Publication', width: 20 },
      { key: 'phone', content: 'Phone', width: 18 },
      { key: 'email', content: 'Email', width: 25 },
    ],
  };

  const userRows = users.map(u => ({
    key: u.id,
    cells: [
      { key: 'name', content: <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Avatar size="small" name={u.fullName} /><strong>{u.fullName}</strong></div> },
      { key: 'bruin', content: <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{u.bruinCardNumber}</span> },
      { key: 'pub', content: u.publication },
      { key: 'phone', content: u.phone },
      { key: 'email', content: <a href={`mailto:${u.email}`} style={{ color: '#0052CC' }}>{u.email}</a> },
    ],
  }));

  return (
    <div>
      {/* Regular Users */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#172B4D' }}>Regular Users (Students)</h3>
            <p style={{ margin: '4px 0 0', color: '#5E6C84', fontSize: '13px' }}>
              Borrowers — no login access. Receive SMS/email notifications via Twilio.
            </p>
          </div>
          <Button appearance="primary" onClick={() => setShowAddUser(true)}>
            Add Student
          </Button>
        </div>
        <DynamicTable head={userHead} rows={userRows} rowsPerPage={10} defaultPage={1} isFixedSize />
      </div>

      {/* Manager Accounts (Super Admin only) */}
      {role === 'super_admin' && (
        <div>
          <h3 style={{ margin: '0 0 4px', color: '#172B4D' }}>Manager Accounts</h3>
          <p style={{ margin: '0 0 12px', color: '#5E6C84', fontSize: '13px' }}>
            Add or remove manager login accounts. Managers can check in/out equipment and send reminders.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <TextField
                value={newManagerEmail}
                onChange={(e) => setNewManagerEmail((e.target as HTMLInputElement).value)}
                placeholder="manager@ucla.edu"
              />
            </div>
            <Button
              appearance="primary"
              onClick={() => { if (newManagerEmail) { onAddManager(newManagerEmail); setNewManagerEmail(''); } }}
              isDisabled={!newManagerEmail}
            >
              Add Manager
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {managers.map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: '#F4F5F7', borderRadius: '6px',
                border: '1px solid #DFE1E6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar size="small" name={m.name} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#172B4D' }}>{m.name}</div>
                    <div style={{ fontSize: '12px', color: '#5E6C84' }}>{m.email}</div>
                  </div>
                  <Lozenge appearance={m.role === 'super_admin' ? 'new' : 'default'}>
                    {m.role === 'super_admin' ? 'Super Admin' : 'Manager'}
                  </Lozenge>
                </div>
                {m.role !== 'super_admin' && (
                  <Button appearance="subtle" onClick={() => onRemoveManager(m.id)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onAdd={(u) => { onAddUser(u); setShowAddUser(false); }}
        />
      )}
    </div>
  );
}
