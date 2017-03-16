import React, { PropTypes } from 'react';

import IsAllowed from 'components/IsAllowed/IsAllowed';
import ActionButton from './ActionButton';

import {
  EDIT,
  DRAFT
  // SENT_FOR_REVIEW,
  // WAITING_FOR_APPROVAL,
  // APPROVED
} from '../../../../config/constants';

const ActionButtons = ({ cancelEdit, documentState, saveDraft, sendForInspection, setDocumentState, status }) => {
  const editMode = documentState === 'edit';
  const editable = (
    <IsAllowed to={EDIT}>
      <span>
        <ActionButton
          className='btn-sm pull-right'
          type={editMode ? 'primary' : 'default'}
          action={editMode ? saveDraft : sendForInspection}
          label={editMode ? 'Tallenna luonnos' : 'Lähetä tarkastettavaksi'}
        />
        <ActionButton
          className='btn-sm pull-right'
          type={editMode ? 'danger' : 'primary'}
          action={editMode ? cancelEdit : () => setDocumentState('edit')}
          label={editMode ? 'Peruuta muokkaus' : 'Muokkaustila'}
        />
        {editMode &&
        <span className='fa fa-asterisk required-asterisk required-legend'> = Pakollinen tieto</span>
        }
      </span>
    </IsAllowed>
  );

  return (
    <div>
      { status === DRAFT && editable }
    </div>
  );
};

ActionButtons.propTypes = {
  cancelEdit: PropTypes.func,
  documentState: PropTypes.string,
  saveDraft: PropTypes.func,
  sendForInspection: PropTypes.func,
  setDocumentState: PropTypes.func,
  status: PropTypes.string.isRequired
};

export default ActionButtons;
