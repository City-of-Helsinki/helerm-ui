/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
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

class ValidationBar extends Component {
  constructor(props) {
    super(props);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.renderContent = this.renderContent.bind(this);

    this.state = {
      filter: '',
    };
  }

  onFilterChange(filter) {
    this.setState({
      filter,
    });
  }

  getFilterByStatus(value) {
    const { filter } = this.state;
    return !filter ? true : value === filter;
  }

  getInvalidSection(type, section, validateRequired, validateWarn, children) {
    const hasChildren = children !== undefined && children.filter((x) => x !== null).length > 0;

    if (!section || (type !== 'record' && !hasChildren)) {
      return null;
    }

    const { attributeTypes } = this.props;

    const invalidAttributes = validateRequired ? validateRequired(section, attributeTypes) : [];
    const warnAttributes = validateWarn ? validateWarn(section, attributeTypes) : [];
    const nameAttribute = section.attributes ? find(ATTRIBUTE_NAME_FIELDS, (field) => !!section.attributes[field]) : '';

    if (invalidAttributes.length || warnAttributes.length || children?.length) {
      return (
        <div className={`sidebar-content-${type}`} key={section.id}>
          <div
            className='parent-name'
            onClick={() => this.props.scrollToType(type, section.id)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                this.props.scrollToType(type, section.id);
              }
            }}
          >
            {nameAttribute ? section.attributes[nameAttribute] : ''}
          </div>
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
  }

  generateInvalidTosAttributes(validate, validateWarn, values) {
    const showInvalidAttributes = this.getFilterByStatus(VALIDATION_FILTER_ERROR);
    const showWarnAttributes = this.getFilterByStatus(VALIDATION_FILTER_WARN);
    const invalidAttributes = showInvalidAttributes ? validate(values, this.props.attributeTypes) : [];
    const warnAttributes = showWarnAttributes ? validateWarn(values, this.props.attributeTypes) : [];
    const mappedInvalidAttributes = map(invalidAttributes, (item, index) => (
      <div key={index} className='missing-attribute'>
        <i className='fa-solid fa-circle-xmark' /> {this.props.attributeTypes[item].name}
      </div>
    ));
    const mappedWarnAttributes = map(warnAttributes, (item, index) => (
      <div key={index} className='warn-attribute'>
        <i className='fa-solid fa-circle-exclamation' /> {this.props.attributeTypes[item].name}
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
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  generateInvalidAttributes() {
    const { selectedTOS } = this.props;

    const showInvalidAttributes = this.getFilterByStatus(VALIDATION_FILTER_ERROR);
    const showWarnAttributes = this.getFilterByStatus(VALIDATION_FILTER_WARN);

    // get invalid sections of phase-action-record -tree as div elements
    const invalidPhases = Object.values(selectedTOS.phases).map((phase) => ({
      id: phase.id,
      invalidSection: this.getInvalidSection(
        'phase',
        phase,
        showInvalidAttributes ? validatePhase : null,
        showWarnAttributes ? validatePhaseWarnings : null,
        phase.actions
          .map((actionId) => selectedTOS.actions?.[actionId])
          .map((action) =>
            this.getInvalidSection(
              'action',
              action,
              showInvalidAttributes ? validateAction : null,
              showWarnAttributes ? validateActionWarnings : null,
              action?.records
                .map((recordId) => selectedTOS.records?.[recordId])
                .map((record) =>
                  this.getInvalidSection(
                    'record',
                    record,
                    showInvalidAttributes ? validateRecord : null,
                    showWarnAttributes ? validateRecordWarnings : null,
                  ),
                ),
            )
          )
        )
      }))
      .map(({ id, invalidSection }) => <div key={id}>{invalidSection}</div>);

    return invalidPhases.length > 0 ? invalidPhases : null;
  }

  renderInvalidContent() {
    const { selectedTOS } = this.props;
    const invalidTOSAttributes = this.generateInvalidTosAttributes(validateTOS, validateTOSWarnings, selectedTOS);
    const invalidAttributes = this.generateInvalidAttributes();

    if (invalidTOSAttributes || invalidAttributes?.length > 0) {
      return (
        <div className='sidebar-invalid-content'>
          {invalidTOSAttributes && (
            <h5
              onClick={this.props.scrollToMetadata}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  this.props.scrollToMetadata();
                }
              }}
            >
              Käsittelyprosessi
            </h5>
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
  }

  renderContent() {
    const invalidContent = this.renderInvalidContent();
    return <div className='sidebar-content'>{invalidContent}</div>;
  }

  render() {
    const { selectedTOS, setValidationVisibility, top } = this.props;
    const { filter } = this.state;
    const sidebarContent = selectedTOS.id ? this.renderContent() : <div />;

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
              onClick={() => this.onFilterChange('')}
            >
              Kaikki
            </button>
            <button
              type='button'
              className={classnames('sidebar-filter-warn btn btn-sm', {
                'btn-default': filter === VALIDATION_FILTER_WARN,
              })}
              onClick={() => this.onFilterChange(VALIDATION_FILTER_WARN)}
            >
              <i className='fa-solid fa-circle-exclamation' /> Huomautukset
            </button>
            <button
              type='button'
              className={classnames('sidebar-filter-error btn btn-sm', {
                'btn-default': filter === VALIDATION_FILTER_ERROR,
              })}
              onClick={() => this.onFilterChange(VALIDATION_FILTER_ERROR)}
            >
              <i className='fa-solid fa-triangle-exclamation' /> Virheet
            </button>
          </div>
        </div>
        {sidebarContent}
      </div>
    );
  }
}

ValidationBar.propTypes = {
  attributeTypes: PropTypes.object.isRequired,
  scrollToMetadata: PropTypes.func.isRequired,
  scrollToType: PropTypes.func.isRequired,
  selectedTOS: PropTypes.object.isRequired,
  setValidationVisibility: PropTypes.func.isRequired,
  top: PropTypes.number.isRequired,
};

export default ValidationBar;
