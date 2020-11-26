import React, { PropTypes } from 'react';

const ClassificationHeader = ({
  classification,
  isOpen,
  setVisibility
}) => {
  return (
    <div className='classification-header'>
      <div className='row'>
        <div className='col-xs-6'>
          <h4>Tehtäväluokan tiedot</h4>
        </div>
        <div className='col-xs-6'>
          <button
            type='button'
            className='btn btn-info btn-sm pull-right'
            title={isOpen ? 'Pienennä' : 'Laajenna'}
            onClick={() => setVisibility(!isOpen)}
          >
            <span
              className={
                'fa ' + (isOpen ? 'fa-minus' : 'fa-plus')
              }
              aria-hidden='true'
            />
          </button>
        </div>
      </div>
      {isOpen &&
        !!classification && (
        <div>
          <div className='row'>
            <div className='col-xs-12'>
              <div className='list-group-item col-xs-6'>
                <strong>Kuvaus</strong>
                <div>{classification.description || '\u00A0'}</div>
              </div>
              <div className='list-group-item col-xs-6'>
                <strong>Sisäinen kuvaus</strong>
                <div>{classification.description_internal || '\u00A0'}</div>
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-12'>
              <div className='list-group-item col-xs-6'>
                <strong>Liittyvä tehtäväluokka</strong>
                <div>{classification.related_classification || '\u00A0'}</div>
              </div>
              <div className='list-group-item col-xs-6'>
                <strong>Lisätiedot</strong>
                <div>{classification.additional_information || '\u00A0'}</div>
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-12'>
              <div className='list-group-item col-xs-6'>
                <strong>Tehtäväluokan versio</strong>
                <div>{classification.version || '\u00A0'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ClassificationHeader.propTypes = {
  classification: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  setVisibility: PropTypes.func.isRequired
};

export default ClassificationHeader;
