import React from 'react';
import PropTypes from 'prop-types';
import './DeleteView.scss';

const TYPE_CONFIG = {
  phase: {
    name: 'käsittelyvaihetta',
    childrenText: 'käsittelyvaiheen',
    children: true,
  },
  action: {
    name: 'toimenpidettä',
    childrenText: 'toimenpiteen',
    children: true,
  },
  record: {
    name: 'asiakirjaa',
    children: false,
  },
};

const DeleteView = ({ type, target, cancel, action }) => {
  return (
    <div className='delete-view row' data-testid='delete-view'>
      <h3 data-testid='delete-view-title'>
        Olet poistamassa {TYPE_CONFIG[type].name} &quot;
        {target}&quot;
      </h3>
      {TYPE_CONFIG[type].children && (
        <span className='has-children-text' data-testid='delete-view-warning'>
          Huomioi, että kaikki {TYPE_CONFIG[type].childrenText} sisältämät tiedot poistetaan
        </span>
      )}
      <h4 data-testid='delete-view-confirmation'>Vahvista poisto</h4>
      <div className='popup-buttons' data-testid='delete-view-buttons'>
        <button type='button' onClick={cancel} className='btn btn-default' data-testid='delete-view-cancel-button'>
          Peruuta
        </button>
        <button type='button' onClick={action} className='btn btn-delete' data-testid='delete-view-delete-button'>
          Poista
        </button>
      </div>
    </div>
  );
};

DeleteView.propTypes = {
  action: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  target: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default DeleteView;
