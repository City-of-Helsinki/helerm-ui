import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';

import RouterSync from '../RouterSync/RouterSync';

const RouterSyncLayout = ({ children }) => {
  return (
    <>
      <RouterSync />
      {children || <Outlet />}
    </>
  );
};

RouterSyncLayout.propTypes = {
  children: PropTypes.node,
};

export default RouterSyncLayout;
