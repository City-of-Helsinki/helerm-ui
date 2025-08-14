import * as consts from './constants';

// env variables for the react app
// https://create-react-app.dev/docs/adding-custom-environment-variables/

const THEMES = {
  black: '#000000',
  brick: '#bd2719',
  bus: '#0000bf',
  copper: '#00d7a7',
  coat: '#0072c6',
  engel: '#ffe977',
  fog: '#9fc9eb',
  gold: '#c2a251',
  metro: '#fd4f00',
  silver: '#dedfe1',
  summer: '#ffc61e',
  suomenlinna: '#f5a3c7',
  tram: '#009246',
  white: '#ffffff',
};

function envValueToBoolean(value, defaultValue) {
  const strValue = String(value).toLowerCase();
  if (value === false || strValue === '' || strValue === 'false' || strValue === '0') {
    return false;
  }
  if (value === true || strValue === 'true' || strValue === '1') {
    return true;
  }
  return defaultValue;
}

export default {
  NODE_ENV: import.meta.env.NODE_ENV,
  API_URL: import.meta.env.REACT_APP_API_URL,
  API_VERSION: import.meta.env.REACT_APP_API_VERSION,
  RESULTS_PER_PAGE: parseInt(import.meta.env.REACT_APP_RESULTS_PER_PAGE, 10) || consts.DEFAULT_PAGE_SIZE,
  SEARCH_PAGE_SIZE: parseInt(import.meta.env.REACT_APP_SEARCH_PAGE_SIZE, 10) || consts.DEFAULT_SEARCH_PAGE_SIZE,
  GIT_VERSION: import.meta.env.REACT_APP_GIT_VERSION,
  SITE_TITLE: import.meta.env.REACT_APP_SITE_TITLE || '',
  FEEDBACK_URL: import.meta.env.REACT_APP_FEEDBACK_URL,
  FACETED_SEARCH_LENGTH:
    parseInt(import.meta.env.REACT_APP_FACETED_SEARCH_LENGTH, 10) || consts.DEFAULT_FACETED_SEARCH_LENGTH,
  SITE_THEME: THEMES[import.meta.env.REACT_APP_SITE_THEME] || THEMES.coat,
  SENTRY_DSN: import.meta.env.REACT_APP_SENTRY_DSN,
  OIDC_DEBUG: envValueToBoolean(import.meta.env.REACT_APP_OIDC_DEBUG, false),
  OIDC_AUTHORITY: import.meta.env.REACT_APP_OIDC_AUTHORITY,
  API_TOKEN_AUTH_AUDIENCE: import.meta.env.REACT_APP_OIDC_API_TOKEN_AUTH_AUDIENCE,
  OIDC_CLIENT_ID: import.meta.env.REACT_APP_OIDC_CLIENT_ID,
  OIDC_RESPONSE_TYPE: import.meta.env.REACT_APP_OIDC_RESPONSE_TYPE,
  OIDC_SCOPE: import.meta.env.REACT_APP_OIDC_SCOPE,
  OIDC_TOKEN_URL: import.meta.env.REACT_APP_OIDC_TOKEN_URL,
  MATOMO_DOMAINS: import.meta.env.REACT_APP_MATOMO_DOMAINS,
  MATOMO_COOKIE_DOMAIN: import.meta.env.REACT_APP_MATOMO_COOKIE_DOMAIN,
  MATOMO_SRC_URL: import.meta.env.REACT_APP_MATOMO_SRC_URL,
  MATOMO_URL_BASE: import.meta.env.REACT_APP_MATOMO_URL_BASE,
  MATOMO_SITE_ID: import.meta.env.REACT_APP_MATOMO_SITE_ID,
  MATOMO_ENABLED: envValueToBoolean(import.meta.env.REACT_APP_MATOMO_ENABLED, false),
};
