import React from 'react';
import './Loader.scss';

export class Loader extends React.Component {
  render () {
    return (
      <div className='loader-container'>
        <span className='fa fa-spinner fa-spin loader' />
      </div>
    );
  }
}

export default Loader;
