import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import NavigationContainer from '../../components/Navigation/NavigationContainer';

import '../../styles/core.scss';
import './CoreLayout.scss';

const CoreLayout = ({ children }) => (
  <div className='core-layout__viewport'>
    <Header />
    <div className='core-layout__navigation'>
      <NavigationContainer />
    </div>
    <Suspense fallback={<Loader show />}>
      <div className='container-fluid helerm-content'>{children}</div>
    </Suspense>
  </div>
);

CoreLayout.propTypes = {
  children: PropTypes.node,
};

export default CoreLayout;
