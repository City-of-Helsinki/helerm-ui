import React, { Component } from 'react';
import { map, find, forEach } from 'lodash';
import StickySidebar from 'sticky-sidebar/dist/sticky-sidebar';

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
} from '../../../../config/constants';

const ATTRIBUTE_NAME_FIELDS = ['PhaseType', 'ActionType', 'TypeSpecifier'];

export class ValidationBar extends Component {
  constructor (props) {
    super(props);
    this.renderContent = this.renderContent.bind(this);
    this.state = {
      sidebar: null
    };
  }

  componentDidMount () {
    const sidebar = new StickySidebar('.sidebar-content', {
      bottomSpacing: 10,
      topSpacing: 155,
      containerSelector: '.validation-bar-container',
      innerWrapperSelector: '.sidebar-invalid-content'
    });
    this.setState({ sidebar }); // eslint-disable-line react/no-did-mount-set-state
  }

  componentDidUpdate () {
    const { sidebar } = this.state;
    if (sidebar) {
      sidebar.updateSticky();
    }
  }

  componentWillUnmount () {
    const { sidebar } = this.state;
    if (sidebar) {
      sidebar.destroy();
    }
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
        <i className='fa fa-times-circle' />{' '}
        {this.props.attributeTypes[item].name}
      </div>
    ));
    const mappedWarnAttributes = map(warnAttributes, (item, index) => (
      <div key={index} className='warn-attribute'>
        <i className='fa fa-exclamation-circle' />{' '}
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
            <div className='parent-name'>{nameAttribute ? section.attributes[nameAttribute] : ''}</div>
            <div className='missing-attributes'>
              {map(invalidAttributes, (item, key) => {
                return (
                  <div key={key} className='missing-attribute'>
                    <i className='fa fa-exclamation-triangle' />{' '}
                    {attributeTypes[item].name}
                  </div>
                );
              })}
              {map(warnAttributes, (item, key) => {
                return (
                  <div key={key} className='warn-attribute'>
                    <i className='fa fa-exclamation-circle' />{' '}
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
    const { validationFilter } = this.props;
    return !validationFilter ? true : value === validationFilter;
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
          {invalidTOSAttributes && <h5>Käsittelyprosessi</h5>}
          {invalidTOSAttributes}
          {invalidAttributes}
        </div>
      );
    }
    return <div className='no-missing-attributes'><div className='fa fa-check-circle' /></div>;
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
    const { selectedTOS } = this.props;
    const sidebarContent = selectedTOS.id ? this.renderContent() : <div />;

    return (
      <div className='helerm-validation-bar'>
        {sidebarContent}
      </div>
    );
  }
}

ValidationBar.propTypes = {
  attributeTypes: React.PropTypes.object.isRequired,
  selectedTOS: React.PropTypes.object.isRequired,
  validationFilter: React.PropTypes.string.isRequired
};

export default ValidationBar;
