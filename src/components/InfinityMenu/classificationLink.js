import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

const stopPropagation = ev => ev.stopPropagation();

const ClassificationLink = ({ id }) => (
  <Link to={`/view-classification/${id}`} onClick={stopPropagation} title='Avaa luokituksen tiedot'>
    <i className='fa fa-info-circle' />
  </Link>
);

ClassificationLink.propTypes = {
  id: PropTypes.string.isRequired
};

export default ClassificationLink;
