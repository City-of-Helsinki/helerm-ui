import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

import { resolveReturnValues, resolveSelectValues } from '../../../utils/helpers';

const SearchFilter = ({
  placeholder,
  value,
  options,
  handleChange,
  multi = true,
  className = 'col-sm-6',
  isVisible = true,
  isDisabled = false,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={className}>
      <Select
        className='Select'
        noOptionsMessage={() => 'Ei valintoja'}
        blurInputOnSelect
        placeholder={placeholder}
        value={resolveSelectValues(options, value, multi)}
        isMulti={multi}
        options={options}
        isClearable
        isDisabled={isDisabled}
        onChange={(emittedValue) => handleChange(resolveReturnValues(emittedValue, multi))}
      />
    </div>
  );
};

SearchFilter.propTypes = {
  className: PropTypes.string,
  handleChange: PropTypes.func,
  isDisabled: PropTypes.bool,
  isVisible: PropTypes.bool,
  multi: PropTypes.bool,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  value: PropTypes.array,
};

export default SearchFilter;
