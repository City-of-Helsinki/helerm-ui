import React from 'react';

import { getClient } from '../utils/oidcClient';

export const ClientContext = React.createContext(
  null
);

export const ClientProvider = ({ children }) => {
  const client = getClient();
  return (
    <ClientContext.Provider value={{client}}>
      {children}
    </ClientContext.Provider>
  );
};
