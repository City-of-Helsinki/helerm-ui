import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';

import { login, logout } from './reducer';
import Login from './Login';

const mapDispatchToProps = (dispatch) => ({
  login: bindActionCreators(login, dispatch),
  logout: bindActionCreators(logout, dispatch),
});

const mapStateToProps = (state) => ({
  user: state.user.data,
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
