/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { setNavigationVisibility } from '../../store/reducers/navigation';
import {
  fetchClassificationsThunk,
  filterItemsThunk,
  searchItemsThunk,
  resetSuggestionsThunk,
  toggleAttribute,
  toggleShowAllAttributeOptions,
  cancelClassificationFetch,
  classificationsSelector,
  exportItemsSelector,
  filteredAttributesSelector,
  isFetchingSelector,
  itemsSelector,
  metadataSelector,
  suggestionsSelector,
  termsSelector,
} from '../../store/reducers/search';
import { attributeTypesSelector } from '../../store/reducers/ui';
import useAuth from '../../hooks/useAuth';

const FacetedSearch = () => {
  const dispatch = useDispatch();
  const { getApiToken } = useAuth();

  const attributeTypes = useSelector(attributeTypesSelector);
  const attributes = useSelector(filteredAttributesSelector);
  const classifications = useSelector(classificationsSelector);
  const exportItems = useSelector(exportItemsSelector);
  const isFetching = useSelector(isFetchingSelector);
  const items = useSelector(itemsSelector);
  const metadata = useSelector(metadataSelector);
  const suggestions = useSelector(suggestionsSelector);
  const terms = useSelector(termsSelector);

  const [facetsOpen, setFacetsOpen] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacets, setSelectedFacets] = useState({
    action: [],
    classification: [],
    function: [],
    phase: [],
    record: [],
  });

  const apiToken = useMemo(() => getApiToken(), [getApiToken]);

  useEffect(() => {
    dispatch(setNavigationVisibility(false));

    return () => {
      dispatch(setNavigationVisibility(true));
      dispatch(cancelClassificationFetch());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isEmpty(attributeTypes) && !isFetching && isEmpty(classifications)) {
      dispatch(fetchClassificationsThunk({ token: apiToken }));
    }
  }, [dispatch, attributeTypes, isFetching, classifications, apiToken]);

  const onToggleFacet = (type) => {
    setFacetsOpen((prevFacetsOpen) =>
      includes(prevFacetsOpen, type) ? without(prevFacetsOpen, type) : [...prevFacetsOpen, type],
    );
  };

  const onClickShowAll = (attribute) => {
    dispatch(toggleShowAllAttributeOptions(attribute));
  };

  const onClickAllByType = (type) => {
    dispatch(searchItemsThunk({ searchTerm, type, isSuggestionsOnly: false }));
  };

  const onClickAttribute = (attribute) => {
    dispatch(toggleAttribute(attribute));
  };

  const onClickAttributeOption = (attribute, option) => {
    const { key, name, type } = attribute;
    const { value, hits } = option;
    const facets = selectedFacets[type];

    if (facets) {
      const facet = find(facets, { key, value });
      const updatedFacets = {
        ...selectedFacets,
        [type]: facet
          ? without(facets, facet)
          : [
              ...facets,
              {
                hits,
                key,
                name,
                type,
                value,
              },
            ],
      };

      setSelectedFacets(updatedFacets);
      dispatch(filterItemsThunk(updatedFacets));
    }
  };

  const onClickItem = (item) => {
    setPreviewItem(item);
  };

  const onClickReset = () => {
    setFacetsOpen([]);
    setPreviewItem(null);
    setSearchTerm('');
    setSelectedFacets({
      action: [],
      classification: [],
      function: [],
      phase: [],
      record: [],
    });

    dispatch(searchItemsThunk({ searchTerm: '', isSuggestionsOnly: false }));
  };

  const onClosePreview = () => {
    setPreviewItem(null);
  };

  const onRemoveFacet = (key, type, value) => {
    const facets = selectedFacets[type];

    if (facets) {
      const facet = find(facets, { key, value });

      if (facet) {
        const updatedFacets = {
          ...selectedFacets,
          [type]: without(facets, facet),
        };

        setSelectedFacets(updatedFacets);
        dispatch(filterItemsThunk(updatedFacets));
      }
    }
  };

  const onSearchInputChange = (e) => {
    const suggestSize = config.FACETED_SEARCH_LENGTH || 3;
    const newSearchTerm = e.target.value;

    setSearchTerm(newSearchTerm);

    if (newSearchTerm.length >= suggestSize) {
      dispatch(searchItemsThunk({ searchTerm: newSearchTerm, type: null, isSuggestionsOnly: true }));
    } else {
      dispatch(resetSuggestionsThunk());
    }
  };

  const onSearchSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }

    setFacetsOpen([]);
    setPreviewItem(null);
    setSelectedFacets({
      action: [],
      classification: [],
      function: [],
      phase: [],
      record: [],
    });

    dispatch(searchItemsThunk({ searchTerm, type: null, isSuggestionsOnly: false }));
  };

  const onSelectSuggestion = (type) => {
    setFacetsOpen([type]);
    dispatch(searchItemsThunk({ searchTerm, type, isSuggestionsOnly: false }));
  };

  const isOptionSelected = (attribute, option) => {
    const { key, type } = attribute;
    const { value } = option;
    const facets = selectedFacets[type];
    const facetOption = find(facets, (facet) => facet.key === key && facet.value === value);
    return !!facetOption;
  };

  const renderAttribute = (attribute) => {
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
          onClick={() => onClickAttribute(attribute)}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onClickAttribute(attribute);
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
                'faceted-search-facets-item-attribute-value-selected': isOptionSelected(attribute, option),
              })}
              key={`${attribute.type}-${attribute.key}-${option.value}`}
              onClick={() => onClickAttributeOption(attribute, option)}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  onClickAttributeOption(attribute, option);
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
            onClick={() => onClickShowAll(attribute)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                onClickShowAll(attribute);
              }
            }}
          >
            {attribute.showAll ? 'Vähemmän' : `Lisää (${hidden})`}
          </div>
        )}
      </div>
    );
  };

  const renderFacetGroup = (type) => {
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
          onClick={() => onToggleFacet(type)}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onToggleFacet(type);
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
                onClick={() => onClickAllByType(type)}
                onKeyUp={(event) => {
                  if (event.key === 'Enter') {
                    onClickAllByType(type);
                  }
                }}
              >
                <span>
                  <strong>Kaikki</strong>
                </span>
                <span>({totalHits})</span>
              </div>
            </div>
            {orderedAttributes.map((attribute) => renderAttribute(attribute))}
          </div>
        )}
      </div>
    );
  };

  const renderSelectedFacetButton = (facet) => {
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
        onClick={() => onRemoveFacet(key, type, value)}
      >
        <span>{text}</span>
        <i className='fa-solid fa-xmark' />
        <span className='tooltiptext'>{text}</span>
      </button>
    );
  };

  const renderSelectedFacets = () => {
    return (
      <div className='faceted-search-selected-facets'>
        {(!isEmpty(terms) ||
          !isEmpty(selectedFacets.classification) ||
          !isEmpty(selectedFacets.function) ||
          !isEmpty(selectedFacets.phase) ||
          !isEmpty(selectedFacets.action) ||
          !isEmpty(selectedFacets.record)) && (
          <button type='button' className='btn btn-sm btn-primary' onClick={onClickReset}>
            Poista rajaukset
          </button>
        )}
        {selectedFacets.classification.map((facet) => renderSelectedFacetButton(facet))}
        {selectedFacets.function.map((facet) => renderSelectedFacetButton(facet))}
        {selectedFacets.phase.map((facet) => renderSelectedFacetButton(facet))}
        {selectedFacets.action.map((facet) => renderSelectedFacetButton(facet))}
        {selectedFacets.record.map((facet) => renderSelectedFacetButton(facet))}
      </div>
    );
  };

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
          <form onSubmit={onSearchSubmit}>
            <input
              className='input-title form-control col-xs-11'
              type='search'
              placeholder='Vapaasanahaku'
              onChange={onSearchInputChange}
              value={searchTerm}
            />
            {!isEmpty(suggestions) && (
              <FacetedSearchSuggestions onSelect={onSelectSuggestion} suggestions={suggestions} term={searchTerm} />
            )}
          </form>
          <button type='button' className='btn btn-primary' onClick={onSearchSubmit}>
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
              {renderFacetGroup(TYPE_CLASSIFICATION)}
              {renderFacetGroup(TYPE_FUNCTION)}
              {renderFacetGroup(TYPE_PHASE)}
              {renderFacetGroup(TYPE_ACTION)}
              {renderFacetGroup(TYPE_RECORD)}
            </div>
          </div>
          <div className='faceted-search-list'>
            {isFetching && (
              <div className='faceted-search-loader'>
                <span className='fa-solid fa-2x fa-spinner fa-spin' />
              </div>
            )}
            {renderSelectedFacets()}
            <FacetedSearchResults
              highlightedId={previewItem ? previewItem.id : null}
              items={items}
              metadata={metadata}
              onSelectItem={onClickItem}
            />
          </div>
        </div>
      </div>
      <div className='faceted-search-preview'>
        {!!previewItem && (
          <Sticky topOffset={-48} stickyClassName='faceted-search-preview-sticky'>
            <PreviewItem item={previewItem} metadata={metadata} onClose={onClosePreview} />
          </Sticky>
        )}
      </div>
    </div>
  );
};

export default FacetedSearch;
