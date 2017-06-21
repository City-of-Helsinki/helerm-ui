import React from 'react';
import Select from 'react-select';

export const DropdownInput = ({
  keyValue,
  type,
  disabled = false,
  valueState,
  options,
  onChange,
  onInputChange,
  onSubmit,
  inputClassName = 'input-type form-control col-xs-11',
  selectClassName = `form-control edit-${type}-type__input`
}) => {
  const optionsArray = [];
  if (Object.keys(options).length === 0) {
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
  }

  for (const key in options) {
    if (options.hasOwnProperty(key)) {
      optionsArray.push({
        label: options[key].value,
        value: options[key].value
      });
    }
  }
  return (
    <Select
      className={selectClassName}
      placeholder='Valitse...'
      value={valueState}
      disabled={disabled}
      autoBlur={false}
      // autofocus={true}
      openOnFocus={true}
      clearable={true}
      options={optionsArray}
      onChange={(option) => type === 'form'
        ? onChange(option ? option.value : null, keyValue, 'value')
        : onChange(option ? option.value : null)}
      onBlur={onSubmit}
    />
  );
};

DropdownInput.propTypes = {
  disabled: React.PropTypes.bool,
  inputClassName: React.PropTypes.string,
  keyValue: React.PropTypes.string,
  onChange: React.PropTypes.func.isRequired,
  onInputChange: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  options: React.PropTypes.object.isRequired,
  selectClassName: React.PropTypes.string,
  type: React.PropTypes.string.isRequired,
  valueState: React.PropTypes.string
};

export default DropdownInput;
