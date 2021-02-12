import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty, slice } from 'lodash';

import { BULK_UPDATE_SEARCH_TERM_DEFAULT } from '../../../../constants';
import SearchTerm from './SearchTerm';

import './SearchTerms.scss';

export class SearchTerms extends React.Component {
  constructor (props) {
    super(props);

    this.onChangeSearchTerm = this.onChangeSearchTerm.bind(this);
    this.onAddSearchTerm = this.onAddSearchTerm.bind(this);
    this.onRemoveSearchTerm = this.onRemoveSearchTerm.bind(this);
    this.onResetSearch = this.onResetSearch.bind(this);
    this.onSearch = this.onSearch.bind(this);

    this.state = {
      searchTerms: props.searchTerms
    };
  }

  onAddSearchTerm () {
    const { searchTerms } = this.state;
    this.setState({
      searchTerms: [...searchTerms, { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: new Date().getTime() }]
    });
    this.props.resetSearchResults();
  }

  onChangeSearchTerm (index, searchTerm) {
    const { searchTerms } = this.state;
    const start = slice(searchTerms, 0, index);
    const end = index + 1 < searchTerms.length ? slice(searchTerms, index + 1, searchTerms.length) : [];
    this.setState({
      searchTerms: [...start, searchTerm, ...end]
    });
    this.props.resetSearchResults();
  }

  onRemoveSearchTerm (index) {
    const { searchTerms } = this.state;
    if (searchTerms.length === 1) {
      this.onResetSearch();
    } else {
      const start = slice(searchTerms, 0, index);
      const end = index + 1 < searchTerms.length ? slice(searchTerms, index + 1, searchTerms.length) : [];
      this.setState({
        searchTerms: [...start, ...end]
      });
    }
    this.props.resetSearchResults();
  }

  onResetSearch () {
    this.setState({
      searchTerms: [{ ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: new Date().getTime() }]
    });
    this.props.resetSearchResults();
  }

  onSearch () {
    const { searchTerms } = this.state;
    this.props.onSearch(searchTerms);
  }

  validateTerms (searchTerms) {
    let isValidTerms = true;
    searchTerms.forEach(searchTerm => {
      if (isEmpty(searchTerm.target) || isEmpty(searchTerm.attribute) || isEmpty(searchTerm.value)) {
        isValidTerms = false;
      }
    });
    return isValidTerms;
  }

  render () {
    const { attributeTypes, attributeValues } = this.props;
    const { searchTerms } = this.state;
    const isValidTerms = this.validateTerms(searchTerms);
    return (
      <div className='search-terms'>
        <h3>Rajaa muutettavat kohteet</h3>
        <div className='search-terms-container'>
          {searchTerms.map((searchTerm, index) => (
            <SearchTerm
              attributeTypes={attributeTypes}
              attributeValues={attributeValues}
              key={searchTerm.id}
              onAddSearchTerm={this.onAddSearchTerm}
              onChangeSearchTerm={(emittedSearchTerm) => this.onChangeSearchTerm(index, emittedSearchTerm)}
              onRemoveSearchTerm={() => this.onRemoveSearchTerm(index)}
              searchTerm={searchTerm}
              showAdd={index === searchTerms.length - 1}
            />
          ))}
        </div>
        <div className='bulk-update-search-actions'>
          <button className='btn btn-default' onClick={this.onResetSearch}>
            Tyhjennä
          </button>
          <button
            className='btn btn-primary'
            disabled={!isValidTerms}
            onClick={this.onSearch}
          >
            Hae
          </button>
        </div>
      </div>
    );
  }
}

SearchTerms.propTypes = {
  attributeTypes: PropTypes.object,
  attributeValues: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
  resetSearchResults: PropTypes.func.isRequired,
  searchTerms: PropTypes.array.isRequired
};

export default SearchTerms;
