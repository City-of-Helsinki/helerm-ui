import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';

import { login, logout } from './reducer';
import Login from './Login';

const mapDispatchToProps = (dispatch) => ({
  loginDispatch: bindActionCreators(login, dispatch),
  logoutDispatch: bindActionCreators(logout, dispatch),
});

export default connect(null, mapDispatchToProps)(Login);
