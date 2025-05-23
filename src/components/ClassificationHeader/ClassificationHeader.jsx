import React from 'react';
import PropTypes from 'prop-types';

import { EDIT } from '../../constants';
import IsAllowed from '../IsAllowed/IsAllowed';
import ClassificationButton from './ClassificationButton';

const ClassificationHeader = ({ code, title, createTos, functionAllowed = false }) => {
  const classificationName = `${code} ${title}`;
  const creatable = functionAllowed ? (
    <IsAllowed to={EDIT}>
      <span>
        <ClassificationButton className='btn-sm pull-right' type='primary' action={createTos} label='Luo kuvaus' />
      </span>
    </IsAllowed>
  ) : null;

  return (
    <div className='single-classification-header'>
      <div className='row'>
        <h4 className='col-md-6 col-xs-12'>{classificationName}</h4>
        <div className='document-buttons col-xs-12 col-md-6 no-print'>{creatable}</div>
      </div>
    </div>
  );
};

ClassificationHeader.propTypes = {
  code: PropTypes.string.isRequired,
  createTos: PropTypes.func.isRequired,
  functionAllowed: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

export default ClassificationHeader;
