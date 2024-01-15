/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import { Router } from 'react-router-dom';
import ReduxToastr from 'react-redux-toastr';
import { LoginProvider, SessionEndedHandler } from 'hds-react';

import { retrieveUserFromSession } from '../components/Login/reducer';
import { fetchAttributeTypes, fetchTemplates } from '../store/uiReducer';
import { providerProperties } from '../utils/oidc/constants';
import useAuth from '../hooks/useAuth';

const App = ({
  history,
  routes,
  dispatchRetrieveUserFromSession,
  dispatchFetchAttributeTypes,
  dispatchFetchTemplates,
}) => {
  const { authenticated, user } = useAuth();

  useEffect(() => {
    dispatchFetchAttributeTypes();
    dispatchFetchTemplates();

    if (authenticated) {
      const { profile } = user;
      const { sub: userId } = profile;

      dispatchRetrieveUserFromSession(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, user]);

  return (
    <div style={{ height: '100%' }}>
      <SessionEndedHandler
        content={{
          title: 'Istunto on vanhentunut!',
          text: 'Istuntosi palvelimella on vanhentunut. Sinut kirjataan ulos palvelusta.',
          buttonText: 'Kirjaudu ulos',
          closeButtonLabelText: 'Kirjaudu ulos',
        }}
      />
      <Router history={history}>{routes}</Router>
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
  );
};

const AppContainer = ({
  routes,
  store,
  history,
  dispatchRetrieveUserFromSession,
  dispatchFetchAttributeTypes,
  dispatchFetchTemplates,
}) => (
  <LoginProvider {...providerProperties}>
    <Provider store={store}>
      <App
        history={history}
        routes={routes}
        dispatchRetrieveUserFromSession={dispatchRetrieveUserFromSession}
        dispatchFetchAttributeTypes={dispatchFetchAttributeTypes}
        dispatchFetchTemplates={dispatchFetchTemplates}
      />
    </Provider>
  </LoginProvider>
);

App.propTypes = {
  history: PropTypes.object.isRequired,
  routes: PropTypes.node.isRequired,
  dispatchFetchAttributeTypes: PropTypes.func.isRequired,
  dispatchFetchTemplates: PropTypes.func.isRequired,
  dispatchRetrieveUserFromSession: PropTypes.func.isRequired,
};

AppContainer.propTypes = {
  dispatchFetchAttributeTypes: PropTypes.func.isRequired,
  dispatchFetchTemplates: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  dispatchRetrieveUserFromSession: PropTypes.func.isRequired,
  routes: PropTypes.node.isRequired,
  store: PropTypes.object.isRequired,
};

const mapDispatchToProps = {
  dispatchRetrieveUserFromSession: retrieveUserFromSession,
  dispatchFetchAttributeTypes: fetchAttributeTypes,
  dispatchFetchTemplates: fetchTemplates,
};

export default connect(null, mapDispatchToProps)(AppContainer);
