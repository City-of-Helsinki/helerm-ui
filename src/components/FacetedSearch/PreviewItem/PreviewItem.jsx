/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { isArray } from 'lodash';

import './PreviewItem.scss';
import { getDisplayLabelForAttribute } from '../../../utils/attributeHelper';
import { TYPE_LABELS } from '../../../constants';

const PreviewItem = ({ item, metadata, onClose }) => {
  const link = item.function ? `/view-tos/${item.function}` : `/view-classification/${item.id}`;
  const attributes = Object.keys(item.attributes).reduce((acc, key) => {
    if (Object.hasOwn(item.attributes, key) && item.attributes[key]) {
      acc.push({
        key,
        name: metadata[key] ? metadata[key].name : key,
        value: item.attributes[key],
      });
    }
    return acc;
  }, []);
  return (
    <div className='faceted-search-preview-item'>
      <div className='faceted-search-preview-item-title'>
        Esikatselu{' '}
        <button type='button' className='btn btn-sm btn-link pull-right' onClick={onClose} aria-label='Esikatselu'>
          <i className='fa-solid fa-xmark' />
        </button>
      </div>
      <div className='faceted-search-preview-item-path'>
        {item.path.map((path) => (
          <div key={`preview-${path}`}>{path}</div>
        ))}
      </div>
      <div className='faceted-search-preview-item-type'>{TYPE_LABELS[item.type]}</div>
      <div className='faceted-search-preview-item-name'>
        <Link to={link}>{item.name}</Link>
      </div>
      {attributes.map((attr) => (
        <div className='faceted-search-preview-item-attribute' key={`preview-${attr.key}`}>
          <div>
            <strong>{attr.name}</strong>
          </div>
          <div>
            {isArray(attr.value)
              ? attr.value
                  .map((v) =>
                    getDisplayLabelForAttribute({
                      attributeValue: v,
                      identifier: attr.key,
                    }),
                  )
                  .join(', ')
              : getDisplayLabelForAttribute({
                  attributeValue: attr.value,
                  identifier: attr.key,
                })}
          </div>
        </div>
      ))}
    </div>
  );
};

PreviewItem.propTypes = {
  item: PropTypes.object.isRequired,
  metadata: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PreviewItem;
