import React from 'react';
import ModalDialog, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import Button from '@atlaskit/button/new';
import { Box, Text } from '@atlaskit/primitives';
import type { Category } from '../types';

type Props = {
  column: { id: string; title: string; color: string };
  categories: Category[];
  onClose: () => void;
  onConfirm: (id: string, name: string, color: string) => void;
};

const colorOptions = [
  { label: 'Blue', value: '#0052CC' },
  { label: 'Green', value: '#00875A' },
  { label: 'Yellow', value: '#FF991F' },
  { label: 'Orange', value: '#FF5630' },
  { label: 'Red', value: '#DE350B' },
  { label: 'Purple', value: '#6554C0' },
  { label: 'Gray', value: '#6B7780' },
];

export default function EditColumnModal({ column, categories, onClose, onConfirm }: Props) {
  const [name, setName] = React.useState(column.title);
  const [color, setColor] = React.useState(column.color);
  const [categoryId, setCategoryId] = React.useState(column.id);

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));
  const selectedCategory = categoryOptions.find((o) => o.value === categoryId) ?? null;
  const selectedColor = colorOptions.find((o) => o.value === color) ?? null;

  function handleSubmit() {
    if (!name.trim()) return;
    onConfirm(column.id, name.trim(), color);
  }

  return (
    <ModalDialog onClose={onClose} width="small">
      <ModalHeader hasCloseButton>
        <ModalTitle>Edit Column</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Box style={{ marginTop: 16 }}>
          <Form onSubmit={handleSubmit}>
            {({ formProps }) => (
              <form {...formProps}>
                <Field name="name" label="Column Name" isRequired>
                  {() => (
                    <TextField
                      value={name}
                      onChange={(e) => setName((e.target as HTMLInputElement).value)}
                      placeholder="Column name"
                      isRequired
                    />
                  )}
                </Field>

                <Field name="color" label="Column Color">
                  {() => (
                    <Select
                      options={colorOptions}
                      value={selectedColor}
                      onChange={(opt) => { if (opt) setColor(opt.value); }}
                      placeholder="Select color"
                    />
                  )}
                </Field>

                <Box style={{ marginTop: 8 }}>
                  <Button 
                    appearance="primary" 
                    onClick={handleSubmit}
                    isDisabled={!name.trim()}
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
