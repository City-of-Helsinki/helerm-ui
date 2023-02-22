/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import Loader from '../Loader';

class LoginCallback extends React.Component {
  componentDidMount() {
    this.props.handleCallback();
  }

  render() {
    const { isInitialized } = this.props;

    if (!isInitialized) {
      return (
        <div>
          <h3>Hetkinen, tarkistetaan kirjautumistietoja...</h3>
          <Loader show />
        </div>
      );
    }
    return <Redirect to='/' />;
  }
}

LoginCallback.propTypes = {
  handleCallback: PropTypes.func.isRequired,
  isInitialized: PropTypes.bool.isRequired,
};

export default LoginCallback;
