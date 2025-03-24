/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import raw from 'raw.macro';
import classnames from 'classnames';

import './FacetedSearchHelp.scss';
import useOutsideClick from '../../../hooks/useOutsideClick';

export const FACETED_SEARCH_HELP_TYPE_FACET = 'facet';
export const FACETED_SEARCH_HELP_TYPE_TERM = 'searchterm';

// CRA does not support importing text files
// this is offered as a solution here
// (https://github.com/facebook/create-react-app/issues/3722)
const searchterm = raw('./searchterm_fi.md');
const facet = raw('./facet_fi.md');

const FacetedSearchHelp = ({ type }) => {
  const { show, setShow, ref } = useOutsideClick();

  return (
    <div className='faceted-search-help'>
      <button type='button' className='btn btn-link' onClick={() => setShow(!show)}>
        <i className='fa-solid fa-question' />
      </button>
      <div
        className={classnames('popover', { show })}
        onClick={() => setShow(!show)}
        onKeyUp={(event) => {
          if (event.key === 'Enter') {
            setShow(!show);
          }
        }}
        ref={ref}
      >
        <ReactMarkdown plugins={[gfm]} source={type === FACETED_SEARCH_HELP_TYPE_TERM ? searchterm : facet} />
      </div>
    </div>
  );
};

FacetedSearchHelp.propTypes = {
  type: PropTypes.string.isRequired,
};

export default FacetedSearchHelp;
