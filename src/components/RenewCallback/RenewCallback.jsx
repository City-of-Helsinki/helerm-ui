import React from 'react';
import PropTypes from 'prop-types';

import Loader from '../Loader';

class RenewCallback extends React.Component {
  componentDidMount() {
    this.props.handleRenewCallback();
  }

  render() {
    const { isInitialized } = this.props;
    return (
      <div>
        <h3>{!isInitialized ? 'Hetkinen, tarkistetaan kirjautumistietoja...' : 'Kirjautumistiedot tarkistettu'}</h3>
        {!isInitialized && <Loader show />}
      </div>
    );
  }
}

RenewCallback.propTypes = {
  handleRenewCallback: PropTypes.func.isRequired,
  isInitialized: PropTypes.bool.isRequired,
};

export default RenewCallback;
