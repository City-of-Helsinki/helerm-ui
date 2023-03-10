import React from 'react';
import PropTypes from 'prop-types';

import BannerElement from './BannerElement';

import './Banner.scss';

const Banner = ({ children }) => (
  <div className='helerm-banner'>
    <div>{children}</div>
  </div>
);

Banner.propTypes = {
  children: PropTypes.node,
};

Banner.Element = BannerElement;

export default Banner;
