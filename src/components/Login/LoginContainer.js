import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  login,
  logout,
  retrieveUserFromSession
} from './reducer';

import Login from './Login';

const mapDispatchToProps = (dispatch) => {
  return {
    login: bindActionCreators(login, dispatch),
    logout: bindActionCreators(logout, dispatch),
    retrieveUserFromSession: bindActionCreators(retrieveUserFromSession, dispatch)
  };
};

const mapStateToProps = (state) => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
