import React, { Component } from 'react';
import SideBar from 'react-sidebar';
import map from 'lodash/map';

import { validateTOS } from '../../../utils/validators';
// import { validateRecord } from '../../../../utils/validators';

export class ValidationBar extends Component {
  constructor (props) {
    super(props);
    this.renderContent = this.renderContent.bind(this);
  }

  renderContent () {
    const { attributeTypes, selectedTOS } = this.props;
    const invalidTOSAttributes = map(
      validateTOS(selectedTOS, attributeTypes), (item, index) => (
        <div key={index}>
          {item}
        </div>
      )
    );
    // const invalidRecordAttributes = map();
    console.log(invalidTOSAttributes);
    return (
      <div>
        <div>Puuttuvat metatiedot</div>
        {invalidTOSAttributes}
      </div>
    );
  }

  render () {
    const { children, selectedTOS } = this.props;
    const sidebarContent = selectedTOS.id ? this.renderContent() : <div/>;

    return (
      <div>
        <SideBar
          sidebar={sidebarContent}>
          {children}
        </SideBar>
      </div>
    );
  }
};

ValidationBar.propTypes = {
  attributeTypes: React.PropTypes.object.isRequired,
  children: React.PropTypes.array.isRequired,
  selectedTOS: React.PropTypes.object.isRequired
};

export default ValidationBar;
