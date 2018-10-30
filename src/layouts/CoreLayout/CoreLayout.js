import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../components/Header';
import Banner from 'components/Banner';
import NavigationContainer from '../../components/Navigation/NavigationContainer';
import ValidationBarContainer from '../../components/Tos/ValidationBar/ValidationBarContainer';
import '../../styles/core.scss';
import './CoreLayout.scss';

export const CoreLayout = ({ children }) => (
  <div className='core-layout__viewport'>
    <ValidationBarContainer>
      <Header />
      <NavigationContainer />
      <div className='container-fluid helerm-content'>{children}</div>
    </ValidationBarContainer>
    <Banner />
  </div>
);

CoreLayout.propTypes = {
  children: PropTypes.element
};

export default CoreLayout;
