import React from 'react';
import './Popup.scss';

const Popup = ({content, closePopup}) => {
  const stop = (e) => {
    e.stopPropagation();
  }
	return (
    <div className='popup-outer-background' onClick={closePopup}>
      <div className='popup-inner-background' onClick={(e) => stop(e)}>
				{ content }
			</div>
		</div>
	);
};

export default Popup;
