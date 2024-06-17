import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './Dropdown.scss';

import DropdownMenuWrapper from './DropdownMenuWrapper';

const Dropdown = (props) => {
  const { items, small, extraSmall } = props;

  const [isOpen, setIsOpen] = useState(false);

  const buttonRef = useRef(null);

  const handleClick = (index) => {
    setIsOpen(false);

    items[index].action();
  };

  const handleClickOutsideMenu = (event) => {
    const shouldCloseMenu = buttonRef.current && !buttonRef.current.contains(event.target);

    if (shouldCloseMenu) {
      setIsOpen(false);
    }
  };

  const generateRows = (dropdownItems) =>
    dropdownItems.map((item, index) => (
      <button
        type='button'
        key={item.text}
        className={classnames('btn btn-sm dropdown-row', item.style)}
        onClick={() => handleClick(index)}
      >
        <span className={classnames('fa-solid dropdown-icon', item.icon)} />
        {item.text}
      </button>
    ));

  const dropdownRows = generateRows(items);

  return (
    <span className='dropdown-wrapper'>
      <button
        type='button'
        aria-label='Näytä toiminnallisuudet'
        ref={buttonRef}
        className={classnames('btn btn-primary', { 'btn-sm': small }, { 'btn-xs': extraSmall })}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className='fa-solid fa-bars' />
      </button>
      {isOpen && (
        <DropdownMenuWrapper
          onClickOutside={handleClickOutsideMenu}
          className={classnames('dropdown-items', { 'items-xs': extraSmall })}
        >
          {dropdownRows}
        </DropdownMenuWrapper>
      )}
    </span>
  );
};

Dropdown.propTypes = {
  extraSmall: PropTypes.bool,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      style: PropTypes.string,
      icon: PropTypes.string,
      text: PropTypes.string,
      action: PropTypes.func.isRequired,
    }),
  ).isRequired,
  small: PropTypes.bool,
};

export default Dropdown;
