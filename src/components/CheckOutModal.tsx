import React, { useState } from 'react';
import ModalDialog, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import Form, { Field, FormFooter } from '@atlaskit/form';
import Select from '@atlaskit/select';
import TextArea from '@atlaskit/textarea';
import { DatePicker } from '@atlaskit/datetime-picker';
import Lozenge from '@atlaskit/lozenge';
import type { Equipment, User, Checkout } from '../types';
import { USERS } from '../data/mockData';

type Props = {
  equipment: Equipment;
  onClose: () => void;
  onConfirm: (checkout: Omit<Checkout, 'id'>) => void;
};

const userOptions = USERS.map((u) => ({
  label: `${u.fullName} — ${u.publication} (${u.bruinCardNumber})`,
  value: u.id,
}));

function getDefaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  // Skip weekend
  if (d.getDay() === 6) d.setDate(d.getDate() + 2);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function CheckOutModal({ equipment, onClose, onConfirm }: Props) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string>(getDefaultDueDate());
  const [conditionNote, setConditionNote] = useState('');

  const handleSubmit = () => {
    if (!selectedUser) return;
    onConfirm({
      equipmentId: equipment.id,
      userId: selectedUser,
      checkedOutAt: new Date().toISOString(),
      dueAt: new Date(`${dueDate}T12:00:00`).toISOString(),
      conditionNoteOut: conditionNote,
      isOverdue: false,
    });
  };

  return (
    <ModalDialog onClose={onClose} width="medium">
      <ModalHeader hasCloseButton>
        <ModalTitle>Check Out Equipment</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div style={{ marginBottom: '12px' }}>
          <strong>Item:</strong>{' '}
          {equipment.name} {equipment.tagNumber}
          {'  '}
          <Lozenge appearance="inprogress">Checking Out</Lozenge>
        </div>

        <Form onSubmit={handleSubmit}>
          {({ formProps }) => (
            <form {...formProps}>
              <Field name="user" label="Assign to Student" isRequired>
                {() => (
                  <Select
                    options={userOptions}
                    placeholder="Search by name or Bruin card number..."
                    onChange={(opt) => setSelectedUser(opt?.value ?? null)}
                    menuPosition="fixed"
                  />
                )}
              </Field>
              <Field name="dueDate" label="Due Date (default: next business day at 12:00 PM)">
                {() => (
                  <DatePicker
                    value={dueDate}
                    onChange={(val) => setDueDate(val)}
                    dateFormat="MM/DD/YYYY"
                  />
                )}
              </Field>
              <Field name="conditionNote" label="Condition Note (optional)">
                {() => (
                  <TextArea
                    value={conditionNote}
                    onChange={(e) => setConditionNote(e.target.value)}
                    placeholder="e.g., camera strap missing, minor scratch on lens..."
                    minimumRows={2}
                  />
                )}
              </Field>
              <FormFooter />
            </form>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button appearance="subtle" onClick={onClose}>Cancel</Button>
        <Button
          appearance="primary"
          onClick={handleSubmit}
          isDisabled={!selectedUser}
        >
          Confirm Check Out
        </Button>
      </ModalFooter>
    </ModalDialog>
  );
}
