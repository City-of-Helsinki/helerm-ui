/* eslint-disable import/no-cycle */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable class-methods-use-this */
import React from 'react';
import PropTypes from 'prop-types';
import { find, includes, isArray, isEmpty, keys, map, sortBy } from 'lodash';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

import { BULK_UPDATE_CONVERSION_TYPES, BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES } from '../../../../constants';
import './Conversion.scss';
import { resolveReturnValues, resolveSelectValues } from '../../../../utils/helpers';
import { getDisplayLabelForAttribute } from '../../../../utils/attributeHelper';

class Conversion extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeAttribute = this.onChangeAttribute.bind(this);
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeValidDate = this.onChangeValidDate.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onConvert = this.onConvert.bind(this);

    this.state = {
      attribute: props.conversion ? props.conversion.attribute : '',
      type: props.conversion ? props.conversion.type : 'function',
      value: props.conversion ? props.conversion.value : '',
    };
  }

  onChangeAttribute(option) {
    this.setState({
      attribute: option.value,
      value: '',
    });
  }

  onChangeType(option) {
    this.setState({
      type: option.value,
      attribute: '',
      value: '',
    });
  }

  onChangeValue(option) {
    if (isArray(option)) {
      const values = option.length ? map(option, 'value') : null;
      this.setState({
        value: values && values.length === 1 ? values[0] : values,
      });
    } else {
      this.setState({
        value: option?.value ? option?.value : option,
      });
    }
  }

  onChangeValidDate(date) {
    const value = date ? moment(date).format('YYYY-MM-DD') : '';
    this.setState({ value });
  }

  onConvert() {
    const { attribute, type, value } = this.state;
    this.props.onConvert({ attribute, type, value });
  }

  getAttributeOptions(attributeTypes, type) {
    const attributes = [...BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES];
    return sortBy(
      keys(attributeTypes).reduce((acc, key) => {
        const attribute = attributeTypes[key];
        if (includes(attribute.allowedIn, type)) {
          acc.push({
            label: attribute.name,
            value: key,
          });
        }
        return acc;
      }, attributes),
      ['label'],
    );
  }

  getValueField(attributeTypes, type, attribute, value) {
    const attributeType = attributeTypes[attribute] || {};
    if (!isEmpty(attributeType) && !isEmpty(attributeType.values)) {
      const options = attributeType.values.map((item) => ({
        label: getDisplayLabelForAttribute({
          attributeValue: item.value,
          identifier: attribute,
        }),
        value: item.value,
      }));
      if (!find(options, { value }) && !isEmpty(value)) {
        options.push({
          label: getDisplayLabelForAttribute({
            attributeValue: value,
            identifier: attribute,
          }),
          value,
        });
      }
      if (includes(attributeType.allowValuesOutsideChoicesIn, type)) {
        const multi = includes(attributeType.multiIn, attribute);
        return (
          <CreatableSelect
            isDisabled={isEmpty(attribute)}
            isClearable
            value={resolveSelectValues(options, value, multi) || ''}
            isMulti={multi}
            onChange={(emittedValue) => this.onChangeValue(resolveReturnValues(emittedValue, multi))}
            autoFocus
            options={options}
          />
        );
      }
      return (
        <Select
          className='Select'
          autoFocus
          isDisabled={isEmpty(attribute)}
          isClearable
          value={options.find((o) => o.value === value)}
          onChange={this.onChangeValue}
          options={options}
        />
      );
    }
    if (includes(['valid_from', 'valid_to'], attribute)) {
      return (
        <div className='conversion-date-field'>
          <DatePicker
            autoFocus
            dateFormat='dd.MM.yyyy'
            showYearDropdown
            dateFormatCalendar='MMMM'
            isClearable
            placeholderText='PP.KK.VVVV'
            selected={value ? moment(value).toDate() : null}
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
        onChange={({ target }) => this.onChangeValue(target.value)}
        autoFocus
      />
    );
  }

  render() {
    const { attribute, type, value } = this.state;
    const { attributeTypes, disabled } = this.props;
    const attributes = this.getAttributeOptions(attributeTypes, type);
    return (
      <div className='conversion'>
        <div className='col-xs-3'>
          <span className='conversion-label'>Kohdistus</span>
          <Select
            className='Select'
            isClearable={false}
            value={BULK_UPDATE_CONVERSION_TYPES.find((convType) => convType.value === type)}
            onChange={this.onChangeType}
            options={BULK_UPDATE_CONVERSION_TYPES}
          />
        </div>
        <div className='col-xs-3'>
          <span className='conversion-label'>Kenttä</span>
          <Select
            className='Select'
            isClearable={false}
            autoFocus
            value={attributes.find((a) => a.value === attribute) || ''}
            onChange={this.onChangeAttribute}
            options={attributes}
          />
        </div>
        <div className='col-xs-3'>
          <span className='conversion-label'>Uusi arvo</span>
          {this.getValueField(attributeTypes, type, attribute, value)}
        </div>
        <div className='col-xs-3 conversion-action'>
          <button
            type='button'
            className='btn btn-primary'
            disabled={isEmpty(attribute) || disabled}
            onClick={this.onConvert}
          >
            Muuta
          </button>
        </div>
      </div>
    );
  }
}

Conversion.propTypes = {
  attributeTypes: PropTypes.object.isRequired,
  conversion: PropTypes.shape({
    attribute: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  }),
  disabled: PropTypes.bool.isRequired,
  onConvert: PropTypes.func.isRequired,
};

export default Conversion;
