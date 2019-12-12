import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { isArray } from 'lodash';

import { TYPE_LABELS } from '../../../../config/constants';

import './PreviewItem.scss';

export const PreviewItem = ({ item, metadata, onClose }) => {
  const link = item.function
    ? `view-tos/${item.function}`
    : `view-classification/${item.id}`;
  const attributes = Object.keys(item.attributes).reduce((acc, key) => {
    if (item.attributes.hasOwnProperty(key) && item.attributes[key]) {
      acc.push({
        key,
        name: metadata[key] ? metadata[key].name : key,
        value: item.attributes[key]
      });
    }
    return acc;
  }, []);
  return (
    <div className='faceted-search-preview-item'>
      <div className='faceted-search-preview-item-title'>
        Esikatselu
        <button className='btn btn-sm btn-link pull-right' onClick={onClose}>
          <i className='fa fa-times' />
        </button>
      </div>
      <div className='faceted-search-preview-item-path'>
        {item.path.map(path => (
          <div key={`preview-${path}`}>{path}</div>
        ))}
      </div>
      <div className='faceted-search-preview-item-type'>{TYPE_LABELS[item.type]}</div>
      <div className='faceted-search-preview-item-name'>
        <Link to={link} target='_blank'>{item.name}</Link>
      </div>
      {attributes.map(attr => (
        <div className='faceted-search-preview-item-attribute' key={`preview-${attr.key}`}>
          <div><strong>{attr.name}</strong></div>
          <div>{isArray(attr.value) ? attr.value.join(', ') : attr.value}</div>
        </div>
      ))}
    </div>
  );
};

PreviewItem.propTypes = {
  item: PropTypes.object.isRequired,
  metadata: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PreviewItem;
