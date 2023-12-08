import config from '../../config';

const providerProperties = {
  userManagerSettings: {
    authority: config.OIDC_AUTHORITY,
    client_id: config.OIDC_CLIENT_ID,
    scope: 'openid profile',
    redirect_uri: `${window.location.origin}/callback`,
    silent_redirect_uri: `${window.location.origin}/renew`,
    post_logout_redirect_uri: `${window.location.origin}/callback`,
  },
  apiTokensClientSettings: {
    url: config.OIDC_TOKEN_URL,
    queryProps: {
      grantType: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      permission: '#access',
    },
    audiences: ['https://api.hel.fi/auth/helerm'],
  },
  sessionPollerSettings: { pollIntervalInMs: 10000 },
};

export default providerProperties;
