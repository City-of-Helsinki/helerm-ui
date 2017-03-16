import React, { PropTypes } from 'react';
import Sticky from 'react-sticky';

import ActionButtons from './ActionButtons';

const TosHeader = ({
  cancelEdit,
  documentState,
  functionId,
  name,
  saveDraft,
  sendForInspection,
  setDocumentState,
  state
}) => {
  const tosName = `${functionId} ${name}`;

  return (
    <Sticky className='single-tos-header'>
      <div className='row'>
        <h4 className='col-md-6 col-xs-12'>{tosName}</h4>
        <div className='document-buttons col-xs-12 col-md-6'>
          <ActionButtons
            cancelEdit={cancelEdit}
            documentState={documentState}
            saveDraft={saveDraft}
            sendForInspection={sendForInspection}
            setDocumentState={setDocumentState}
            state={state}
          />
        </div>
      </div>
    </Sticky>
  );
};

TosHeader.propTypes = {
  cancelEdit: PropTypes.func,
  documentState: PropTypes.string.isRequired,
  functionId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  saveDraft: PropTypes.func,
  sendForInspection: PropTypes.func,
  setDocumentState: PropTypes.func,
  state: PropTypes.string
};

export default TosHeader;
