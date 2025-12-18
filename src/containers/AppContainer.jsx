import { CookieBanner, CookieConsentContextProvider, LoginProvider, SessionEndedHandler } from 'hds-react';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import ReduxToastr from 'react-redux-toastr';
import { createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';

import MatomoContext from '../components/Matomo/matomo-context';
import MatomoTracker from '../components/Matomo/MatomoTracker';
import config from '../config';
import useAuth from '../hooks/useAuth';
import useCookieConsentSettings from '../hooks/useCookieConsentSettings';
import { fetchAttributeTypesThunk, fetchTemplatesThunk } from '../store/reducers/ui';
import { retrieveUserFromSession } from '../store/reducers/user';
import '../styles/core.scss';
import { providerProperties } from '../utils/oidc/constants';

const App = ({ router }) => {
  const [userDataFetched, setUserDataFetched] = useState(false);

  const dispatch = useDispatch();
  const { authenticated, user, getApiToken } = useAuth();

  const userId = authenticated && user?.profile?.sub;
  const apiToken = getApiToken();

  useEffect(() => {
    const fetchData = async () => {
      dispatch(fetchAttributeTypesThunk());
      dispatch(fetchTemplatesThunk());

      if (authenticated && userId && apiToken) {
        dispatch(retrieveUserFromSession({ id: userId, token: apiToken }));
        setUserDataFetched(true);
      }
    };

    fetchData();
  }, [dispatch, authenticated, userId, apiToken]);

  useEffect(() => {
    if (!authenticated && userDataFetched) {
      setUserDataFetched(false);
    }
  }, [authenticated, userDataFetched]);

  return (
    <div style={{ height: '100%' }}>
      <CookieBanner />
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

  const cookieConsentProps = useCookieConsentSettings();

  return (
    <CookieConsentContextProvider {...cookieConsentProps}>
      <LoginProvider {...providerProperties}>
        <Provider store={store}>
          <MatomoContext.Provider value={matomoTracker}>
            <React.StrictMode>
              <App router={router} />
            </React.StrictMode>
          </MatomoContext.Provider>
        </Provider>
      </LoginProvider>
    </CookieConsentContextProvider>
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
