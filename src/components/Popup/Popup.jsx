import { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Popup.scss';

const Popup = ({ content, closePopup, label = 'Ponnahdusikkuna' }) => {
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
      role='none'
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closePopup();
        }
      }}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && event.key === 'Escape') {
          closePopup();
        }
      }}
    >
      <dialog open className='popup-inner-background' data-testid='popup-content' aria-modal='true' aria-label={label}>
        <button
          type='button'
          className='popup__close'
          onClick={closePopup}
          data-testid='popup-close-button'
          aria-label='Sulje'
        >
          <i className='fa-solid fa-xmark' />
        </button>
        {content}
      </dialog>
    </div>
  );
};

Popup.propTypes = {
  closePopup: PropTypes.func.isRequired,
  content: PropTypes.object.isRequired,
  label: PropTypes.string,
};

export default Popup;
