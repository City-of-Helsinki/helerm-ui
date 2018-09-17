import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

const SearchFilter = ({ placeholder, value, options, handleChange, multi }) => {
  return (
    <div className='col-sm-6'>
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
  handleChange: PropTypes.func,
  multi: PropTypes.bool,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  value: PropTypes.array
};

SearchFilter.defaultProps = {
  multi: true
};

export default SearchFilter;
