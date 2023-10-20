import React from 'react';
import PropTypes from 'prop-types';

import { getClient } from '../utils/oidcClient';

export const ClientContext = React.createContext(null);

const ClientProvider = ({ children }) => {
  const client = getClient();
  const clientMemo = React.useMemo(() => ({ client }), [client]);

  return <ClientContext.Provider value={clientMemo}>{children}</ClientContext.Provider>;
};

ClientProvider.propTypes = {
  children: PropTypes.element,
};

export default ClientProvider;
