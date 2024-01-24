import { renderHook } from '@testing-library/react-hooks';

import useCookieConsent from '../useCookieConsent';

describe('useCookieConsent', () => {
  it('should return the correct config object', () => {
    const { result } = renderHook(() => useCookieConsent());

    expect(result.current.config).toEqual({
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
      onAllConsentsGiven: expect.any(Function),
      onConsentsParsed: expect.any(Function),
      focusTargetSelector: '#main',
    });
  });

  it('should return the correct config object when isModal is false', () => {
    const { result } = renderHook(() => useCookieConsent(false));

    expect(result.current.config).toEqual({
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
      onAllConsentsGiven: expect.any(Function),
      onConsentsParsed: expect.any(Function),
      focusTargetSelector: undefined,
    });
  });
});
