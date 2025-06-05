import { IconInfoCircle, Link, SearchInput, Select } from 'hds-react';
import PropTypes from 'prop-types';

import './NavigationSearch.scss';
import { statusFilters } from '../../constants';

const NavigationSearch = ({ handleSearch, handleStatusChange }) => {
  return (
    <div className='helerm-navigation-search'>
      <SearchInput className='helerm-navigation-search-input' onSubmit={handleSearch} placeholder='Etsi...' />
      <Select
        className='helerm-navigation-search-select'
        placeholder='Suodata tilan mukaan...'
        options={statusFilters}
        defaultValue={statusFilters[3]}
        onChange={handleStatusChange}
      />
      <Link href='/classification-tree' iconLeft={<IconInfoCircle />} className='helerm-navigation-search-link' />
    </div>
  );
};

NavigationSearch.propTypes = {
  handleSearch: PropTypes.func,
  handleStatusChange: PropTypes.func,
};

export default NavigationSearch;
