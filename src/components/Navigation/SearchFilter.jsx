/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

import { resolveReturnValues, resolveSelectValues } from '../../utils/helpers';

const SearchFilter = ({ placeholder, value, options, handleChange, multi, className, isVisible }) => {
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
        onChange={(emittedValue) => handleChange(resolveReturnValues(emittedValue, multi))}
      />
    </div>
  );
};

SearchFilter.propTypes = {
  className: PropTypes.string,
  handleChange: PropTypes.func,
  isVisible: PropTypes.bool,
  multi: PropTypes.bool,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  value: PropTypes.array,
};

SearchFilter.defaultProps = {
  className: 'col-sm-6',
  isVisible: true,
  multi: true,
};

export default SearchFilter;
