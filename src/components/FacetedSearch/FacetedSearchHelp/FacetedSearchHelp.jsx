/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import raw from 'raw.macro';
import classnames from 'classnames';

import './FacetedSearchHelp.scss';

export const FACETED_SEARCH_HELP_TYPE_FACET = 'facet';
export const FACETED_SEARCH_HELP_TYPE_TERM = 'searchterm';

// CRA does not support importing text files
// this is offered as a solution here
// (https://github.com/facebook/create-react-app/issues/3722)
const searchterm = raw('./searchterm_fi.md');
const facet = raw('./facet_fi.md');
const EVENTS = ['mouseup', 'touchend'];

class FacetedSearchHelp extends React.Component {
  constructor(props) {
    super(props);

    this.onToggleHelp = this.onToggleHelp.bind(this);

    this.state = {
      show: false,
    };
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  handleClickOutside = (event) => {
    const happenedOutside = this.wrapper && !this.wrapper.contains(event.target);

    if (happenedOutside) {
      this.onToggleHelp();
    }
  };

  onToggleHelp() {
    this.setState({ show: !this.state.show }, () => {
      if (this.state.show) {
        this.addListeners();
      } else {
        this.removeListeners();
      }
    });
  }

  addListeners() {
    EVENTS.forEach((name) => {
      document.addEventListener(name, this.handleClickOutside);
    });
  }

  removeListeners() {
    EVENTS.forEach((name) => {
      document.removeEventListener(name, this.handleClickOutside);
    });
  }

  render() {
    const { type } = this.props;
    return (
      <div className='faceted-search-help'>
        <button type='button' className='btn btn-link' onClick={this.onToggleHelp}>
          <i className='fa-solid fa-question' />
        </button>
        <div
          className={classnames('popover', { show: this.state.show })}
          onClick={this.onToggleHelp}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              this.onToggleHelp();
            }
          }}
          ref={(wrapper) => {
            this.wrapper = wrapper;
          }}
        >
          <ReactMarkdown plugins={[gfm]} source={type === FACETED_SEARCH_HELP_TYPE_TERM ? searchterm : facet} />
        </div>
      </div>
    );
  }
}

FacetedSearchHelp.propTypes = {
  type: PropTypes.string.isRequired,
};

export default FacetedSearchHelp;
