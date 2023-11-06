import Oidc, { UserManager, WebStorageStateStore } from 'oidc-client';
import fetch from 'isomorphic-fetch';

import { getStorageItem, setStorageItem, removeStorageItem } from './storage';
import config from '../config';
import { confirmMessage, displayMessage } from './helpers';

let client = null;
let isLogging = false;

// eslint-disable-next-line sonarjs/cognitive-complexity
export function createOidcClient() {
  const location = window.location.origin;
  const isRenew = window.location.href.includes('/renew');
  const oidcConfig = {
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    authority: config.OIDC_URL,
    automaticSilentRenew: true,
    client_id: config.OIDC_CLIENT_ID,
    redirect_uri: `${location}/callback`,
    response_type: config.OIDC_RESPONSE_TYPE,
    scope: config.OIDC_SCOPE,
    post_logout_redirect_uri: `${location}/`,
    silent_redirect_uri: `${location}/renew`,
    accessTokenExpiringNotificationTime: 5 * 60,
    silentRequestTimeout: 15000,
  };

  const manager = new UserManager(oidcConfig);

  manager.clearStaleState();

  const removeStorageData = () => {
    removeStorageItem('accesstoken');
    removeStorageItem('oidctoken');
    removeStorageItem('user');
    manager.clearStaleState();
  };

  const login = () => {
    if (!isLogging) {
      isLogging = true;
      manager.removeUser();
      manager.signinRedirect();
    }
  };

  const logout = () => {
    removeStorageData();
    manager.removeUser();
    manager.signoutRedirect();
  };

  const onRenewFailed = () => {
    isLogging = false;
    confirmMessage('Istunnon uusiminen epäonnistui. Haluatko kirjautua sisään?', {
      id: 'oidc-renew-fail',
      okText: 'Kirjaudu',
      cancelText: 'Peruuta',
      onOk: () => {
        login();
      },
      onCancel: () => {
        logout();
      },
    });
  };

  const fetchApiToken = async (user) => {
    const tokenHeaders = new Headers();

    tokenHeaders.append('Authorization', `Bearer ${user.access_token}`);
    tokenHeaders.append('Content-Type', 'application/json');

    const requestOptions = {
      method: 'POST',
      headers: tokenHeaders,
    };

    setStorageItem('accesstoken', user.access_token);

    try {
      const response = await fetch(config.OIDC_TOKEN_URL, requestOptions);

      if (response.ok) {
        const json = await response.json();

        const values = Object.values(json);
        const token = (values?.[0]) || null;

        setStorageItem('oidctoken', token);
        setStorageItem('user', user.profile.sub);
      } else {
        removeStorageData();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      removeStorageData();
    }
  };

  if (!isRenew) {
    manager.events.addAccessTokenExpired(() => {
      manager.removeUser();
      removeStorageData();
      confirmMessage('Istunto on päättynyt ja sen uusiminen epäonnistui. Haluatko kirjautua sisään uudelleen?', {
        id: 'oidc-expired',
        okText: 'Kirjaudu',
        cancelText: 'Peruuta',
        onOk: () => {
          isLogging = true;
          removeStorageData();
          manager.signinRedirect();
        },
        onCancel: () => {
          manager.signoutRedirect();
        },
      });
    });

    manager.events.addSilentRenewError(() => {
      isLogging = false;
      manager.clearStaleState();
      confirmMessage(
        'Istunnon uusiminen epäonnistui. Yritetäänkö uudestaan? Ehdit vielä tallentaa keskeneräiset muutokset valitsemalla peruuta.',
        {
          id: 'oidc-renew',
          okText: 'Yritä uudestaan',
          cancelText: 'Peruuta',
          onOk: () => {
            isLogging = true;
            manager
              .signinSilent()
              .then(() => {
                isLogging = false;
                displayMessage({
                  title: 'Istunnon uusiminen',
                  body: 'Istunto uusittu onnistuneesti.',
                });
              })
              .catch(() => {
                isLogging = false;

                onRenewFailed();
              });
          },
        },
      );
    });

    manager.events.addUserLoaded(async (user) => {
      const accessToken = getStorageItem('accesstoken');
      if (user && accessToken && user.access_token !== accessToken) {
        await fetchApiToken(user);
      }
    })
  }

  if (config.OIDC_LOGGING) {
    Oidc.Log.logger = console;
    Oidc.Log.level = Oidc.Log.INFO;
  }

  const handleAPITokenExpired = () => {
    isLogging = false;
    removeStorageData();
    confirmMessage('Istunto on vanhentunut. Haluatko kirjautua sisään uudelleen?', {
      id: 'oidc-api-expired',
      okText: 'Kirjaudu',
      cancelText: 'Peruuta',
      onOk: () => {
        login();
      },
      onCancel: () => {
        logout();
      },
    });
  };

  const handleCallback = async () => new Promise((resolve, reject) => {
    manager
      .signinRedirectCallback()
      .then((loadedUser) => {
        if (loadedUser?.access_token) {
          resolve(fetchApiToken(loadedUser));
        }

        resolve();
      })
      .then(() => {
        isLogging = false;
        resolve();
      })
      .catch((e) => {
        isLogging = false;
        reject(e);
      });
  });

  const handleRenewCallback = async () => {
    isLogging = true;
    return new Promise((resolve, reject) => {
      manager
        .signinSilentCallback()
        .then(() => {
          isLogging = false;
          resolve();
        })
        .catch((e) => {
          isLogging = false;
          reject(e);
        });
    });
  };

  client = {
    login,
    logout,
    handleAPITokenExpired,
    handleCallback,
    handleRenewCallback,
  };
  return client;
}

export function getClient() {
  if (client) {
    return client;
  }
  client = createOidcClient();
  return client;
}
