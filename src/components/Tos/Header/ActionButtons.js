import React, { PropTypes } from 'react';

import IsAllowed from 'components/IsAllowed/IsAllowed';
import ActionButton from './ActionButton';

import {
  EDIT,
  REVIEW,
  APPROVE,
  DRAFT,
  SENT_FOR_REVIEW,
  WAITING_FOR_APPROVAL,
  APPROVED
} from '../../../../config/constants';

const ActionButtons = ({
  cancelEdit,
  documentState,
  saveDraft,
  changeStatus,
  setDocumentState,
  setValidationVisibility,
  status
}) => {
  const editMode = documentState === 'edit';
  const editable = (
    <IsAllowed to={EDIT}>
      <span>
        <ActionButton
          className='btn-sm pull-right'
          type={editMode ? 'primary' : 'default'}
          action={editMode ? saveDraft : () => changeStatus(SENT_FOR_REVIEW)}
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

  const reviewable = (
    <IsAllowed to={REVIEW}>
      <span>
        <ActionButton
          className='btn-sm pull-right'
          type='primary'
          action={() => changeStatus(WAITING_FOR_APPROVAL)}
          label={'Lähetä hyväksyttäväksi'}
        />
        <ActionButton
          className='btn-sm pull-right'
          type='danger'
          action={() => changeStatus(DRAFT)}
          label={'Palauta luonnokseksi'}
        />
      </span>
    </IsAllowed>
  );

  const approvable = (
    <IsAllowed to={APPROVE}>
      <span>
        <ActionButton
          className='btn-sm pull-right'
          type='primary'
          action={() => changeStatus(APPROVED)}
          label={'Hyväksy'}
        />
        <ActionButton
          className='btn-sm pull-right'
          type='danger'
          action={() => changeStatus(DRAFT)}
          label={'Palauta luonnokseksi'}
        />
      </span>
    </IsAllowed>
  );

  return (
    <div>
      { status === DRAFT && editable }
      { status === SENT_FOR_REVIEW && reviewable }
      { status === WAITING_FOR_APPROVAL && approvable }
      <div className='validation-button'>
        <ActionButton
          className='btn-sm pull-right'
          style={{ marginRight: '15px' }}
          type='success'
          action={() => setValidationVisibility(true)}
          label={'Esitarkasta'}
          icon={'fa fa-check-circle-o'}
        />
      </div>
    </div>
  );
};

ActionButtons.propTypes = {
  cancelEdit: PropTypes.func,
  changeStatus: PropTypes.func,
  documentState: PropTypes.string,
  saveDraft: PropTypes.func,
  setDocumentState: PropTypes.func,
  setValidationVisibility: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired
};

export default ActionButtons;
