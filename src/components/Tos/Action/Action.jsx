/* eslint-disable sonarjs/todo-tag */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { uniqueId } from 'lodash';

import Record from '../Record/Record';
import Attributes from '../Attribute/Attributes';
import DeleteView from '../DeleteView/DeleteView';
import Popup from '../../Popup';
import ReorderView from '../Reorder/ReorderView';
import ImportView from '../ImportView/ImportView';
import EditorForm from '../EditorForm/EditorForm';
import Dropdown from '../../Dropdown';
import Sticky from '../../Sticky/Sticky';
import { DROPDOWN_ITEMS } from '../../../constants';
import { attributeButton } from '../../../utils/attributeHelper';
import './Action.scss';

const Action = React.forwardRef(
  (
    {
      action,
      actionTypes,
      actions,
      addRecord,
      attributeTypes,
      changeOrder,
      displayMessage,
      documentState,
      editAction,
      editActionAttribute,
      editRecord,
      editRecordAttribute,
      importItems,
      phases,
      phasesOrder,
      recordTypes,
      records,
      removeAction,
      removeRecord,
      setActionVisibility,
      setRecordVisibility,
    },
    ref,
  ) => {
    const [typeSpecifier, setTypeSpecifier] = useState(action.attributes.TypeSpecifier || null);
    const [type, setType] = useState(action.attributes.ActionType || null);
    const [deleting, setDeleting] = useState(false);
    const [showReorderView, setShowReorderView] = useState(false);
    const [showImportView, setShowImportView] = useState(false);
    const [mode, setMode] = useState('view');
    const [editingTypeSpecifier, setEditingTypeSpecifier] = useState(false);
    const [editingAction, setEditingAction] = useState(false);
    const [complementingAction, setComplementingAction] = useState(false);
    const [creatingRecord, setCreatingRecord] = useState(false);
    const [complementingRecordAdd, setComplementingRecordAdd] = useState(false);
    const [record, setRecord] = useState(null);
    const [topOffset, setTopOffset] = useState(0);

    const element = ref;
    const records_ref = useRef({});

    const updateTopOffsetForSticky = useCallback(() => {
      const headerEl = document.getElementById('single-tos-header-container');
      const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
      const menuEl = document.getElementById('navigation-menu');
      const menuHeight = menuEl ? menuEl.getBoundingClientRect().height : 0;
      const phaseTitles = document.getElementsByClassName('phase-title-sticky');
      let phaseTitleHeight = 35; // magic number for a title that fits on one row
      if (phaseTitles.length) {
        phaseTitleHeight = phaseTitles[phaseTitles.length - 1].getBoundingClientRect().height;
      }
      setTopOffset(headerHeight + menuHeight + phaseTitleHeight);
    }, []);

    const disableEditMode = useCallback(() => {
      setEditingTypeSpecifier(false);
      setEditingAction(false);
      setComplementingAction(false);
      setMode('view');
    }, []);

    useEffect(() => {
      updateTopOffsetForSticky();
      window.addEventListener('resize', updateTopOffsetForSticky);

      return () => {
        window.removeEventListener('resize', updateTopOffsetForSticky);
      };
    }, [updateTopOffsetForSticky]);

    useEffect(() => {
      if (action.attributes.TypeSpecifier) {
        setTypeSpecifier(action.attributes.TypeSpecifier);
      }
      if (action.attributes.ActionType) {
        setType(action.attributes.ActionType);
      }
      if (documentState === 'view') {
        disableEditMode();
      }
    }, [action.attributes, documentState, disableEditMode]);

    const onTypeSpecifierChange = useCallback((event) => {
      setTypeSpecifier(event.target.value);
    }, []);

    const toggleReorderView = useCallback(() => {
      setShowReorderView((prev) => !prev);
    }, []);

    const toggleImportView = useCallback(() => {
      setShowImportView((prev) => !prev);
    }, []);

    const editTypeSpecifier = useCallback(() => {
      if (documentState === 'edit') {
        setEditingTypeSpecifier(true);
        setMode('edit');
      }
    }, [documentState]);

    const editActionForm = useCallback(() => {
      if (documentState === 'edit') {
        setEditingAction(true);
        setMode('edit');
      }
    }, [documentState]);

    const complementRecordAdd = useCallback(() => {
      if (documentState !== 'edit') {
        setComplementingRecordAdd(true);
      }
    }, [documentState]);

    const onEditFormShowMoreAction = useCallback((e) => {
      e.preventDefault();
      setComplementingAction((prev) => !prev);
      setEditingAction((prev) => !prev);
    }, []);

    const updateActionTypeSpecifier = useCallback(
      (event) => {
        event?.preventDefault();
        const updatedTypeSpecifier = {
          typeSpecifier,
          actionId: action.id,
        };
        editActionAttribute(updatedTypeSpecifier);
        disableEditMode();
      },
      [action.id, typeSpecifier, editActionAttribute, disableEditMode],
    );

    const updateActionType = useCallback(
      (event) => {
        event?.preventDefault();
        const updatedActionType = {
          type,
          actionId: action.id,
        };
        editActionAttribute(updatedActionType);
        disableEditMode();
      },
      [action.id, type, editActionAttribute, disableEditMode],
    );

    const updateActionAttribute = useCallback(
      (attribute, attributeIndex) => {
        const updatedActionAttribute = { attribute, attributeIndex, actionId: action.id };
        editActionAttribute(updatedActionAttribute);
      },
      [action.id, editActionAttribute],
    );

    const editActionWithForm = useCallback(
      (attributes, actionId, disableEditModeFlag = true) => {
        setTypeSpecifier(attributes.TypeSpecifier);
        setType(attributes.ActionType);
        editAction(attributes, actionId);
        if (disableEditModeFlag) {
          disableEditMode();
        }
      },
      [editAction, disableEditMode],
    );

    const createNewRecord = useCallback(() => {
      setCreatingRecord(true);
      setRecord({ attributes: {} });
    }, []);

    const cancelRecordCreation = useCallback(() => {
      setCreatingRecord(false);
    }, []);

    const cancelRecordComplement = useCallback(() => {
      setComplementingRecordAdd(false);

      setRecord(null);
    }, []);

    const onEditFormShowMore = useCallback((e, recordAttributes) => {
      e.preventDefault();
      const newAttrs = {};
      Object.keys(recordAttributes).forEach((key) => {
        if (recordAttributes?.[key].value) {
          Object.assign(newAttrs, { [key]: recordAttributes?.[key].value });
        }
      });

      setRecord((prev) => ({
        ...prev,
        attributes: newAttrs,
      }));

      setComplementingRecordAdd((prev) => !prev);
      setCreatingRecord((prev) => !prev);
    }, []);

    const createRecord = useCallback(
      (attributes, actionId) => {
        setCreatingRecord(false);
        setComplementingRecordAdd(false);
        addRecord(attributes, actionId);
      },
      [addRecord],
    );

    const cancelDeletion = useCallback(() => {
      setDeleting(false);
    }, []);

    const deleteAction = useCallback(() => {
      removeAction(action.id, action.phase);
      setDeleting(false);
    }, [action.id, action.phase, removeAction]);
    const getTargetName = useCallback(() => {
      return typeSpecifier || type || '';
    }, [typeSpecifier, type]);

    const generateDropdownItems = useCallback(() => {
      return [
        { ...DROPDOWN_ITEMS[0], text: 'Uusi asiakirja', action: () => createNewRecord() },
        { ...DROPDOWN_ITEMS[1], text: 'Muokkaa toimenpidettä', action: () => editActionForm() },
        { ...DROPDOWN_ITEMS[2], text: 'Järjestä asiakirjoja', action: () => toggleReorderView() },
        { ...DROPDOWN_ITEMS[3], text: 'Tuo asiakirjoja', action: () => toggleImportView() },
        { ...DROPDOWN_ITEMS[4], text: 'Poista toimenpide', action: () => setDeleting(true) },
      ];
    }, [createNewRecord, editActionForm, toggleReorderView, toggleImportView]);

    const generateRecords = useCallback(
      (actionRecords) => {
        const elements = [];
        if (!actionRecords) return elements;

        Object.keys(actionRecords).forEach((key) => {
          const recordId = actionRecords[key];
          if (records && Object.hasOwn(records, recordId)) {
            elements.push(
              <Record
                key={key}
                record={records[recordId]}
                documentState={documentState}
                recordTypes={recordTypes}
                attributeTypes={attributeTypes}
                editRecord={editRecord}
                editRecordAttribute={editRecordAttribute}
                removeRecord={removeRecord}
                setRecordVisibility={setRecordVisibility}
                displayMessage={displayMessage}
                ref={(element) => {
                  records_ref.current[recordId] = element;
                }}
              />,
            );
          }
        });
        return elements;
      },
      [
        records,
        documentState,
        recordTypes,
        attributeTypes,
        editRecord,
        editRecordAttribute,
        removeRecord,
        setRecordVisibility,
        displayMessage,
      ],
    );

    const renderActionButtons = useCallback(() => {
      const actionDropdownItems = generateDropdownItems();

      return (
        <div className='action-buttons'>
          {documentState === 'edit' && (
            <span className='action-dropdown-button'>
              <Dropdown items={actionDropdownItems} extraSmall />
            </span>
          )}
          {attributeButton(action.attributes, attributeTypes) && (
            <button
              type='button'
              className='btn btn-info btn-xs record-button pull-right'
              onClick={() => setActionVisibility(action.id, !action.is_open)}
            >
              <span className={`fa-solid ${action.is_open ? 'fa-minus' : 'fa-plus'}`} aria-hidden='true' />
            </button>
          )}
        </div>
      );
    }, [
      documentState,
      action.attributes,
      action.id,
      action.is_open,
      generateDropdownItems,
      attributeTypes,
      setActionVisibility,
    ]);

    const renderBasicAttributes = useCallback(() => {
      const classNames = classnames(['col-xs-12', 'basic-attribute', documentState === 'edit' ? 'editable' : null]);

      let typeSpecifierElement = (
        <span
          className={classNames}
          onClick={() => editTypeSpecifier()}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              editTypeSpecifier();
            }
          }}
        >
          {typeSpecifier}
        </span>
      );

      if (mode === 'edit' && editingTypeSpecifier) {
        typeSpecifierElement = (
          <div className='col-xs-11 action-title-input row'>
            <form onSubmit={updateActionTypeSpecifier}>
              <input
                className='input-title form-control col-xs-11'
                value={typeSpecifier || ''}
                onChange={onTypeSpecifierChange}
                onBlur={updateActionTypeSpecifier}
                autoFocus
              />
            </form>
          </div>
        );
      }

      if (action.is_open && action.records?.length) {
        return (
          <Sticky
            topOffset={-1 * topOffset}
            bottomOffset={topOffset}
            boundaryElement='.actions'
            hideOnBoundaryHit
            stickyStyle={{
              position: 'fixed',
              top: topOffset,
              left: 0,
            }}
            stickyClassName='action-title-sticky'
            className='action-title action-open'
          >
            <div className='basic-attributes'>{typeSpecifierElement}</div>
          </Sticky>
        );
      }

      return (
        <div className='action-title action-closed'>
          <div className='basic-attributes'>{typeSpecifierElement}</div>
        </div>
      );
    }, [
      mode,
      documentState,
      action.is_open,
      action.records,
      typeSpecifier,
      topOffset,
      editTypeSpecifier,
      updateActionTypeSpecifier,
      onTypeSpecifierChange,
      editingTypeSpecifier,
    ]);

    const recordElements = action.records ? generateRecords(action.records) : [];
    const reorderRecords = action.records
      ? action.records.map((recordId) => ({
          id: recordId,
          key: uniqueId(recordId),
        }))
      : [];

    return (
      <div className='action row' ref={element}>
        {mode === 'edit' && editingAction && (
          <EditorForm
            onShowMore={onEditFormShowMoreAction}
            targetId={action.id}
            attributes={action.attributes}
            attributeTypes={attributeTypes}
            elementConfig={{
              elementTypes: actionTypes,
              editWithForm: editActionWithForm,
            }}
            editorConfig={{
              type: 'action',
              action: 'edit',
            }}
            closeEditorForm={disableEditMode}
            displayMessage={displayMessage}
          />
        )}
        {mode === 'edit' && complementingAction && (
          <EditorForm
            onShowMore={onEditFormShowMoreAction}
            targetId={action.id}
            attributes={action.attributes}
            attributeTypes={attributeTypes}
            elementConfig={{
              elementTypes: actionTypes,
              editWithForm: editActionWithForm,
            }}
            editorConfig={{
              type: 'action',
              action: 'complement',
            }}
            closeEditorForm={disableEditMode}
            displayMessage={displayMessage}
          />
        )}
        {!editingAction && !complementingAction && (
          <div>
            <div className='box'>
              <Attributes
                element={action}
                documentState={documentState}
                type='action'
                attributeTypes={attributeTypes}
                typeOptions={actionTypes}
                renderBasicAttributes={renderBasicAttributes}
                renderButtons={renderActionButtons}
                updateTypeSpecifier={updateActionTypeSpecifier}
                updateType={updateActionType}
                updateAttribute={updateActionAttribute}
                showAttributes={action.is_open}
              />
              {creatingRecord && (
                <EditorForm
                  onShowMoreForm={onEditFormShowMore}
                  targetId={action.id}
                  attributes={record?.attributes || {}}
                  attributeTypes={attributeTypes}
                  elementConfig={{
                    elementTypes: recordTypes,
                    createRecord: createRecord,
                  }}
                  editorConfig={{
                    type: 'record',
                    action: 'add',
                  }}
                  closeEditorForm={cancelRecordCreation}
                  displayMessage={displayMessage}
                />
              )}
              {complementingRecordAdd && (
                <EditorForm
                  onShowMoreForm={onEditFormShowMore}
                  targetId={action.id}
                  attributes={record?.attributes || {}}
                  attributeTypes={attributeTypes}
                  elementConfig={{
                    elementTypes: recordTypes,
                    createRecord: createRecord,
                  }}
                  editorConfig={{
                    type: 'record',
                    action: 'complement',
                    from: 'newRecord',
                  }}
                  complementRecordAdd={complementRecordAdd}
                  closeEditorForm={cancelRecordComplement}
                  displayMessage={displayMessage}
                />
              )}
            </div>
            {!!recordElements.length && (
              <div className='attribute-labels-container'>
                <div
                  className={classnames('col-xs-12 records box', {
                    'records-editing': documentState === 'edit',
                  })}
                >
                  <h4>Asiakirjat</h4>
                  {recordElements}
                </div>
              </div>
            )}
          </div>
        )}

        {deleting && (
          <Popup
            closePopup={cancelDeletion}
            content={
              <DeleteView type='action' target={getTargetName()} action={deleteAction} cancel={cancelDeletion} />
            }
          />
        )}

        {showReorderView && (
          <Popup
            closePopup={toggleReorderView}
            content={
              <ReorderView
                target='record'
                toggleReorderView={toggleReorderView}
                items={reorderRecords}
                values={records}
                changeOrder={changeOrder}
                parent={action.id}
                attributeTypes={attributeTypes}
                parentName={getTargetName()}
              />
            }
          />
        )}

        {showImportView && (
          <Popup
            closePopup={toggleImportView}
            content={
              <ImportView
                level='record'
                toggleImportView={toggleImportView}
                title='asiakirjoja'
                targetText={`toimenpiteeseen "${getTargetName()}"`}
                itemsToImportText='asiakirjat'
                phasesOrder={phasesOrder}
                phases={phases}
                actions={actions}
                records={records}
                importItems={importItems}
                parent={action.id}
                parentName={action.name}
              />
            }
          />
        )}
      </div>
    );
  },
);

Action.propTypes = {
  action: PropTypes.object.isRequired,
  actionTypes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  addRecord: PropTypes.func.isRequired,
  attributeTypes: PropTypes.object.isRequired,
  changeOrder: PropTypes.func.isRequired,
  displayMessage: PropTypes.func.isRequired,
  documentState: PropTypes.string.isRequired,
  editAction: PropTypes.func.isRequired,
  editActionAttribute: PropTypes.func.isRequired,
  editRecord: PropTypes.func.isRequired,
  editRecordAttribute: PropTypes.func.isRequired,
  importItems: PropTypes.func.isRequired,
  phases: PropTypes.object.isRequired,
  phasesOrder: PropTypes.array.isRequired,
  recordTypes: PropTypes.object.isRequired,
  records: PropTypes.object.isRequired,
  removeAction: PropTypes.func.isRequired,
  removeRecord: PropTypes.func.isRequired,
  setActionVisibility: PropTypes.func.isRequired,
  setRecordVisibility: PropTypes.func.isRequired,
};

export default Action;
