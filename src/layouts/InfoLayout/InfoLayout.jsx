import React from 'react';
import PropTypes from 'prop-types';

import Header from '../../components/Header';
import '../CoreLayout/CoreLayout.scss';
import '../../styles/core.scss';

const InfoLayout = ({ children }) => (
  <div className='core-layout__viewport'>
    <Header />
    <div className='container-fluid'>{children}</div>
  </div>
);

InfoLayout.propTypes = {
  children: PropTypes.element,
};

export default InfoLayout;
