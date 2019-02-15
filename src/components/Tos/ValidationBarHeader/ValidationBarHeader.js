import React from 'react';
import classnames from 'classnames';

import './ValidationBarHeader.scss';
import {
  VALIDATION_FILTER_ERROR,
  VALIDATION_FILTER_WARN
} from '../../../../config/constants';

const ValidationBarHeader = ({
    validationFilter,
    onFilterChange,
    setValidationVisibility
  }) => {
  return (
    <div className='col-xs-3 validation-bar-header'>
      <div className='validation-bar-header-container'>
        <h3>
          Esitarkastus
          <button
            className='sidebar-close-button pull-right'
            onClick={() => setValidationVisibility(false)}>
            <i className='fa fa-times' />
          </button>
        </h3>
        <div className='validation-bar-header-filter'>
          <button
              className={classnames(
              'validation-bar-header-filter-all btn btn-sm',
              { 'btn-default': validationFilter === '' }
              )}
              onClick={() => onFilterChange('')}>
              Kaikki
          </button>
          <button
            className={classnames(
            'validation-bar-header-filter-warn btn btn-sm',
            { 'btn-default': validationFilter === VALIDATION_FILTER_WARN }
            )}
            onClick={() => onFilterChange(VALIDATION_FILTER_WARN)}>
            <i className='fa fa-exclamation-circle' /> Huomautukset
          </button>
          <button
            className={classnames(
            'validation-bar-header-filter-error btn btn-sm',
            { 'btn-default': validationFilter === VALIDATION_FILTER_ERROR }
            )}
            onClick={() => onFilterChange(VALIDATION_FILTER_ERROR)}>
            <i className='fa fa-exclamation-triangle' /> Virheet
          </button>
        </div>
      </div>
    </div>
  );
};

ValidationBarHeader.propTypes = {
  onFilterChange: React.PropTypes.func.isRequired,
  setValidationVisibility: React.PropTypes.func.isRequired,
  validationFilter: React.PropTypes.string.isRequired
};

export default ValidationBarHeader;
