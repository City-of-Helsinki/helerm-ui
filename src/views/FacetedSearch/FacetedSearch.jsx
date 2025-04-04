/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { filter, find, includes, isArray, isEmpty, orderBy, slice, uniq, without } from 'lodash';
import Sticky from 'react-sticky-el';

import {
  FACET_ATTRIBUTE_SIZE,
  TYPE_ACTION,
  TYPE_CLASSIFICATION,
  TYPE_FUNCTION,
  TYPE_PHASE,
  TYPE_RECORD,
  TYPE_LABELS,
} from '../../constants';
import config from '../../config';
import Exporter from '../../components/Exporter';
import FacetedSearchHelp, {
  FACETED_SEARCH_HELP_TYPE_FACET,
  FACETED_SEARCH_HELP_TYPE_TERM,
} from '../../components/FacetedSearch/FacetedSearchHelp/FacetedSearchHelp';
import FacetedSearchResults from '../../components/FacetedSearch/FacetedSearchResults/FacetedSearchResults';
import FacetedSearchSuggestions from '../../components/FacetedSearch/FacetedSearchSuggestions/FacetedSearchSuggestions';
import PreviewItem from '../../components/FacetedSearch/PreviewItem/PreviewItem';
import './FacetedSearch.scss';
import { getDisplayLabelForAttribute } from '../../utils/attributeHelper';

class FacetedSearch extends React.Component {
  constructor(props) {
    super(props);

    this.onClickAllByType = this.onClickAllByType.bind(this);
    this.onClickAttribute = this.onClickAttribute.bind(this);
    this.onClickAttributeOption = this.onClickAttributeOption.bind(this);
    this.onClickItem = this.onClickItem.bind(this);
    this.onClickShowAll = this.onClickShowAll.bind(this);
    this.onClosePreview = this.onClosePreview.bind(this);
    this.onClickReset = this.onClickReset.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onSearchInputChange = this.onSearchInputChange.bind(this);
    this.onSelectSuggestion = this.onSelectSuggestion.bind(this);
    this.onToggleFacet = this.onToggleFacet.bind(this);

    this.state = {
      facetsOpen: [],
      previewItem: null,
      searchTerm: '',
      selectedFacets: {
        action: [],
        classification: [],
        function: [],
        phase: [],
        record: [],
      },
    };
  }

  componentDidMount() {
    this.props.setNavigationVisibility(false);
    const { attributeTypes, isFetching, items } = this.props;
    if (!isEmpty(attributeTypes) && !isFetching && isEmpty(items)) {
      this.props.fetchClassifications();
    }
  }

  componentDidUpdate() {
    const { attributeTypes, isFetching, classifications } = this.props;
    if (!isEmpty(attributeTypes) && !isFetching && isEmpty(classifications)) {
      this.props.fetchClassifications();
    }
  }

  onToggleFacet(type) {
    const { facetsOpen } = this.state;
    this.setState({
      facetsOpen: includes(facetsOpen, type) ? without(facetsOpen, type) : [...facetsOpen, type],
    });
  }

  onClickShowAll(attribute) {
    this.props.toggleShowAllAttributeOptions(attribute);
  }

  onClickAllByType(type) {
    const { searchTerm } = this.state;
    this.props.searchItems(searchTerm, type, false);
  }

  onClickAttribute(attribute) {
    this.props.toggleAttributeOpen(attribute);
  }

  onClickAttributeOption(attribute, option) {
    const { key, name, type } = attribute;
    const { value, hits } = option;
    const { selectedFacets } = this.state;
    const facets = selectedFacets[type];
    if (facets) {
      const facet = find(facets, { key, value });
      this.setState(
        {
          selectedFacets: {
            ...selectedFacets,
            [type]: facet ? without(facets, facet) : [...facets, { key, name, type, value, hits }],
          },
        },
        () => {
          this.props.filterItems(this.state.selectedFacets);
        },
      );
    }
  }

