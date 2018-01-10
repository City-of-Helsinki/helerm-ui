import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './Dropdown.scss';

import DropdownMenuWrapper from './DropdownMenuWrapper';

export class Dropdown extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      open: false
    };
  }

  handleClick (index) {
    this.setState({ open: false });
    this.props.items[index].action();
  }

  generateRows (dropdownItems) {
    return dropdownItems.map((item, index) => {
      return (
        <button
          key={index}
          className={classnames('btn btn-sm dropdown-row', item.style)}
          onClick={() => this.handleClick(index)}>
          <span className={classnames('fa dropdown-icon', item.icon)}/>
          {item.text}
        </button>
      );
    });
  }

  handleClickOutsideMenu = (event) => {
    const shouldCloseMenu = this.button && !this.button.contains(event.target);
    if (shouldCloseMenu) {
      this.setState({ open: false });
    }
  }

  render () {
    const { items, small, extraSmall } = this.props;
    const dropdownRows = this.generateRows(items);
    return (
      <span className='dropdown-wrapper'>
        <button
          ref={button => { this.button = button; }}
          className={classnames('btn btn-primary', { 'btn-sm': small }, { 'btn-xs': extraSmall })}
          onClick={() => this.setState((state) => ({ open: !state.open }))}
        >
          <span className='fa fa-bars'/>
        </button>
        { this.state.open &&
        <DropdownMenuWrapper
          onClickOutside={this.handleClickOutsideMenu}
          className={classnames('dropdown-items', { 'items-xs': extraSmall })}
        >
          {dropdownRows}
        </DropdownMenuWrapper>
        }
      </span>
    );
  }
}

Dropdown.propTypes = {
  extraSmall: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.shape({
    style: PropTypes.string,
    icon: PropTypes.string,
    text: PropTypes.string,
    action: PropTypes.func.isRequired
  })).isRequired,
  small: PropTypes.bool
};

export default Dropdown;
