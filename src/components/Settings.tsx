import React from 'react';
import { Box, Stack, Text } from '@atlaskit/primitives';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import Button from '@atlaskit/button/new';
import SectionMessage from '@atlaskit/section-message';
import Avatar from '@atlaskit/avatar';
import type { Manager } from '../types';

type Props = {
  currentManager: Manager;
  onUpdateProfile: (manager: Omit<Manager, 'id'>) => void;
};

export default function Settings({ currentManager, onUpdateProfile }: Props) {
  const [form, setForm] = React.useState({
    name: currentManager.name,
    email: currentManager.email,
    role: currentManager.role,
  });

  const roleOptions = [
    { label: 'Manager', value: 'manager' },
    { label: 'Super Admin', value: 'super_admin' },
  ];

  const selectedRole = roleOptions.find((o) => o.value === form.role) ?? null;

  function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) return;
    onUpdateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
    });
  }

  return (
    <Box>
      <Box style={{ marginBottom: 32 }}>
        <Stack space="space.200">
          <Box>
            <Text as="strong" weight="semibold" size="large" color="color.text">
              Project Settings
            </Text>
            <Box style={{ color: 'color.text.subtle', marginTop: 4 }}>
              <Text size="small" color="inherit">
                Configure your profile and system preferences
              </Text>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Profile Section */}
      <Box style={{ marginBottom: 32 }}>
        <Box style={{ marginBottom: 16 }}>
          <Text as="strong" weight="semibold" size="medium" color="color.text">
            User Profile
          </Text>
        </Box>

        <Box style={{ 
          background: '#FFFFFF', 
          border: '1px solid #DFE1E6', 
          borderRadius: 8, 
          padding: 24,
          maxWidth: '600px'
        }}>
          <Stack space="space.200">
            <Box style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <Avatar size="large" name={form.name} />
              <Box>
                <Text as="strong" weight="semibold" size="medium" color="color.text">
                  {form.name}
                </Text>
                <Box style={{ color: 'color.text.subtle', marginTop: 2 }}>
                  <Text size="small" color="inherit">
                    {form.email}
                  </Text>
                </Box>
              </Box>
            </Box>

            <Form onSubmit={handleSubmit}>
              {({ formProps }) => (
                <form {...formProps}>
                  <Stack space="space.200">
                    <Field name="name" label="Display Name" isRequired>
                      {() => (
                        <TextField
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: (e.target as HTMLInputElement).value })}
                          placeholder="Your display name"
                        />
                      )}
                    </Field>

                    <Field name="email" label="Email Address" isRequired>
                      {() => (
                        <TextField
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: (e.target as HTMLInputElement).value })}
                          placeholder="your.email@ucla.edu"
                        />
                      )}
                    </Field>

                    <Field name="role" label="Role">
                      {() => (
                        <Select
                          options={roleOptions}
                          value={selectedRole}
                          onChange={(opt) => { if (opt) setForm({ ...form, role: opt.value as 'manager' | 'super_admin' }); }}
                          isDisabled={currentManager.role === 'manager'}
                        />
                      )}
                    </Field>

                    <Box style={{ marginTop: 8 }}>
                      <Button 
                        appearance="primary" 
                        onClick={handleSubmit}
                        isDisabled={!form.name.trim() || !form.email.trim()}
                      >
                        Save Profile Changes
                      </Button>
                    </Box>
                  </Stack>
                </form>
              )}
            </Form>
          </Stack>
        </Box>
      </Box>

      {/* System Information */}
      <Box style={{ marginBottom: 32 }}>
        <Box style={{ marginBottom: 16 }}>
          <Text as="strong" weight="semibold" size="medium" color="color.text">
            System Information
          </Text>
        </Box>

        <Box style={{ 
          background: '#F4F5F7', 
          borderRadius: 8, 
          padding: 20,
          maxWidth: '600px'
        }}>
          <Stack space="space.100">
            <Box>
              <Text weight="medium" color="color.text">Application Version</Text>
              <Box style={{ color: 'color.text.subtle', marginTop: 2 }}>
                <Text size="small" color="inherit">v1.0.0</Text>
              </Box>
            </Box>

            <Box>
              <Text weight="medium" color="color.text">Environment</Text>
              <Box style={{ color: 'color.text.subtle', marginTop: 2 }}>
                <Text size="small" color="inherit">Development</Text>
              </Box>
            </Box>

            <Box>
              <Text weight="medium" color="color.text">Last Updated</Text>
              <Box style={{ color: 'color.text.subtle', marginTop: 2 }}>
                <Text size="small" color="inherit">{new Date().toLocaleDateString()}</Text>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Notification Settings */}
      <Box>
        <Box style={{ marginBottom: 16 }}>
          <Text as="strong" weight="semibold" size="medium" color="color.text">
            Notification Settings
          </Text>
        </Box>

        <SectionMessage appearance="information">
          <Text size="small">
            Notification preferences are currently managed at the system level. 
            Email and SMS notifications are automatically sent for checkouts, reminders, and returns.
          </Text>
        </SectionMessage>
      </Box>
    </Box>
  );
}
