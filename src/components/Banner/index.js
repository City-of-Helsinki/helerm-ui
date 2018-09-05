import React from 'react';
import Banner from './Banner';
import { Link } from 'react-router';

export default () => (
  <Banner>
    <Banner.Element background='green'>BETA {SITE_TITLE} v{VERSION}</Banner.Element>
    <Banner.Element background='blue'>
      <a
        style={{ color: '#fff' }}
        href={`${FEEDBACK_URL}`}
        target='_blank'
        rel='noopener norefer'
      >
        Anna palautetta
      </a>
    </Banner.Element>
    <Banner.Element background='#ddd'>
      <Link to='/info' target='_blank' rel='noopener norefer'>
        Tietoa palvelusta
      </Link>
    </Banner.Element>
  </Banner>
);
