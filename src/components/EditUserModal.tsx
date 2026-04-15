import React from 'react';
import ModalDialog, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Button from '@atlaskit/button/new';
import { Box, Text } from '@atlaskit/primitives';
import type { User } from '../types';

type Props = {
  user: User;
  onClose: () => void;
  onConfirm: (user: Omit<User, 'id'>) => void;
};

function EditUserModal({ user, onClose, onConfirm }: Props) {
  const [form, setForm] = React.useState({
    fullName: user.fullName,
    bruinCardNumber: user.bruinCardNumber,
    publication: user.publication,
    phone: user.phone,
    email: user.email,
  });

  const handleSubmit = () => {
    if (!form.fullName || !form.bruinCardNumber || !form.email) return;
    onConfirm(form);
  };

  return (
    <ModalDialog onClose={onClose} width="medium">
      <ModalHeader hasCloseButton>
        <ModalTitle>Edit Student</ModalTitle>
      </ModalHeader>
      <ModalBody>
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
                      isRequired
                    />
                  )}
                </Field>
                <Field name="bruinCard" label="Bruin Card Number" isRequired>
                  {() => (
                    <TextField
                      value={form.bruinCardNumber}
                      onChange={(e) => setForm({ ...form, bruinCardNumber: (e.target as HTMLInputElement).value })}
                      placeholder="e.g., 905123456"
                      isRequired
                    />
                  )}
                </Field>
                <Field name="publication" label="Publication Affiliation" isRequired>
                  {() => (
                    <TextField
                      value={form.publication}
                      onChange={(e) => setForm({ ...form, publication: (e.target as HTMLInputElement).value })}
                      placeholder="e.g., Daily Bruin"
                      isRequired
                    />
                  )}
                </Field>
                <Field name="phone" label="Phone Number" isRequired>
                  {() => (
                    <TextField
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: (e.target as HTMLInputElement).value })}
                      placeholder="e.g., (310) 555-0101"
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
                      placeholder="e.g., student@g.ucla.edu"
                      isRequired
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
          Save Changes
        </Button>
      </ModalFooter>
    </ModalDialog>
  );
}

export default EditUserModal;
