/* eslint-disable no-underscore-dangle */
const useCookieConsent = (isModal = true) => {
  const config = {
    siteName: 'Tiedonohjaus',
    currentLanguage: 'fi',
    language: {
      languageOptions: [{ code: 'fi', label: 'Suomeksi (FI)' }],
    },
    optionalCookies: {
      groups: [
        {
          commonGroup: 'statistics',
          cookies: [{ commonCookie: 'matomo' }],
        },
      ],
    },
    onAllConsentsGiven: (consents) => {
      if (consents.matomo) {
        //  start tracking
        window._paq.push(['setConsentGiven']);
        window._paq.push(['setCookieConsentGiven']);
      }
    },
    onConsentsParsed: (consents) => {
      /* istanbul ignore next */
      if (consents.matomo === undefined) {
        // tell matomo to wait for consent:
        window._paq.push(['requireConsent']);
        window._paq.push(['requireCookieConsent']);
      } else if (consents.matomo === false) {
        // tell matomo to forget conset
        window._paq.push(['forgetConsentGiven']);
      }
    },
    focusTargetSelector: isModal ? `#main` : undefined,
  };

  return { config }
};

export default useCookieConsent;
