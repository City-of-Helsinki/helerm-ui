import React, { Component } from 'react';
import SideBar from 'react-sidebar';
import Select from 'react-select';
import {map, filter, find } from 'lodash';
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
    overflow: 'auto'
  }
};

const FILTER_VALUE_ERROR = 'error';
const FILTER_VALUE_WARN = 'warning';

const filterStatuses = [
  { value: FILTER_VALUE_ERROR, label: 'Virheet' },
  { value: FILTER_VALUE_WARN, label: 'Huomautukset' }
];

export class ValidationBar extends Component {
  constructor (props) {
    super(props);
    this.renderContent = this.renderContent.bind(this);
    this.onFilterStatusChange = this.onFilterStatusChange.bind(this);
    this.state = {
      filterStatus: []
    };
  }

  generateInvalidAttributes (validate, validateWarn, values) {
    const showInvalidAttributes = this.getFilterByStatus(FILTER_VALUE_ERROR);
    const showWarnAttributes = this.getFilterByStatus(FILTER_VALUE_WARN);
    const invalidAttributes = showInvalidAttributes ? validate(values, this.props.attributeTypes) : [];
    const warnAttributes = showWarnAttributes ? validateWarn(values, this.props.attributeTypes) : [];
    const mappedInvalidAttributes = map(invalidAttributes, (item, index) => (
      <div key={index} className='missing-attribute'>
        <i className='fa fa-times-circle'></i> {this.props.attributeTypes[item].name}
      </div>
    ));
    const mappedWarnAttributes = map(warnAttributes, (item, index) => (
      <div key={index} className='warn-attribute'>
        <i className='fa fa-exclamation-circle'></i> {this.props.attributeTypes[item].name}
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

  generateAttributeSection (validateRequired, validateWarn, elements) {
    const { attributeTypes } = this.props;
    const showInvalidAttributes = this.getFilterByStatus(FILTER_VALUE_ERROR);
    const showWarnAttributes = this.getFilterByStatus(FILTER_VALUE_WARN);
    const mappedAttributeSections = map(elements, (element, index) => {
      const invalidAttributes = showInvalidAttributes ? validateRequired(element, attributeTypes) : [];
      const warnAttributes = showWarnAttributes ? validateWarn(element, attributeTypes) : [];
      if (invalidAttributes.length || warnAttributes.length) {
        return (
          <div key={index}>
            <div className='parent-name'>{element.name}</div>
            <div className='missing-attributes'>
              {map(invalidAttributes, (item, key) => {
                return (
                  <div key={key} className='missing-attribute'>
                    <i className='fa fa-times-circle'></i> {attributeTypes[item].name}
                  </div>
                );
              })}
              {map(warnAttributes, (item, key) => {
                return (
                  <div key={key} className='warn-attribute'>
                    <i className='fa fa-exclamation-circle'></i> {attributeTypes[item].name}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    });

    return filter(mappedAttributeSections, (section) => (section !== undefined));
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
    return find(this.state.filterStatus, (item) => (item === filterValue)) ? true : false;
  }

  renderInvalidContent () {
    const { selectedTOS } = this.props;
    const invalidTOSAttributes = this.generateInvalidAttributes(validateTOS, validateTOSWarnings, selectedTOS);
    const invalidPhaseAttributes = this.generateAttributeSection(validatePhase, validatePhaseWarnings, selectedTOS.phases);
    const invalidActionAttributes = this.generateAttributeSection(validateAction, validateActionWarnings, selectedTOS.actions);
    const invalidRecordAttributes = this.generateAttributeSection(validateRecord, validateRecordWarnings, selectedTOS.records);

    if (invalidTOSAttributes ||
        invalidPhaseAttributes.length > 0 ||
        invalidActionAttributes.length > 0 ||
        invalidRecordAttributes.length > 0) {
      return (
        <div>
          <h4>Esitarkastus</h4>
          {invalidTOSAttributes &&
            <h5>Asian metatiedot</h5>}
          {invalidTOSAttributes}
          {invalidPhaseAttributes.length > 0 &&
            <h5>Käsittelyvaiheet</h5>}
          {invalidPhaseAttributes}
          {invalidActionAttributes.length > 0 &&
            <h5>Toimenpiteet</h5>}
          {invalidActionAttributes}
          {invalidRecordAttributes.length > 0 &&
            <h5>Asiakirjat</h5>}
          {invalidRecordAttributes}
        </div>
      );
    }
    return (
      <div className='no-missing-attributes fa fa-check-circle'/>
    );
  }

  renderContent () {
    const invalidContent = this.renderInvalidContent();
    return (
      <div className='sidebar-content'>
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
    const { children, selectedTOS } = this.props;
    const sidebarContent = selectedTOS.id ? this.renderContent() : <div/>;

    return (
      <div className='helerm-validation-bar'>
        <SideBar
          sidebar={sidebarContent}
          open={this.props.is_open}
          onSetOpen={() => this.props.setValidationVisibility(false)}
          pullRight={true}
          styles={styles}>
          {children}
        </SideBar>
      </div>
    );
  }
};

ValidationBar.propTypes = {
  attributeTypes: React.PropTypes.object.isRequired,
  children: React.PropTypes.array.isRequired,
  is_open: React.PropTypes.bool.isRequired,
  selectedTOS: React.PropTypes.object.isRequired,
  setValidationVisibility: React.PropTypes.func.isRequired
};

export default ValidationBar;
