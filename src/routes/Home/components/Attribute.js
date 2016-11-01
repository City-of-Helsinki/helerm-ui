import React from 'react';
import './Attribute.scss';

export class Attribute extends React.Component {
  generateInput (attribute, currentAttribute) {
    if (attribute.values.length) {
      const options = attribute.values.map((option, index) => {
        if(option === currentAttribute){
          return <option key={index} value={option.value} selected='selected'>{option.value}</option>;
        } else {
          return <option key={index} value={option.value}>{option.value}</option>;
        }
      });
      return (
        <select className='col-xs-6'>
          { options }
        </select>
      );
    } else if (attribute.values === undefined) {
      return <input defaultValue={attribute.name} />;
    } else {
      return null;
    }
  }
  render () {
    const { attribute, attributeIndex } = this.props;
    if (this.props.mode === 'view') {
      return (
        <div className='attribute col-xs-12 col-md-6 col-lg-4'>
          <span className='col-xs-6 table-key'>
            {this.props.attributes[attributeIndex].name}
          </span>
          <span className='col-xs-6'>
            {attribute}
          </span>
        </div>
      );
    }
    if (this.props.mode === 'edit') {
      const inputField = this.generateInput(this.props.attributes[attributeIndex], attribute);
      return (
        <div className='attribute col-xs-12 col-md-6 col-lg-4'>
          <span className='col-xs-6 table-key'>
            {this.props.attributes[attributeIndex].name}
          </span>
          { inputField }
        </div>
      );
    }
  }
}

Attribute.propTypes = {
  attribute: React.PropTypes.string.isRequired,
  attributeIndex: React.PropTypes.string.isRequired,
  attributes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired,
  mode: React.PropTypes.string.isRequired
};

export default Attribute;
