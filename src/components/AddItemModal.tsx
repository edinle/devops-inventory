import React from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import Button from '@atlaskit/button/new';
import { Box, Text } from '@atlaskit/primitives';
import type { Category } from '../types';

type Props = {
  categories: Category[];
  onClose: () => void;
  onConfirm: (item: {
    name: string;
    tagNumber: string;
    categoryId: string;
    conditionNotes: string;
  }) => void;
};

function AddItemModal({ categories, onClose, onConfirm }: Props) {
  const [name, setName] = React.useState('');
  const [tagNumber, setTagNumber] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [conditionNotes, setConditionNotes] = React.useState('');

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));
  const selectedCategory = categoryOptions.find((o) => o.value === categoryId) ?? null;

  function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedTagNumber = tagNumber.trim();
    const trimmedConditionNotes = conditionNotes.trim();

    if (!trimmedName || !trimmedTagNumber || !categoryId) {
      return;
    }

    onConfirm({
      name: trimmedName,
      tagNumber: trimmedTagNumber,
      categoryId,
      conditionNotes: trimmedConditionNotes,
    });
  }

  return (
    <Modal onClose={onClose} width="medium">
      <ModalHeader>
        <ModalTitle>Add New Item</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Box>
            <Text as="span" size="small" weight="medium" color="color.text">Item name</Text>
            <Box style={{ marginTop: 6 }}>
              <TextField
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Equipment name"
                autoFocus
                isRequired
              />
            </Box>
          </Box>

          <Box>
            <Text as="span" size="small" weight="medium" color="color.text">Tag number</Text>
            <Box style={{ marginTop: 6 }}>
              <TextField
                value={tagNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagNumber(e.target.value)}
                placeholder="e.g., CAM001"
                isRequired
              />
            </Box>
          </Box>

          <Box>
            <Text as="span" size="small" weight="medium" color="color.text">Category</Text>
            <Box style={{ marginTop: 6 }}>
              <Select
                options={categoryOptions}
                value={selectedCategory}
                onChange={(opt) => { if (opt) setCategoryId(opt.value); }}
                placeholder="Select category"
                isRequired
              />
            </Box>
          </Box>

          <Box>
            <Text as="span" size="small" weight="medium" color="color.text">Initial condition notes (optional)</Text>
            <Box style={{ marginTop: 6 }}>
              <TextField
                value={conditionNotes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConditionNotes(e.target.value)}
                placeholder="Initial condition or notes about this item"
              />
            </Box>
          </Box>
        </Box>
      </ModalBody>
      <ModalFooter>
        <Button appearance="subtle" onClick={onClose}>Cancel</Button>
        <Button 
          appearance="primary" 
          onClick={handleSubmit} 
          isDisabled={!name.trim() || !tagNumber.trim() || !categoryId}
        >
          Add Item
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default AddItemModal;
