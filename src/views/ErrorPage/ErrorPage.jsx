import { Notification } from 'hds-react';
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import InfoLayout from '../../layouts/InfoLayout/InfoLayout';

import './ErrorPage.scss';

/**
 * ErrorPage component.
 *
 * @component
 * @param {boolean} hideFrontPageLink - Whether to hide the front page link or not. Default is false.
 * @returns {JSX.Element} - The rendered ErrorPage component.
 */
const ErrorPage = ({ hideFrontPageLink = false }) => (
  <InfoLayout>
    <div className='container'>
      <Notification type='error' label='Virhe'>
        <p>Jokin meni pieleen. Yritä hetken kuluttua uudelleen.</p>
        {hideFrontPageLink !== true && (
          <Link className='link' to='/'>
            Etusivulle
          </Link>
        )}
      </Notification>
    </div>
  </InfoLayout>
);

export default ErrorPage;

ErrorPage.propTypes = {
  hideFrontPageLink: PropTypes.bool,
};
