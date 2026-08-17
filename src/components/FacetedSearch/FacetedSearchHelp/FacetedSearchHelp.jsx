import { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import classnames from 'classnames';

import './FacetedSearchHelp.scss';
import facet from './facet_fi.md?raw';
import searchterm from './searchterm_fi.md?raw';
import useOutsideClick from '../../../hooks/useOutsideClick';

export const FACETED_SEARCH_HELP_TYPE_FACET = 'facet';
export const FACETED_SEARCH_HELP_TYPE_TERM = 'searchterm';

const FacetedSearchHelp = ({ type }) => {
  const { show, setShow, ref } = useOutsideClick();
  const popoverId = `faceted-search-help-popover-${type}`;

  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShow(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [show, setShow]);

  return (
    <div className='faceted-search-help'>
      <button
        type='button'
        className='btn btn-link'
        aria-expanded={show}
        aria-controls={popoverId}
        aria-label='Ohje'
        onClick={() => setShow(!show)}
      >
        <i className={classnames('fa-solid fa-question', { 'icon-white': type === FACETED_SEARCH_HELP_TYPE_FACET })} />
      </button>
      <div id={popoverId} className={classnames('popover', { show })} ref={ref}>
        <button type='button' className='popover-close' onClick={() => setShow(false)} aria-label='Sulje'>
          <i className='fa-solid fa-xmark' />
        </button>
        <ReactMarkdown remarkPlugins={[gfm]}>
          {type === FACETED_SEARCH_HELP_TYPE_TERM ? searchterm : facet}
        </ReactMarkdown>
      </div>
    </div>
  );
};

FacetedSearchHelp.propTypes = {
  type: PropTypes.string.isRequired,
};

export default FacetedSearchHelp;
