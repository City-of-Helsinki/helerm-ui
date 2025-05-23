/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import EditorForm from '../EditorForm/EditorForm';
import { formatDateTime, getStatusLabel } from '../../../utils/helpers';

const VersionData = ({ attributeTypes, displayMessage, editValidDates, selectedTOS, setVersionVisibility }) => {
  const [editing, setEditing] = useState(false);
  const [validFrom, setValidFrom] = useState(null);
  const [validFromEditing, setValidFromEditing] = useState(false);
  const [validTo, setValidTo] = useState(null);
  const [validToEditing, setValidToEditing] = useState(false);

  useEffect(() => {
    if (selectedTOS.documentState === 'view') {
      setEditing(false);
      setValidFromEditing(false);
      setValidToEditing(false);
    }
  }, [selectedTOS.documentState]);

  const onValidDateChange = (key, date) => {
    const value = date ? moment(date).format('YYYY-MM-DD') : null;

    if (value) {
      if (key === 'validFrom') {
        setValidFromEditing(false);
      } else if (key === 'validTo') {
        setValidToEditing(false);
      }
    }

    editValidDates({ [key]: value });
  };

  const activateValidDateEditMode = (key) => {
    if (selectedTOS.documentState === 'edit') {
      if (key === 'validFrom') {
        setValidFromEditing(true);
      } else if (key === 'validTo') {
        setValidToEditing(true);
      }
    }
  };

  const generateVersionDataButtons = () => {
    const {
      documentState,
      is_version_open: isVersionOpen,
      valid_from: validFromValue,
      valid_to: validToValue,
    } = selectedTOS;

    const isEdit = documentState === 'edit';

    return (
      <div className='pull-right'>
        {isEdit && (
          <button
            type='button'
            className='btn btn-link'
            onClick={() => {
              setEditing(true);
              setValidFrom(validFromValue);
              setValidTo(validToValue);
            }}
          >
            Muokkaa version tietoja
          </button>
        )}
        <button
          type='button'
          className='btn btn-info btn-sm'
          title={isVersionOpen ? 'Pienennä' : 'Laajenna'}
          aria-label={isVersionOpen ? 'Pienennä' : 'Laajenna'}
          onClick={() => setVersionVisibility(!isVersionOpen)}
        >
          <span className={`fa-solid ${isVersionOpen ? 'fa-minus' : 'fa-plus'}`} aria-hidden='true' />
        </button>
      </div>
    );
  };

  const generateVersionData = () => {
    const {
      modified_at: modifiedAt,
      state,
      modified_by: modifiedBy,
      valid_from: validFromValue,
      valid_to: validToValue,
    } = selectedTOS;

    const formattedDateTime = formatDateTime(modifiedAt);
    const validFromData = generateValidDateField('Voimassaolo alkaa', 'validFrom', validFromValue, validFromEditing);
    const validToData = generateValidDateField('Voimassaolo päättyy', 'validTo', validToValue, validToEditing);

    const modifiedByString = typeof modifiedBy === 'string' ? `, ${modifiedBy}` : '';

    return (
      <div>
        <div className='metadata-data-row__primary'>
          <div className='list-group-item col-xs-6'>
            <strong>Tila</strong>
            <div>{getStatusLabel(state)}</div>
          </div>
          <div className='list-group-item col-xs-6'>
            <strong>Muokkausajankohta, muokkaaja</strong>
            <div>{`${formattedDateTime}${modifiedByString}`}</div>
          </div>
        </div>
        {!editing && (
          <div className='metadata-data-row__primary'>
            {validFromData}
            {validToData}
          </div>
        )}
      </div>
    );
  };

  const generateValidDateField = (label, field, value, isEditing) => {
    if (isEditing) {
      return (
        <div className='list-group-item col-xs-6 datepicker-field'>
          <strong>{label}:</strong>
          <DatePicker
            autoFocus
            dateFormat='dd.MM.yyyy'
            isClearable
            showYearDropdown
            dateFormatCalendar='MMMM'
            placeholderText='PP.KK.VVVV'
            selected={value ? moment(value).toDate() : null}
            onChange={(date) => onValidDateChange(field, date)}
          />
        </div>
      );
    }
    return (
      <span
        onClick={() => activateValidDateEditMode(field)}
        onKeyUp={(event) => {
          if (event.key === 'Enter') {
            activateValidDateEditMode(field);
          }
        }}
        className='list-group-item col-xs-6 attribute-basic'
      >
        <strong>{label}:</strong>
        <div>{value ? formatDateTime(value, 'D.M.YYYY') : '\u00A0'}</div>
      </span>
    );
  };

  const generateEditorFormValidDateFields = () => {
    const validFromData = generateEditorFormValidDateField('Voimassaolo alkaa', 'validFrom', selectedTOS.valid_from);
    const validToData = generateEditorFormValidDateField('Voimassaolo päättyy', 'validTo', selectedTOS.valid_to);

    return [validFromData, validToData];
  };

  const generateEditorFormValidDateField = (label, field, value) => {
    return (
      <div key={field} className='col-xs-12 col-lg-6 form-group'>
        <label className='editor-form__label'>{label}</label>
        <DatePicker
          className='form-control edit-record__input'
          dateFormat='dd.MM.yyyy'
          isClearable
          showYearDropdown
          dateFormatCalendar='MMMM'
          placeholderText='PP.KK.VVVV'
          selected={value ? moment(value).toDate() : null}
          onChange={(date) => onValidDateChange(field, date)}
        />
      </div>
    );
  };

  const editVersionWithForm = () => {
    setEditing(false);
  };

  const cancelVersionEdit = () => {
    setEditing(false);
    editValidDates({ validFrom, validTo });
  };

  const versionDataButtons = generateVersionDataButtons();
  const TOSVersionData = generateVersionData();

  return (
    <div className='tos-version-data'>
      <div className='row'>
        <div className='col-xs-6'>
          <h4>Käsittelyprosessin version tiedot</h4>
        </div>
        <div className='col-xs-6'>{versionDataButtons}</div>
      </div>
      {selectedTOS.is_version_open && (
        <div className='row'>
          <div className='col-xs-12'>{TOSVersionData}</div>
        </div>
      )}
      {editing && (
        <EditorForm
          targetId={selectedTOS.id}
          additionalFields={generateEditorFormValidDateFields()}
          attributes={selectedTOS.attributes}
          attributeTypes={attributeTypes}
          editMetaDataWithForm={editVersionWithForm}
          editorConfig={{
            type: 'version',
            action: 'edit',
          }}
          closeEditorForm={cancelVersionEdit}
          displayMessage={displayMessage}
        />
      )}
    </div>
  );
};

VersionData.propTypes = {
  attributeTypes: PropTypes.object.isRequired,
  displayMessage: PropTypes.func.isRequired,
  editValidDates: PropTypes.func.isRequired,
  selectedTOS: PropTypes.object.isRequired,
  setVersionVisibility: PropTypes.func.isRequired,
};

export default VersionData;
