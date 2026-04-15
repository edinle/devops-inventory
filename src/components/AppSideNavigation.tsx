import React from 'react';
import Avatar from '@atlaskit/avatar';
import { Box, Inline, Pressable, Stack, Text } from '@atlaskit/primitives';
import BacklogIcon from '@atlaskit/icon/core/backlog';
import BookWithBookmarkIcon from '@atlaskit/icon/core/book-with-bookmark';
import PeopleGroupIcon from '@atlaskit/icon/core/people-group';
import ChartBarIcon from '@atlaskit/icon/core/chart-bar';
import PriorityBlockerIcon from '@atlaskit/icon/core/priority-blocker';
import ScreenIcon from '@atlaskit/icon/core/screen';
import PersonAddIcon from '@atlaskit/icon/core/person-add';
import AddIcon from '@atlaskit/icon/core/add';
import SettingsIcon from '@atlaskit/icon/core/settings';
import { resolveAtlaskitIcon } from '../utils/resolveAtlaskitIcon';

export type AppView = 'board' | 'inventory' | 'iam' | 'activity' | 'settings' | 'audit';

type NavItem = {
  id: AppView;
  label: string;
  icon: unknown;
};

type AuxItem = {
  id: string;
  label: string;
  icon: unknown;
};

type Props = {
  activeView: AppView;
  onSelect: (view: AppView) => void;
};

const primaryItems: NavItem[] = [
  { id: 'board', label: 'Queues', icon: BacklogIcon },
  { id: 'inventory', label: 'Inventory list', icon: BookWithBookmarkIcon },
  { id: 'iam', label: 'Identity and access', icon: PeopleGroupIcon },
  { id: 'activity', label: 'Reports and activity', icon: ChartBarIcon },
];

const auxiliaryItems: AuxItem[] = [
  { id: 'audit', label: 'Equipment Audit', icon: AddIcon },
  { id: 'settings', label: 'Project settings', icon: SettingsIcon },
];

function NavRow({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon: unknown;
  selected: boolean;
  onClick?: () => void;
}) {
  const Icon = resolveAtlaskitIcon(icon as never) as React.ComponentType<{ label: string; size?: string }>;

  return (
    <Pressable
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 40,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        color: selected ? '#1868DB' : '#505258',
        background: selected ? '#E9F2FE' : 'transparent',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {selected && (
        <Box
          style={{
            position: 'absolute',
            left: 0,
            top: 10,
            bottom: 10,
            width: 4,
            borderRadius: '0 4px 4px 0',
            background: '#1868DB',
          }}
        />
      )}
      <Icon label={label} size="small" />
      <Text as="span" size="medium" weight={selected ? 'medium' : 'regular'} color="inherit">
        {label}
      </Text>
    </Pressable>
  );
}

export default function AppSideNavigation({ activeView, onSelect }: Props) {
  const FooterScreen = resolveAtlaskitIcon(ScreenIcon);

  return (
    <div
      className="app-side-nav"
      style={{
        width: 272,
        borderRight: '1px solid #DFE1E6',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box style={{ padding: 12, borderBottom: '1px solid #EBECF0' }}>
        <Inline space="space.100" alignBlock="center">
          <Avatar size="small" name="Project" />
          <Stack space="space.0">
            <Text as="strong" weight="semibold" color="color.text">
              Project
            </Text>
            <Text size="small" color="color.text.subtlest">
              Description goes here
            </Text>
          </Stack>
        </Inline>
      </Box>

      <Box style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {primaryItems.map((item) => (
          <NavRow
            key={item.id}
            label={item.label}
            icon={item.icon}
            selected={activeView === item.id}
            onClick={() => onSelect(item.id)}
          />
        ))}

        <Box style={{ height: 8 }} />

        {auxiliaryItems.map((item) => (
          <NavRow 
            key={item.id} 
            label={item.label} 
            icon={item.icon} 
            selected={activeView === item.id as AppView}
            onClick={() => onSelect(item.id as AppView)}
          />
        ))}
      </Box>

      <Box style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid #EBECF0' }}>
        <Stack space="space.100" alignInline="center">
          <FooterScreen label="Managed" spacing="spacious" />
          <Box style={{ textAlign: 'center' }}>
            <Text size="small" color="color.text.subtle">
              You are in a team-managed project
            </Text>
          </Box>
          <Box style={{ textAlign: 'center' }}>
            <Text size="small" color="color.text.subtlest">
              Give feedback • Learn more
            </Text>
          </Box>
        </Stack>
      </Box>
    </div>
  );
}
