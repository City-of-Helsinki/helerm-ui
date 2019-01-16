import React, { Component } from 'react';
import { map, find, forEach } from 'lodash';
import classnames from 'classnames';
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

const FILTER_VALUE_ERROR = 'error';
const FILTER_VALUE_WARN = 'warning';

const ATTRIBUTE_NAME_FIELDS = ['PhaseType', 'ActionType', 'TypeSpecifier'];

export class ValidationBar extends Component {
  constructor (props) {
    super(props);
    this.renderContent = this.renderContent.bind(this);
    this.onFilterStatusChange = this.onFilterStatusChange.bind(this);
    this.state = {
      filterStatus: '',
      sidebar: null
    };
  }

  componentDidMount () {
    const sidebar = new StickySidebar('.sidebar-content', {
      bottomSpacing: 10,
      topSpacing: 135,
      containerSelector: '.validation-bar-container',
      innerWrapperSelector: '.sidebar__inner'
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
    const showInvalidAttributes = this.getFilterByStatus(FILTER_VALUE_ERROR);
    const showWarnAttributes = this.getFilterByStatus(FILTER_VALUE_WARN);
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
    const showInvalidAttributes = this.getFilterByStatus(FILTER_VALUE_ERROR);
    const showWarnAttributes = this.getFilterByStatus(FILTER_VALUE_WARN);
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

  onFilterStatusChange (filterStatus) {
    this.setState({
      filterStatus
    });
  }

  getFilterByStatus (filterValue) {
    const { filterStatus } = this.state;
    return !filterStatus ? true : filterValue === filterStatus;
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
    const { filterStatus } = this.state;
    const invalidContent = this.renderInvalidContent();
    return (
      <div className='sidebar-content'>
        <div className='sidebar-content-close'>
          <h3>
            Esitarkastus
            <button
              className='sidebar-close-button pull-right'
              onClick={() => this.props.setValidationVisibility(false)}>
              <i className='fa fa-times' />
            </button>
          </h3>
        </div>
        <div className='sidebar-content-filter'>
          <button
            className={classnames(
              'sidebar-content-filter-all btn btn-sm',
              { 'btn-default': filterStatus === '' }
            )}
            onClick={() => this.onFilterStatusChange('')}>
            Kaikki
          </button>
          <button
            className={classnames(
              'sidebar-content-filter-warn btn btn-sm',
              { 'btn-default': filterStatus === FILTER_VALUE_WARN }
            )}
            onClick={() => this.onFilterStatusChange(FILTER_VALUE_WARN)}>
            <i className='fa fa-exclamation-circle' /> Huomautukset
          </button>
          <button
            className={classnames(
              'sidebar-content-filter-error btn btn-sm',
              { 'btn-default': filterStatus === FILTER_VALUE_ERROR }
            )}
            onClick={() => this.onFilterStatusChange(FILTER_VALUE_ERROR)}>
            <i className='fa fa-exclamation-triangle' /> Virheet
          </button>
        </div>
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
  setValidationVisibility: React.PropTypes.func.isRequired
};

export default ValidationBar;
