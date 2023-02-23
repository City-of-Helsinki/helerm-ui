/* eslint-disable import/no-cycle */
/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import EditorForm from '../EditorForm/EditorForm';
import { formatDateTime, getStatusLabel } from '../../../utils/helpers';

class VersionData extends React.Component {
  constructor(props) {
    super(props);
    this.cancelVersionEdit = this.cancelVersionEdit.bind(this);
    this.editVersionWithForm = this.editVersionWithForm.bind(this);
    this.generateEditorFormValidDateFields = this.generateEditorFormValidDateFields.bind(this);
    this.generateEditorFormValidDateField = this.generateEditorFormValidDateField.bind(this);
    this.onValidDateChange = this.onValidDateChange.bind(this);

    this.state = {
      editing: false,
      validFrom: null,
      validFromEditing: false,
      validTo: null,
      validToEditing: false,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selectedTOS.documentState === 'view') {
      this.setState({
        editing: false,
        validFromEditing: false,
        validToEditing: false,
      });
    }
  }

  onValidDateChange(key, date) {
    const value = date ? moment(date).format('YYYY-MM-DD') : null;
    if (value) {
      this.setState({ [`${key}Editing`]: false });
    }
    this.props.editValidDates({ [key]: value });
  }

  generateVersionDataButtons() {
    const { selectedTOS, setVersionVisibility } = this.props;
    const { documentState, is_version_open: isVersionOpen, valid_from: validFrom, valid_to: validTo } = selectedTOS;
    const isEdit = documentState === 'edit';
    return (
      <div className='pull-right'>
        {isEdit && (
          <button
            type='button'
            className='btn btn-link'
            onClick={() => this.setState({ editing: true, validFrom, validTo })}
          >
            Muokkaa version tietoja
          </button>
        )}
        <button
          type='button'
          className='btn btn-info btn-sm'
          title={isVersionOpen ? 'Pienennä' : 'Laajenna'}
          onClick={() => setVersionVisibility(!isVersionOpen)}
        >
          <span className={`fa-solid ${isVersionOpen ? 'fa-minus' : 'fa-plus'}`} aria-hidden='true' />
        </button>
      </div>
    );
  }

  generateVersionData() {
    const {
      modified_at: modifiedAt,
      state,
      modified_by: modifiedBy,
      valid_from: validFrom,
      valid_to: validTo,
    } = this.props.selectedTOS;
    const { validFromEditing, validToEditing } = this.state;
    const formattedDateTime = formatDateTime(modifiedAt);
    const validFromData = this.generateValidDateField('Voimassaolo alkaa', 'validFrom', validFrom, validFromEditing);
    const validToData = this.generateValidDateField('Voimassaolo päättyy', 'validTo', validTo, validToEditing);

    return (
      <div>
        <div className='metadata-data-row__primary'>
          <div className='list-group-item col-xs-6'>
            <strong>Tila</strong>
            <div>{getStatusLabel(state)}</div>
          </div>
          <div className='list-group-item col-xs-6'>
            <strong>Muokkausajankohta, muokkaaja</strong>
            <div>{`${formattedDateTime}${typeof modifiedBy === 'string' ? `, ${modifiedBy}` : ''}`}</div>
          </div>
        </div>
        {!this.state.editing && (
          <div className='metadata-data-row__primary'>
            {validFromData}
            {validToData}
          </div>
        )}
      </div>
    );
  }

  generateValidDateField(label, field, value, editing) {
    if (editing) {
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
            onChange={(date) => this.onValidDateChange(field, date)}
          />
        </div>
      );
    }
    return (
      <span onClick={() => this.activateValidDateEditMode(field)} className='list-group-item col-xs-6 attribute-basic'>
        <strong>{label}:</strong>
        <div>{value ? formatDateTime(value, 'D.M.YYYY') : '\u00A0'}</div>
      </span>
    );
  }

  generateEditorFormValidDateFields() {
    const { selectedTOS } = this.props;
    const validFromData = this.generateEditorFormValidDateField(
      'Voimassaolo alkaa',
      'validFrom',
      selectedTOS.valid_from,
    );
    const validToData = this.generateEditorFormValidDateField('Voimassaolo päättyy', 'validTo', selectedTOS.valid_to);

    return [validFromData, validToData];
  }

  generateEditorFormValidDateField(label, field, value) {
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
          onChange={(date) => this.onValidDateChange(field, date)}
        />
      </div>
    );
  }

  activateValidDateEditMode(key) {
    if (this.props.selectedTOS.documentState === 'edit') {
      this.setState({ [`${key}Editing`]: true });
    }
  }

  editVersionWithForm() {
    this.setState({
      editing: false,
    });
  }

  cancelVersionEdit() {
    const { validFrom, validTo } = this.state;
    this.setState({ editing: false });
    this.props.editValidDates({ validFrom, validTo });
  }

  render() {
    const { attributeTypes, displayMessage, selectedTOS } = this.props;

    const versionDataButtons = this.generateVersionDataButtons();
    const TOSVersionData = this.generateVersionData();
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
        {this.state.editing && (
          <EditorForm
            targetId={selectedTOS.id}
            additionalFields={this.generateEditorFormValidDateFields()}
            attributes={selectedTOS.attributes}
            attributeTypes={attributeTypes}
            editMetaDataWithForm={this.editVersionWithForm}
            editorConfig={{
              type: 'version',
              action: 'edit',
            }}
            closeEditorForm={this.cancelVersionEdit}
            displayMessage={displayMessage}
          />
        )}
      </div>
    );
  }
}

VersionData.propTypes = {
  attributeTypes: PropTypes.object.isRequired,
  displayMessage: PropTypes.func.isRequired,
  editValidDates: PropTypes.func.isRequired,
  selectedTOS: PropTypes.object.isRequired,
  setVersionVisibility: PropTypes.func.isRequired,
};

export default VersionData;
