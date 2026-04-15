import React from 'react';
import ModalDialog, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import Button from '@atlaskit/button/new';
import { Box, Text } from '@atlaskit/primitives';
import type { Manager } from '../types';

type Props = {
  manager: Manager;
  onClose: () => void;
  onConfirm: (manager: Omit<Manager, 'id'>) => void;
};

function EditManagerModal({ manager, onClose, onConfirm }: Props) {
  const [form, setForm] = React.useState({
    name: manager.name,
    email: manager.email,
    role: manager.role,
  });

  const roleOptions = [
    { label: 'Manager', value: 'manager' },
    { label: 'Super Admin', value: 'super_admin' },
  ];

  const selectedRole = roleOptions.find((o) => o.value === form.role) ?? null;

  function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) return;
    onConfirm({
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
    });
  }

  return (
    <ModalDialog onClose={onClose} width="medium">
      <ModalHeader hasCloseButton>
        <ModalTitle>Edit Manager</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Box style={{ marginTop: 16 }}>
          <Form onSubmit={handleSubmit}>
            {({ formProps }) => (
              <form {...formProps}>
                <Field name="name" label="Display Name" isRequired>
                  {() => (
                    <TextField
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: (e.target as HTMLInputElement).value })}
                      placeholder="Manager display name"
                      isRequired
                    />
                  )}
                </Field>

                <Field name="email" label="Email Address" isRequired>
                  {() => (
                    <TextField
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: (e.target as HTMLInputElement).value })}
                      placeholder="manager@ucla.edu"
                      isRequired
                    />
                  )}
                </Field>

                <Field name="role" label="Role">
                  {() => (
                    <Select
                      options={roleOptions}
                      value={selectedRole}
                      onChange={(opt) => { if (opt) setForm({ ...form, role: opt.value as 'manager' | 'super_admin' }); }}
                      isDisabled={manager.role === 'super_admin'}
                    />
                  )}
                </Field>

                <Box style={{ marginTop: 8 }}>
                  <Button 
                    appearance="primary" 
                    onClick={handleSubmit}
                    isDisabled={!form.name.trim() || !form.email.trim()}
                  >
                    Save Changes
                  </Button>
                </Box>
              </form>
            )}
          </Form>
        </Box>
      </ModalBody>
      <ModalFooter>
        <Button appearance="subtle" onClick={onClose}>Cancel</Button>
      </ModalFooter>
    </ModalDialog>
  );
}

export default EditManagerModal;
