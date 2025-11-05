/* eslint-disable no-underscore-dangle */
import { PAGE_HEADER_ID } from '../constants';
import siteSettings from './data/siteSettings.json';

export const COOKIE_CONSENT_GROUP = {
  Tunnistamo: 'tunnistamo',
  Shared: 'shared',
  Statistics: 'statistics',
};

const useCookieConsentSettings = () => {
  const cookieConsentProps = {
    onChange: (changeEvent) => {
      const { acceptedGroups } = changeEvent;

      const hasStatisticsConsent = acceptedGroups.includes(COOKIE_CONSENT_GROUP.Statistics);

      if (hasStatisticsConsent) {
        //  start tracking
        globalThis._paq.push(['setConsentGiven']);
        globalThis._paq.push(['setCookieConsentGiven']);
      } else {
        // tell matomo to forget conset
        globalThis._paq.push(['forgetConsentGiven']);
      }
    },
    siteSettings: siteSettings,
    options: { focusTargetSelector: `#${PAGE_HEADER_ID}`, language: 'fi' },
  };

  return cookieConsentProps;
};

export default useCookieConsentSettings;
