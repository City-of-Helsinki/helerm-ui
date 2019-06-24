import React from 'react';
import PropTypes from 'prop-types';
import { find, includes, isArray, isEmpty, keys, map, sortBy } from 'lodash';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

import {
  BULK_UPDATE_CONVERSION_TYPES,
  BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES
} from '../../../../../config/constants';

import './Conversion.scss';

export class Conversion extends React.Component {
  constructor (props) {
    super(props);

    this.onChangeAttribute = this.onChangeAttribute.bind(this);
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeValidDate = this.onChangeValidDate.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onConvert = this.onConvert.bind(this);

    this.state = {
      attribute: props.conversion ? props.conversion.attribute : '',
      type: props.conversion ? props.conversion.type : 'function',
      value: props.conversion ? props.conversion.value : ''
    };
  }

  onChangeAttribute (option) {
    this.setState({
      attribute: option.value,
      value: ''
    });
  }

  onChangeType (option) {
    this.setState({
      type: option.value,
      attribute: '',
      value: ''
    });
  }

  onChangeValue (option) {
    if (isArray(option)) {
      const values = option.length ? map(option, 'value') : null;
      this.setState({
        value: values && values.length === 1 ? values[0] : values
      });
    } else {
      this.setState({
        value: option && option.value ? option.value : option
      });
    }
  }

  onChangeValidDate (date) {
    const value = date ? date.format('YYYY-MM-DD') : '';
    this.setState({ value });
  }

  onConvert () {
    const { attribute, type, value } = this.state;
    this.props.onConvert({ attribute, type, value });
  }

  getAttributeOptions (attributeTypes, type) {
    const attributes = [...BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES];
    return sortBy(keys(attributeTypes).reduce((acc, key) => {
      const attribute = attributeTypes[key];
      if (includes(attribute.allowedIn, type)) {
        acc.push({
          label: attribute.name,
          value: key
        });
      }
      return acc;
    }, attributes), ['label']);
  }

  getValueField (attributeTypes, type, attribute, value) {
    const attributeType = attributeTypes[attribute] || {};
    if (!isEmpty(attributeType) && !isEmpty(attributeType.values)) {
      const options = attributeType.values.map(item => ({
        label: item.value,
        value: item.value
      }));
      if (!find(options, { value })) {
        options.push({
          label: value,
          value
        });
      }
      if (includes(attributeType.allowValuesOutsideChoicesIn, type)) {
        return (
          <Select.Creatable
            autoBlur={false}
            disabled={isEmpty(attribute)}
            openOnFocus={true}
            clearable={true}
            value={value}
            multi={includes(attributeType.multiIn, attribute)}
            onChange={this.onChangeValue}
            autoFocus={true}
            options={options}
          />
        );
      }
      return (
        <Select
          autoBlur={false}
          disabled={isEmpty(attribute)}
          openOnFocus={true}
          clearable={true}
          value={value}
          onChange={this.onChangeValue}
          autoFocus={true}
          options={options}
          multi={false}
        />
      );
    } else if (includes(['valid_from', 'valid_to'], attribute)) {
      return (
        <div className='conversion-date-field'>
          <DatePicker
            autoFocus={true}
            dateFormat='D.M.YYYY'
            isClearable={true}
            locale='fi-fi'
            placeholderText='PP.KK.VVVV'
            selected={value ? moment(value) : null}
            onChange={this.onChangeValidDate}
          />
        </div>
      );
    }
    return (
      <input
        className='form-control'
        disabled={isEmpty(attribute)}
        value={value}
        onChange={({ target: { value } }) => this.onChangeValue(value)}
        autoFocus={true}
      />
    );
  }

  render () {
    const { attribute, type, value } = this.state;
    const { attributeTypes, disabled } = this.props;
    const attributes = this.getAttributeOptions(attributeTypes, type);

    return (
      <div className='conversion'>
        <div className='col-xs-3'>
          <span className='conversion-label'>Kohdistus</span>
          <Select
            autoBlur={false}
            openOnFocus={true}
            clearable={false}
            value={type}
            onChange={this.onChangeType}
            autoFocus={true}
            options={BULK_UPDATE_CONVERSION_TYPES}
          />
        </div>
        <div className='col-xs-3'>
          <span className='conversion-label'>Kenttä</span>
          <Select
            autoBlur={false}
            openOnFocus={true}
            clearable={false}
            value={attribute}
            onChange={this.onChangeAttribute}
            autoFocus={true}
            options={attributes}
            multi={false}
          />
        </div>
        <div className='col-xs-3'>
          <span className='conversion-label'>Uusi arvo</span>
          {this.getValueField(attributeTypes, type, attribute, value)}
        </div>
        <div className='col-xs-3 conversion-action'>
          <button
            className='btn btn-primary'
            disabled={isEmpty(attribute) || disabled}
            onClick={this.onConvert}>
            Muuta
          </button>
        </div>
      </div>
    );
  }
}

Conversion.propTypes = {
  attributeTypes: PropTypes.object,
  conversion: PropTypes.shape({
    attribute: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array
    ])
  }),
  disabled: PropTypes.bool.isRequired,
  onConvert: PropTypes.func.isRequired
};

export default Conversion;
