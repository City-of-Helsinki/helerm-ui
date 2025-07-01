import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import './Phase.scss';
import { uniqueId } from 'lodash';

import Action from '../Action/Action';
import Attributes from '../Attribute/Attributes';
import DeleteView from '../DeleteView/DeleteView';
import Popup from '../../Popup';
import ImportView from '../ImportView/ImportView';
import ReorderView from '../Reorder/ReorderView';
import Dropdown from '../../Dropdown';
import AddElementInput from '../AddElementInput/AddElementInput';
import EditorForm from '../EditorForm/EditorForm';
import { generateDefaultAttributes } from '../../../utils/attributeHelper';
import { DROPDOWN_ITEMS } from '../../../constants';

const Phase = React.forwardRef(
  (
    {
      phase,
      actions,
      actionTypes,
      addRecord,
      attributeTypes,
      documentState,
      editPhaseAttribute,
      displayMessage,
      changeOrder,
      importItems,
      removePhase,
      setActionVisibility,
      editActionAttribute,
      editRecord,
      editRecordAttribute,
      editAction,
      removeAction,
      removeRecord,
      setRecordVisibility,
      phaseTypes,
      phases,
      phasesOrder,
      records,
      recordTypes,
      setPhaseAttributesVisibility,
      addAction,
      editPhase,
      setPhaseVisibility,
      phaseIndex,
    },
    ref,
  ) => {
    const [typeSpecifier, setTypeSpecifier] = useState(phase.attributes.TypeSpecifier || null);
    const [type, setType] = useState(phase.attributes.PhaseType || null);
    const [deleting, setDeleting] = useState(false);
    const [showReorderView, setShowReorderView] = useState(false);
    const [showImportView, setShowImportView] = useState(false);
    const [mode, setMode] = useState('view');
    const [editingPhase, setEditingPhase] = useState(false);
    const [complementingPhase, setComplementingPhase] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [actionDefaultAttributes, setActionDefaultAttributes] = useState({});
    const [actionTypeSpecifier, setActionTypeSpecifier] = useState('');
    const [actionType, setActionType] = useState('');

    const element = ref;
    const actions_ref = useRef({});

    const updateTopOffsetForSticky = useCallback(() => {
      if (element.current) {
        const offset = element.current.offsetTop;
        if (offset > 0) {
          element.current.style.top = `${offset}px`;
        }
      }
    }, [element]);

    const disableEditMode = useCallback(() => {
      setMode('view');
      setEditingPhase(false);
      setComplementingPhase(false);
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
      if (documentState === 'view') {
        disableEditMode();
      }
    }, [phase.attributes, documentState, disableEditMode]);

    const toggleReorderView = useCallback(() => {
      setShowReorderView((prev) => !prev);
    }, []);

    const toggleImportView = useCallback(() => {
      setShowImportView((prev) => !prev);
    }, []);

    const getTargetName = useCallback(() => {
      const hasType = type?.length;
      const hasTypeSpecifier = typeSpecifier?.length;
      const slash = hasType && hasTypeSpecifier ? ' / ' : '';

      return (type || '') + slash + (typeSpecifier || '');
    }, [typeSpecifier, type]);

    const updateTypeSpecifier = useCallback(
      (newTypeSpecifier, phaseId) => {
        const updatedTypeSpecifier = {
          typeSpecifier: newTypeSpecifier,
          phaseId: phaseId || phase.id,
        };
        editPhaseAttribute(updatedTypeSpecifier);
        disableEditMode();
      },
      [phase.id, editPhaseAttribute, disableEditMode],
    );

    const updatePhaseType = useCallback(
      (event) => {
        if (event && typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        const updatedPhaseType = {
          type,
          phaseId: phase.id,
        };
        editPhaseAttribute(updatedPhaseType);
        disableEditMode();
      },
      [type, phase.id, editPhaseAttribute, disableEditMode],
    );

    const updatePhaseAttribute = useCallback(
      (attribute, attributeIndex) => {
        const updatedPhaseAttribute = { attribute, attributeIndex, phaseId: phase.id };
        editPhaseAttribute(updatedPhaseAttribute);
      },
      [phase.id, editPhaseAttribute],
    );

    const editPhaseWithForm = useCallback(
      (attributes, phaseId, disableEditModeFlag = true) => {
        setTypeSpecifier(attributes.TypeSpecifier);
        setType(attributes.PhaseType);
        editPhase(attributes, phaseId);
        if (disableEditModeFlag) {
          disableEditMode();
        }
      },
      [editPhase, disableEditMode],
    );

    const cancelDeletion = useCallback(() => {
      setDeleting(false);
    }, []);

    const deletePhase = useCallback(() => {
      if (phase.actions) {
        phase.actions.forEach((actionId) => {
          removeAction(actionId, phase.id);
        });
      }
      removePhase(phase.id);
      setDeleting(false);
    }, [phase.id, phase.actions, removeAction, removePhase]);

    const editPhaseForm = useCallback(() => {
      if (documentState === 'edit') {
        setEditingPhase(true);
        setMode('edit');
      }
    }, [documentState]);

    const onEditFormShowMorePhase = useCallback((e) => {
      e.preventDefault();
      setComplementingPhase((prev) => !prev);
      setEditingPhase((prev) => !prev);
    }, []);

    const createNewAction = useCallback(() => {
      setMode('add');
    }, []);

    const onActionDefaultAttributeChange = useCallback((key, value) => {
      setActionDefaultAttributes((prev) => ({
        ...prev,
        [key]: value,
      }));
    }, []);

    const onActionTypeSpecifierChange = useCallback((event) => {
      setActionTypeSpecifier(event.target.value);
    }, []);

    const onActionTypeChange = useCallback((value) => {
      setActionType(value);
    }, []);

    const onActionTypeInputChange = useCallback((event) => {
      setActionType(event.target.value);
    }, []);

    const onAddFormShowMoreAction = useCallback((e) => {
      e.preventDefault();
      setShowMore((prev) => !prev);
    }, []);

    const addActionHandler = useCallback(
      (event) => {
        event.preventDefault();
        if (setPhaseVisibility) {
          setPhaseVisibility(phaseIndex, true);
        }
        addAction(actionTypeSpecifier || '', actionType || '', actionDefaultAttributes || {}, phaseIndex);
        setActionTypeSpecifier('');
        setActionType('');
        setActionDefaultAttributes({});
        disableEditMode();
        displayMessage({
          title: 'Toimenpide',
          body: 'Toimenpiteen lisäys onnistui!',
        });
      },
      [
        actionTypeSpecifier,
        actionType,
        actionDefaultAttributes,
        phaseIndex,
        addAction,
        setPhaseVisibility,
        disableEditMode,
        displayMessage,
      ],
    );

    const cancelActionCreation = useCallback(
      (event) => {
        event.preventDefault();
        setActionDefaultAttributes({});
        setActionTypeSpecifier('');
        disableEditMode();
      },
      [disableEditMode],
    );

    const togglePhaseAttributesVisibility = useCallback(() => {
      if (setPhaseAttributesVisibility) {
        setPhaseAttributesVisibility(phase.id, !phase.is_attributes_open);
      }
    }, [phase.id, phase.is_attributes_open, setPhaseAttributesVisibility]);

    const generateDropdownItems = useCallback(() => {
      return [
        { ...DROPDOWN_ITEMS[0], text: 'Uusi toimenpide', action: () => createNewAction() },
        { ...DROPDOWN_ITEMS[1], text: 'Muokkaa käsittelyvaihetta', action: () => editPhaseForm() },
        { ...DROPDOWN_ITEMS[2], text: 'Järjestä toimenpiteitä', action: () => toggleReorderView() },
        { ...DROPDOWN_ITEMS[3], text: 'Tuo toimenpiteitä', action: () => toggleImportView() },
        { ...DROPDOWN_ITEMS[4], text: 'Poista käsittelyvaihe', action: () => setDeleting(true) },
      ];
    }, [createNewAction, editPhaseForm, toggleReorderView, toggleImportView]);

    const generateTypeOptions = useCallback((typeOptions) => {
      const options = [];

      Object.keys(typeOptions || {}).forEach((key) => {
        if (Object.hasOwn(typeOptions, key)) {
          options.push({
            label: typeOptions[key].name,
            value: typeOptions[key].name,
          });
        }
      });

      return options;
    }, []);

    const renderPhaseButtons = useCallback(() => {
      const phaseDropdownItems = generateDropdownItems();

      return (
        <div className='phase-buttons'>
          {phase.actions?.length !== 0 && (
            <button
              type='button'
              className='btn btn-info btn-sm pull-right'
              title={phase.is_open ? 'Pienennä' : 'Laajenna'}
              aria-label={phase.is_open ? 'Pienennä' : 'Laajenna'}
              onClick={() => setPhaseVisibility && setPhaseVisibility(phaseIndex, !phase.is_open)}
            >
              <span className={`fa-solid ${phase.is_open ? 'fa-minus' : 'fa-plus'}`} aria-hidden='true' />
            </button>
          )}
          {documentState === 'edit' && (
            <span className='pull-right'>
              <Dropdown items={phaseDropdownItems} small />
            </span>
          )}
          {documentState === 'edit' && (
            <button type='button' className='btn btn-default' onClick={() => togglePhaseAttributesVisibility()}>
              {phase.is_attributes_open ? 'Piilota metatiedot' : 'Näytä metatiedot'}
            </button>
          )}
        </div>
      );
    }, [
      documentState,
      phase.actions,
      phase.is_attributes_open,
      phase.is_open,
      generateDropdownItems,
      togglePhaseAttributesVisibility,
      phaseIndex,
      setPhaseVisibility,
    ]);

    const renderBasicAttributes = useCallback(() => {
      const typeOptions = {};
      if (phaseTypes) {
        Object.keys(phaseTypes).forEach((key) => {
          if (Object.hasOwn(phaseTypes, key)) {
            typeOptions[key] = {
              value: phaseTypes[key].value,
            };
          }
        });
      }

      return (
        <div className='basic-attributes'>
          <Attributes
            attributeTypes={attributeTypes}
            documentState={documentState}
            element={{
              id: phase.id,
              attributes: phase.attributes,
            }}
            showAttributes={phase.is_attributes_open || false}
            type='phase'
            typeOptions={typeOptions}
            renderButtons={renderPhaseButtons}
            updateAttribute={updatePhaseAttribute}
            updateType={updatePhaseType}
            updateTypeSpecifier={updateTypeSpecifier}
          />
        </div>
      );
    }, [
      attributeTypes,
      documentState,
      phase.id,
      phase.attributes,
      phase.is_attributes_open,
      phaseTypes,
      renderPhaseButtons,
      updatePhaseAttribute,
      updatePhaseType,
      updateTypeSpecifier,
    ]);

    const renderActions = useCallback(
      (phaseActions) => {
        return Object.keys(phaseActions).map((actionId) => (
          <Action
            key={actionId}
            action={phaseActions[actionId]}
            phase={phase}
            documentState={documentState}
            attributeTypes={attributeTypes}
            editPhaseAttribute={editPhaseAttribute}
            displayMessage={displayMessage}
            setActionVisibility={setActionVisibility}
            editActionAttribute={editActionAttribute}
            editRecord={editRecord}
            editRecordAttribute={editRecordAttribute}
            removeAction={removeAction}
            removeRecord={removeRecord}
            setRecordVisibility={setRecordVisibility}
            actionTypes={actionTypes}
            actions={actions}
            records={records}
            phases={phases}
            phasesOrder={phasesOrder}
            recordTypes={recordTypes}
            addRecord={addRecord}
            editAction={editAction}
            importItems={importItems}
            changeOrder={changeOrder}
            ref={(element) => {
              actions_ref.current[actionId] = element;
            }}
          />
        ));
      },
      [
        phase,
        documentState,
        attributeTypes,
        editPhaseAttribute,
        displayMessage,
        setActionVisibility,
        editActionAttribute,
        editRecord,
        editRecordAttribute,
        removeAction,
        removeRecord,
        setRecordVisibility,
        actions,
        actionTypes,
        records,
        phases,
        phasesOrder,
        recordTypes,
        addRecord,
        editAction,
        importItems,
        changeOrder,
      ],
    );

    const reorderActions =
      phase.actions?.map((actionId) => ({
        id: actionId,
        key: uniqueId(actionId),
      })) || [];

    return (
      <div className='phase' ref={element}>
        <div className='box'>
          {mode === 'edit' && editingPhase && (
            <EditorForm
              onShowMore={onEditFormShowMorePhase}
              targetId={phase.id}
              attributes={phase.attributes}
              attributeTypes={attributeTypes}
              elementConfig={{
                elementTypes: phaseTypes,
                editWithForm: editPhaseWithForm,
              }}
              editorConfig={{
                type: 'phase',
                action: 'edit',
              }}
              closeEditorForm={disableEditMode}
              displayMessage={displayMessage}
            />
          )}
          {mode === 'edit' && complementingPhase && (
            <EditorForm
              onShowMore={onEditFormShowMorePhase}
              targetId={phase.id}
              attributes={phase.attributes}
              attributeTypes={attributeTypes}
              elementConfig={{
                elementTypes: phaseTypes,
                editWithForm: editPhaseWithForm,
              }}
              editorConfig={{
                type: 'phase',
                action: 'complement',
              }}
              closeEditorForm={disableEditMode}
              displayMessage={displayMessage}
            />
          )}
          {!editingPhase && !complementingPhase && (
            <div>
              {renderBasicAttributes()}
              {mode === 'add' && (
                <AddElementInput
                  type='action'
                  submit={addActionHandler}
                  typeOptions={generateTypeOptions(actionTypes)}
                  defaultAttributes={generateDefaultAttributes(attributeTypes, 'action', showMore)}
                  newDefaultAttributes={actionDefaultAttributes}
                  newTypeSpecifier={actionTypeSpecifier}
                  newType={actionType}
                  onDefaultAttributeChange={onActionDefaultAttributeChange}
                  onTypeSpecifierChange={onActionTypeSpecifierChange}
                  onTypeChange={onActionTypeChange}
                  onTypeInputChange={onActionTypeInputChange}
                  cancel={cancelActionCreation}
                  onAddFormShowMore={onAddFormShowMoreAction}
                  showMoreOrLess={showMore}
                />
              )}
              <div className={`actions ${phase.is_open ? '' : 'hidden'}`}>{actions && renderActions(actions)}</div>
            </div>
          )}

          {deleting && (
            <Popup
              closePopup={cancelDeletion}
              content={<DeleteView type='phase' target={getTargetName()} action={deletePhase} cancel={cancelDeletion} />}
            />
          )}

          {showReorderView && (
            <Popup
              closePopup={toggleReorderView}
              content={
                <ReorderView
                  target='action'
                  items={reorderActions}
                  values={actions}
                  changeOrder={changeOrder}
                  toggleReorderView={toggleReorderView}
                  parent={phaseIndex}
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
                  level='action'
                  toggleImportView={toggleImportView}
                  title='toimenpiteitä'
                  targetText={`käsittelyvaiheeseen "${getTargetName()}"`}
                  itemsToImportText='toimenpiteet'
                  phases={phases}
                  actions={actions}
                  records={records}
                  importItems={importItems}
                  parent={phaseIndex}
                  phasesOrder={phasesOrder}
                  showItems={() => setPhaseVisibility && setPhaseVisibility(phaseIndex, true)}
                />
              }
            />
          )}
        </div>
      </div>
    );
  },
);

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
  setActionVisibility: PropTypes.func.isRequired,
  editActionAttribute: PropTypes.func.isRequired,
  editRecord: PropTypes.func.isRequired,
  editRecordAttribute: PropTypes.func.isRequired,
  removeAction: PropTypes.func.isRequired,
  removeRecord: PropTypes.func.isRequired,
  setRecordVisibility: PropTypes.func.isRequired,
  phaseTypes: PropTypes.object,
  setPhaseAttributesVisibility: PropTypes.func,
  addAction: PropTypes.func,
  editPhase: PropTypes.func,
  setPhaseVisibility: PropTypes.func,
  phaseIndex: PropTypes.string,
  actionTypes: PropTypes.object,
  phases: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  phasesOrder: PropTypes.array,
  records: PropTypes.object,
  recordTypes: PropTypes.object,
  addRecord: PropTypes.func,
  editAction: PropTypes.func,
};

export default Phase;
