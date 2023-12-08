/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import { Router } from 'react-router-dom';
import ReduxToastr from 'react-redux-toastr';
import { LoginProvider } from 'hds-react';

import Loader from '../components/Loader';
import { retrieveUserFromSession } from '../components/Login/reducer';
import { fetchAttributeTypes, fetchTemplates } from '../store/uiReducer';
import providerProperties from '../utils/oidc/config';

class AppContainer extends Component {
  UNSAFE_componentWillMount() {
    if (!window.location.href.includes('/renew')) {
      this.props.fetchAttributeTypes();
      this.props.fetchTemplates();
    }
    this.props.retrieveUserFromSession();
  }

  render() {
    const { user, routes, store, history } = this.props;
    return (
      <LoginProvider {...providerProperties}>
        <Provider store={store}>
          <div style={{ height: '100%' }}>
            {user ? <Router history={history}>{routes}</Router> : <Loader show />}
            <ReduxToastr
              timeOut={4000}
              newestOnTop
              preventDuplicates
              position='top-right'
              transitionIn='fadeIn'
              transitionOut='bounceOutUp'
              progressBar
            />
          </div>
        </Provider>
      </LoginProvider>
    );
  }
}

AppContainer.propTypes = {
  fetchAttributeTypes: PropTypes.func.isRequired,
  fetchTemplates: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  retrieveUserFromSession: PropTypes.func.isRequired,
  routes: PropTypes.node.isRequired,
  store: PropTypes.object.isRequired,
  user: PropTypes.object,
};

const mapStateToProps = ({ user }) => ({
  user: user.data,
});

const mapDispatchToProps = {
  fetchAttributeTypes,
  fetchTemplates,
  retrieveUserFromSession,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
