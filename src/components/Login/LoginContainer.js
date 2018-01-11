import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  login,
  logout
} from './reducer';

import Login from './Login';

const mapDispatchToProps = (dispatch) => {
  return {
    login: bindActionCreators(login, dispatch),
    logout: bindActionCreators(logout, dispatch)
  };
};

const mapStateToProps = (state) => {
  return {
    user: state.user.data
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
