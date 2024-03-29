import React, { Suspense, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useCookies } from 'hds-react';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import useMatomo from '../../components/Matomo/hooks/useMatomo';

import '../CoreLayout/CoreLayout.scss';

const InfoLayout = ({ children }) => {
  const location = useLocation();
  const { getAllConsents } = useCookies();
  const { trackPageView } = useMatomo();

  useEffect(() => {
    if (getAllConsents().matomo) {
      trackPageView({
        href: window.location.href,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllConsents, location.pathname, location.search]);

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
