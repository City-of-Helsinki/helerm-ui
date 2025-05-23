/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { isEmpty } from 'lodash';

import { TYPE_LABELS } from '../../../constants';
import useOutsideClick from '../../../hooks/useOutsideClick';

import './FacetedSearchSuggestions.scss';

const FacetedSearchSuggestions = ({ onSelect, suggestions, term }) => {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { show, setShow, ref } = useOutsideClick(true);

  useEffect(() => {
    if (term && !isEmpty(suggestions)) {
      setShow(true);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, suggestions]);

  const shouldShow = show && showSuggestions && !isEmpty(suggestions);

  return (
    <div className={classnames('faceted-search-suggestions popover', { show: shouldShow })} ref={ref}>
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
          {TYPE_LABELS[item.type]} ({item.hits ? item.hits.length : 0})
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
