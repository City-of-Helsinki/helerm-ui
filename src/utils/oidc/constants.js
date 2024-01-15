/* eslint-disable import/prefer-default-export */
import config from '../../config';

export const providerProperties = {
  debug: config.OIDC_DEBUG,
  userManagerSettings: {
    authority: config.OIDC_AUTHORITY,
    client_id: config.OIDC_CLIENT_ID,
    scope: config.OIDC_SCOPE,
    redirect_uri: `${window.location.origin}/callback`,
    silent_redirect_uri: `${window.location.origin}/silent_renew.html`,
    post_logout_redirect_uri: window.location.origin,
    response_type: config.OIDC_RESPONSE_TYPE,
  },
  apiTokensClientSettings: {
    url: config.OIDC_TOKEN_URL,
    queryProps: {
      grantType: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      permission: '#access',
    },
    audiences: [config.API_TOKEN_AUTH_AUDIENCE],
  },
  sessionPollerSettings: { pollIntervalInMs: 10000 },
};
