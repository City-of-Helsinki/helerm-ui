import { use } from 'react';

import { NotificationsContext } from '../NotificationsContext';

const useNotificationsContext = () => use(NotificationsContext);

export default useNotificationsContext;
export { useNotificationsContext };
