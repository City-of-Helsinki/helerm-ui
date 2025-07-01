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
      data-testid="popup-component"
      onClick={closePopup}
      onKeyUp={(event) => {
        if (event.key === 'Enter') {
          closePopup();
        }
      }}
    >
      <div
        className='popup-inner-background'
        data-testid="popup-content"
        onClick={(e) => stop(e)}
        onKeyUp={(event) => {
          if (event.key === 'Enter') {
            stop(event);
          }
        }}
      >
        <button type='button' className='popup__close' onClick={closePopup} data-testid="popup-close-button">
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
