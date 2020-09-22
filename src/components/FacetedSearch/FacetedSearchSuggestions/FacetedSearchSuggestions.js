import React, { PropTypes } from 'react';
import classnames from 'classnames';

import { TYPE_LABELS } from '../../../../config/constants';

import './FacetedSearchSuggestions.scss';

const EVENTS = ['mouseup', 'touchend'];

export class FacetedSearchSuggestions extends React.Component {
  constructor (props) {
    super(props);

    this.onToggleHelp = this.onToggleHelp.bind(this);

    this.state = {
      show: true
    };
  }

  componentDidMount () {
    this.addListeners();
  }

  componentDidUpdate (prevProps) {
    if (prevProps.term !== this.props.term && !this.state.show) {
      this.onToggleHelp();
    }
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
    const { onSelect, suggestions } = this.props;
    return (
      <div
        className={classnames('faceted-search-suggestions popover', { 'show': this.state.show })}
        ref={wrapper => { this.wrapper = wrapper; }}
      >
        <div className='faceted-search-suggestions-title'>Rajaukset</div>
        {suggestions.map(item => (
          <div
            className='faceted-search-suggestion'
            key={item.type}
            onClick={() => onSelect(item.type)}
          >
            {TYPE_LABELS[item.type]} ({item.hits.length})
          </div>
        ))}
      </div>
    );
  }
};

FacetedSearchSuggestions.propTypes = {
  onSelect: PropTypes.func.isRequired,
  suggestions: PropTypes.array.isRequired,
  term: PropTypes.string
};

export default FacetedSearchSuggestions;