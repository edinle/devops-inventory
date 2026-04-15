import React, { useState } from 'react';
import ModalDialog, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import Form, { Field } from '@atlaskit/form';
import TextArea from '@atlaskit/textarea';
import Lozenge from '@atlaskit/lozenge';
import SectionMessage from '@atlaskit/section-message';
import type { Equipment, Checkout, User } from '../types';

type Props = {
  equipment: Equipment;
  checkout: Checkout;
  borrower: User | undefined;
  onClose: () => void;
  onConfirm: (returnNote: string) => void;
};

export default function CheckInModal({ equipment, checkout, borrower, onClose, onConfirm }: Props) {
  const [returnNote, setReturnNote] = useState('');

  const dueDate = new Date(checkout.dueAt);
  const formattedDue = dueDate.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  return (
    <ModalDialog onClose={onClose} width="medium">
      <ModalHeader hasCloseButton>
        <ModalTitle>Check In Equipment</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div style={{ marginBottom: '16px' }}>
          <strong>Item:</strong>{' '}
          {equipment.name} {equipment.tagNumber}
          {'  '}
          {checkout.isOverdue
            ? <Lozenge appearance="removed">Overdue</Lozenge>
            : <Lozenge appearance="success">On Time</Lozenge>}
        </div>

        {checkout.isOverdue && (
          <div style={{ marginBottom: '16px' }}>
            <SectionMessage appearance="error" title="Item is overdue">
              This item was due on {formattedDue}. Please note the return condition carefully.
            </SectionMessage>
          </div>
        )}

        <div style={{ marginBottom: '12px', padding: '12px', background: '#F4F5F7', borderRadius: '4px' }}>
          <div><strong>Borrower:</strong> {borrower?.fullName ?? 'Unknown'}</div>
          <div><strong>Checked out:</strong> {new Date(checkout.checkedOutAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div><strong>Was due:</strong> {formattedDue}</div>
          {checkout.conditionNoteOut && (
            <div><strong>Out condition note:</strong> {checkout.conditionNoteOut}</div>
          )}
        </div>

        <Form onSubmit={() => onConfirm(returnNote)}>
          {({ formProps }) => (
            <form {...formProps}>
              <Field name="returnNote" label="Return Condition Note (optional)">
                {() => (
                  <TextArea
                    value={returnNote}
                    onChange={(e) => setReturnNote(e.target.value)}
                    placeholder="Describe the item's condition on return..."
                    minimumRows={2}
                  />
                )}
              </Field>
            </form>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button appearance="subtle" onClick={onClose}>Cancel</Button>
        <Button appearance="primary" onClick={() => onConfirm(returnNote)}>
          Confirm Return
        </Button>
      </ModalFooter>
    </ModalDialog>
  );
}
