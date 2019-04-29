import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { every, filter, isEqual } from 'lodash';

import { getStatusLabel } from 'utils/helpers';

import './SearchResults.scss';

export class SearchResults extends React.Component {

  getStateCount (searchResults, state) {
    return filter(searchResults, result => result.item ? isEqual(result.item.function_state, state) : false).length;
  }

  render () {
    const { searchResults } = this.props;
    const allSelected = every(searchResults, { selected: true });
    const drafts = this.getStateCount(searchResults, 'draft');
    const sentForReview = this.getStateCount(searchResults, 'sent_for_review');
    const waitingForApproval = this.getStateCount(searchResults, 'waiting_for_approval');
    const approved = this.getStateCount(searchResults, 'approved');

    return (
      <div className='search-results'>
        <div className='row search-result-header'>
          <div className='col-xs-1'>
            <div
              className={classnames('search-result-item-check', { 'search-result-item-checked': allSelected })}
              onClick={() => this.props.onSelectAll(!allSelected)}
            >
              <i className='fa fa-check' />
            </div>
          </div>
          <div className='col-xs-8'>
            <h3>{`Hakutulos: ${searchResults.length} osumaa`}</h3>
          </div>
          <div className='col-xs-3'>
            {drafts > 0 && (<h5>Luonnoksia: {drafts}</h5>)}
            {sentForReview > 0 && (<h5>Tarkastettavana: {sentForReview}</h5>)}
            {waitingForApproval > 0 && (<h5>Hyväksyttävänä: {waitingForApproval}</h5>)}
            {approved > 0 && (<h5>Hyväksyttyjä: {approved}</h5>)}
          </div>
        </div>
        {searchResults.map((result, index) => (
          <div className='row search-result-item' key={result.item.function}>
            <div className='col-xs-1'>
              <div
                className={classnames('search-result-item-check', { 'search-result-item-checked': result.selected })}
                onClick={() => {
                  this.props.onSelect(index, !result.selected);
                }}
              >
                <i className='fa fa-check' />
              </div>
            </div>
            <div className='col-xs-8'>
              <span className='search-result-item-path'>{result.item.path.join(' > ')}</span>
              <h4 className='search-result-item-name'>{result.item.name}</h4>
              {result.paths.map((path, pathIndex) => (
                <h4 key={`${result.item.function}${pathIndex}`}>{path}</h4>
              ))}
            </div>
            <div className='col-xs-3 search-result-item-state'>
              <h4>{getStatusLabel(result.item.function_state)}</h4>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

SearchResults.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  searchResults: PropTypes.array.isRequired
};

export default SearchResults;
