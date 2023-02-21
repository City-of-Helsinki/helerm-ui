import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { map, find, forEach } from 'lodash';

import './ValidationBar.scss';

import {
  validateTOS,
  validatePhase,
  validateAction,
  validateRecord,
  validateTOSWarnings,
  validatePhaseWarnings,
  validateActionWarnings,
  validateRecordWarnings
} from '../../../utils/validators';

import {
  VALIDATION_FILTER_ERROR,
  VALIDATION_FILTER_WARN
} from '../../../constants';

const ATTRIBUTE_NAME_FIELDS = ['PhaseType', 'ActionType', 'TypeSpecifier'];

export class ValidationBar extends Component {
  constructor (props) {
    super(props);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.renderContent = this.renderContent.bind(this);

    this.state = {
      filter: ''
    };
  }

  onFilterChange (filter) {
    this.setState({
      filter
    });
  }

  generateInvalidTosAttributes (validate, validateWarn, values) {
    const showInvalidAttributes = this.getFilterByStatus(VALIDATION_FILTER_ERROR);
    const showWarnAttributes = this.getFilterByStatus(VALIDATION_FILTER_WARN);
    const invalidAttributes = showInvalidAttributes
      ? validate(values, this.props.attributeTypes)
      : [];
    const warnAttributes = showWarnAttributes
      ? validateWarn(values, this.props.attributeTypes)
      : [];
    const mappedInvalidAttributes = map(invalidAttributes, (item, index) => (
      <div key={index} className='missing-attribute'>
        <i className='fa-solid fa-circle-xmark' />{' '}
        {this.props.attributeTypes[item].name}
      </div>
    ));
    const mappedWarnAttributes = map(warnAttributes, (item, index) => (
      <div key={index} className='warn-attribute'>
        <i className='fa-solid fa-circle-exclamation' />{' '}
        {this.props.attributeTypes[item].name}
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
  }

  generateInvalidAttributes () {
    const { selectedTOS } = this.props;
    const showInvalidAttributes = this.getFilterByStatus(VALIDATION_FILTER_ERROR);
    const showWarnAttributes = this.getFilterByStatus(VALIDATION_FILTER_WARN);
    const invalidPhases = [];
    forEach(selectedTOS.phases, (phase, index) => {
      const invalidActions = [];
      forEach(phase.actions, (actionId) => {
        const action = selectedTOS.actions[actionId];
        const invalidRecords = [];
        forEach(action.records, recordId => {
          const invalidRecord = this.getInvalidSection(
            'record',
            selectedTOS.records[recordId],
            showInvalidAttributes ? validateRecord : null,
            showWarnAttributes ? validateRecordWarnings : null
          );
          if (invalidRecord) {
            invalidRecords.push(invalidRecord);
          }
        });
        const invalidAction = this.getInvalidSection(
          'action',
          action,
          showInvalidAttributes ? validateAction : null,
          showWarnAttributes ? validateActionWarnings : null,
          invalidRecords
        );
        if (invalidAction) {
          invalidActions.push(invalidAction);
        }
      });
      const invalidPhase = this.getInvalidSection(
        'phase',
        phase,
        showInvalidAttributes ? validatePhase : null,
        showWarnAttributes ? validatePhaseWarnings : null,
        invalidActions
      );
      if (invalidPhase) {
        invalidPhases.push(
          <div key={index}>
            {invalidPhase}
          </div>
        );
      }
    });

    return invalidPhases;
  }

  getInvalidSection (type, section, validateRequired, validateWarn, children) {
    if (section) {
      const { attributeTypes } = this.props;
      const invalidAttributes = validateRequired ? validateRequired(section, attributeTypes) : [];
      const warnAttributes = validateWarn ? validateWarn(section, attributeTypes) : [];
      const nameAttribute = section.attributes
        ? find(ATTRIBUTE_NAME_FIELDS, field => !!section.attributes[field])
        : '';
      if (invalidAttributes.length || warnAttributes.length || (children && children.length)) {
        return (
          <div className={`sidebar-content-${type}`} key={section.id}>
            <div className='parent-name' onClick={() => this.props.scrollToType(type, section.id)}>
              {nameAttribute ? section.attributes[nameAttribute] : ''}
            </div>
            <div className='missing-attributes'>
              {map(invalidAttributes, (item, key) => {
                return (
                  <div key={key} className='missing-attribute'>
                    <i className='fa-solid fa-triangle-exclamation' />{' '}
                    {attributeTypes[item].name}
                  </div>
                );
              })}
              {map(warnAttributes, (item, key) => {
                return (
                  <div key={key} className='warn-attribute'>
                    <i className='fa-solid fa-circle-exclamation' />{' '}
                    {attributeTypes[item].name}
                  </div>
                );
              })}
            </div>
            {children}
          </div>
        );
      }
    }
    return null;
  }

  getFilterByStatus (value) {
    const { filter } = this.state;
    return !filter ? true : value === filter;
  }

  renderInvalidContent () {
    const { selectedTOS } = this.props;
    const invalidTOSAttributes = this.generateInvalidTosAttributes(
      validateTOS,
      validateTOSWarnings,
      selectedTOS
    );
    const invalidAttributes = this.generateInvalidAttributes();

    if (invalidTOSAttributes || invalidAttributes.length > 0) {
      return (
        <div className='sidebar-invalid-content'>
          {invalidTOSAttributes && <h5 onClick={this.props.scrollToMetadata}>Käsittelyprosessi</h5>}
          {invalidTOSAttributes}
          {invalidAttributes}
        </div>
      );
    }
    return <div className='no-missing-attributes'><div className='fa-solid fa-circle-check' /></div>;
  }

  renderContent () {
    const invalidContent = this.renderInvalidContent();
    return (
      <div className='sidebar-content'>
        {invalidContent}
      </div>
    );
  }

  render () {
    const { selectedTOS, setValidationVisibility, top } = this.props;
    const { filter } = this.state;
    const sidebarContent = selectedTOS.id ? this.renderContent() : <div />;

    return (
      <div className='validation-bar' style={{ top: top + 47 }}>
        <div className='validation-bar-header'>
          <h3>
            Esitarkastus
            <button
              className='sidebar-close-button pull-right'
              onClick={() => setValidationVisibility(false)}>
              <i className='fa-solid fa-xmark' />
            </button>
          </h3>
          <div className='sidebar-filter'>
            <button
              className={classnames(
                'sidebar-filter-all btn btn-sm',
                { 'btn-default': filter === '' }
              )}
              onClick={() => this.onFilterChange('')}>
                Kaikki
            </button>
            <button
              className={classnames(
                'sidebar-filter-warn btn btn-sm',
                { 'btn-default': filter === VALIDATION_FILTER_WARN }
              )}
              onClick={() => this.onFilterChange(VALIDATION_FILTER_WARN)}>
              <i className='fa-solid fa-circle-exclamation' /> Huomautukset
            </button>
            <button
              className={classnames(
                'sidebar-filter-error btn btn-sm',
                { 'btn-default': filter === VALIDATION_FILTER_ERROR }
              )}
              onClick={() => this.onFilterChange(VALIDATION_FILTER_ERROR)}>
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
  top: PropTypes.number.isRequired
};

export default ValidationBar;
