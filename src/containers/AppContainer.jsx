import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Provider, useDispatch } from 'react-redux';
import { createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import ReduxToastr from 'react-redux-toastr';
import { LoginProvider, SessionEndedHandler } from 'hds-react';

import { retrieveUserFromSession } from '../store/reducers/user';
import { fetchAttributeTypesThunk, fetchTemplatesThunk } from '../store/reducers/ui';
import { providerProperties } from '../utils/oidc/constants';
import useAuth from '../hooks/useAuth';
import CookieConsent from '../components/CookieConsent/CookieConsent';
import MatomoContext from '../components/Matomo/matomo-context';
import MatomoTracker from '../components/Matomo/MatomoTracker';
import config from '../config';

import '../styles/core.scss';

const App = ({ router }) => {
  const { authenticated, user, getApiToken } = useAuth();
  const dispatch = useDispatch();

  // Extract userId to prevent unnecessary effect runs
  const userId = authenticated && user?.profile?.sub;

  const apiToken = getApiToken();

  useEffect(() => {
    async function fetchData() {
      // These are public API endpoints that don't require authentication
      dispatch(fetchAttributeTypesThunk());
      dispatch(fetchTemplatesThunk());

      if (authenticated && userId && apiToken) {
        dispatch(retrieveUserFromSession({ id: userId, token: apiToken }));
      }
    }

    fetchData();
  }, [authenticated, userId, dispatch, apiToken]);

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

const AppContainer = ({ routes, store }) => {
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
          <React.StrictMode>
            <App router={router} />
          </React.StrictMode>
        </MatomoContext.Provider>
      </Provider>
    </LoginProvider>
  );
};

App.propTypes = {
  router: PropTypes.any.isRequired,
};

AppContainer.propTypes = {
  routes: PropTypes.node.isRequired,
  store: PropTypes.object.isRequired,
};

export default AppContainer;
