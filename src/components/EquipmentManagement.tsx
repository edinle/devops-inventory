import React, { useState } from 'react';
import Button from '@atlaskit/button/new';
import DynamicTable from '@atlaskit/dynamic-table';
import ModalDialog, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import Lozenge from '@atlaskit/lozenge';
import SectionMessage from '@atlaskit/section-message';
import type { Equipment, Category } from '../types';

type Props = {
  equipment: Equipment[];
  categories: Category[];
  role: 'super_admin' | 'manager';
  onAddEquipment: (e: Omit<Equipment, 'id' | 'conditionNotes'>) => void;
  onArchive: (id: string, reason: string) => void;
};

function AddEquipmentModal({
  categories,
  onClose,
  onAdd,
}: { categories: Category[]; onClose: () => void; onAdd: (e: Omit<Equipment, 'id' | 'conditionNotes'>) => void }) {
  const [form, setForm] = useState({ name: '', tagNumber: '', categoryId: '', status: 'available' as const });

  const catOptions = categories.map(c => ({ label: c.name, value: c.id }));

  return (
    <ModalDialog onClose={onClose} width="medium">
      <ModalHeader hasCloseButton>
        <ModalTitle>Add Equipment Item</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={() => {}}>
          {({ formProps }) => (
            <form {...formProps}>
              <Field name="name" label="Equipment Name" isRequired>
                {() => (
                  <TextField
                    value={form.name}
                    onChange={e => setForm({ ...form, name: (e.target as HTMLInputElement).value })}
                    placeholder="e.g., Nikon D850"
                  />
                )}
              </Field>
              <Field name="tag" label="Tag Number" isRequired>
                {() => (
                  <TextField
                    value={form.tagNumber}
                    onChange={e => setForm({ ...form, tagNumber: (e.target as HTMLInputElement).value })}
                    placeholder="e.g., #5"
                  />
                )}
              </Field>
              <Field name="category" label="Category" isRequired>
                {() => (
                  <Select
                    options={catOptions}
                    placeholder="Select category..."
                    onChange={opt => setForm({ ...form, categoryId: opt?.value ?? '' })}
                    menuPosition="fixed"
                  />
                )}
              </Field>
            </form>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button appearance="subtle" onClick={onClose}>Cancel</Button>
        <Button
          appearance="primary"
          onClick={() => { if (form.name && form.tagNumber && form.categoryId) onAdd(form); }}
          isDisabled={!form.name || !form.tagNumber || !form.categoryId}
        >
          Add Item
        </Button>
      </ModalFooter>
    </ModalDialog>
  );
}

function ArchiveModal({ item, onClose, onConfirm }: { item: Equipment; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  return (
    <ModalDialog onClose={onClose} width="small">
      <ModalHeader hasCloseButton>
        <ModalTitle appearance="warning">Archive Item</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <SectionMessage appearance="warning">
          Archiving preserves the item's history. It will not appear in checkout flows. This action can be reversed by an admin.
        </SectionMessage>
        <div style={{ marginTop: '12px' }}>
          <strong>Item:</strong> {item.name} {item.tagNumber}
        </div>
        <div style={{ marginTop: '12px' }}>
          <Field name="reason" label="Reason for archiving" isRequired>
            {() => (
              <TextField
                value={reason}
                onChange={e => setReason((e.target as HTMLInputElement).value)}
                placeholder="e.g., broken SD card slot, decommissioned"
              />
            )}
          </Field>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button appearance="subtle" onClick={onClose}>Cancel</Button>
        <Button appearance="warning" onClick={() => reason && onConfirm(reason)} isDisabled={!reason}>
          Archive
        </Button>
      </ModalFooter>
    </ModalDialog>
  );
}

const statusAppearance: Record<string, 'success' | 'default' | 'removed'> = {
  available: 'success',
  checked_out: 'inprogress' as any,
  archived: 'removed',
};

const statusLabel: Record<string, string> = {
  available: 'Available',
  checked_out: 'Checked Out',
  archived: 'Archived',
};

export default function EquipmentManagement({ equipment, categories, role, onAddEquipment, onArchive }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [archiveItem, setArchiveItem] = useState<Equipment | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'checked_out' | 'archived'>('all');

  const filtered = equipment.filter(e => filterStatus === 'all' || e.status === filterStatus);

  const head = {
    cells: [
      { key: 'name', content: 'Name', isSortable: true, width: 22 },
      { key: 'tag', content: 'Tag', width: 8 },
      { key: 'category', content: 'Category', width: 15 },
      { key: 'status', content: 'Status', width: 14 },
      { key: 'notes', content: 'Latest Condition Note', width: 28 },
      { key: 'actions', content: '', width: 13 },
    ],
  };

  const rows = filtered.map(item => {
    const cat = categories.find(c => c.id === item.categoryId);
    return {
      key: item.id,
      cells: [
        { key: 'name', content: <strong>{item.name}</strong> },
        { key: 'tag', content: <span style={{ fontFamily: 'monospace', color: '#5E6C84' }}>{item.tagNumber}</span> },
        { key: 'category', content: cat ? (
          <span style={{
            background: cat.color + '22',
            color: cat.color,
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
          }}>{cat.name}</span>
        ) : '—' },
        {
          key: 'status',
          content: (
            <Lozenge appearance={statusAppearance[item.status] ?? 'default'}>
              {statusLabel[item.status] ?? item.status}
            </Lozenge>
          ),
        },
        {
          key: 'notes',
          content: item.archivedReason
            ? <span style={{ color: '#97A0AF', fontStyle: 'italic', fontSize: '12px' }}>Archived: {item.archivedReason}</span>
            : item.conditionNotes.length > 0
              ? <span style={{ fontSize: '12px', color: '#5E6C84' }}>{item.conditionNotes[item.conditionNotes.length - 1]}</span>
              : <span style={{ color: '#97A0AF' }}>—</span>,
        },
        {
          key: 'actions',
          content: role === 'super_admin' && item.status !== 'archived' ? (
            <Button
              appearance="subtle"
              spacing="compact"
              onClick={() => setArchiveItem(item)}
            >
              Archive
            </Button>
          ) : null,
        },
      ],
    };
  });

  const filterOptions: Array<{ label: string; value: typeof filterStatus }> = [
    { label: 'All Items', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'Checked Out', value: 'checked_out' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#172B4D' }}>Equipment Inventory</h3>
          <p style={{ margin: '4px 0 0', color: '#5E6C84', fontSize: '13px' }}>
            {equipment.filter(e => e.status !== 'archived').length} active items across {categories.length} categories
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: filterStatus === opt.value ? '#0052CC' : '#DFE1E6',
                  background: filterStatus === opt.value ? '#DEEBFF' : '#fff',
                  color: filterStatus === opt.value ? '#0052CC' : '#5E6C84',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {role === 'super_admin' && (
            <Button appearance="primary" onClick={() => setShowAdd(true)}>
              Add Item
            </Button>
          )}
        </div>
      </div>

      <DynamicTable head={head} rows={rows} rowsPerPage={15} defaultPage={1} isFixedSize />

      {showAdd && (
        <AddEquipmentModal
          categories={categories}
          onClose={() => setShowAdd(false)}
          onAdd={(e) => { onAddEquipment(e); setShowAdd(false); }}
        />
      )}
      {archiveItem && (
        <ArchiveModal
          item={archiveItem}
          onClose={() => setArchiveItem(null)}
          onConfirm={(reason) => { onArchive(archiveItem.id, reason); setArchiveItem(null); }}
        />
      )}
    </div>
  );
}
