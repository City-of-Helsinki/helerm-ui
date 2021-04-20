import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';

import Loader from '../Loader';

export class LoginCallback extends React.Component {

  componentDidMount() {
    this.props.handleCallback()
  }

  render () {
    const {isInitialized} = this.props

    if (!isInitialized) {
      return (
        <div>
          <h3>Hetkinen, tarkistetaan kirjautumistietoja...</h3>
          <Loader show={true} />
        </div>
      );
    }
    return (
      <Redirect to='/' />
    );
  }
};

LoginCallback.propTypes = {
  handleCallback: PropTypes.func.isRequired,
  isInitialized: PropTypes.bool.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default LoginCallback;
