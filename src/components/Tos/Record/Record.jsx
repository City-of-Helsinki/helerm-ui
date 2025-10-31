/* eslint-disable consistent-return */
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Dropdown from '../../Dropdown';
import Popup from '../../Popup';
import Attributes from '../Attribute/Attributes';
import DeleteView from '../DeleteView/DeleteView';
import EditorForm from '../EditorForm/EditorForm';
import './Record.scss';

const Record = React.forwardRef(
  (
    {
      attributeTypes,
      displayMessage,
      documentState,
      editRecord,
      editRecordAttribute,
      record,
      recordTypes,
      removeRecord,
      setRecordVisibility,
    },
    ref,
  ) => {
    const [complementingRecord, setComplementingRecord] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editingRecord, setEditingRecord] = useState(false);
    const [mode, setMode] = useState('view');

    const element = ref;

    const onEditFormShowMoreRecord = (e) => {
      e.preventDefault();

      setComplementingRecord((prev) => !prev);
      setEditingRecord((prev) => !prev);
    };

    const disableEditMode = () => {
      setEditingRecord(false);
      setComplementingRecord(false);
      setMode('view');
    };

    const editRecordForm = () => {
      if (documentState === 'edit') {
        setEditingRecord(true);
        setMode('edit');
      }
    };

    const editRecordWithForm = (attributesToEdit, recordId, shouldDisableEditMode = true) => {
      const editedRecord = { attributes: attributesToEdit };
      editRecord({ editedRecord, recordId });

      if (shouldDisableEditMode) {
        disableEditMode();
      }
    };

    const updateTypeSpecifier = (typeSpecifier, recordId) => {
      editRecordAttribute({
        recordId,
        attributeName: 'TypeSpecifier',
        attributeValue: typeSpecifier,
      });
    };

    const updateRecordType = (type, recordId) => {
      editRecordAttribute({
        recordId,
        attributeName: 'RecordType',
        attributeValue: type,
      });
    };

    const updateRecordAttribute = (attribute, attributeIndex, recordId) => {
      editRecordAttribute({
        recordId,
        attributeName: attributeIndex,
        attributeValue: attribute,
      });
    };

    const cancelDeletion = () => {
      setDeleting(false);
    };

    const deleteRecord = () => {
      setDeleting(false);
      removeRecord({ recordId: record.id, actionId: record.action });
    };

    const showAttributeButton = (attributesToCheck) => {
      const actualAttributes = [];

      Object.keys(attributesToCheck).forEach((key) => {
        if (key !== 'TypeSpecifier' && key !== 'RecordType') {
          actualAttributes.push(key);
        }
      });

      return !!actualAttributes.length;
    };

    const renderRecordButtons = () => {
      if (mode === 'view') {
        return (
          <div className='record-button-group'>
            {documentState === 'edit' && (
              <Dropdown
                items={[
                  {
                    text: 'Muokkaa asiakirjaa',
                    icon: 'fa-pencil',
                    style: 'btn-primary',
                    action: () => editRecordForm(),
                  },
                  {
                    text: 'Poista asiakirja',
                    icon: 'fa-trash',
                    style: 'btn-delete',
                    action: () => setDeleting(true),
                  },
                ]}
                extraSmall
              />
            )}
            {showAttributeButton(record.attributes) && (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label
              <button
                type='button'
                className='btn btn-info btn-xs record-button pull-right'
                onClick={() => setRecordVisibility(record.id, !record.is_open)}
              >
                <span className={`fa-solid ${record.is_open ? 'fa-minus' : 'fa-plus'}`} aria-hidden='true' />
              </button>
            )}
          </div>
        );
      }
    };

    return (
      <div
        className={classnames(
          'record col-xs-12',
          { 'record-open': record.is_open },
          { 'record-closed': !record.is_open },
        )}
        ref={element}
      >
        <div>
          {mode === 'edit' && editingRecord && (
            <EditorForm
              onShowMore={onEditFormShowMoreRecord}
              targetId={record.id}
              attributes={record.attributes}
              attributeTypes={attributeTypes}
              elementConfig={{
                elementTypes: recordTypes,
                editWithForm: editRecordWithForm,
              }}
              editorConfig={{
                type: 'record',
                action: 'edit',
              }}
              closeEditorForm={disableEditMode}
              displayMessage={displayMessage}
            />
          )}
          {mode === 'edit' && complementingRecord && (
            <EditorForm
              onShowMore={onEditFormShowMoreRecord}
              targetId={record.id}
              attributes={record.attributes}
              attributeTypes={attributeTypes}
              elementConfig={{
                elementTypes: recordTypes,
                editWithForm: editRecordWithForm,
              }}
              editorConfig={{
                type: 'record',
                action: 'complement',
                from: 'editRecord',
              }}
              closeEditorForm={disableEditMode}
              displayMessage={displayMessage}
            />
          )}
          {!editingRecord && !complementingRecord && (
            <Attributes
              element={record}
              documentState={documentState}
              type='record'
              attributeTypes={attributeTypes}
              typeOptions={recordTypes}
              renderButtons={renderRecordButtons}
              updateTypeSpecifier={updateTypeSpecifier}
              updateType={updateRecordType}
              updateAttribute={updateRecordAttribute}
              showAttributes={record.is_open}
            />
          )}
          {deleting && (
            <Popup
              content={
                <DeleteView
                  type='record'
                  target={record.attributes.TypeSpecifier || record.attributes.RecordType || '---'}
                  action={deleteRecord}
                  cancel={cancelDeletion}
                />
              }
              closePopup={cancelDeletion}
            />
          )}
        </div>
      </div>
    );
  },
);

Record.propTypes = {
  attributeTypes: PropTypes.object.isRequired,
  displayMessage: PropTypes.func.isRequired,
  documentState: PropTypes.string.isRequired,
  editRecord: PropTypes.func.isRequired,
  editRecordAttribute: PropTypes.func.isRequired,
  record: PropTypes.object.isRequired,
  recordTypes: PropTypes.object.isRequired,
  removeRecord: PropTypes.func.isRequired,
  setRecordVisibility: PropTypes.func.isRequired,
};

export default Record;
