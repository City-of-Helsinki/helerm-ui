import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { USER_LOGIN_STATUS } from '../../constants';
import { handleRenewCallback } from '../Login/reducer';
import RenewCallback from './RenewCallback';

const mapDispatchToProps = (dispatch) => ({
  handleRenewCallback: bindActionCreators(handleRenewCallback, dispatch),
});

const mapStateToProps = (state) => ({
  isInitialized:
    state.user.status === USER_LOGIN_STATUS.AUTHORIZED || state.user.status === USER_LOGIN_STATUS.UNAUTHORIZED,
});

export default connect(mapStateToProps, mapDispatchToProps)(RenewCallback);
