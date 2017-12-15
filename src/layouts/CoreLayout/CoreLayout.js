import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../components/Header';
import Banner from 'components/Banner';
import NavigationContainer from '../../components/Navigation/NavigationContainer';
import ValidationBarContainer from '../../components/Tos/ValidationBar/ValidationBarContainer';
import './CoreLayout.scss';
import '../../styles/core.scss';

export const CoreLayout = ({ children }) => (
  <div className='core-layout__viewport'>
    <ValidationBarContainer>
      <Header />
      <NavigationContainer />
      <div className='container-fluid'>{children}</div>
    </ValidationBarContainer>
    <Banner />
  </div>
);

CoreLayout.propTypes = {
  children: PropTypes.element
};

export default CoreLayout;
