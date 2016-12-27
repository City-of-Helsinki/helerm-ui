import React from 'react';
import './Attribute.scss';

export class Attribute extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.submit = this.submit.bind(this);
    this.state = {
      attribute: this.props.attribute,
      mode: this.props.mode
    };
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.mode) {
      this.setState({ mode: nextProps.mode });
    }
    if (nextProps.attribute) {
      this.setState({ attribute: nextProps.attribute });
    }
  }
  activateEditMode () {
    if (this.state.mode !== 'edit') {
      this.changeState('edit');
    }
  }
  onChange (event) {
    this.setState({ attribute: event.target.value });
  }
  changeState (newState) {
    if (this.props.documentState === 'edit') {
      this.setState({ mode: newState });
    }
  }
  submit (event) {
    event.preventDefault();
    setTimeout(() => this.changeState('view'),
      150
    );
  }
  generateAttributeInput (attribute, currentAttribute) {
    if (attribute.values && attribute.values.length) {
      const options = attribute.values.map((option, index) => {
        return <option key={index} value={option.value}>{option.value}</option>;
      });
      return (
        <select
          className='form-control edit-record__input'
          value={this.state.attribute}
          onChange={this.onChange}
          onBlur={this.submit}
          autoFocus>
          <option value={null}>[ Tyhjä ]</option>
          { options }
        </select>
      );
    } else if (attribute.values.length === 0 || attribute.type) {
      return (
        <form onSubmit={this.submit}>
          <input
            className='col-xs-6 form-control edit-record__input'
            value={this.state.attribute}
            onChange={this.onChange}
            onBlur={this.submit}
            autoFocus
          />
        </form>
      );
    } else {
      return null;
    }
  }
  generateRecordInput (type, name) {
    if (type === '') {
      return (
        <form onSubmit={this.submit}>
          <input
            className='col-xs-6 form-control edit-record__input'
            value={this.state.attribute}
            onChange={this.onChange}
            onBlur={this.submit}
            autoFocus
          />
        </form>
      );
    } else {
      return this.generateRecordDropdown(this.props.attributeTypes, type);
    }
  }
  generateRecordDropdown (recordTypes, activeRecord) {
    const options = [];
    for (const key in recordTypes) {
      if (recordTypes.hasOwnProperty(key)) {
        options.push(<option key={key} value={recordTypes[key]}>{recordTypes[key]}</option>);
      }
    }
    return (
      <form onSubmit={this.submit}>
        <select
          className='col-xs-6 form-control edit-record__input'
          value={this.state.attribute}
          onChange={this.onChange}
          onBlur={this.submit}
          autoFocus>
          <option value={null}>[ Tyhjä ]</option>
          {options}
        </select>
      </form>
    );
  }
  render () {
    const { attribute, attributeIndex, showAttributes, attributeKey, attributeTypes, editable, type } = this.props;
    let attributeValue;
    if (editable === false) {
      return (
        <a className='list-group-item col-xs-6'>
          <strong>{attributeIndex}:</strong> <div>{attribute}</div>
        </a>
      );
    }
    if (this.state.mode === 'view') {
      attributeValue = <div className='table-value'>{this.state.attribute}</div>;
    }
    if (this.state.mode === 'edit') {
      if (type === 'attribute') {
        attributeValue = this.generateAttributeInput(attributeTypes[attributeIndex], attribute);
      }
      if (type === 'record') {
        attributeValue = this.generateRecordInput(attributeIndex, attribute);
      }
    }
    return (
      <a
        onClick={() => this.activateEditMode()}
        className={'list-group-item col-xs-6 attribute ' + (showAttributes ? 'visible' : 'hidden')}>
        <span className='table-key'>
          { attributeKey }
          { type === 'attribute' &&
            this.props.documentState === 'edit' &&
            attributeTypes[attributeIndex].required &&
            <span className='fa fa-asterisk required-asterisk' />
          }
        </span>
        { attributeValue }
      </a>
    );
  }
}

Attribute.propTypes = {
  attribute: React.PropTypes.string,
  attributeIndex: React.PropTypes.string.isRequired,
  attributeKey: React.PropTypes.string.isRequired,
  attributeTypes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired,
  showAttributes: React.PropTypes.bool.isRequired,
  mode: React.PropTypes.string.isRequired,
  editable: React.PropTypes.bool.isRequired,
  type: React.PropTypes.string.isRequired
};

export default Attribute;
