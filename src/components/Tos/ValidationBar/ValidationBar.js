import React, { Component } from 'react';
import SideBar from 'react-sidebar';
import map from 'lodash/map';
import './ValidationBar.scss';

import { validateTOS, validateRecord } from '../../../utils/validators';

const styles = {
  sidebar: {
    width: 256,
    height: '100%',
    padding: '10px 0 0 20px',
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
    height: '100%'
  }
};

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

  generateAttributeSection (validate, element, index) {
    const invalidAttributes = validate(element, this.props.attributeTypes);

    if (invalidAttributes.length) {
      return (
        <div key={index}>
          <div className='parent-name'>{element.name}</div>
          <div className='missing-attributes'>
            {map(invalidAttributes, (item) => (
              <div className='missing-attribute'>
                {'• '}{item}
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  renderContent () {
    const { selectedTOS } = this.props;

    const invalidTOSAttributes = this.generateInvalidAttributes(validateTOS, selectedTOS);
    const invalidPhaseAttributes = [];
    const invalidActionAttributes = [];
    const invalidRecordAttributes = map(selectedTOS.records, (record, index) => (
        this.generateAttributeSection(validateRecord, record, index)
      )
    );

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
