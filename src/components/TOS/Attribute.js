import React from 'react';
import Select from 'react-select';
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

  activateEditMode () {
    if (this.state.mode !== 'edit') {
      this.changeState('edit');
    }
  }

  onChange (val) {
    this.setState({ attribute: val });
  }

  changeState (newState) {
    if (this.props.documentState === 'edit') {
      this.setState({ mode: newState });
    }
  }

  submit (event) {
    event.preventDefault();
    if (this.props.attributeIndex === '') {
      this.props.updateRecordName(this.state.attribute, this.props.recordId);
    } else if (this.props.attributeIndex === this.props.attribute) {
      this.props.updateRecordType(
        this.state.attribute,
        this.props.recordId
      );
    } else if (this.props.tosAttribute) {
      this.props.updateTOSAttribute(
        this.state.attribute,
        this.props.attributeIndex
      );
    } else {
      this.props.updateRecordAttribute(
        this.state.attribute,
        this.props.attributeIndex,
        this.props.recordId
      );
    }

    setTimeout(() => this.changeState('view'),
      150
    );
  }

  generateAttributeInput (attribute, currentAttribute) {
    if (attribute.values && attribute.values.length) {
      const options = attribute.values.map(option => {
        return {
          value: option.value,
          label: option.value
        };
      });
      return (
        <Select
          autoBlur={false}
          openOnFocus={true}
          className='form-control edit-record__input'
          clearable={false}
          value={this.state.attribute}
          onChange={({ value }) => this.onChange(value)}
          onBlur={this.submit}
          autofocus={true}
          options={options}
        />
      );
    } else if (attribute.values.length === 0 || attribute.type) {
      return (
        <form onSubmit={this.submit}>
          <input
            className='col-xs-6 form-control edit-record__input'
            value={this.state.attribute}
            onChange={({ target: { value } }) => this.onChange(value)}
            onBlur={this.submit}
            autoFocus={true}
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
            onChange={({ target: { value } }) => this.onChange(value)}
            onBlur={this.submit}
            autoFocus={true}
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
        options.push({
          label: recordTypes[key],
          value: recordTypes[key]
        });
      }
    }
    return (
      <form onSubmit={this.submit}>
        <Select
          autoBlur={false}
          openOnFocus={true}
          className='col-xs-6 form-control edit-record__input'
          clearable={false}
          value={this.state.attribute}
          onChange={({ value }) => this.onChange(value)}
          onBlur={this.submit}
          autofocus={true}
          options={options}
        />
      </form>
    );
  }

  render () {
    const { attribute, attributeIndex, showAttributes, attributeKey, attributeTypes, editable, type } = this.props;
    let attributeValue;
    if (editable === false && attribute !== null) {
      return (
        <a className='list-group-item col-xs-6'>
          <strong>{attributeIndex}:</strong>
          <div>{attribute}</div>
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

    if (attribute !== null) {
      return (
        <a
          onClick={() => this.activateEditMode()}
          className={'list-group-item col-xs-6 attribute ' + (showAttributes ? 'visible' : 'hidden')}>
          <span className='table-key'>
            { attributeKey }
            { type === 'attribute' &&
            this.props.documentState === 'edit' &&
            attributeTypes[attributeIndex].required &&
            <span className='fa fa-asterisk required-asterisk'/>
            }
          </span>
          { attributeValue }
        </a>
      );
    }
    return null;
  }
}

Attribute.propTypes = {
  attribute: React.PropTypes.string,
  attributeIndex: React.PropTypes.string,
  attributeKey: React.PropTypes.string.isRequired,
  attributeTypes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired,
  editable: React.PropTypes.bool.isRequired,
  mode: React.PropTypes.string.isRequired,
  recordId: React.PropTypes.string,
  showAttributes: React.PropTypes.bool.isRequired,
  tosAttribute: React.PropTypes.bool,
  type: React.PropTypes.string.isRequired,
  updateRecordAttribute: React.PropTypes.func,
  updateRecordName: React.PropTypes.func,
  updateRecordType: React.PropTypes.func,
  updateTOSAttribute: React.PropTypes.func
};

export default Attribute;
