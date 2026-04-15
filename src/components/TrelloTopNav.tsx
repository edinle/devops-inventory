import React from 'react';
import { IconButton } from '@atlaskit/button/new';
import Textfield from '@atlaskit/textfield';
import Avatar from '@atlaskit/avatar';
import Tooltip from '@atlaskit/tooltip';
import { Box, Flex, Inline, Pressable, Text, xcss } from '@atlaskit/primitives';
import SearchIcon from '@atlaskit/icon/core/search';
import StarStarredIcon from '@atlaskit/icon/core/star-starred';
import ShowMoreVerticalIcon from '@atlaskit/icon/core/show-more-vertical';

type Props = {
  workspaceName: string;
  boardName: string;
  userName: string;
  onBoardStar?: () => void;
};

const navXcss = xcss({
  height: '44px',
  backgroundColor: 'color.background.neutral.bold',
});

const navInnerXcss = xcss({
  height: '44px',
  paddingInline: 'space.150',
});

export default function TrelloTopNav({ workspaceName, boardName, userName, onBoardStar }: Props) {
  return (
    <Box xcss={navXcss} style={{ background: 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.92)' }}>
      <Flex xcss={navInnerXcss} alignItems="center" justifyContent="space-between" gap="space.150">
        <Inline space="space.100" alignBlock="center">
          <Box
            xcss={xcss({
              paddingInline: 'space.100',
              paddingBlock: 'space.050',
            })}
            style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 3 }}
          >
            <Text as="strong" color="inherit" weight="bold">
              Trello
            </Text>
          </Box>

          {['Workspaces', 'Recent', 'Starred', 'Templates'].map((label) => (
            <Pressable
              key={label}
              xcss={xcss({ paddingInline: 'space.100', paddingBlock: 'space.050' })}
              style={{ height: 32, borderRadius: 3, color: 'rgba(255,255,255,0.92)' }}
            >
              <Text as="span" weight="medium" size="medium" color="inherit">
                {label}
              </Text>
            </Pressable>
          ))}

          <Pressable
            xcss={xcss({ paddingInline: 'space.100', paddingBlock: 'space.050' })}
            style={{
              height: 32,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.14)',
              color: 'rgba(255,255,255,0.95)',
            }}
          >
            <Text as="span" weight="medium" size="medium" color="inherit">
              Create
            </Text>
          </Pressable>
        </Inline>

        <Inline space="space.100" alignBlock="center">
          <Box style={{ width: 260 }}>
            <Textfield
              placeholder="Search"
              elemAfterInput={
                <Box style={{ display: 'flex', alignItems: 'center', paddingRight: 8 }}>
                  <SearchIcon label="Search" />
                </Box>
              }
            />
          </Box>

          <Tooltip content="Star board">
            <IconButton
              appearance="subtle"
              icon={StarStarredIcon}
              label="Star board"
              onClick={onBoardStar}
            />
          </Tooltip>

          <Tooltip content="More">
            <IconButton appearance="subtle" icon={ShowMoreVerticalIcon} label="More" />
          </Tooltip>

          <Tooltip content={userName}>
            <Avatar size="small" name={userName} />
          </Tooltip>
        </Inline>
      </Flex>

      <Box
        xcss={xcss({ paddingInline: 'space.200', paddingBlock: 'space.100' })}
        style={{ background: 'rgba(0,0,0,0.18)' }}
      >
        <Inline space="space.100" alignBlock="center">
          <Text as="strong" weight="semibold" size="large" color="inherit">
            {workspaceName}
          </Text>
          <Text size="large" color="inherit">
            /
          </Text>
          <Text as="strong" weight="semibold" size="large" color="inherit">
            {boardName}
          </Text>
        </Inline>
      </Box>
    </Box>
  );
}

