import { configure, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';

import { useNotificationsContext } from '../hooks/useNotificationsContext';
import { NotificationsProvider } from '../NotificationsContext';

configure({ defaultHidden: true });

const MultipleNotificationsTrigger = () => {
  const { addNotification } = useNotificationsContext();

  useEffect(() => {
    addNotification({ label: 'Notification 1', type: 'success' });
    addNotification({ label: 'Notification 2', type: 'error' });
    addNotification({ label: 'Notification 3', type: 'info' });
  }, [addNotification]);

  return null;
};

const AutoCloseNotificationTrigger = () => {
  const { addNotification } = useNotificationsContext();

  useEffect(() => {
    addNotification({
      autoCloseDuration: 50,
      label: 'Notification 1',
      type: 'success',
    });
  }, [addNotification]);

  return null;
};

it('should show several notifications', async () => {
  render(
    <NotificationsProvider>
      <MultipleNotificationsTrigger />
    </NotificationsProvider>
  );

  await screen.findByRole('alert', { name: 'Notification 1' });
  await screen.findByRole('alert', { name: 'Notification 2' });
  await screen.findByRole('alert', { name: 'Notification 3' });
});

it('should automatically hide notification after certain period of time', async () => {
  render(
    <NotificationsProvider>
      <AutoCloseNotificationTrigger />
    </NotificationsProvider>
  );

  await screen.findByRole('alert', { name: 'Notification 1' });
  await waitFor(() =>
    expect(
      screen.queryByRole('alert', { name: 'Notification 1' })
    ).not.toBeInTheDocument()
  );
});
