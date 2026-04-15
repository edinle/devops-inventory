import React, { useState } from 'react';
import { Box, Stack, Text, Inline } from '@atlaskit/primitives';
import Button from '@atlaskit/button/new';
import DynamicTable from '@atlaskit/dynamic-table';
import Lozenge from '@atlaskit/lozenge';
import Avatar from '@atlaskit/avatar';
import SectionMessage from '@atlaskit/section-message';
import type { Equipment, Category, User } from '../types';

type Props = {
  equipment: Equipment[];
  categories: Category[];
  users: User[];
  currentRole: 'super_admin' | 'manager';
};

type AuditItem = {
  id: string;
  name: string;
  tagNumber: string;
  category: string;
  expectedStatus: 'found' | 'not_found' | 'missing';
  actualStatus?: 'found' | 'not_found';
  notes?: string;
  checkedBy?: string;
  checkedAt?: string;
};

export default function AuditMode({ equipment, categories, users, currentRole }: Props) {
  const [isAuditMode, setIsAuditMode] = useState(false);
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  function startAudit() {
    const allEquipment = equipment.map(eq => ({
      id: eq.id,
      name: eq.name,
      tagNumber: eq.tagNumber,
      category: categories.find(c => c.id === eq.categoryId)?.name || 'Unknown',
      expectedStatus: 'not_found' as const,
    }));
    setAuditItems(allEquipment);
    setIsAuditMode(true);
  }

  function updateAuditItem(id: string, actualStatus: 'found' | 'not_found', notes?: string) {
    setAuditItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, actualStatus, notes, checkedBy: 'Current User', checkedAt: new Date().toISOString() }
        : item
    ));
  }

  function generatePDFReport() {
    setIsGeneratingReport(true);
    
    // Create a simple text-based report for now
    const reportContent = auditItems.map(item => ({
      'Equipment Name': item.name,
      'Tag Number': item.tagNumber,
      'Category': item.category,
      'Expected Status': item.expectedStatus,
      'Actual Status': item.actualStatus || 'Not Checked',
      'Notes': item.notes || '',
      'Checked By': item.checkedBy || '',
      'Checked At': item.checkedAt ? new Date(item.checkedAt).toLocaleString() : '',
    }));

    // Convert to CSV format for easy export
    const csvContent = [
      Object.keys(reportContent[0]).join(','),
      ...reportContent.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipment-audit-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setIsGeneratingReport(false), 1000);
  }

  function exitAuditMode() {
    setIsAuditMode(false);
    setAuditItems([]);
  }

  if (currentRole === 'super_admin') {
    return (
      <SectionMessage appearance="information">
        <Text>
          Audit mode is only available for non-super-admin users for equipment verification purposes.
        </Text>
      </SectionMessage>
    );
  }

  if (!isAuditMode) {
    return (
      <Box style={{ padding: 24 }}>
        <SectionMessage appearance="information">
          <Text>
            Audit mode allows you to verify equipment existence in the physical equipment room.
            Check each item to confirm if it's present and generate a report for tax auditing purposes.
          </Text>
        </SectionMessage>
        <Box style={{ marginTop: 16 }}>
          <Button appearance="primary" onClick={startAudit}>
            Start Equipment Audit
          </Button>
        </Box>
      </Box>
    );
  }

  const auditHead = {
    cells: [
      { key: 'name', content: 'Equipment Name', width: 25 },
      { key: 'tag', content: 'Tag Number', width: 15 },
      { key: 'category', content: 'Category', width: 20 },
      { key: 'expected', content: 'Expected', width: 12 },
      { key: 'actual', content: 'Actual', width: 12 },
      { key: 'status', content: 'Status', width: 15 },
      { key: 'notes', content: 'Notes', width: 25 },
    ],
  };

  const auditRows = auditItems.map(item => ({
    key: item.id,
    cells: [
      {
        key: 'name',
        content: (
          <Text weight="medium">{item.name}</Text>
        ),
      },
      {
        key: 'tag',
        content: (
          <Box style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
            <Text size="small">{item.tagNumber}</Text>
          </Box>
        ),
      },
      { key: 'category', content: item.category },
      {
        key: 'expected',
        content: (
          <Lozenge appearance="default">Not Checked</Lozenge>
        ),
      },
      {
        key: 'actual',
        content: (
          <Box>
            <Button 
              appearance={item.actualStatus === 'found' ? 'primary' : 'subtle'}
              spacing="compact"
              onClick={() => updateAuditItem(item.id, item.actualStatus === 'found' ? 'not_found' : 'found')}
            >
              {item.actualStatus === 'found' ? 'Mark Missing' : 'Mark Found'}
            </Button>
          </Box>
        ),
      },
      {
        key: 'status',
        content: (
          <Lozenge 
            appearance={item.actualStatus === 'found' ? 'success' : item.actualStatus === 'not_found' ? 'removed' : 'default'}
          >
            {item.actualStatus === 'found' ? 'Found' : item.actualStatus === 'not_found' ? 'Missing' : 'Not Checked'}
          </Lozenge>
        ),
      },
      {
        key: 'notes',
        content: (
          <Text size="small" color="color.text.subtle">
            {item.notes || '-'}
          </Text>
        ),
      },
    ],
  }));

  return (
    <Box style={{ padding: 24 }}>
      <Box style={{ marginBottom: 24 }}>
        <Inline space="space.200" alignBlock="center" spread="space-between">
          <Box>
            <Text as="strong" weight="semibold" size="large" color="color.text">
              Equipment Audit Mode
            </Text>
            <Box style={{ color: 'color.text.subtle', marginTop: 4 }}>
              <Text size="small" color="inherit">
                Verify physical equipment existence for tax auditing
              </Text>
            </Box>
          </Box>
          <Box>
            <Button appearance="subtle" onClick={exitAuditMode}>
              Exit Audit Mode
            </Button>
          </Box>
        </Inline>
      </Box>

      <DynamicTable 
        head={auditHead} 
        rows={auditRows} 
        rowsPerPage={20} 
        defaultPage={1} 
        isFixedSize 
      />

      <Box style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Text size="small" color="color.text.subtle">
            Total items: {auditItems.length} | 
            Found: {auditItems.filter(item => item.actualStatus === 'found').length} | 
            Missing: {auditItems.filter(item => item.actualStatus === 'not_found').length}
          </Text>
        </Box>
        <Button 
          appearance="primary" 
          onClick={generatePDFReport}
          isDisabled={isGeneratingReport}
        >
          {isGeneratingReport ? 'Generating...' : 'Generate CSV Report'}
        </Button>
      </Box>
    </Box>
  );
}
