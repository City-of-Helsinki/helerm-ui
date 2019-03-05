import React, { PropTypes } from 'react';

class Login extends React.Component {
  constructor () {
    super();

    this.handleUserLinkClick = this.handleUserLinkClick.bind(this);
  }

  handleUserLinkClick (e) {
    e.preventDefault();
    const { user } = this.props;
    const linkMethod = user.id ? this.props.logout : this.props.login;
    linkMethod();
  }

  getUserLink () {
    const { user } = this.props;
    const linkText = (user && user.id) ? 'Kirjaudu ulos' : 'Kirjaudu sisään';

    return (
      <a href='' className='navbar-link' onClick={this.handleUserLinkClick}>{linkText}</a>
    );
  }

  render () {
    const { user } = this.props;
    const displayName = (user && user.id) ? user.displayName ? user.displayName : `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : null;
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
  user: PropTypes.object
};

export default Login;
