import React, { PropTypes } from 'react';

import '../Login.scss';

class Login extends React.Component {
  constructor () {
    super();

    this.handleUserLinkClick = this.handleUserLinkClick.bind(this);
  }

  componentWillMount () {
    this.props.retrieveUserFromSession();
  }

  handleUserLinkClick (e) {
    e.preventDefault();
    const { user } = this.props;
    const linkMethod = user.id ? this.props.logout : this.props.login;
    linkMethod();
  }

  getUserLink () {
    const { user } = this.props;
    const linkText = user.id ? `${user.firstName}, Kirjaudu ulos` : 'Kirjaudu sisään';

    return (
      <a href='' className='navbar-link' onClick={this.handleUserLinkClick}>{linkText}</a>
    );
  }

  render () {
    return (
      <p className='navbar-text login-container'>
        {this.getUserLink()}
      </p>
    );
  }
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  retrieveUserFromSession: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
};

export default Login;
