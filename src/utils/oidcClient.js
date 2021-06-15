import Oidc, { UserManager, WebStorageStateStore } from 'oidc-client';
import fetch from 'isomorphic-fetch';

import { setStorageItem, removeStorageItem } from './storage';
import { config } from '../config';

let client = null;
let isLogging = false;

export function createOidcClient() {
    const location = window.location.origin;
    const oidcConfig = {
        userStore: new WebStorageStateStore({ store: window.localStorage }),
        authority: config.OIDC_URL,
        automaticSilentRenew: false,
        client_id: config.OIDC_CLIENT_ID,
        redirect_uri: `${location}/callback`,
        response_type: config.OIDC_RESPONSE_TYPE,
        scope: config.OIDC_SCOPE,
        post_logout_redirect_uri: `${location}/`,
    };
    const manager = new UserManager(oidcConfig);
    
    manager.events.addAccessTokenExpired(() => {
        manager.removeUser();
        manager.clearStaleState();
    });
    
    if (config.OIDC_LOGGING) {
      Oidc.Log.logger = console;
      Oidc.Log.level = Oidc.Log.INFO;
    }

    const addEventListener = (callback) => {
        return manager.events.addAccessTokenExpiring(callback);
    }

    const removeEventListener = (callback) => {
        return manager.events.removeAccessTokenExpiring(callback);
    }
  
    const login = () => {
        if (!isLogging) {
            isLogging = true;
            manager.removeUser();
            manager.signinRedirect();
        }
    };
  
    const logout = () => {
        removeStorageItem('oidctoken');
        removeStorageItem('user');
        manager.removeUser();
        manager.signoutRedirect();
    };

    const handleCallback = async () => {
        return new Promise((resolve, reject) => {
            manager
                .signinRedirectCallback()
                .then((loadedUser) => {
                    const tokenHeaders = new Headers();
                    tokenHeaders.append('Authorization', `Bearer ${loadedUser.access_token}`);
                    tokenHeaders.append('Content-Type', 'application/json');
                    const requestOptions = {
                        method: 'POST',
                        headers: tokenHeaders,
                    };
                    
                    return fetch(config.OIDC_TOKEN_URL, requestOptions)
                        .then((res) => {
                            return res.json()
                        })
                        .then(resp => {
                            const values = Object.values(resp)
                            const token = (values && values[0]) || null
                            setStorageItem('oidctoken', token);
                            setStorageItem('user', loadedUser.profile.sub);
                            resolve(token);
                        });
                })
                .catch(e => {
                    reject(e);
                });
            });
    }
  
    client = {
        login,
        logout,
        handleCallback,
        addEventListener,
        removeEventListener,
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