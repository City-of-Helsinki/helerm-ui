import React, { Component } from 'react';
import SideBar from 'react-sidebar';
import Select from 'react-select';
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

const styles = {
  root: {
    position: 'relative'
  },
  sidebar: {
    position: 'fixed',
    width: 300,
    height: '100%',
    padding: '10px 10px 0 20px',
    backgroundColor: 'white',
    zIndex: '99'
  },
  sidebarLink: {
    display: 'block',
    color: '#757575',
    textDecoration: 'none'
  },
  divider: {
    margin: '8px 0',
    height: 1,
    backgroundColor: '#757575'
  },
  content: {
    height: '100%',
    minHeight: '400px',
    position: 'relative',
    overflowY: 'hidden',
    transition: 'left .3s ease-out, margin-right .3s ease-out'
  }
};

const FILTER_VALUE_ERROR = 'error';
const FILTER_VALUE_WARN = 'warning';

const filterStatuses = [
  { value: FILTER_VALUE_ERROR, label: 'Virheet' },
  { value: FILTER_VALUE_WARN, label: 'Huomautukset' }
];

const ATTRIBUTE_NAME_FIELDS = ['PhaseType', 'ActionType', 'TypeSpecifier'];

export class ValidationBar extends Component {
  constructor (props) {
    super(props);
    this.renderContent = this.renderContent.bind(this);
    this.onFilterStatusChange = this.onFilterStatusChange.bind(this);
    this.state = {
      filterStatus: []
    };
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
                    <i className='fa fa-times-circle' />{' '}
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

  onFilterStatusChange (options) {
    this.setState({
      filterStatus: map(options, 'value')
    });
  }

  getFilterByStatus (filterValue) {
    if (!this.state.filterStatus.length) {
      return true;
    }
    return !!find(this.state.filterStatus, item => item === filterValue);
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
        <div>
          <h4>Esitarkastus</h4>
          {invalidTOSAttributes && <h5>Käsittelyprosessi</h5>}
          {invalidTOSAttributes}
          {invalidAttributes}
        </div>
      );
    }
    return <div className='no-missing-attributes fa fa-check-circle' />;
  }

  renderContent () {
    const invalidContent = this.renderInvalidContent();
    return (
      <div className='sidebar-content'>
        <div className='sidebar-content-close'>
          <button
            className='btn btn-sm btn-default'
            onClick={() => this.props.setValidationVisibility(false)}>
            <i className='fa fa-times' />
          </button>
        </div>
        <Select
          autoBlur={true}
          placeholder='Suodata tyypin mukaan...'
          value={this.state.filterStatus}
          multi={true}
          joinValues={true}
          clearable={false}
          options={filterStatuses}
          onChange={this.onFilterStatusChange}
        />
        {invalidContent}
      </div>
    );
  }

  render () {
    const { children, is_open: isOpen, selectedTOS } = this.props;
    const sidebarContent = selectedTOS.id ? this.renderContent() : <div />;

    return (
      <div className='helerm-validation-bar'>
        <SideBar
          sidebar={sidebarContent}
          open={isOpen}
          docked={isOpen}
          pullRight={true}
          rootClassName={`helerm-validation-sidebar${isOpen ? '--opened' : ''}`}
          contentClassName='helerm-validation-sidebar--content'
          styles={styles}
        >
          {children}
        </SideBar>
      </div>
    );
  }
}

ValidationBar.propTypes = {
  attributeTypes: React.PropTypes.object.isRequired,
  children: React.PropTypes.array.isRequired,
  is_open: React.PropTypes.bool.isRequired,
  selectedTOS: React.PropTypes.object.isRequired,
  setValidationVisibility: React.PropTypes.func.isRequired
};

export default ValidationBar;
