import React from 'react';
import Button, { IconButton } from '@atlaskit/button/new';
import Textfield from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import ShowMoreHorizontalIcon from '@atlaskit/icon/core/show-more-horizontal';
import { Box, Inline, Text } from '@atlaskit/primitives';
import { resolveAtlaskitIcon } from '../utils/resolveAtlaskitIcon';

type Option = {
  label: string;
  value: string;
};

type Props = {
  breadcrumbs: readonly string[];
  title: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  filterPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  selectPlaceholder?: string;
  selectOptions?: Option[];
  selectedOption?: Option | null;
  onSelectChange?: (option: Option | null) => void;
};

export default function AppPageHeader({
  breadcrumbs,
  title,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  filterPlaceholder,
  filterValue,
  onFilterChange,
  selectPlaceholder,
  selectOptions,
  selectedOption,
  onSelectChange,
}: Props) {
  const More = resolveAtlaskitIcon(ShowMoreHorizontalIcon);

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '24px 24px 16px',
        borderBottom: '1px solid #EBECF0',
        background: '#FFFFFF',
      }}
    >
      <Inline space="space.050" alignBlock="center" shouldWrap>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={`${crumb}-${index}`}>
            {index > 0 && (
              <Text size="medium" color="color.text.subtlest">
                /
              </Text>
            )}
            <Text size="medium" color="color.text.subtlest">
              {crumb}
            </Text>
          </React.Fragment>
        ))}
      </Inline>

      <Inline space="space.100" alignBlock="center" spread="space-between">
        <Text as="strong" weight="bold" size="large" color="color.text">
          {title}
        </Text>

        <Inline space="space.050" alignBlock="center">
          {primaryActionLabel && (
            <Button appearance="primary" onClick={onPrimaryAction}>
              {primaryActionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button appearance="default" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          <IconButton appearance="default" icon={More} label="More" />
        </Inline>
      </Inline>

      {(onFilterChange || onSelectChange) && (
        <Inline space="space.100" alignBlock="center" shouldWrap>
          {onFilterChange && (
            <Box style={{ width: 240 }}>
              <Textfield
                placeholder={filterPlaceholder ?? 'Search'}
                value={filterValue ?? ''}
                onChange={(event) => onFilterChange((event.target as HTMLInputElement).value)}
              />
            </Box>
          )}

          {onSelectChange && (
            <Box style={{ width: 220 }}>
              <Select<Option, false>
                inputId="view-filter-select"
                options={selectOptions ?? []}
                placeholder={selectPlaceholder ?? 'Choose filter'}
                value={selectedOption ?? null}
                onChange={(option) => onSelectChange(option as Option | null)}
                menuPosition="fixed"
              />
            </Box>
          )}
        </Inline>
      )}
    </Box>
  );
}
