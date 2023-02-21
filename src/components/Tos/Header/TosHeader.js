import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import ActionButtons from './ActionButtons';

const TosHeader = ({
  cancelEdit,
  classificationId,
  currentVersion,
  documentState,
  functionId,
  fetchTos,
  isValidationBarVisible,
  name,
  saveDraft,
  changeStatus,
  setDocumentState,
  setTosVisibility,
  setValidationVisibility,
  review,
  state,
  tosId,
  versions
}) => {
  const tosName = `${functionId} ${name}`;

  return (
    <div className='single-tos-header'>
      <div className='row'>
        <div className='col-md-6 col-xs-12'>
          <span className='classification-header-text'>
            <h3>
              {tosName}{' '}
              <Link to={`/view-classification/${classificationId}`} title='Avaa luokituksen tiedot'>
                <i className='fa-solid fa-circle-info'/>
              </Link>
            </h3>
          </span>
        </div>
        <div className='document-buttons col-xs-12 col-md-6'>
          <ActionButtons
            cancelEdit={cancelEdit}
            changeStatus={changeStatus}
            documentState={documentState}
            fetchTos={fetchTos}
            isValidationBarVisible={isValidationBarVisible}
            saveDraft={saveDraft}
            setDocumentState={setDocumentState}
            setTosVisibility={setTosVisibility}
            setValidationVisibility={setValidationVisibility}
            review={review}
            status={state}
            tosId={tosId}
          />
        </div>
      </div>
    </div>
  );
};

TosHeader.propTypes = {
  cancelEdit: PropTypes.func,
  changeStatus: PropTypes.func,
  classificationId: PropTypes.string.isRequired,
  currentVersion: PropTypes.number.isRequired,
  documentState: PropTypes.string.isRequired,
  fetchTos: PropTypes.func.isRequired,
  functionId: PropTypes.string.isRequired,
  isValidationBarVisible: PropTypes.bool,
  name: PropTypes.string.isRequired,
  review: PropTypes.func.isRequired,
  saveDraft: PropTypes.func,
  setDocumentState: PropTypes.func,
  setTosVisibility: PropTypes.func.isRequired,
  setValidationVisibility: PropTypes.func,
  state: PropTypes.string,
  tosId: PropTypes.string,
  versions: PropTypes.array
};

export default TosHeader;
