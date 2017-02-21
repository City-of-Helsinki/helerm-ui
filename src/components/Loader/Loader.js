import React, { PropTypes } from 'react';
import './Loader.scss';

const Loader = ({ show }) => (
  show
    ? (<div className='loader-container'>
      <span className='fa fa-2x fa-spinner fa-spin loader'/>
    </div>)
    : null
);

Loader.propTypes = {
  show: PropTypes.bool.isRequired
};

export default Loader;
