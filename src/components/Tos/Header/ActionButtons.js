import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { getNewPath } from 'utils/helpers';

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
  setPhasesVisibility,
  setTosVisibility,
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
          className='btn pull-right'
          type={editMode ? 'success' : 'success'}
          action={editMode ? saveDraft : () => review(SENT_FOR_REVIEW)}
          label={editMode ? 'Tallenna luonnos' : 'Lähetä tarkastettavaksi'}
        />
        <ActionButton
          className='btn pull-right'
          type={editMode ? 'danger' : 'primary'}
          action={editMode ? cancelEdit : () => setDocumentState('edit')}
          label={editMode ? 'Peruuta muokkaus' : 'Muokkaa'}
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
          className='btn pull-right'
          type='primary'
          action={() => changeStatus(WAITING_FOR_APPROVAL)}
          label={'Lähetä hyväksyttäväksi'}
        />
        <ActionButton
          className='btn pull-right'
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
          className='btn pull-right'
          type='primary'
          action={() => changeStatus(APPROVED)}
          label={'Hyväksy'}
        />
        <ActionButton
          className='btn pull-right'
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
          className='btn pull-right'
          type='primary'
          icon='fa-file-o'
          action={saveDraft}
          label={'Luo luonnos'}
        />
        <ActionButton
          className='btn pull-right'
          type='secondary'
          icon='fa-refresh'
          action={() => fetchTos(tosId, { state: 'approved' })}
          label={'Hae viimeisin hyväksytty versio'}
        />
      </span>
    </IsAllowed>
  );

  return (
    <div className='row'>
      <div className='col-xs-12'>
        {status === DRAFT && editable}
        {status === SENT_FOR_REVIEW && reviewable}
        {status === WAITING_FOR_APPROVAL && approvable}
        {status === APPROVED && draftable}
        {status !== APPROVED && (
          <ActionButton
            className='btn pull-right'
            type='primary'
            action={() => setValidationVisibility(true)}
            label={'Esitarkasta'}
          />
        )}
        <Link
          className={`btn btn-primary pull-right${editMode ? ' disabled' : ''}`}
          to={getNewPath(window.location.pathname, 'print')}
        >
          Raportti
        </Link>
      </div>
      <div className='col-xs-12 tos-visibility-buttons'>
        <ActionButton
          className='pull-right'
          type='link'
          action={() => setTosVisibility(true)}
          label={'Avaa kaikki tiedot'}
        />
        <ActionButton
          className='pull-right'
          type='link'
          action={setPhasesVisibility}
          label={'Avaa perustiedot'}
        />
        <ActionButton
          className='pull-right'
          type='link'
          action={() => setTosVisibility(false)}
          label={'Pienennä kaikki'}
        />
      </div>
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
  setPhasesVisibility: PropTypes.func.isRequired,
  setTosVisibility: PropTypes.func.isRequired,
  setValidationVisibility: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  tosId: PropTypes.string.isRequired
};

export default ActionButtons;
