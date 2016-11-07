import React from 'react';
import './Attribute.scss';

export class Attribute extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.state = {
      attribute: ''
    };
  }
  componentWillMount () {
    this.setState({ attribute: this.props.attribute });
  }
  onChange (event) {
    this.setState({ attribute: event.target.value });
  }
  generateInput (attribute, currentAttribute) {
    if (attribute.values.length) {
      const options = attribute.values.map((option, index) => {
        return <option key={index} value={option.value}>{option.value}</option>;
      });
      return (
        <select className='form-control' value={this.state.attribute} onChange={this.onChange}>
          { options }
        </select>
      );
    } else if (attribute.values.length === 0) {
      return (
        <input
          className='form-control'
          value={this.state.attribute}
          onChange={this.onChange}
        />
      );
    } else {
      return null;
    }
  }
  render () {
    const { attribute, attributeIndex, showAttributes } = this.props;
    let attributeValue;
    if (this.props.mode === 'view') {
      attributeValue = <div className=''>{this.state.attribute}</div>;
    }
    if (this.props.mode === 'edit') {
      attributeValue = this.generateInput(this.props.attributes[attributeIndex], attribute);
    }
    return (
      <div className={'attribute col-xs-12 col-md-6 col-lg-4 ' + (showAttributes ? 'visible' : 'hidden')}>
        <span className='table-key'>
          {this.props.attributes[attributeIndex].name}
        </span>
        { attributeValue }
      </div>
    );
  }
}

Attribute.propTypes = {
  attribute: React.PropTypes.string.isRequired,
  attributeIndex: React.PropTypes.string.isRequired,
  attributes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired,
  showAttributes: React.PropTypes.bool.isRequired,
  mode: React.PropTypes.string.isRequired
};

export default Attribute;
