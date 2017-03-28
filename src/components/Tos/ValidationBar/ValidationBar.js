import React, { Component } from 'react';
import SideBar from 'react-sidebar';
import map from 'lodash/map';

import { validateTOS, validateRecord } from '../../../utils/validators';

export class ValidationBar extends Component {
  constructor (props) {
    super(props);
    this.renderContent = this.renderContent.bind(this);
  }

  generateInvalidAttributes (validate, values) {
    const mappedInvalidAttributes = map(validate(values, this.props.attributeTypes), (item, index) => (
      <div key={index} className='missing-attribute'>
        {'• '}{item}
      </div>
    ));

    return (
      <div className='missing-attributes'>
        {mappedInvalidAttributes}
      </div>
    );
  }

  renderContent () {
    const { selectedTOS } = this.props;

    const invalidTOSAttributes = this.generateInvalidAttributes(validateTOS, selectedTOS);
    const invalidPhaseAttributes = [];
    const invalidActionAttributes = [];
    const invalidRecordAttributes = map(selectedTOS.records, (record, index) => (
      <div key={index}>
        <div className='record-name'>{record.name}</div>
        {this.generateInvalidAttributes(validateRecord, record)}
      </div>
      )
    );

    console.log(invalidTOSAttributes);
    return (
      <div className='sidebar-content'>
        <h4>Puuttuvat metatiedot</h4>
        {invalidTOSAttributes.length !== 0 &&
          <h5>TOS-metatiedot</h5>}
        {invalidTOSAttributes}
        {invalidPhaseAttributes.length !== 0 &&
          <h5>Käsittelyvaiheet</h5>}
        {invalidPhaseAttributes}
        {invalidActionAttributes.length !== 0 &&
          <h5>Toimenpiteet</h5>}
        {invalidActionAttributes}
        {invalidRecordAttributes.length !== 0 &&
          <h5>Asiakirjat</h5>}
        {invalidRecordAttributes}
      </div>
    );
  }

  render () {
    const { children, selectedTOS } = this.props;
    const sidebarContent = selectedTOS.id ? this.renderContent() : <div/>;

    return (
      <div>
        <SideBar
          sidebar={sidebarContent}
          open={this.props.is_open}
          pullRight={true}>
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
  selectedTOS: React.PropTypes.object.isRequired
};

export default ValidationBar;
