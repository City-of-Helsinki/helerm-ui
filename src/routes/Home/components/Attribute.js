import React from 'react';

export class Attribute extends React.Component {
  render () {
    const { attribute, attributeIndex } = this.props;
    return (
      <div className='attribute col-xs-12'>
        <span className='col-xs-6'>
          {this.props.attributes[attributeIndex].name}
        </span>
        <span className='col-xs-6'>
          {attribute}
        </span>
      </div>
    );
  }
}

Attribute.propTypes = {
  attribute: React.PropTypes.string.isRequired,
  attributeIndex: React.PropTypes.string.isRequired,
  attributes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired
};

export default Attribute;
