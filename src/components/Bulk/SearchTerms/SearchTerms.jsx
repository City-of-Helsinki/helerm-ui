import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { isEmpty, slice } from 'lodash';

import { BULK_UPDATE_SEARCH_TERM_DEFAULT } from '../../../constants';
import SearchTerm from './SearchTerm';

import './SearchTerms.scss';

const SearchTerms = ({
  attributeTypes,
  attributeValues,
  onSearch,
  resetSearchResults,
  searchTerms: initialSearchTerms,
}) => {
  const [searchTerms, setSearchTerms] = useState(initialSearchTerms);

  const onAddSearchTerm = useCallback(() => {
    setSearchTerms((prevSearchTerms) => [
      ...prevSearchTerms,
      { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: new Date().getTime() },
    ]);
    resetSearchResults();
  }, [resetSearchResults]);

  const onChangeSearchTerm = useCallback(
    (index, searchTerm) => {
      setSearchTerms((prevSearchTerms) => {
        const start = slice(prevSearchTerms, 0, index);
        const end = index + 1 < prevSearchTerms.length ? slice(prevSearchTerms, index + 1, prevSearchTerms.length) : [];
        return [...start, searchTerm, ...end];
      });
      resetSearchResults();
    },
    [resetSearchResults],
  );

  const onRemoveSearchTerm = useCallback(
    (index) => {
      setSearchTerms((prevSearchTerms) => {
        if (prevSearchTerms.length === 1) {
          return [{ ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: new Date().getTime() }];
        } else {
          const start = slice(prevSearchTerms, 0, index);
          const end =
            index + 1 < prevSearchTerms.length ? slice(prevSearchTerms, index + 1, prevSearchTerms.length) : [];
          return [...start, ...end];
        }
      });
      resetSearchResults();
    },
    [resetSearchResults],
  );

  const onResetSearch = useCallback(() => {
    setSearchTerms([{ ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: new Date().getTime() }]);
    resetSearchResults();
  }, [resetSearchResults]);

  const handleSearch = useCallback(() => {
    onSearch(searchTerms);
  }, [onSearch, searchTerms]);

  const validateTerms = useCallback((terms) => {
    let isValidTerms = true;
    terms.forEach((searchTerm) => {
      if (isEmpty(searchTerm.target) || isEmpty(searchTerm.attribute) || isEmpty(searchTerm.value)) {
        isValidTerms = false;
      }
    });
    return isValidTerms;
  }, []);

  const isValidTerms = validateTerms(searchTerms);

  return (
    <div className='search-terms'>
      <h3>Rajaa muutettavat kohteet</h3>
      <div className='search-terms-container'>
        {searchTerms.map((searchTerm, index) => (
          <SearchTerm
            attributeTypes={attributeTypes}
            attributeValues={attributeValues}
            key={searchTerm.id}
            onAddSearchTerm={onAddSearchTerm}
            onChangeSearchTerm={(emittedSearchTerm) => onChangeSearchTerm(index, emittedSearchTerm)}
            onRemoveSearchTerm={() => onRemoveSearchTerm(index)}
            searchTerm={searchTerm}
            showAdd={index === searchTerms.length - 1}
          />
        ))}
      </div>
      <div className='bulk-update-search-actions'>
        <button type='button' className='btn btn-default' onClick={onResetSearch}>
          Tyhjennä
        </button>
        <button type='button' className='btn btn-primary' disabled={!isValidTerms} onClick={handleSearch}>
          Hae
        </button>
      </div>
    </div>
  );
};

SearchTerms.propTypes = {
  attributeTypes: PropTypes.object,
  attributeValues: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
  resetSearchResults: PropTypes.func.isRequired,
  searchTerms: PropTypes.array.isRequired,
};

export default SearchTerms;
