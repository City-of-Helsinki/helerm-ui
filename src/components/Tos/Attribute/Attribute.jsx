/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable class-methods-use-this */
import React from 'react';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/creatable';
import classnames from 'classnames';
import { includes, forEach, find, map } from 'lodash';

import { resolveSelectValues, resolveReturnValues } from '../../../utils/helpers';
import getDisplayLabelForAttribute from '../../../utils/attributeHelper';
import './Attribute.scss';

class Attribute extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.submit = this.submit.bind(this);
    this.state = {
      attribute: this.props.attribute,
      mode: 'view',
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.state.attribute !== nextProps.attribute) {
      this.setState({ attribute: nextProps.attribute });
    }
  }

  onPromptCreate(label) {
    return `Lisää "${label}"`;
  }

  onChange(option) {
    if (option instanceof Array) {
      const values = option.length ? map(option, 'value') : null;
      this.setState({
        attribute: values && values.length === 1 ? values[0] : values,
      });
    } else {
      this.setState({
        attribute: option && option.value ? option.value : option,
      });
    }
  }

  activateEditMode() {
    if (this.state.mode !== 'edit') {
      this.changeState('edit');
    }
  }

  changeState(newState) {
    if (this.props.documentState === 'edit') {
      this.setState({ mode: newState });
    }
  }

  submit(event) {
    event.preventDefault();
    if (this.props.attributeIndex === '') {
      this.props.updateTypeSpecifier(this.state.attribute, this.props.elementId);
    } else if (this.props.attributeIndex === this.props.attribute) {
      this.props.updateType(this.state.attribute, this.props.elementId);
    } else if (this.props.tosAttribute) {
      this.props.updateFunctionAttribute(this.state.attribute, this.props.attributeIndex);
    } else {
      this.props.updateAttribute(this.state.attribute, this.props.attributeIndex, this.props.elementId);
    }

    setTimeout(() => this.changeState('view'), 150);
  }

  resolveBaseAttributePlaceholder() {
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

  resolvePlaceHolder(fieldName) {
    return `Valitse ${fieldName.toLowerCase()}...`;
  }

  generateAttributeInput(attribute, currentAttribute) {
    if (attribute.values && attribute.values.length) {
      const options = attribute.values.map((option) => ({
        value: option.value,
        label: getDisplayLabelForAttribute({
          attributeValue: option.value,
          id: option.id,
        }),
      }));
      if (currentAttribute) {
        const valueArray = currentAttribute instanceof Array ? currentAttribute : [currentAttribute];
        forEach(valueArray, (value) => {
          if (!find(options, (option) => option.value === value)) {
            options.push({
              label: value,
              value,
            });
          }
        });
      }
      const multi = includes(attribute.multiIn, this.props.parentType);
      return (
        <CreatableSelect
          openMenuOnFocus
          className='form-control edit-attribute__input'
          isClearable
          value={resolveSelectValues(options, this.state.attribute, multi)}
          onChange={(emittedValue) => this.onChange(resolveReturnValues(emittedValue, multi))}
          onBlur={this.submit}
          autoFocus
          options={options}
          isMulti={multi}
          placeholder={this.resolvePlaceHolder(attribute.name)}
          formatCreateLabel={this.onPromptCreate}
          delimiter=';'
        />
      );
    }
    if (attribute.values.length === 0 || attribute.type) {
      return (
        <form onSubmit={this.submit}>
          <input
            className='col-xs-6 form-control edit-attribute__input'
            value={this.state.attribute}
            onChange={({ target: { value } }) => this.onChange(value)}
            onBlur={this.submit}
            autoFocus
          />
        </form>
      );
    }
    return null;
  }

  generateBasicAttributeInput(type) {
    if (type === '') {
      return (
        <form onSubmit={this.submit}>
          <input
            className='col-xs-6 form-control edit-attribute__input'
            value={this.state.attribute || ''}
            onChange={({ target: { value } }) => this.onChange(value)}
            onBlur={this.submit}
            autoFocus
          />
        </form>
      );
    }
    return this.generateBasicAttributeDropdown(this.props.typeOptions, type);
  }

  generateBasicAttributeDropdown(typeOptions) {
    const options = [];
    Object.keys(typeOptions).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(typeOptions, key)) {
        options.push({
          label: typeOptions[key].value,
          value: typeOptions[key].value,
        });
      }
    });
    if (this.state.attribute) {
      const valueArray = this.state.attribute instanceof Array ? this.state.attribute : [this.state.attribute];
      forEach(valueArray, (value) => {
        if (!find(options, (option) => option.value === value)) {
          options.push({
            label: value,
            value,
          });
        }
      });
    }
    return (
      <form onSubmit={this.submit}>
        <CreatableSelect
          openMenuOnFocus
          isClearable
          autoFocus
          className='col-xs-6 form-control edit-attribute__input'
          value={resolveSelectValues(options, this.state.attribute)}
          onChange={(option) => this.onChange(option ? option.value : null)}
          onBlur={this.submit}
          options={options}
          placeholder={this.resolveBaseAttributePlaceholder() || 'Valitse...'}
          formatCreateLabel={this.onPromptCreate}
          delimiter=';'
        />
      </form>
    );
  }

  render() {
    const { attribute, attributeIndex, showAttributes, attributeKey, attributeTypes, editable, type } = this.props;
    let attributeValue;
    if (editable === false && attribute !== null) {
      return (
        <span className='list-group-item col-xs-6 attribute-basic'>
          <strong>{attributeIndex}:</strong>
          <div>{attribute || '\u00A0'}</div>
        </span>
      );
    }
    if (this.state.mode === 'view') {
      const resolveDisplayName = (attr) => {
        if (!attr) return '';
        return getDisplayLabelForAttribute({
          attributeValue: attr,
          identifier: attributeIndex,
        });
      };
      attributeValue = (
        <div className='table-value'>
          {this.state.attribute instanceof Array
            ? this.state.attribute.map((attr) => resolveDisplayName(attr)).join(', ')
            : resolveDisplayName(this.state.attribute)}
        </div>
      );
    }
    if (this.state.mode === 'edit') {
      if (type === 'attribute') {
        attributeValue = this.generateAttributeInput(attributeTypes[attributeIndex], this.state.attribute);
      }
      if (type === 'basic') {
        attributeValue = this.generateBasicAttributeInput(attributeIndex, attribute);
      }
    }

    if (attribute !== null || (attribute === null && type === 'basic')) {
      return (
        <span
          onClick={() => this.activateEditMode()}
          className={classnames([
            'list-group-item col-xs-6 attribute',
            showAttributes ? 'visible' : 'hidden',
            type === 'basic' ? 'attribute-basic' : '',
          ])}
        >
          <span className='table-key'>
            {attributeKey}
            {/* { type === 'attribute' &&
            this.props.documentState === 'edit' &&
            attributeTypes[attributeIndex].required &&
            <span className='fa-solid fa-asterisk required-asterisk'/>
            } */}
          </span>
          {attributeValue}
        </span>
      );
    }
    return null;
  }
}

Attribute.propTypes = {
  attribute: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  attributeIndex: PropTypes.string,
  attributeKey: PropTypes.string.isRequired,
  attributeTypes: PropTypes.object,
  documentState: PropTypes.string.isRequired,
  editable: PropTypes.bool.isRequired,
  elementId: PropTypes.string,
  parentType: PropTypes.string,
  showAttributes: PropTypes.bool.isRequired,
  tosAttribute: PropTypes.bool,
  type: PropTypes.string.isRequired,
  typeOptions: PropTypes.object,
  updateAttribute: PropTypes.func,
  updateFunctionAttribute: PropTypes.func,
  updateType: PropTypes.func,
  updateTypeSpecifier: PropTypes.func,
};

export default Attribute;
