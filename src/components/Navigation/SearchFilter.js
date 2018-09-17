import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

const SearchFilter = ({ placeholder, value, options, handleChange, multi, className, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={className}>
      <Select
        autoBlur={true}
        placeholder={placeholder}
        value={value}
        multi={multi}
        joinValues={true}
        clearable={false}
        resetValue={options}
        options={options}
        onChange={handleChange}
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
  value: PropTypes.array
};

SearchFilter.defaultProps = {
  className: 'col-sm-6',
  isVisible: true,
  multi: true
};

export default SearchFilter;
