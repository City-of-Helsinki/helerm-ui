import React from 'react';
import { Link } from 'react-router-dom';

import Banner from './Banner';
import config from '../../config';

const BannerWrapper = () => {
  const gitVersion = config.GIT_VERSION;
  const siteTitle = config.SITE_TITLE;
  const feedBackUrl = config.FEEDBACK_URL;
  return (
    <Banner>
      <Banner.Element background='green'>
        BETA {siteTitle} {gitVersion}
      </Banner.Element>
      <Banner.Element background='blue'>
        <a style={{ color: '#fff' }} href={feedBackUrl} target='_blank' rel='noreferrer'>
          Anna palautetta
        </a>
      </Banner.Element>
      <Banner.Element background='#ddd'>
        <Link to='/info' rel='noopener norefer'>
          Tietoa palvelusta
        </Link>
      </Banner.Element>
    </Banner>
  );
};

export default BannerWrapper;
