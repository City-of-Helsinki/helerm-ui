import React, { PropTypes } from 'react';

import IsAllowed from 'components/IsAllowed/IsAllowed';
import ActionButton from './ActionButton';

import {
  EDIT,
  DRAFT,
  SENT_FOR_REVIEW,
  WAITING_FOR_APPROVAL,
  APPROVED
} from '../../../../config/constants';

const ActionButtons = ({ cancelEdit, documentState, saveDraft, sendForInspection, setDocumentState, status }) => {
  const editable = (
    <div>
      { documentState !== 'edit' &&
      <IsAllowed to={EDIT}>
        <span>
          <ActionButton
            className='btn-sm pull-right'
            type='default'
            action={sendForInspection}
            label='Lähetä tarkastettavaksi'
          />
          <ActionButton
            className='btn-sm pull-right'
            type='primary'
            action={() => setDocumentState('edit')}
            label='Muokkaustila'
          />
        </span>
      </IsAllowed>
      }
      {
        documentState === 'edit' &&
        <IsAllowed to={EDIT}>
          <span>
            <ActionButton
              className='btn-sm pull-right'
              type='primary'
              action={saveDraft}
              label='Tallenna luonnos'
            />
            <ActionButton
              className='btn-sm pull-right'
              type='danger'
              action={cancelEdit}
              label='Peruuta muokkaus'
            />
            <span
              className='fa fa-asterisk required-asterisk required-legend'> = Pakollinen tieto
            </span>
          </span>
        </IsAllowed>
      }
    </div>
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
