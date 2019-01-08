import React from 'react';
import PropTypes from 'prop-types';
import { StickyContainer } from 'react-sticky';

import Header from '../../components/Header';
import NavigationContainer from '../../components/Navigation/NavigationContainer';

import '../../styles/core.scss';
import './CoreLayout.scss';

export const CoreLayout = ({ children }) => (
  <div className='core-layout__viewport'>
    <StickyContainer>
      <Header />
      <div className='core-layout__navigation'>
        <NavigationContainer />
      </div>
      <div className='container-fluid helerm-content'>{children}</div>
    </StickyContainer>
  </div>
);

CoreLayout.propTypes = {
  children: PropTypes.element
};

export default CoreLayout;
