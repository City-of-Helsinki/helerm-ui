import React from 'react';
import './Loader.scss';

export class Loader extends React.Component {
  render () {
    const { isFetching } = this.props;
    return (
      <div className='loader-container'>
        <span className='fa fa-spinner fa-spin loader' />
      </div>
    );
  }
}

Loader.propTypes = {
  isFetching: React.PropTypes.bool.isRequired,
};

export default Loader;
