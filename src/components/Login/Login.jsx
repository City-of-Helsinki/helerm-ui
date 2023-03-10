/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';

import './Login.scss';

class Login extends React.Component {
  constructor() {
    super();

    this.handleUserLinkClick = this.handleUserLinkClick.bind(this);
  }

  handleUserLinkClick(e) {
    e.preventDefault();
    const { user } = this.props;
    const linkMethod = user.id ? this.props.logout : this.props.login;
    linkMethod();
  }

  getUserLink() {
    const { user } = this.props;
    const linkText = user && user.id ? 'Kirjaudu ulos' : 'Kirjaudu sisään';

    return (
      <span className='login-button' role='button' onClick={this.handleUserLinkClick}>
        {linkText}
      </span>
    );
  }

  render() {
    const { user } = this.props;
    const displayName =
      user && user.id
        ? user.displayName
          ? user.displayName
          : `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
        : null;
    return (
      <p className='navbar-text pull-right login-link'>
        {!!displayName && <small>{displayName}</small>}
        {this.getUserLink()}
      </p>
    );
  }
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default Login;
