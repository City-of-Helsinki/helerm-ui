import React from 'react';
import PropTypes from 'prop-types';

class DropdownMenuWrapper extends React.Component {
  static componentDidMount() {
    const { listenEvents } = this.props;
    listenEvents.forEach((name) => {
      document.addEventListener(name, this.handleClickOutside);
    });
  }

  componentWillUnmount() {
    const { listenEvents } = this.props;
    listenEvents.forEach((name) => {
      document.removeEventListener(name, this.handleClickOutside);
    });
  }

  handleClickOutside = (event) => {
    const happenedOutside = this.wrapper && !this.wrapper.contains(event.target);

    if (happenedOutside) {
      this.props.onClickOutside(event);
    }
  };

  render() {
    const { children, onClickOutside, listenEvents, ...divProps } = this.props;
    return (
      <div
        ref={(wrapper) => {
          this.wrapper = wrapper;
        }}
        {...divProps}
      >
        {children}
      </div>
    );
  }
}

DropdownMenuWrapper.propTypes = {
  children: PropTypes.node,
  listenEvents: PropTypes.arrayOf(PropTypes.string),
  onClickOutside: PropTypes.func.isRequired,
};

DropdownMenuWrapper.defaultProps = {
  listenEvents: ['mouseup', 'touchend'],
};

DropdownMenuWrapper.wrapper = null;

export default DropdownMenuWrapper;
