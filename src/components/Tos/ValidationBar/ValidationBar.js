import React, { Component } from 'react';
import SideBar from 'react-sidebar';
import { generateValidation } from '../ViewTos/ViewTos';

export class ValidationBar extends Component {
  constructor (props) {
    super(props);
    this.renderContent = this.renderContent.bind(this);
  }

  render () {
    const { children } = this.props;
    const empty = () => <div/>;
    console.log(typeof empty);
    return (
      <div>
        <SideBar
          sidebar={generateValidation || empty}>
          {children}
        </SideBar>
      </div>
    );
  }
};

ValidationBar.propTypes = {
  children: React.PropTypes.array.isRequired
};

export default ValidationBar;
