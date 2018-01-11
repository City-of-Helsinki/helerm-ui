import React from 'react';
import PropTypes from 'prop-types';

class DropdownMenuWrapper extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    listenEvents: PropTypes.arrayOf(PropTypes.string),
    onClickOutside: PropTypes.func.isRequired
  };

  static defaultProps = {
    listenEvents: ['mouseup', 'touchend']
  };

  componentDidMount () {
    const { listenEvents } = this.props;
    listenEvents.forEach(name => {
      document.addEventListener(name, this.handleClickOutside);
    });
  }

  componentWillUnmount () {
    const { listenEvents } = this.props;
    listenEvents.forEach(name => {
      document.removeEventListener(name, this.handleClickOutside);
    });
  }

  handleClickOutside = (event) => {
    const happenedOutside = this.wrapper && !this.wrapper.contains(event.target);

    if (happenedOutside) {
      this.props.onClickOutside(event);
    }
  }

  wrapper = null;

  render () {
    const {
      children,
      onClickOutside: _ignore_onClickOutside, // eslint-disable-line no-unused-vars
      listenEvents: _ignore_listenEvents, // eslint-disable-line no-unused-vars
      ...divProps
    } = this.props;
    return (
      <div ref={wrapper => { this.wrapper = wrapper; }} {...divProps}>
        {children}
      </div>
    );
  }
}

export default DropdownMenuWrapper;
