import React from 'react';
import Banner from './Banner';
import { Link } from 'react-router';

export default () => (
  <Banner>
    <Banner.Element background='green'>BETA</Banner.Element>
    <Banner.Element background='blue'>
      <a
        style={{ color: '#fff' }}
        href={`mailto:${FEEDBACK_EMAIL}?subject=Tiedonohjaus-palaute`}
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
