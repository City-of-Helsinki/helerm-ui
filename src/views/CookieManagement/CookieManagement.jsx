import React from 'react';
import { CookiePage } from 'hds-react';

import useCookieConsent from '../../hooks/useCookieConsent';

const CookieManagement = () => {
  const { config } = useCookieConsent({
    isModal: false,
  });

  return <CookiePage contentSource={config} />;
};

export default CookieManagement;
