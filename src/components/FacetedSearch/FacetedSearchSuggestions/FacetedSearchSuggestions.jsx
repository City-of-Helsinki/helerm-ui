/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-access-state-in-setstate */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { TYPE_LABELS } from '../../../constants';
import useOutsideClick from '../../../hooks/useOutsideClick';

import './FacetedSearchSuggestions.scss';

const FacetedSearchSuggestions = ({ onSelect, suggestions, term }) => {
  const { show, setShow, ref } = useOutsideClick(true);

  useEffect(() => {
    if (term && !show) {
      setShow(true);
    }
  }, [term, show]);

  return (
    <div className={classnames('faceted-search-suggestions popover', { show })} ref={ref}>
      <div className='faceted-search-suggestions-title'>Rajaukset</div>
      {suggestions.map((item) => (
        <div
          className='faceted-search-suggestion'
          key={item.type}
          onClick={() => onSelect(item.type)}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onSelect(item.type);
            }
          }}
        >
          {TYPE_LABELS[item.type]} ({item.hits.length})
        </div>
      ))}
    </div>
  );
};

FacetedSearchSuggestions.propTypes = {
  onSelect: PropTypes.func.isRequired,
  suggestions: PropTypes.array.isRequired,
  term: PropTypes.string,
};

export default FacetedSearchSuggestions;
