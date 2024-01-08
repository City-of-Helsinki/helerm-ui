import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import '../CoreLayout/CoreLayout.scss';
import '../../styles/core.scss';

const InfoLayout = ({ children }) => (
  <div className='core-layout__viewport'>
    <Header />
    <Suspense fallback={<Loader show />}>
      <div className='container-fluid'>{children}</div>
    </Suspense>
  </div>
);

InfoLayout.propTypes = {
  children: PropTypes.element,
};

export default InfoLayout;
