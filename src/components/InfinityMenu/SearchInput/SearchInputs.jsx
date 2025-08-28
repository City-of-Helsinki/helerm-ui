import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Select from 'react-select';

import SearchInput from './SearchInput';

export const FILTER_CONDITION_OPTIONS = [
  { value: 'and', label: 'JA' },
  { value: 'or', label: 'TAI' },
];

const SearchInputs = ({
  headerProps,
  isDetailSearch,
  searchInputs,
  filterCondition,
  addSearchInput,
  setSearchInput,
  removeSearchInput,
  onFilterConditionChange,
  disabled = false,
}) =>
  searchInputs.map((input, index) => (
    <div
      key={index}
      className={classNames({
        'col-xs-12 filters filters-detail-search-input': isDetailSearch,
        'col-sm-6': !isDetailSearch,
      })}
    >
      <SearchInput
        {...headerProps}
        searchInput={input}
        placeholder='Etsi...'
        setSearchInput={(event) => setSearchInput(index, event.target.value)}
        disabled={disabled}
      />
      {isDetailSearch && (
        <div className='filters-detail-search-input-buttons'>
          {index + 1 < searchInputs.length && (
            <Select
              className='Select'
              autoBlur
              isDisabled={disabled || index > 0}
              placeholder='Ehto'
              value={FILTER_CONDITION_OPTIONS.find(({ value }) => value === filterCondition)}
              isClearable={false}
              options={FILTER_CONDITION_OPTIONS}
              onChange={onFilterConditionChange}
            />
          )}
          <button
            type='button'
            className='btn btn-info btn-sm'
            onClick={() => removeSearchInput(index)}
            title='Poista hakuehto'
            aria-label='Poista hakuehto'
            disabled={disabled}
          >
            <span className='fa-solid fa-minus' aria-hidden='true' />
          </button>
          {index + 1 === searchInputs.length && (
            <button
              type='button'
              className='btn btn-info btn-sm'
              onClick={addSearchInput}
              title='Lisää hakuehto'
              aria-label='Lisää hakuehto'
              disabled={disabled}
            >
              <span className='fa-solid fa-plus' aria-hidden='true' />
            </button>
          )}
        </div>
      )}
    </div>
  ));

SearchInputs.propTypes = {
  headerProps: PropTypes.object,
  isDetailSearch: PropTypes.bool,
  searchInputs: PropTypes.array.isRequired,
  filterCondition: PropTypes.string.isRequired,
  addSearchInput: PropTypes.func.isRequired,
  setSearchInput: PropTypes.func.isRequired,
  removeSearchInput: PropTypes.func.isRequired,
  onFilterConditionChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default SearchInputs;
