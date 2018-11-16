import React, { PropTypes } from 'react';
import Sticky from 'react-sticky';
import { Link } from 'react-router';

import ActionButtons from './ActionButtons';

const TosHeader = ({
  cancelEdit,
  classificationId,
  documentState,
  functionId,
  fetchTos,
  name,
  saveDraft,
  changeStatus,
  setDocumentState,
  setPhasesVisibility,
  setTosVisibility,
  setValidationVisibility,
  review,
  state,
  tosId
}) => {
  const tosName = `${functionId} ${name}`;

  return (
    <Sticky className='single-tos-header'>
      <div className='row'>
        <h4 className='col-md-6 col-xs-12'>
          {tosName}{' '}
          <Link to={`/view-classification/${classificationId}`} title='Avaa luokituksen tiedot'>
            <i className='fa fa-info-circle'/>
          </Link>
        </h4>
        <div className='document-buttons col-xs-12 col-md-6'>
          <ActionButtons
            cancelEdit={cancelEdit}
            changeStatus={changeStatus}
            documentState={documentState}
            fetchTos={fetchTos}
            saveDraft={saveDraft}
            setDocumentState={setDocumentState}
            setPhasesVisibility={setPhasesVisibility}
            setTosVisibility={setTosVisibility}
            setValidationVisibility={setValidationVisibility}
            review={review}
            status={state}
            tosId={tosId}
          />
        </div>
      </div>
    </Sticky>
  );
};

TosHeader.propTypes = {
  cancelEdit: PropTypes.func,
  changeStatus: PropTypes.func,
  classificationId: PropTypes.string.isRequired,
  documentState: PropTypes.string.isRequired,
  fetchTos: PropTypes.func.isRequired,
  functionId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  review: PropTypes.func.isRequired,
  saveDraft: PropTypes.func,
  setDocumentState: PropTypes.func,
  setPhasesVisibility: PropTypes.func.isRequired,
  setTosVisibility: PropTypes.func.isRequired,
  setValidationVisibility: PropTypes.func,
  state: PropTypes.string,
  tosId: PropTypes.string
};

export default TosHeader;
