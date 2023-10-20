/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
import React from 'react';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/creatable';
import { map, difference } from 'lodash';

import { resolveReturnValues, resolveSelectValues } from '../../../utils/helpers';

function resolvePlaceholder(type, formType) {
  switch (type) {
    case 'phase':
      return 'Valitse käsittelyvaihe...';
    case 'form':
      if (formType) {
        if (formType === 'phase') {
          return 'Valitse käsittelyvaihe...';
        }
        if (formType === 'record') {
          return 'Valitse asiakirjatyyppi...';
        }
      }
      break;
    default:
      return null;
  }
}

function onPromptCreate(label) {
  return `Lisää "${label}"`;
}

function getMissingValueOptions(value, options) {
  const valueArray = value instanceof Array ? value : [value];
  const optionValues = map(options, 'value');
  return difference(valueArray, optionValues);
}

const DropdownInput = ({
  keyValue,
  type,
  formType,
  disabled = false,
  multi = false,
  valueState,
  options,
  onChange,
  onInputChange,
  onSubmit,
  inputClassName = 'input-type form-control col-xs-11',
  selectClassName = `form-control edit-${type}-type__input`,
}) => {
  const optionsArray = [];
  const validation = () => {
    if (options instanceof Object) {
      if (options instanceof Array) {
        return options.length === 0;
      }
      return Object.keys(options).length === 0;
    }
  };

  if (validation()) {
    if (type === 'form') {
      const onFormInputChange = (event) => {
        onInputChange(event.target.value, keyValue, 'value');
      };
      return (
        <input
          className={inputClassName}
          value={valueState || ''}
          onChange={onFormInputChange}
          onBlur={onSubmit}
          placeholder='Tyyppi'
        />
      );
    }
    return (
      <input className={inputClassName} value={valueState || ''} autoFocus onChange={onInputChange} onBlur={onSubmit} />
    );
  }
  const onFieldChange = (option) => {
    if (option instanceof Array) {
      const values = option.length ? map(option, 'value') : null;
      const value = values && values.length === 1 ? values[0] : values;
      type === 'form' ? onChange(value, keyValue, 'value') : onChange(value);
    } else {
      type === 'form'
        ? onChange(option ? option.value : null, keyValue, 'value')
        : onChange(option ? option.value : null);
    }
  };
  Object.keys(options).forEach((key) => {
    if (Object.hasOwn(options, key)) {
      optionsArray.push({
        label: options[key].label ? options[key].label : options[key].value,
        value: options[key].value,
      });
    }
  });
  const missingOptions = getMissingValueOptions(valueState, optionsArray);
  missingOptions.forEach((option) => {
    optionsArray.push({
      label: option,
      value: option,
    });
  });
  return (
    <CreatableSelect
      className={selectClassName}
      placeholder={resolvePlaceholder(type, formType) || 'Valitse...'}
      value={resolveSelectValues(optionsArray, valueState, multi)}
      isDisabled={disabled}
      autoFocus={type !== 'form'}
      openMenuOnFocus
      isClearable
      options={optionsArray}
      onChange={(emittedValue) => onFieldChange(resolveReturnValues(emittedValue, multi))}
      onBlur={onSubmit}
      formatCreateLabel={onPromptCreate}
      isMulti={multi}
      delimiter=';'
    />
  );
};

DropdownInput.propTypes = {
  disabled: PropTypes.bool,
  formType: PropTypes.string,
  inputClassName: PropTypes.string,
  keyValue: PropTypes.string,
  multi: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  options: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  selectClassName: PropTypes.string,
  type: PropTypes.string.isRequired,
  valueState: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};

export default DropdownInput;
