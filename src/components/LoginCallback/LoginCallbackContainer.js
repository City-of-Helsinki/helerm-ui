import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { USER_LOGIN_STATUS } from '../../constants';
import { handleLoginCallback, logout } from '../Login/reducer';

import LoginCallback from './LoginCallback';

const mapDispatchToProps = (dispatch) => {
  return {
    handleCallback: bindActionCreators(handleLoginCallback, dispatch),
    logout: bindActionCreators(logout, dispatch)
  };
};

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.user.status === USER_LOGIN_STATUS.AUTHORIZED,
    isInitialized: state.user.status === USER_LOGIN_STATUS.AUTHORIZED || state.user.status === USER_LOGIN_STATUS.UNAUTHORIZED,
    user: state.user.data
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginCallback);
