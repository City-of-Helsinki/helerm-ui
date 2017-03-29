import React, { PropTypes } from 'react';
import Sticky from 'react-sticky';

import ActionButtons from './ActionButtons';

const TosHeader = ({
  cancelEdit,
  documentState,
  functionId,
  fetchTos,
  name,
  saveDraft,
  changeStatus,
  setDocumentState,
  state,
  tosId
}) => {
  const tosName = `${functionId} ${name}`;

  return (
    <Sticky className='single-tos-header'>
      <div className='row'>
        <h4 className='col-md-6 col-xs-12'>{tosName}</h4>
        <div className='document-buttons col-xs-12 col-md-6'>
          <ActionButtons
            cancelEdit={cancelEdit}
            changeStatus={changeStatus}
            documentState={documentState}
            fetchTos={fetchTos}
            saveDraft={saveDraft}
            setDocumentState={setDocumentState}
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
  documentState: PropTypes.string.isRequired,
  fetchTos: PropTypes.func.isRequired,
  functionId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  saveDraft: PropTypes.func,
  setDocumentState: PropTypes.func,
  state: PropTypes.string,
  tosId: PropTypes.string
};

export default TosHeader;
