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
      mode: 'view'
    };
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.attribute !== nextProps.attribute) {
      this.setState({ attribute: nextProps.attribute });
    }
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
      this.props.updateTypeSpecifier(this.state.attribute, this.props.elementId);
    } else if (this.props.attributeIndex === this.props.attribute) {
      this.props.updateType(
        this.state.attribute,
        this.props.elementId
      );
    } else if (this.props.tosAttribute) {
      this.props.updateFunctionAttribute(
        this.state.attribute,
        this.props.attributeIndex
      );
    } else {
      this.props.updateAttribute(
        this.state.attribute,
        this.props.attributeIndex,
        this.props.elementId
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
          className='form-control edit-attribute__input'
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
            className='col-xs-6 form-control edit-attribute__input'
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

  generateBasicAttributeInput (type, name) {
    if (type === '') {
      return (
        <form onSubmit={this.submit}>
          <input
            className='col-xs-6 form-control edit-attribute__input'
            value={this.state.attribute}
            onChange={({ target: { value } }) => this.onChange(value)}
            onBlur={this.submit}
            autoFocus={true}
          />
        </form>
      );
    } else {
      return this.generateBasicAttributeDropdown(this.props.typeOptions, type);
    }
  }

  generateBasicAttributeDropdown (typeOptions, activeElement) {
    const options = [];
    for (const key in typeOptions) {
      if (typeOptions.hasOwnProperty(key)) {
        options.push({
          label: typeOptions[key].name,
          value: typeOptions[key].name
        });
      }
    }
    return (
      <form onSubmit={this.submit}>
        <Select
          autoBlur={false}
          openOnFocus={true}
          className='col-xs-6 form-control edit-attribute__input'
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
    console.log('Rendered Attribute component');
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
      if (type === 'basic') {
        attributeValue = this.generateBasicAttributeInput(attributeIndex, attribute);
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
  attributeTypes: React.PropTypes.object,
  documentState: React.PropTypes.string.isRequired,
  editable: React.PropTypes.bool.isRequired,
  elementId: React.PropTypes.string,
  showAttributes: React.PropTypes.bool.isRequired,
  tosAttribute: React.PropTypes.bool,
  type: React.PropTypes.string.isRequired,
  typeOptions: React.PropTypes.object,
  updateAttribute: React.PropTypes.func,
  updateFunctionAttribute: React.PropTypes.func,
  updateType: React.PropTypes.func,
  updateTypeSpecifier: React.PropTypes.func
};

export default Attribute;
