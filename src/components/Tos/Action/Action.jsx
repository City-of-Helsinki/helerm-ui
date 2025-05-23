/* eslint-disable sonarjs/todo-tag */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Sticky from 'react-sticky-el';
import './Action.scss';

import Record from '../Record/Record';
import Attributes from '../Attribute/Attributes';
import DeleteView from '../DeleteView/DeleteView';
import Popup from '../../Popup';
import ReorderView from '../Reorder/ReorderView';
import ImportView from '../ImportView/ImportView';

const Action = (props) => {
  const {
    action,
    attributeTypes,
    changeOrder,
    displayMessage,
    documentState,
    editActionAttribute,
    editRecord,
    editRecordAttribute,
    importItems,
    removeAction,
    removeRecord,
    setActionVisibility,
    setRecordVisibility,
  } = props;

  const [typeSpecifier, setTypeSpecifier] = useState(action.attributes.TypeSpecifier || null);
  const [type, setType] = useState(action.attributes.ActionType || null);
  const [deleting, setDeleting] = useState(false);
  const [showReorderView, setShowReorderView] = useState(false);
  const [showImportView, setShowImportView] = useState(false);
  const [topOffset, setTopOffset] = useState(0);

  const element = useRef(null);

  const updateTopOffsetForSticky = useCallback(() => {
    if (element.current) {
      setTopOffset(element.current.offsetTop);
    }
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
  }, [action.attributes, documentState]);

  const onTypeChange = useCallback((value) => {
    setType(value);
  }, []);

  const toggleReorderView = useCallback(() => {
    setShowReorderView((prev) => !prev);
  }, []);

  const toggleImportView = useCallback(() => {
    setShowImportView((prev) => !prev);
  }, []);

  const updateActionTypeSpecifier = useCallback(
    (event) => {
      event?.preventDefault();
      editActionAttribute({
        actionId: action.id,
        attribute: 'TypeSpecifier',
        value: typeSpecifier,
      });
    },
    [action.id, typeSpecifier, editActionAttribute],
  );

  const updateActionType = useCallback(
    (event) => {
      event?.preventDefault();
      editActionAttribute({
        actionId: action.id,
        attribute: 'ActionType',
        value: type,
      });
    },
    [action.id, type, editActionAttribute],
  );

  const cancelDeletion = useCallback(() => {
    setDeleting(false);
  }, []);

  const deleteAction = useCallback(() => {
    removeAction(action.id);
    setDeleting(false);
  }, [action.id, removeAction]);

  const getTargetName = useCallback(() => {
    return typeSpecifier || type || '';
  }, [typeSpecifier, type]);

  const renderRecords = () => {
    return action.records.map((recordId) => (
      <Record
        key={recordId}
        record={action.records[recordId]}
        documentState={documentState}
        attributeTypes={attributeTypes}
        editRecord={editRecord}
        editRecordAttribute={editRecordAttribute}
        removeRecord={removeRecord}
        setRecordVisibility={setRecordVisibility}
        displayMessage={displayMessage}
      />
    ));
  };

  const renderActionHeader = () => (
    <div className='action-header'>
      <Attributes
        element={action}
        documentState={documentState}
        type={type}
        attributeTypes={attributeTypes}
        typeSpecifier={typeSpecifier}
        onTypeChange={onTypeChange}
        updateTypeSpecifier={updateActionTypeSpecifier}
        updateType={updateActionType}
      />
      {action.is_open && (
        <button
          type='button'
          className='btn btn-info btn-xs action-button pull-right'
          onClick={() => setActionVisibility(action.id, false)}
          aria-label='Sulje'
        >
          <span className='fa-solid fa-chevron-up' aria-hidden='true' />
        </button>
      )}
      {!action.is_open && (
        <button
          type='button'
          className='btn btn-info btn-xs action-button pull-right'
          onClick={() => setActionVisibility(action.id, true)}
          aria-label='Avaa'
        >
          <span className='fa-solid fa-chevron-down' aria-hidden='true' />
        </button>
      )}
    </div>
  );

  return (
    <div className='action' ref={element}>
      <Sticky topOffset={-topOffset} bottomOffset={0} stickyClass='sticky' stickyStyle={{ top: topOffset }}>
        {renderActionHeader()}
      </Sticky>

      {action.is_open && (
        <>
          <div className='records'>{action.records && renderRecords()}</div>

          {deleting && (
            <Popup closePopup={cancelDeletion}>
              <DeleteView type='action' target={getTargetName()} action={deleteAction} cancel={cancelDeletion} />
            </Popup>
          )}

          {showReorderView && (
            <Popup closePopup={toggleReorderView}>
              <ReorderView
                target='action'
                items={action.records}
                changeOrder={changeOrder}
                toggleReorderView={toggleReorderView}
                parentName={getTargetName()}
              />
            </Popup>
          )}

          {showImportView && (
            <Popup closePopup={toggleImportView}>
              <ImportView
                level='action'
                actions={action}
                importItems={importItems}
                toggleImportView={toggleImportView}
                targetText={`toimenpiteeseen "${getTargetName()}"`}
                itemsToImportText='toimenpiteet'
                title='toimenpide'
              />
            </Popup>
          )}
        </>
      )}
    </div>
  );
};

Action.propTypes = {
  action: PropTypes.object.isRequired,
  attributeTypes: PropTypes.object.isRequired,
  changeOrder: PropTypes.func.isRequired,
  displayMessage: PropTypes.func.isRequired,
  documentState: PropTypes.string.isRequired,
  editActionAttribute: PropTypes.func.isRequired,
  editRecord: PropTypes.func.isRequired,
  editRecordAttribute: PropTypes.func.isRequired,
  importItems: PropTypes.func.isRequired,
  removeAction: PropTypes.func.isRequired,
  removeRecord: PropTypes.func.isRequired,
  setActionVisibility: PropTypes.func.isRequired,
  setRecordVisibility: PropTypes.func.isRequired,
};

export default Action;
