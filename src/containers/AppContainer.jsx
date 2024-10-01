/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import { createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import ReduxToastr from 'react-redux-toastr';
import { LoginProvider, SessionEndedHandler } from 'hds-react';

import { retrieveUserFromSession } from '../components/Login/reducer';
import { fetchAttributeTypes, fetchTemplates } from '../store/uiReducer';
import { providerProperties } from '../utils/oidc/constants';
import useAuth from '../hooks/useAuth';
import CookieConsent from '../components/CookieConsent/CookieConsent';
import MatomoContext from '../components/Matomo/matomo-context';
import MatomoTracker from '../components/Matomo/MatomoTracker';
import config from '../config';

import '../styles/core.scss';

const App = ({ router, dispatchRetrieveUserFromSession, dispatchFetchAttributeTypes, dispatchFetchTemplates }) => {
  const { authenticated, user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      dispatchFetchAttributeTypes();
      dispatchFetchTemplates();

      if (authenticated) {
        const { profile } = user;
        const { sub: userId } = profile;

        await dispatchRetrieveUserFromSession(userId);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, user]);

  return (
    <div style={{ height: '100%' }}>
      <CookieConsent />
      <SessionEndedHandler
        content={{
          title: 'Istunto on vanhentunut!',
          text: 'Istuntosi palvelimella on vanhentunut. Sinut kirjataan ulos palvelusta.',
          buttonText: 'Kirjaudu ulos',
          closeButtonLabelText: 'Kirjaudu ulos',
        }}
      />
      <RouterProvider router={router} />
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
  dispatchRetrieveUserFromSession,
  dispatchFetchAttributeTypes,
  dispatchFetchTemplates,
}) => {
  const matomoTracker = useMemo(
    () =>
      new MatomoTracker({
        urlBase: config.MATOMO_URL_BASE,
        siteId: config.MATOMO_SITE_ID,
        srcUrl: config.MATOMO_SRC_URL,
        enabled: config.MATOMO_ENABLED,
        configurations: {
          ...(config.MATOMO_COOKIE_DOMAIN && { setCookieDomain: config.MATOMO_COOKIE_DOMAIN }),
          ...(config.MATOMO_DOMAINS && { setDomains: config.MATOMO_DOMAINS.split(',') }),
          setDoNotTrack: true,
        },
      }),
    [],
  );

  const router = createBrowserRouter(createRoutesFromElements(routes), { basename: '/' });

  return (
    <LoginProvider {...providerProperties}>
      <Provider store={store}>
        <MatomoContext.Provider value={matomoTracker}>
          <App
            router={router}
            dispatchRetrieveUserFromSession={dispatchRetrieveUserFromSession}
            dispatchFetchAttributeTypes={dispatchFetchAttributeTypes}
            dispatchFetchTemplates={dispatchFetchTemplates}
          />
        </MatomoContext.Provider>
      </Provider>
    </LoginProvider>
  );
};

App.propTypes = {
  router: PropTypes.any.isRequired,
  dispatchFetchAttributeTypes: PropTypes.func.isRequired,
  dispatchFetchTemplates: PropTypes.func.isRequired,
  dispatchRetrieveUserFromSession: PropTypes.func.isRequired,
};

AppContainer.propTypes = {
  dispatchFetchAttributeTypes: PropTypes.func.isRequired,
  dispatchFetchTemplates: PropTypes.func.isRequired,
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
