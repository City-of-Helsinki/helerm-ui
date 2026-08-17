import { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Popup.scss';

const Popup = ({ content, closePopup }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closePopup();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closePopup]);

  return (
    <div
      className='popup-outer-background'
      data-testid='popup-component'
      role='presentation'
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closePopup();
        }
      }}
    >
      <div className='popup-inner-background' data-testid='popup-content' role='dialog' aria-modal='true'>
        <button type='button' className='popup__close' onClick={closePopup} data-testid='popup-close-button'>
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
