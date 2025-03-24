/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import './Popup.scss';

const Popup = ({ content, closePopup }) => {
  const stop = (e) => {
    e.stopPropagation();
  };
  return (
    <div
      className='popup-outer-background'
      onClick={closePopup}
      onKeyUp={(event) => {
        if (event.key === 'Enter') {
          closePopup();
        }
      }}
    >
      <div
        className='popup-inner-background'
        onClick={(e) => stop(e)}
        onKeyUp={(event) => {
          if (event.key === 'Enter') {
            stop(event);
          }
        }}
      >
        <button type='button' className='popup__close' onClick={closePopup}>
          <i className='fa-solid fa-xmark' />
        </button>
        {content}
      </div>
    </div>
  );
};

Popup.propTypes = {
  closePopup: PropTypes.func.isRequired,
  content: PropTypes.object.isRequired,
};

export default Popup;
