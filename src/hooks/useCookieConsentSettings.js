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

      const hasStatisticsConsent = acceptedGroups.indexOf(COOKIE_CONSENT_GROUP.Statistics) > -1;

      if (hasStatisticsConsent) {
        //  start tracking
        window._paq.push(['setConsentGiven']);
        window._paq.push(['setCookieConsentGiven']);
      } else {
        // tell matomo to forget conset
        window._paq.push(['forgetConsentGiven']);
      }
    },
    siteSettings: siteSettings,
    options: { focusTargetSelector: `#${PAGE_HEADER_ID}`, language: 'fi' },
  };

  return cookieConsentProps;
};

export default useCookieConsentSettings;
