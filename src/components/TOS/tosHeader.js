import React, { PropTypes } from 'react';
import Sticky from 'react-sticky';

import IsAllowed from 'components/IsAllowed/IsAllowed';

import { EDIT } from '../../../config/constants';

const TosHeader = ({ functionId, name, documentState, sendForInspection, setDocumentState, saveDraft, cancelEdit }) => {
  return (
    <Sticky className='single-tos-header'>
      <div className='row'>
        <h4 className='col-md-6 col-xs-12'>{functionId} {name}</h4>
        <div className='document-buttons col-xs-12 col-md-6'>
          { documentState !== 'edit' &&
          <IsAllowed to={EDIT}>
            <span>
              <button
                className='btn btn-default btn-sm pull-right'
                onClick={sendForInspection}>
                Lähetä tarkastettavaksi
              </button>
              <button
                className='btn btn-primary btn-sm pull-right'
                onClick={() => setDocumentState('edit')}>
                Muokkaustila
              </button>
            </span>
          </IsAllowed>
          }
          { documentState === 'edit' &&
          <IsAllowed to={EDIT}>
            <span>
              <button
                className='btn btn-primary btn-sm pull-right'
                onClick={saveDraft}>
                Tallenna luonnos
              </button>
              <button
                className='btn btn-danger btn-sm pull-right'
                onClick={cancelEdit}>
                Peruuta muokkaus
              </button>
              <span
                className='fa fa-asterisk required-asterisk required-legend'> = Pakollinen tieto
              </span>
            </span>
          </IsAllowed>
          }
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
  setDocumentState: PropTypes.func
};

export default TosHeader;
