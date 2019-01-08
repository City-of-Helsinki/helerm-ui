import React from 'react';
import Select from 'react-select';
import classnames from 'classnames';
import { includes, forEach, find, map } from 'lodash';

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

  onChange (option) {
    if (option instanceof Array) {
      const values = option.length ? map(option, 'value') : null;
      this.setState({
        attribute: values && values.length === 1 ? values[0] : values
      });
    } else {
      this.setState({
        attribute: option && option.value ? option.value : option
      });
    }
  }

  changeState (newState) {
    if (this.props.documentState === 'edit') {
      this.setState({ mode: newState });
    }
  }

  submit (event) {
    event.preventDefault();
    if (this.props.attributeIndex === '') {
      this.props.updateTypeSpecifier(
        this.state.attribute,
        this.props.elementId
      );
    } else if (this.props.attributeIndex === this.props.attribute) {
      this.props.updateType(this.state.attribute, this.props.elementId);
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

    setTimeout(() => this.changeState('view'), 150);
  }

  resolveBaseAttributePlaceholder () {
    const { parentType } = this.props;

    switch (parentType) {
      case 'phase':
        return 'Valitse käsittelyvaihe...';
      // case 'action':
      //   return '';
      case 'record':
        return 'Valitse asiakirjatyyppi...';
      default:
        return null;
    }
  }

  resolvePlaceHolder (fieldName) {
    return `Valitse ${fieldName.toLowerCase()}...`;
  }

  onPromptCreate (label) {
    return `Lisää "${label}"`;
  }

  generateAttributeInput (attribute, currentAttribute) {
    if (attribute.values && attribute.values.length) {
      const options = attribute.values.map(option => {
        return {
          value: option.value,
          label: option.value
        };
      });
      if (currentAttribute) {
        const valueArray =
          currentAttribute instanceof Array
            ? currentAttribute
            : [currentAttribute];
        forEach(valueArray, function (value) {
          if (
            !find(options, function (option) {
              return option.value === value;
            })
          ) {
            options.push({
              label: value,
              value: value
            });
          }
        });
      }
      return (
        <Select.Creatable
          autoBlur={false}
          openOnFocus={true}
          className='form-control edit-attribute__input'
          clearable={true}
          value={this.state.attribute}
          onChange={this.onChange}
          onBlur={this.submit}
          autoFocus={true}
          options={options}
          multi={includes(attribute.multiIn, this.props.parentType)}
          placeholder={this.resolvePlaceHolder(attribute.name)}
          promptTextCreator={this.onPromptCreate}
          delimiter=';'
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
            value={this.state.attribute || ''}
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
          label: typeOptions[key].value,
          value: typeOptions[key].value
        });
      }
    }
    if (this.state.attribute) {
      const valueArray =
        this.state.attribute instanceof Array
          ? this.state.attribute
          : [this.state.attribute];
      forEach(valueArray, function (value) {
        if (
          !find(options, function (option) {
            return option.value === value;
          })
        ) {
          options.push({
            label: value,
            value: value
          });
        }
      });
    }

    return (
      <form onSubmit={this.submit}>
        <Select.Creatable
          autoBlur={false}
          openOnFocus={true}
          className='col-xs-6 form-control edit-attribute__input'
          clearable={true}
          value={this.state.attribute}
          onChange={option => this.onChange(option ? option.value : null)}
          onBlur={this.submit}
          autoFocus={true}
          options={options}
          placeholder={this.resolveBaseAttributePlaceholder() || 'Valitse...'}
          promptTextCreator={this.onPromptCreate}
          delimiter=';'
        />
      </form>
    );
  }

  render () {
    const {
      attribute,
      attributeIndex,
      showAttributes,
      attributeKey,
      attributeTypes,
      editable,
      type
    } = this.props;
    let attributeValue;
    if (editable === false && attribute !== null) {
      return (
        <a className='list-group-item col-xs-6 attribute-basic'>
          <strong>{attributeIndex}:</strong>
          <div>{attribute || '\u00A0'}</div>
        </a>
      );
    }
    if (this.state.mode === 'view') {
      attributeValue = (
        <div className='table-value'>
          {this.state.attribute instanceof Array
            ? this.state.attribute.join(', ')
            : this.state.attribute}
        </div>
      );
    }
    if (this.state.mode === 'edit') {
      if (type === 'attribute') {
        attributeValue = this.generateAttributeInput(
          attributeTypes[attributeIndex],
          this.state.attribute
        );
      }
      if (type === 'basic') {
        attributeValue = this.generateBasicAttributeInput(
          attributeIndex,
          attribute
        );
      }
    }

    if (attribute !== null || (attribute === null && type === 'basic')) {
      return (
        <a
          onClick={() => this.activateEditMode()}
          className={
            classnames([
              'list-group-item col-xs-6 attribute',
              showAttributes ? 'visible' : 'hidden',
              type === 'basic' ? 'attribute-basic' : ''
            ])
          }
        >
          <span className='table-key'>
            {attributeKey}
            {/* { type === 'attribute' &&
            this.props.documentState === 'edit' &&
            attributeTypes[attributeIndex].required &&
            <span className='fa fa-asterisk required-asterisk'/>
            } */}
          </span>
          {attributeValue}
        </a>
      );
    }
    return null;
  }
}

Attribute.propTypes = {
  attribute: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.array
  ]),
  attributeIndex: React.PropTypes.string,
  attributeKey: React.PropTypes.string.isRequired,
  attributeTypes: React.PropTypes.object,
  documentState: React.PropTypes.string.isRequired,
  editable: React.PropTypes.bool.isRequired,
  elementId: React.PropTypes.string,
  parentType: React.PropTypes.string,
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
