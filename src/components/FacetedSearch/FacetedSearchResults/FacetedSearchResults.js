import React, { PropTypes } from 'react';
import classnames from 'classnames';

import { TYPE_LABELS } from '../../../../config/constants';

import './FacetedSearchResults.scss';

export const FacetedSearchResults = ({
  items,
  highlightedId,
  metadata,
  onSelectItem
}) => {
  return (
    <div className='faceted-search-results'>
      {items.map(item => (
        <div
          className={classnames('faceted-search-results-item', {
            'faceted-search-results-item-selected': item.id === highlightedId
          })}
          key={item.id}
          onClick={() => onSelectItem(item)}
        >
          <div className='faceted-search-results-item-info'>
            <div className='faceted-search-results-item-type'>{TYPE_LABELS[item.type]}</div>
            <div
              className='faceted-search-results-item-title'
              dangerouslySetInnerHTML={{ __html: item.matchedName || item.name }} // eslint-disable-line
            />
            <div className='faceted-search-results-item-path'>{item.path ? item.path.join(' > ') : ''}</div>
            {(item.matchedAttributes || []).map(attr => (
              <div
                className='faceted-search-results-item-attribute'
                key={`${item.id}-${attr.key}`}
                dangerouslySetInnerHTML={{ __html: `${metadata[attr.key] ? metadata[attr.key].name : attr.key}: ${attr.value}` }} // eslint-disable-line
              />
            ))}
          </div>
          <div className='faceted-search-results-item-link'>
            <i className={classnames('fa', {
              'fa-angle-right': item.id !== highlightedId,
              'fa-angle-left': item.id === highlightedId
            })} />
          </div>
        </div>
      ))}
    </div>
  );
};

FacetedSearchResults.propTypes = {
  highlightedId: PropTypes.string,
  items: PropTypes.array.isRequired,
  metadata: PropTypes.object.isRequired,
  onSelectItem: PropTypes.func.isRequired
};

export default FacetedSearchResults;
