import React, { PropTypes } from 'react';

const SearchInput = ({ startSearching, setSearchInput, searchInput, placeholder }) => (
  <input className='react-infinity-menu-default-search-input'
         placeholder={placeholder || '🔍'}
         onClick={startSearching}
         onChange={setSearchInput}
         value={searchInput}
  />
);

SearchInput.propTypes = {
  placeholder: PropTypes.string,
  searchInput: PropTypes.string,
  setSearchInput: PropTypes.func,
  startSearching: PropTypes.func
};

export default SearchInput;
