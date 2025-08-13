/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { every, filter, isEqual } from 'lodash';

import { getStatusLabel } from '../../../utils/helpers';
import './SearchResults.scss';
import { getDisplayLabelForAttribute } from '../../../utils/attributeHelper';

const SearchResults = ({ hits, onSelect, onSelectAll, searchResults }) => {
  const getStateCount = useCallback((searchResults, state) => {
    return filter(searchResults, (result) => (result.item ? isEqual(result.item.function_state, state) : false)).length;
  }, []);

  const allSelected = every(searchResults, { selected: true });
  const drafts = getStateCount(searchResults, 'draft');
  const sentForReview = getStateCount(searchResults, 'sent_for_review');
  const waitingForApproval = getStateCount(searchResults, 'waiting_for_approval');
  const approved = getStateCount(searchResults, 'approved');

  return (
    <div className='search-results'>
      <div className='row search-result-header'>
        <div className='col-xs-1'>
          <div
            className={classnames('search-result-item-check', {
              'search-result-item-checked': allSelected,
            })}
            onClick={() => onSelectAll(!allSelected)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                onSelectAll(!allSelected);
              }
            }}
          >
            <i className='fa-solid fa-check' />
          </div>
        </div>
        <div className='col-xs-8 search-result-header-amounts'>
          <div>
            <h4>Hakutulos:</h4>
          </div>
          <div>
            <h5>Käsittelyprosessin kuvaus: {searchResults.length}</h5>
            {hits.phases > 0 && <h5>Käsittelyvaihe: {hits.phases}</h5>}
            {hits.actions > 0 && <h5>Toimenpide: {hits.actions}</h5>}
            {hits.records > 0 && <h5>Asiakirja: {hits.records}</h5>}
          </div>
        </div>
        <div className='col-xs-3'>
          {drafts > 0 && <h5>Luonnoksia: {drafts}</h5>}
          {sentForReview > 0 && <h5>Tarkastettavana: {sentForReview}</h5>}
          {waitingForApproval > 0 && <h5>Hyväksyttävänä: {waitingForApproval}</h5>}
          {approved > 0 && <h5>Hyväksyttyjä: {approved}</h5>}
        </div>
      </div>
      {searchResults.map((result, index) => (
        <div className='row search-result-item' key={result.item.function}>
          <div className='col-xs-1'>
            <div
              className={classnames('search-result-item-check', {
                'search-result-item-checked': result.selected,
              })}
              onClick={() => {
                onSelect(index, !result.selected);
              }}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  onSelect(index, !result.selected);
                }
              }}
            >
              <i className='fa-solid fa-check' />
            </div>
          </div>
          <div className='col-xs-8'>
            <span className='search-result-item-path'>{result.item.path ? result.item.path.join(' > ') : ''}</span>
            <h4 className='search-result-item-name'>{result.item.name}</h4>
            {result.paths.map((path) => {
              // stuff of nightmares, but we need to combine attribute
              // value to possibly existing attribute name for the UI
              const regex = new RegExp(/(.{1,100}):(.{1,100})/);

              const captured = regex.exec(path);
              let pathName = path;
              if (captured && captured.length === 3) {
                const splitAttributes = captured[2].split(/,/g);
                const mappedValue = splitAttributes
                  .map((attr) =>
                    getDisplayLabelForAttribute({
                      attributeValue: attr.trim(),
                      name: captured[1].trim(),
                    }),
                  )
                  .join(', ');
                pathName = `${captured[1].trim()}: ${mappedValue}`;
              }
              return <h4 key={`${result.item.function}-${pathName}`}>{pathName}</h4>;
            })}
          </div>
          <div className='col-xs-3 search-result-item-state'>
            <h4>{getStatusLabel(result.item.function_state)}</h4>
          </div>
        </div>
      ))}
    </div>
  );
};

SearchResults.propTypes = {
  hits: PropTypes.shape({
    actions: PropTypes.number.isRequired,
    phases: PropTypes.number.isRequired,
    records: PropTypes.number.isRequired,
  }),
  onSelect: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  searchResults: PropTypes.array.isRequired,
};

export default SearchResults;
