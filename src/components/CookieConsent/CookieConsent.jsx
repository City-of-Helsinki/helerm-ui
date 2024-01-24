import { CookieModal } from 'hds-react';
import React from 'react';

import useCookieConsent from '../../hooks/useCookieConsent';

const CookieConsent = () => {
  const { config } = useCookieConsent();

  return <CookieModal contentSource={config} />;
};

export default CookieConsent;
