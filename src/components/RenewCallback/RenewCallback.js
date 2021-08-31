import React from 'react';
import PropTypes from 'prop-types';

import Loader from '../Loader';

export class RenewCallback extends React.Component {

  componentDidMount() {
    this.props.handleRenewCallback()
  }

  render () {
    const {isInitialized} = this.props
    return (
        <div>
            <h3>{!isInitialized ? 'Hetkinen, tarkistetaan kirjautumistietoja...' : 'Kirjautumistiedot tarkistettu'}</h3>
            {!isInitialized && <Loader show={true} />}
        </div>
    );
  }
};

RenewCallback.propTypes = {
  handleRenewCallback: PropTypes.func.isRequired,
  isInitialized: PropTypes.bool.isRequired,
};

export default RenewCallback;
