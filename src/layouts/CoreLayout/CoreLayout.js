import React from 'react';
import Header from '../../components/Header';
import NavigationContainer from '../../components/Navigation/NavigationContainer';
import ValidationBarContainer from '../../components/Tos/ValidationBar/ValidationBarContainer';
import './CoreLayout.scss';
import '../../styles/core.scss';

export const CoreLayout = ({ children }) => (
  <div className='core-layout__viewport'>
    <ValidationBarContainer>
      <Header />
      <NavigationContainer />
      <div className='container-fluid'>
        {children}
      </div>
    </ValidationBarContainer>
  </div>
);

CoreLayout.propTypes = {
  children: React.PropTypes.element
};

export default CoreLayout;
