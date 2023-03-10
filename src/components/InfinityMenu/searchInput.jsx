import React from 'react';
import PropTypes from 'prop-types';

const SearchInput = ({ setSearchInput, searchInput, placeholder, ...inputProps }) => (
  <input
    className='react-infinity-menu-default-search-input'
    {...inputProps}
    type='search'
    placeholder={placeholder}
    onChange={setSearchInput}
    value={searchInput}
  />
);

SearchInput.propTypes = {
  placeholder: PropTypes.string,
  searchInput: PropTypes.string,
  setSearchInput: PropTypes.func.isRequired,
};

SearchInput.defaultProps = {
  placeholder: '🔍',
  searchInput: '',
};

export default SearchInput;
