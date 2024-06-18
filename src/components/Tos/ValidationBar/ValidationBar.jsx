/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { map, find } from 'lodash';

import './ValidationBar.scss';

import {
  validateTOS,
  validatePhase,
  validateAction,
  validateRecord,
  validateTOSWarnings,
  validatePhaseWarnings,
  validateActionWarnings,
  validateRecordWarnings,
} from '../../../utils/validators';
import { VALIDATION_FILTER_ERROR, VALIDATION_FILTER_WARN } from '../../../constants';

const ATTRIBUTE_NAME_FIELDS = ['PhaseType', 'ActionType', 'TypeSpecifier'];

const ValidationBar = (props) => {
  const { selectedTOS, setValidationVisibility, top, attributeTypes, scrollToMetadata, scrollToType } = props;

  const [filter, setFilter] = useState('');

  const getFilterByStatus = (value) => (!filter ? true : value === filter);

  const generateInvalidTosAttributes = (validate, validateWarn, values) => {
    const showInvalidAttributes = getFilterByStatus(VALIDATION_FILTER_ERROR);
    const showWarnAttributes = getFilterByStatus(VALIDATION_FILTER_WARN);
    const invalidAttributes = showInvalidAttributes ? validate(values, attributeTypes) : [];
    const warnAttributes = showWarnAttributes ? validateWarn(values, attributeTypes) : [];
    const mappedInvalidAttributes = map(invalidAttributes, (item, index) => (
      <div key={index} className='missing-attribute'>
        <i className='fa-solid fa-circle-xmark' /> {attributeTypes[item].name}
      </div>
    ));
    const mappedWarnAttributes = map(warnAttributes, (item, index) => (
      <div key={index} className='warn-attribute'>
        <i className='fa-solid fa-circle-exclamation' /> {attributeTypes[item].name}
      </div>
    ));

    if (invalidAttributes.length || warnAttributes.length) {
      return (
        <div className='missing-attributes'>
          {mappedInvalidAttributes}
          {mappedWarnAttributes}
        </div>
      );
    }

    return null;
  };

  const getInvalidSection = (type, section, validateRequired, validateWarn, children) => {
    const hasChildren = children !== undefined && children.filter((x) => x !== null).length > 0;

    if (!section || (type !== 'record' && !hasChildren)) {
      return null;
    }

    const invalidAttributes = validateRequired ? validateRequired(section, attributeTypes) : [];
    const warnAttributes = validateWarn ? validateWarn(section, attributeTypes) : [];
    const nameAttribute = section.attributes ? find(ATTRIBUTE_NAME_FIELDS, (field) => !!section.attributes[field]) : '';

    if (invalidAttributes.length || warnAttributes.length || children?.length) {
      return (
        <div className={`sidebar-content-${type}`} key={section.id}>
          <button
            type='button'
            className='parent-name'
            onClick={() => scrollToType(type, section.id)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                scrollToType(type, section.id);
              }
            }}
          >
            {nameAttribute ? section.attributes[nameAttribute] : ''}
          </button>
          <div className='missing-attributes'>
            {map(invalidAttributes, (item, key) => (
              <div key={key} className='missing-attribute'>
                <i className='fa-solid fa-triangle-exclamation' /> {attributeTypes[item].name}
              </div>
            ))}
            {map(warnAttributes, (item, key) => (
              <div key={key} className='warn-attribute'>
                <i className='fa-solid fa-circle-exclamation' /> {attributeTypes[item].name}
              </div>
            ))}
          </div>
          {children}
        </div>
      );
    }

    return null;
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const generateInvalidAttributes = () => {
    const showInvalidAttributes = getFilterByStatus(VALIDATION_FILTER_ERROR);
    const showWarnAttributes = getFilterByStatus(VALIDATION_FILTER_WARN);

    // get invalid sections of phase-action-record -tree as div elements
    const invalidPhases = Object.values(selectedTOS.phases)
      .map((phase) => ({
        id: phase.id,
        invalidSection: getInvalidSection(
          'phase',
          phase,
          showInvalidAttributes ? validatePhase : null,
          showWarnAttributes ? validatePhaseWarnings : null,
          phase.actions
            .map((actionId) => selectedTOS.actions?.[actionId])
            .map((action) =>
              getInvalidSection(
                'action',
                action,
                showInvalidAttributes ? validateAction : null,
                showWarnAttributes ? validateActionWarnings : null,
                action?.records
                  .map((recordId) => selectedTOS.records?.[recordId])
                  .map((record) =>
                    getInvalidSection(
                      'record',
                      record,
                      showInvalidAttributes ? validateRecord : null,
                      showWarnAttributes ? validateRecordWarnings : null,
                    ),
                  ),
              ),
            ),
        ),
      }))
      .filter(({ invalidSection }) => Boolean(invalidSection))
      .map(({ id, invalidSection }) => <div key={id}>{invalidSection}</div>);

    return invalidPhases.length > 0 ? invalidPhases : null;
  };

  const renderInvalidContent = () => {
    const invalidTOSAttributes = generateInvalidTosAttributes(validateTOS, validateTOSWarnings, selectedTOS);
    const invalidAttributes = generateInvalidAttributes();

    if (invalidTOSAttributes || invalidAttributes?.length > 0) {
      return (
        <div className='sidebar-invalid-content'>
          {invalidTOSAttributes && (
            <button
              className='scroll-to-button'
              type='button'
              onClick={scrollToMetadata}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  scrollToMetadata();
                }
              }}
            >
              Käsittelyprosessi
            </button>
          )}
          {invalidTOSAttributes}
          {invalidAttributes}
        </div>
      );
    }

    return (
      <div className='no-missing-attributes'>
        <div className='fa-solid fa-circle-check' />
      </div>
    );
  };

  return (
    <div className='validation-bar' style={{ top: top + 47 }}>
      <div className='validation-bar-header'>
        <h3>
          Esitarkastus{' '}
          <button
            type='button'
            className='sidebar-close-button pull-right'
            onClick={() => setValidationVisibility(false)}
            aria-label='Esitarkastus'
          >
            <i className='fa-solid fa-xmark' />
          </button>
        </h3>
        <div className='sidebar-filter'>
          <button
            type='button'
            className={classnames('sidebar-filter-all btn btn-sm', { 'btn-default': filter === '' })}
            onClick={() => setFilter('')}
          >
            Kaikki
          </button>
          <button
            type='button'
            className={classnames('sidebar-filter-warn btn btn-sm', {
              'btn-default': filter === VALIDATION_FILTER_WARN,
            })}
            onClick={() => setFilter(VALIDATION_FILTER_WARN)}
          >
            <i className='fa-solid fa-circle-exclamation' /> Huomautukset
          </button>
          <button
            type='button'
            className={classnames('sidebar-filter-error btn btn-sm', {
              'btn-default': filter === VALIDATION_FILTER_ERROR,
            })}
            onClick={() => setFilter(VALIDATION_FILTER_ERROR)}
          >
            <i className='fa-solid fa-triangle-exclamation' /> Virheet
          </button>
        </div>
      </div>
      {selectedTOS.id ? <div className='sidebar-content'>{renderInvalidContent()}</div> : <div />}
    </div>
  );
};

ValidationBar.propTypes = {
  attributeTypes: PropTypes.object.isRequired,
  scrollToMetadata: PropTypes.func.isRequired,
  scrollToType: PropTypes.func.isRequired,
  selectedTOS: PropTypes.object.isRequired,
  setValidationVisibility: PropTypes.func.isRequired,
  top: PropTypes.number.isRequired,
};

export default ValidationBar;
