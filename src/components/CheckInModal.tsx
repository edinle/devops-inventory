import React, { useState } from 'react';
import ModalDialog, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import Form, { Field } from '@atlaskit/form';
import TextArea from '@atlaskit/textarea';
import Lozenge from '@atlaskit/lozenge';
import SectionMessage from '@atlaskit/section-message';
import { Box, Stack, Text } from '@atlaskit/primitives';
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
        <Box style={{ marginBottom: 16 }}>
          <Box style={{ 
            background: '#F4F5F7', 
            borderRadius: 8, 
            padding: 16,
            marginBottom: 16 
          }}>
            <Stack space="space.100">
              <Text as="strong" weight="semibold" color="color.text">
                Item
              </Text>
              <Box style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Text color="color.text">
                  {equipment.name} {equipment.tagNumber}
                </Text>
                {checkout.isOverdue ? <Lozenge appearance="removed">Overdue</Lozenge> : <Lozenge appearance="success">On Time</Lozenge>}
              </Box>
            </Stack>
          </Box>
        </Box>

        {checkout.isOverdue && (
          <Box style={{ marginBottom: 16 }}>
            <SectionMessage appearance="error" title="Item is overdue">
              This item was due on {formattedDue}. Please note the return condition carefully.
            </SectionMessage>
          </Box>
        )}

        <Box style={{ marginBottom: 16, padding: 16, background: '#F4F5F7', borderRadius: 8 }}>
          <Stack space="space.100">
            <Text size="small" weight="medium" color="color.text">
              <strong>Borrower:</strong> {borrower?.fullName ?? 'Unknown'}
            </Text>
            <Text size="small" weight="medium" color="color.text">
              <strong>Checked out:</strong>{' '}
              {new Date(checkout.checkedOutAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            <Text size="small" weight="medium" color="color.text">
              <strong>Was due:</strong> {formattedDue}
            </Text>
            {checkout.conditionNoteOut && (
              <Text size="small" weight="medium" color="color.text">
                <strong>Out condition note:</strong> {checkout.conditionNoteOut}
              </Text>
            )}
          </Stack>
        </Box>

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
