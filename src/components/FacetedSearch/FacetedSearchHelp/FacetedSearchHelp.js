import React, { PropTypes } from 'react';
import ReactMarkdown from 'react-markdown';
import classnames from 'classnames';

import searchterm from './searchterm_fi.md';
import facet from './facet_fi.md';
import './FacetedSearchHelp.scss';

export const FACETED_SEARCH_HELP_TYPE_FACET = 'facet';
export const FACETED_SEARCH_HELP_TYPE_TERM = 'searchterm';

const EVENTS = ['mouseup', 'touchend'];

export class FacetedSearchHelp extends React.Component {
  constructor (props) {
    super(props);

    this.onToggleHelp = this.onToggleHelp.bind(this);

    this.state = {
      show: false
    };
  }

  componentWillUnmount () {
    this.removeListeners();
  }

  addListeners () {
    EVENTS.forEach(name => {
      document.addEventListener(name, this.handleClickOutside);
    });
  }

  removeListeners () {
    EVENTS.forEach(name => {
      document.removeEventListener(name, this.handleClickOutside);
    });
  }

  handleClickOutside = (event) => {
    const happenedOutside = this.wrapper && !this.wrapper.contains(event.target);

    if (happenedOutside) {
      this.onToggleHelp();
    }
  }

  onToggleHelp () {
    this.setState({ show: !this.state.show }, () => {
      if (this.state.show) {
        this.addListeners();
      } else {
        this.removeListeners();
      }
    });
  }

  render () {
    const { type } = this.props;
    return (
      <div className='faceted-search-help'>
        <button className='btn btn-link' onClick={this.onToggleHelp}>
          <i className='fa fa-question' />
        </button>
        <div
          className={classnames('popover', { 'show': this.state.show })}
          onClick={this.onToggleHelp}
          ref={wrapper => { this.wrapper = wrapper; }}
        >
          <ReactMarkdown source={type === FACETED_SEARCH_HELP_TYPE_TERM ? searchterm : facet} />
        </div>
      </div>
    );
  }
};

FacetedSearchHelp.propTypes = {
  type: PropTypes.string.isRequired
};

export default FacetedSearchHelp;
