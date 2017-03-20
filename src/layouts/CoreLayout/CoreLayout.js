import React from 'react';
import Header from '../../components/Header';
import NavigationContainer from '../../components/Navigation/NavigationContainer';
import './CoreLayout.scss';
import '../../styles/core.scss';

export const CoreLayout = ({ children }) => (
  <div className='core-layout__viewport'>
    <Header />
    <NavigationContainer/>
    <div className='container-fluid'>
      {children}
    </div>
  </div>
);

CoreLayout.propTypes = {
  children: React.PropTypes.element
};

export default CoreLayout;
