import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

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
  fetchTos,
  saveDraft,
  changeStatus,
  setDocumentState,
  setValidationVisibility,
  review,
  status,
  tosId
}) => {
  const editMode = documentState === 'edit';

  const editable = (
    <IsAllowed to={EDIT}>
      <span>
        <ActionButton
          className='btn-sm pull-right'
          type={editMode ? 'primary' : 'default'}
          action={editMode ? saveDraft : () => review(SENT_FOR_REVIEW)}
          label={editMode ? 'Tallenna luonnos' : 'Lähetä tarkastettavaksi'}
        />
        <ActionButton
          className='btn-sm pull-right'
          type={editMode ? 'danger' : 'primary'}
          action={editMode ? cancelEdit : () => setDocumentState('edit')}
          label={editMode ? 'Peruuta muokkaus' : 'Muokkaustila'}
        />
        {/* {editMode &&
        <span className='fa fa-asterisk required-asterisk required-legend'> = Pakollinen tieto</span>
        } */}
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

  const draftable = (
    <IsAllowed to={EDIT}>
      <span>
        <ActionButton
          className='btn-sm pull-right'
          type='primary'
          icon='fa-file-o'
          action={saveDraft}
          label={'Luo luonnos'}
        />
        <ActionButton
          className='btn-sm pull-right'
          type='secondary'
          icon='fa-refresh'
          action={() => fetchTos(tosId, { state: 'approved' })}
          label={'Hae viimeisin hyväksytty versio'}
        />
      </span>
    </IsAllowed>
  );

  return (
    <div>
      {status === DRAFT && editable}
      {status === SENT_FOR_REVIEW && reviewable}
      {status === WAITING_FOR_APPROVAL && approvable}
      {status === APPROVED && draftable}
      {status !== APPROVED && (
        <div className='validation-button'>
          <ActionButton
            className='btn-sm pull-right'
            style={{ marginRight: '15px' }}
            type='success'
            action={() => setValidationVisibility(true)}
            label={'Esitarkasta'}
            icon={'fa-check-circle-o'}
          />
        </div>
      )}
      <span>
        <Link
          className='btn btn-sm btn-primary'
          to={`/view-tos/${tosId}/print`}
        >
          Tulosta
        </Link>
      </span>
    </div>
  );
};

ActionButtons.propTypes = {
  cancelEdit: PropTypes.func,
  changeStatus: PropTypes.func,
  documentState: PropTypes.string,
  fetchTos: PropTypes.func,
  review: PropTypes.func.isRequired,
  saveDraft: PropTypes.func,
  setDocumentState: PropTypes.func,
  setValidationVisibility: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  tosId: PropTypes.string.isRequired
};

export default ActionButtons;
