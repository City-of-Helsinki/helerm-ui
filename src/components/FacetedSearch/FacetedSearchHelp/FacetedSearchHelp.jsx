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
