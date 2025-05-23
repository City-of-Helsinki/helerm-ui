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
    <div className='delete-view row'>
      <h3>
        Olet poistamassa {TYPE_CONFIG[type].name} &quot;
        {target}&quot;
      </h3>
      {TYPE_CONFIG[type].children && (
        <span className='has-children-text'>
          Huomioi, että kaikki {TYPE_CONFIG[type].childrenText} sisältämät tiedot poistetaan
        </span>
      )}
      <h4>Vahvista poisto</h4>
      <div className='popup-buttons'>
        <button type='button' onClick={cancel} className='btn btn-default'>
          Peruuta
        </button>
        <button type='button' onClick={action} className='btn btn-delete'>
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
