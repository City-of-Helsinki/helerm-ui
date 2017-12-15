import React from 'react';
import PropTypes from 'prop-types';
import BannerElement from './BannerElement';

import './Banner.scss';

class Banner extends React.Component {
  static Element = BannerElement;

  render () {
    const { children } = this.props;
    return (
      <div className='helerm-banner'>
        <div>{children}</div>
      </div>
    );
  }
}

Banner.propTypes = {
  children: PropTypes.node
};

export default Banner;
