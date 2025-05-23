import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import './Phase.scss';

import Action from '../Action/Action';
import Attributes from '../Attribute/Attributes';
import DeleteView from '../DeleteView/DeleteView';
import Popup from '../../Popup';
import ImportView from '../ImportView/ImportView';
import ReorderView from '../Reorder/ReorderView';

const Phase = (props) => {
  const {
    phase,
    actions,
    attributeTypes,
    documentState,
    editPhaseAttribute,
    displayMessage,
    changeOrder,
    importItems,
    removePhase,
  } = props;

  const [typeSpecifier, setTypeSpecifier] = useState(phase.attributes.TypeSpecifier || null);
  const [type, setType] = useState(phase.attributes.PhaseType || null);
  const [deleting, setDeleting] = useState(false);
  const [showReorderView, setShowReorderView] = useState(false);
  const [showImportView, setShowImportView] = useState(false);

  const element = useRef(null);

  const updateTopOffsetForSticky = useCallback(() => {
    if (element.current) {
      const offset = element.current.offsetTop;
      if (offset > 0) {
        element.current.style.top = `${offset}px`;
      }
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
    if (phase.attributes.TypeSpecifier) {
      setTypeSpecifier(phase.attributes.TypeSpecifier);
    }
    if (phase.attributes.PhaseType) {
      setType(phase.attributes.PhaseType);
    }
  }, [phase.attributes]);

  const onTypeChange = useCallback((value) => {
    setType(value);
  }, []);

  const toggleReorderView = useCallback(() => {
    setShowReorderView((prev) => !prev);
  }, []);

  const toggleImportView = useCallback(() => {
    setShowImportView((prev) => !prev);
  }, []);

  const getTargetName = useCallback(() => {
    return typeSpecifier || type || '';
  }, [typeSpecifier, type]);

  const updateTypeSpecifier = useCallback(
    (event) => {
      event?.preventDefault();
      const updatedTypeSpecifier = {
        typeSpecifier,
        phaseId: phase.id,
      };
      editPhaseAttribute(updatedTypeSpecifier);
    },
    [typeSpecifier, phase.id, editPhaseAttribute],
  );

  const cancelDeletion = useCallback(() => {
    setDeleting(false);
  }, []);

  const deletePhase = useCallback(() => {
    removePhase(phase.id);
    setDeleting(false);
  }, [phase.id, removePhase]);

  const renderBasicAttributes = () => {
    return (
      <div className='basic-attributes'>
        <Attributes
          documentState={documentState}
          type={type}
          typeSpecifier={typeSpecifier}
          onTypeChange={onTypeChange}
          updateTypeSpecifier={updateTypeSpecifier}
        />
      </div>
    );
  };

  const renderActions = (phaseActions) => {
    return Object.keys(phaseActions).map((actionId) => (
      <Action
        key={actionId}
        action={phaseActions[actionId]}
        phase={phase}
        documentState={documentState}
        attributeTypes={attributeTypes}
        editPhaseAttribute={editPhaseAttribute}
        displayMessage={displayMessage}
      />
    ));
  };

  return (
    <div className='phase' ref={element}>
      {renderBasicAttributes()}

      <div className='actions'>{actions && renderActions(actions)}</div>

      {deleting && (
        <Popup closePopup={cancelDeletion}>
          <DeleteView type='phase' target={getTargetName()} action={deletePhase} cancel={cancelDeletion} />
        </Popup>
      )}

      {showReorderView && (
        <Popup closePopup={toggleReorderView}>
          <ReorderView
            target='phase'
            items={phase.actions}
            values={actions}
            changeOrder={changeOrder}
            toggleReorderView={toggleReorderView}
            parentName={getTargetName()}
          />
        </Popup>
      )}

      {showImportView && (
        <Popup closePopup={toggleImportView}>
          <ImportView
            level='phase'
            phases={phase}
            actions={actions}
            importItems={importItems}
            toggleImportView={toggleImportView}
            targetText={`käsittelyvaiheeseen "${getTargetName()}"`}
            itemsToImportText='käsittelyvaiheet'
            title='käsittelyvaihe'
          />
        </Popup>
      )}
    </div>
  );
};

Phase.propTypes = {
  phase: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  attributeTypes: PropTypes.object.isRequired,
  documentState: PropTypes.string.isRequired,
  editPhaseAttribute: PropTypes.func.isRequired,
  removePhase: PropTypes.func.isRequired,
  displayMessage: PropTypes.func.isRequired,
  changeOrder: PropTypes.func.isRequired,
  importItems: PropTypes.func.isRequired,
};

export default Phase;
