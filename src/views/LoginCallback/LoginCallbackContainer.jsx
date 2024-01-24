import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';

import { handleLoginCallbackInitialize, handleLoginCallbackError, retrieveUserFromSession } from '../../components/Login/reducer';
import LoginCallback from './LoginCallback';

const mapDispatchToProps = (dispatch) => ({
  handleCallbackInitialize: bindActionCreators(handleLoginCallbackInitialize, dispatch),
  retrieveUserFromSession: bindActionCreators(retrieveUserFromSession, dispatch),
  handleCallbackError: bindActionCreators(handleLoginCallbackError, dispatch),
});

export default connect(null, mapDispatchToProps)(LoginCallback);
