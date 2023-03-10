import React from 'react';
import PropTypes from 'prop-types';

const BannerElement = ({ children, background, color }) => (
  <div className='helerm-banner__element' style={{ background, color }}>
    {children}
  </div>
);

BannerElement.propTypes = {
  background: PropTypes.string,
  children: PropTypes.node,
  color: PropTypes.oneOf(['white', 'black']),
};

BannerElement.defaultProps = {
  color: 'white',
};

export default BannerElement;
