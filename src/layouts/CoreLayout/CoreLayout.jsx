import React, { Suspense, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useCookies } from 'hds-react';

import Header from '../../components/Header';
import Loader from '../../components/Loader';
import NavigationContainer from '../../components/Navigation/NavigationContainer';
import useMatomo from '../../components/Matomo/hooks/useMatomo';

import './CoreLayout.scss';

const CoreLayout = ({ children }) => {
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
        <div className='core-layout__navigation'>
          <NavigationContainer />
        </div>
        <Suspense fallback={<Loader show />}>
          <div className='container-fluid helerm-content'>{children}</div>
        </Suspense>
      </main>
    </div>
  );
};

CoreLayout.propTypes = {
  children: PropTypes.node,
};

export default CoreLayout;