  onClickItem(item) {
    this.setState({
      previewItem: item,
    });
  }

  onClickReset() {
    this.setState(
      {
        facetsOpen: [],
        previewItem: null,
        searchTerm: '',
        selectedFacets: {
          action: [],
          classification: [],
          function: [],
          phase: [],
          record: [],
        },
      },
      () => {
        this.props.searchItems('');
      },
    );
  }

  onClosePreview() {
    this.setState({
      previewItem: null,
    });
  }

  onRemoveFacet(key, type, value) {
    const { selectedFacets } = this.state;
    const facets = selectedFacets[type];
    if (facets) {
      const facet = find(facets, { key, value });
      if (facet) {
        this.setState(
          {
            selectedFacets: {
              ...selectedFacets,
              [type]: without(facets, facet),
            },
          },
          () => {
            this.props.filterItems(this.state.selectedFacets);
          },
        );
      }
    }
  }

  onSearchInputChange(e) {
    const suggestSize = config.FACETED_SEARCH_LENGTH;
    this.setState({ searchTerm: e.target.value }, () => {
      if (this.state.searchTerm.length >= suggestSize) {
        this.props.searchItems(this.state.searchTerm, null, true);
      } else {
        this.props.resetSuggestions();
      }
    });
  }

  onSearchSubmit(event) {
    event.preventDefault();
    const { searchTerm } = this.state;
    this.setState(
      {
        facetsOpen: [],
        previewItem: null,
        selectedFacets: {
          action: [],
          classification: [],
          function: [],
          phase: [],
          record: [],
        },
      },
      () => {
        this.props.searchItems(searchTerm);
      },
    );
  }

  onSelectSuggestion(type) {
    const { searchTerm } = this.state;
    this.setState(
      {
        facetsOpen: [type],
      },
      () => {
        this.props.searchItems(searchTerm, type, false);
      },
    );
  }

  isOptionSelected(attribute, option) {
    const { key, type } = attribute;
    const { value } = option;
    const facets = this.state.selectedFacets[type];
    const facetOption = find(facets, (facet) => facet.key === key && facet.value === value);
    return !!facetOption;
  }

