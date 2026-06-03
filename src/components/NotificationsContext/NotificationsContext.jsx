import PropTypes from 'prop-types';
import { Notification, NotificationSize } from 'hds-react';
import uniqueId from 'lodash/uniqueId';
import {
  createContext,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

const DEFAULT_NOTIFICATIONS_CONTEXT = {
  addNotification: () => {},
};

export const NotificationsContext = createContext(
  DEFAULT_NOTIFICATIONS_CONTEXT
);

const NOTIFICATION_OFFSET = 24;
const NOTIFICATION_Z_INDEX = 1000;
const AUTO_CLOSE_DURATION = 10000;

const getNotificationHeight = ({ id }) => document.getElementById(id)?.clientHeight ?? 0;

const getNotificationHeights = (notifications) => notifications.map(getNotificationHeight);

const getNotificationStyle = (
  heights,
  index
) => {
  const topMargin = heights
    .slice(0, index)
    .reduce(
      (acc, curr) => acc + curr + NOTIFICATION_OFFSET,
      NOTIFICATION_OFFSET
    );

  return {
    top: topMargin,
    transform: 'translate3d(0px, 0px, 0px)',
    zIndex: NOTIFICATION_Z_INDEX,
  };
};

const NotificationsStack = ({ heights, notifications, onClose }) => (
  <>
    {notifications.map((notification, index) => (
      <Notification
        notificationAriaLabel={
          typeof notification.label === 'string' ? notification.label : undefined
        }
        autoCloseDuration={AUTO_CLOSE_DURATION}
        autoClose={true}
        key={notification.id}
        {...notification}
        size={NotificationSize.Medium}
        style={getNotificationStyle(heights, index)}
        position="top-right"
        onClose={() => onClose(notification.id)}
      />
    ))}
  </>
);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [heights, setHeights] = useState([]);

  const addNotification = useCallback((notification) => {
    setNotifications((items) => [
      ...items,
      { ...notification, id: uniqueId('notification-') },
    ]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((items) => items.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({ addNotification }),
    [addNotification]
  );

  useLayoutEffect(() => {
    // Height of last added notification is 0 because it's not rendered yet.
    // In this case it doesn't matter because it's not used for top-margin calculation
    setHeights(getNotificationHeights(notifications));
  }, [notifications]);

  return (
    <NotificationsContext value={value}>
      <NotificationsStack
        heights={heights}
        notifications={notifications}
        onClose={removeNotification}
      />
      {children}
    </NotificationsContext>
  );
};

NotificationsStack.propTypes = {
  heights: PropTypes.arrayOf(PropTypes.number).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
};

NotificationsProvider.propTypes = {
  children: PropTypes.node,
};
