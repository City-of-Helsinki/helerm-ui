import { useGroupConsent } from 'hds-react';
import PropTypes from 'prop-types';
import { Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import useMatomo from '../../components/Matomo/hooks/useMatomo';
import { COOKIE_CONSENT_GROUP } from '../../hooks/useCookieConsentSettings';
import '../CoreLayout/CoreLayout.scss';

const InfoLayout = ({ children }) => {
  const location = useLocation();
  const statisticsConsent = useGroupConsent(COOKIE_CONSENT_GROUP.Statistics);
  const { trackPageView } = useMatomo();

  useEffect(() => {
    if (statisticsConsent) {
      trackPageView({
        href: window.location.href,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statisticsConsent, location.pathname, location.search]);

  return (
    <div className='core-layout__viewport'>
      <Header />
      <main id='main'>
        <Suspense fallback={<Loader show />}>
          <div className='container-fluid'>{children}</div>
        </Suspense>
      </main>
    </div>
  );
};

InfoLayout.propTypes = {
  children: PropTypes.element,
};

export default InfoLayout;
