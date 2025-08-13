import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { find, includes, isArray, isEmpty, keys, map, sortBy } from 'lodash';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

import { BULK_UPDATE_CONVERSION_TYPES, BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES } from '../../../constants';
import './Conversion.scss';
import { resolveReturnValues, resolveSelectValues } from '../../../utils/helpers';
import { getDisplayLabelForAttribute } from '../../../utils/attributeHelper';

const Conversion = ({ attributeTypes, conversion, disabled, onConvert }) => {
  const [attribute, setAttribute] = useState(conversion?.attribute || '');
  const [type, setType] = useState(conversion?.type || 'function');
  const [value, setValue] = useState(conversion?.value || '');

  const onChangeAttribute = useCallback((option) => {
    setAttribute(option.value);
    setValue('');
  }, []);

  const onChangeType = useCallback((option) => {
    setType(option.value);
    setAttribute('');
    setValue('');
  }, []);

  const onChangeValue = useCallback((option) => {
    if (isArray(option)) {
      const values = option.length ? map(option, 'value') : null;
      setValue(values && values.length === 1 ? values[0] : values);
    } else {
      setValue(option?.value ? option?.value : option);
    }
  }, []);

  const onChangeValidDate = useCallback((date) => {
    const newValue = date ? moment(date).format('YYYY-MM-DD') : '';
    setValue(newValue);
  }, []);

  const handleConvert = useCallback(() => {
    onConvert({ attribute, type, value });
  }, [attribute, type, value, onConvert]);

  const getAttributeOptions = useCallback((attributeTypes, type) => {
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
  }, []);

  const getValueField = useCallback(
    (attributeTypes, type, attribute, value) => {
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
              onChange={(emittedValue) => onChangeValue(resolveReturnValues(emittedValue, multi))}
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
            onChange={onChangeValue}
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
              onChange={onChangeValidDate}
            />
          </div>
        );
      }
      return (
        <input
          className='form-control'
          disabled={isEmpty(attribute)}
          value={value}
          onChange={({ target }) => onChangeValue(target.value)}
          autoFocus
        />
      );
    },
    [onChangeValue, onChangeValidDate],
  );

  const attributes = getAttributeOptions(attributeTypes, type);

  return (
    <div className='conversion'>
      <div className='col-xs-3'>
        <span className='conversion-label'>Kohdistus</span>
        <Select
          className='Select'
          isClearable={false}
          value={BULK_UPDATE_CONVERSION_TYPES.find((convType) => convType.value === type)}
          onChange={onChangeType}
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
          onChange={onChangeAttribute}
          options={attributes}
        />
      </div>
      <div className='col-xs-3'>
        <span className='conversion-label'>Uusi arvo</span>
        {getValueField(attributeTypes, type, attribute, value)}
      </div>
      <div className='col-xs-3 conversion-action'>
        <button
          type='button'
          className='btn btn-primary'
          disabled={isEmpty(attribute) || disabled}
          onClick={handleConvert}
        >
          Muuta
        </button>
      </div>
    </div>
  );
};

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
