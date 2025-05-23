import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import SearchFilter from './SearchFilter';
import { statusFilters } from '../../../constants';

const SearchFilters = ({ attributeTypes, isDetailSearch, isUser, filters, handleFilterChange }) => {
  const statusFilterOptions = statusFilters;
  const retentionPeriods = attributeTypes?.RetentionPeriod ? attributeTypes?.RetentionPeriod.values : [];

  const retentionPeriodOptions = retentionPeriods.map((option) => ({
    value: option.value,
    label: option.value,
  }));

  return (
    <div className={classNames({ 'filters row': isDetailSearch })}>
      <SearchFilter
        className={classNames({
          '': !isDetailSearch,
          'col-sm-6': isDetailSearch,
        })}
        placeholder={isUser ? 'Suodata viimeisen tilan mukaan...' : 'Suodata tilan mukaan...'}
        value={filters.statusFilters.values}
        options={statusFilterOptions}
        handleChange={(values) => handleFilterChange(values, 'statusFilters')}
      />
      <SearchFilter
        placeholder='Suodata säilytysajan mukaan'
        value={filters.retentionPeriodFilters.values}
        options={retentionPeriodOptions}
        handleChange={(values) => handleFilterChange(values, 'retentionPeriodFilters')}
        isVisible={isDetailSearch}
      />
    </div>
  );
};

SearchFilters.propTypes = {
  attributeTypes: PropTypes.object,
  isDetailSearch: PropTypes.bool,
  isUser: PropTypes.bool.isRequired,
  filters: PropTypes.object.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
};

export default SearchFilters;
