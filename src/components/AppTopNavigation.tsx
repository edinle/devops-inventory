import React from 'react';
import Button, { IconButton } from '@atlaskit/button/new';
import Textfield from '@atlaskit/textfield';
import { Box, Inline, Text } from '@atlaskit/primitives';
import Tooltip from '@atlaskit/tooltip';
import AppSwitcherIcon from '@atlaskit/icon/core/app-switcher';
import SearchIcon from '@atlaskit/icon/core/search';
import SettingsIcon from '@atlaskit/icon/core/settings';
import { resolveAtlaskitIcon } from '../utils/resolveAtlaskitIcon';

type Props = {
  onCreate?: () => void;
};

export default function AppTopNavigation({ onCreate }: Props) {
  const AppSwitcher = resolveAtlaskitIcon(AppSwitcherIcon);
  const Search = resolveAtlaskitIcon(SearchIcon);
  const Settings = resolveAtlaskitIcon(SettingsIcon);

  return (
    <Box
      style={{
        height: 48,
        borderBottom: '1px solid #DFE1E6',
        background: '#F7F8F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        gap: 12,
      }}
    >
      <Inline space="space.100" alignBlock="center">
        <Tooltip content="Apps">
          <IconButton appearance="subtle" icon={AppSwitcher} label="Apps" />
        </Tooltip>

        <Inline space="space.050" alignBlock="center">
          <Box style={{ width: 9, height: 9, borderRadius: 2, background: '#1868DB' }} />
          <Text as="strong" weight="bold" size="medium" color="color.text.brand">
            ATLASSIAN
          </Text>
        </Inline>

        <Button appearance="primary" spacing="compact" onClick={onCreate}>
          Create
        </Button>
      </Inline>

      <Inline space="space.100" alignBlock="center">
        <Box style={{ width: 220 }}>
          <Textfield
            placeholder="Search"
            elemBeforeInput={
              <Box style={{ display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                <Search label="Search" size="small" />
              </Box>
            }
          />
        </Box>

        <Tooltip content="Settings">
          <IconButton appearance="subtle" icon={Settings} label="Settings" />
        </Tooltip>
      </Inline>
    </Box>
  );
}
