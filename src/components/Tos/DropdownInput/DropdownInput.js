import React from 'react';
import Select from 'react-select';
import { map, difference } from 'lodash';

function resolvePlaceholder (type, formType) {
  switch (type) {
    case 'phase':
      return 'Valitse käsittelyvaihe...';
    // case 'action':
    //   return '';
    // case 'record':
    //   return '';
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

function onPromptCreate (label) {
  return `Lisää "${label}"`;
}

function getMissingValueOptions (value, options) {
  const valueArray = value instanceof Array ? value : [value];
  const optionValues = map(options, 'value');
  return difference(valueArray, optionValues);
}

export const DropdownInput = ({
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
  selectClassName = `form-control edit-${type}-type__input`
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
      const onFormInputChange = event => {
        onInputChange(event.target.value, keyValue, 'value');
      };
      return (
        <input
          className={inputClassName}
          value={valueState || ''}
          onChange={onFormInputChange}
          onBlur={onSubmit}
          placeholder={'Tyyppi'}
        />
      );
    } else {
      return (
        <input
          className={inputClassName}
          value={valueState || ''}
          autoFocus={true}
          onChange={onInputChange}
          onBlur={onSubmit}
        />
      );
    }
  } else {
    const onFieldChange = option => {
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
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        optionsArray.push({
          label: options[key].value,
          value: options[key].value
        });
      }
    }
    const missingOptions = getMissingValueOptions(valueState, optionsArray);
    for (const key in missingOptions) {
      optionsArray.push({
        label: missingOptions[key],
        value: missingOptions[key]
      });
    }
    return (
      <Select.Creatable
        className={selectClassName}
        placeholder={resolvePlaceholder(type, formType) || 'Valitse...'}
        value={valueState}
        disabled={disabled}
        autoBlur={false}
        autoFocus={!(type === 'form')}
        openOnFocus={true}
        clearable={true}
        options={optionsArray}
        onChange={onFieldChange}
        onBlur={onSubmit}
        promptTextCreator={onPromptCreate}
        multi={multi}
        removeSelected={false}
        delimiter=';'
      />
    );
  }
};

DropdownInput.propTypes = {
  disabled: React.PropTypes.bool,
  formType: React.PropTypes.string,
  inputClassName: React.PropTypes.string,
  keyValue: React.PropTypes.string,
  multi: React.PropTypes.bool,
  onChange: React.PropTypes.func.isRequired,
  onInputChange: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  options: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.array
  ]).isRequired,
  selectClassName: React.PropTypes.string,
  type: React.PropTypes.string.isRequired,
  valueState: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.array
  ])
};

export default DropdownInput;