  renderAttribute(attribute) {
    const orderedOptions = orderBy(attribute.options, (option) => option.ref, ['asc']);
    const options = attribute.showAll ? orderedOptions : slice(orderedOptions, 0, FACET_ATTRIBUTE_SIZE);
    const hidden = attribute.options.length - options.length;
    const total = uniq(
      attribute.options.reduce((acc, val) => {
        acc.push(...val.hits);
        return acc;
      }, []),
    ).length;
    return (
      <div key={attribute.key}>
        <div
          className='faceted-search-facets-item-attribute'
          onClick={() => this.onClickAttribute(attribute)}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              this.onClickAttribute(attribute);
            }
          }}
        >
          <i
            className={classnames('fa-solid', {
              'fa-minus': attribute.open,
              'fa-plus': !attribute.open,
            })}
          />
          <span>{attribute.name}</span>
          <span>({total})</span>
        </div>
        {attribute.open &&
          options.map((option) => (
            <div
              className={classnames('faceted-search-facets-item-attribute-value', {
                'faceted-search-facets-item-attribute-value-selected': this.isOptionSelected(attribute, option),
              })}
              key={`${attribute.type}-${attribute.key}-${option.value}`}
              onClick={() => this.onClickAttributeOption(attribute, option)}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  this.onClickAttributeOption(attribute, option);
                }
              }}
            >
              <i className='fa-solid fa-check' />
              <span>
                {isArray(option.value)
                  ? option.value
                      .map((v) =>
                        getDisplayLabelForAttribute({
                          attributeValue: v,
                          identifier: attribute.key,
                        }),
                      )
                      .join(', ')
                  : getDisplayLabelForAttribute({
                      attributeValue: option.value,
                      identifier: attribute.key,
                    })}
              </span>
              <span>({option.hits.length})</span>
            </div>
          ))}
        {attribute.open && orderedOptions.length > FACET_ATTRIBUTE_SIZE && (
          <div
            className='faceted-search-facets-item-attribute-more'
            onClick={() => this.onClickShowAll(attribute)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                this.onClickShowAll(attribute);
              }
            }}
          >
            {attribute.showAll ? 'Vähemmän' : `Lisää (${hidden})`}
          </div>
        )}
      </div>
    );
  }

  renderFacetGroup(type) {
    const { attributes } = this.props;
    const { facetsOpen } = this.state;
    const typeAttributes = filter(attributes, { type });
    const orderedAttributes = orderBy(
      typeAttributes,
      (attr) => {
        const hitss = attr.options.reduce((acc, val) => {
          acc.push(...val.hits);
          return acc;
        }, []);
        return uniq(hitss).length;
      },
      ['desc'],
    );
    const isOpen = includes(facetsOpen, type);
    const hits = typeAttributes.reduce((acc, attr) => {
      const h = attr.options.reduce((hitAcc, val) => {
        hitAcc.push(...val.hits);
        return hitAcc;
      }, []);
      acc.push(...h);
      return acc;
    }, []);
    const totalHits = uniq(hits).length;

    return (
      <div className='faceted-search-facets-item' key={`facet-${type}`}>
        <div
          className='faceted-search-facets-item-title'
          onClick={() => this.onToggleFacet(type)}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              this.onToggleFacet(type);
            }
          }}
        >
          <span>
            {TYPE_LABELS[type]} ({totalHits})
          </span>
          <button type='button' className='btn btn-link'>
            <i
              className={classnames('fa-solid', {
                'fa-angle-down': !isOpen,
                'fa-angle-up': isOpen,
              })}
            />
          </button>
        </div>
        {isOpen && !isEmpty(orderedAttributes) && (
          <div className='faceted-search-facets-item-attributes'>
            <div>
              <div
                className='faceted-search-facets-item-attribute'
                onClick={() => this.onClickAllByType(type)}
                onKeyUp={(event) => {
                  if (event.key === 'Enter') {
                    this.onClickAllByType(type);
                  }
                }}
              >
                <span>
                  <strong>Kaikki</strong>
                </span>
                <span>({totalHits})</span>
              </div>
            </div>
            {orderedAttributes.map((attribute) => this.renderAttribute(attribute))}
          </div>
        )}
      </div>
    );
  }

  renderSelectedFacetButton(facet) {
    const { key, name, type, value } = facet;
    const valueStr = isArray(value)
      ? value
          .map((v) =>
            getDisplayLabelForAttribute({
              attributeValue: v,
              identifier: key,
            }),
          )
          .join(', ')
      : getDisplayLabelForAttribute({
          attributeValue: value,
          identifier: key,
        });
    const text = `${TYPE_LABELS[type]} / ${name}: ${valueStr}`;
    return (
      <button
        type='button'
        className='btn btn-sm btn-default'
        key={`${type}-${key}-${value}`}
        onClick={() => this.onRemoveFacet(key, type, value)}
      >
        <span>{text}</span>
        <i className='fa-solid fa-xmark' />
        <span className='tooltiptext'>{text}</span>
      </button>
    );
  }

  renderSelectedFacets() {
    const { terms } = this.props;
    const { selectedFacets } = this.state;
    return (
      <div className='faceted-search-selected-facets'>
        {(!isEmpty(terms) ||
          !isEmpty(selectedFacets.classification) ||
          !isEmpty(selectedFacets.function) ||
          !isEmpty(selectedFacets.phase) ||
          !isEmpty(selectedFacets.action) ||
          !isEmpty(selectedFacets.record)) && (
          <button type='button' className='btn btn-sm btn-primary' onClick={this.onClickReset}>
            Poista rajaukset
          </button>
        )}
        {selectedFacets.classification.map((facet) => this.renderSelectedFacetButton(facet))}
        {selectedFacets.function.map((facet) => this.renderSelectedFacetButton(facet))}
        {selectedFacets.phase.map((facet) => this.renderSelectedFacetButton(facet))}
        {selectedFacets.action.map((facet) => this.renderSelectedFacetButton(facet))}
        {selectedFacets.record.map((facet) => this.renderSelectedFacetButton(facet))}
      </div>
    );
  }

  render() {
    const { attributeTypes, exportItems, isFetching, items, metadata, suggestions } = this.props;
    const { previewItem, searchTerm } = this.state;

    return (
      <div className='faceted-search'>
        <div className='faceted-search-wrapper'>
          <div className='faceted-search-header'>
            <div>
              <h2>Sisältöhaku</h2>
            </div>
            <Exporter
              attributeTypes={attributeTypes}
              data={exportItems}
              className='pull-right'
              isVisible={exportItems.length > 0}
            />
          </div>
          <div className='faceted-search-field'>
            <form onSubmit={this.onSearchSubmit}>
              <input
                className='input-title form-control col-xs-11'
                type='search'
                placeholder='Vapaasanahaku'
                onChange={this.onSearchInputChange}
                value={searchTerm}
              />
              {!isEmpty(suggestions) && (
                <FacetedSearchSuggestions
                  onSelect={this.onSelectSuggestion}
                  suggestions={suggestions}
                  term={searchTerm}
                />
              )}
            </form>
            <button type='button' className='btn btn-primary' onClick={this.onSearchSubmit}>
              Hae
            </button>
            <FacetedSearchHelp type={FACETED_SEARCH_HELP_TYPE_TERM} />
          </div>
          <div className='faceted-search-content'>
            <div className='faceted-search-facets'>
              <div className='faceted-search-facets-item faceted-search-facets-title'>
                <span>Rajaa hakua</span>
                <FacetedSearchHelp type={FACETED_SEARCH_HELP_TYPE_FACET} />
              </div>
              <div className='faceted-search-facets-items'>
                {this.renderFacetGroup(TYPE_CLASSIFICATION)}
                {this.renderFacetGroup(TYPE_FUNCTION)}
                {this.renderFacetGroup(TYPE_PHASE)}
                {this.renderFacetGroup(TYPE_ACTION)}
                {this.renderFacetGroup(TYPE_RECORD)}
              </div>
            </div>
            <div className='faceted-search-list'>
              {isFetching && (
                <div className='faceted-search-loader'>
                  <span className='fa-solid fa-2x fa-spinner fa-spin' />
                </div>
              )}
              {this.renderSelectedFacets()}
              <FacetedSearchResults
                highlightedId={previewItem ? previewItem.id : null}
                items={items}
                metadata={metadata}
                onSelectItem={this.onClickItem}
              />
            </div>
          </div>
        </div>
        <div className='faceted-search-preview'>
          {!!previewItem && (
            <Sticky topOffset={-48} stickyClassName='faceted-search-preview-sticky'>
              <PreviewItem item={previewItem} metadata={metadata} onClose={this.onClosePreview} />
            </Sticky>
          )}
        </div>
      </div>
    );
  }
}

FacetedSearch.propTypes = {
  attributeTypes: PropTypes.object.isRequired,
  attributes: PropTypes.array.isRequired,
  classifications: PropTypes.array.isRequired,
  exportItems: PropTypes.array.isRequired,
  fetchClassifications: PropTypes.func.isRequired,
  filterItems: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
  items: PropTypes.array.isRequired,
  metadata: PropTypes.object.isRequired,
  resetSuggestions: PropTypes.func.isRequired,
  searchItems: PropTypes.func.isRequired,
  setNavigationVisibility: PropTypes.func.isRequired,
  suggestions: PropTypes.array.isRequired,
  terms: PropTypes.array.isRequired,
  toggleAttributeOpen: PropTypes.func.isRequired,
  toggleShowAllAttributeOptions: PropTypes.func.isRequired,
};

export default FacetedSearch;
