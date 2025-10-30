import classnames from 'classnames';
import { uniqueId } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RenderPropSticky } from 'react-sticky-el';
import './Phase.scss';

import { DROPDOWN_ITEMS } from '../../../constants';
import {
  attributeButton,
  generateDefaultAttributes,
  getDisplayLabelForAttribute,
} from '../../../utils/attributeHelper';
import { randomActionId } from '../../../utils/helpers';
import Dropdown from '../../Dropdown';
import Popup from '../../Popup';
import Action from '../Action/Action';
import AddElementInput from '../AddElementInput/AddElementInput';
import Attributes from '../Attribute/Attributes';
import DeleteView from '../DeleteView/DeleteView';
import EditorForm from '../EditorForm/EditorForm';
import ImportView from '../ImportView/ImportView';
import ReorderView from '../Reorder/ReorderView';

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
    const [editingTypeSpecifier, setEditingTypeSpecifier] = useState(false);
    const [editingType, setEditingType] = useState(false);
    const [topOffset, setTopOffset] = useState(0);

    const element = ref;
    const actions_ref = useRef({});

    const updateTopOffsetForSticky = useCallback(() => {
      // calculates heights for elements that are already sticking (navigation menu and tos header)
      const headerEl = document.getElementById('single-tos-header-container');
      const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
      const menuEl = document.getElementById('navigation-menu');
      const menuHeight = menuEl ? menuEl.getBoundingClientRect().height : 0;
      setTopOffset(headerHeight + menuHeight);
    }, []);

    useEffect(() => {
      updateTopOffsetForSticky();
      window.addEventListener('resize', updateTopOffsetForSticky);

      return () => {
        window.removeEventListener('resize', updateTopOffsetForSticky);
      };
    }, [updateTopOffsetForSticky]);

    const disableEditMode = useCallback(() => {
      setMode('view');
      setEditingPhase(false);
      setComplementingPhase(false);
      setEditingTypeSpecifier(false);
      setEditingType(false);
    }, []);

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
          phaseId: phaseId || phase.id,
          attributeName: 'TypeSpecifier',
          attributeValue: newTypeSpecifier,
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
          phaseId: phase.id,
          attributeName: 'PhaseType',
          attributeValue: type,
        };
        editPhaseAttribute(updatedPhaseType);
        disableEditMode();
      },
      [type, phase.id, editPhaseAttribute, disableEditMode],
    );

    const updatePhaseAttribute = useCallback(
      (attribute, attributeIndex) => {
        const updatedPhaseAttribute = {
          phaseId: phase.id,
          attributeName: attributeIndex,
          attributeValue: attribute,
        };
        editPhaseAttribute(updatedPhaseAttribute);
      },
      [phase.id, editPhaseAttribute],
    );

    const editPhaseWithForm = useCallback(
      (attributes, phaseId, disableEditModeFlag = true) => {
        setTypeSpecifier(attributes.TypeSpecifier);
        setType(attributes.PhaseType);
        editPhase({ editedAttributes: attributes, phaseId });
        if (disableEditModeFlag) {
          disableEditMode();
        }
      },
      [editPhase, disableEditMode],
    );

    const editTypeSpecifier = useCallback(() => {
      if (documentState === 'edit') {
        setMode('edit');
        setEditingTypeSpecifier(true);
      }
    }, [documentState]);

    const editType = useCallback(() => {
      if (documentState === 'edit') {
        setMode('edit');
        setEditingType(true);
      }
    }, [documentState]);

    const onTypeSpecifierChange = useCallback((event) => {
      setTypeSpecifier(event.target.value);
    }, []);

    const onTypeChange = useCallback((value) => {
      setType(value);
    }, []);

    const cancelDeletion = useCallback(() => {
      setDeleting(false);
    }, []);

    const deletePhase = useCallback(() => {
      removePhase(phase.id);
      setDeleting(false);
    }, [phase.id, removePhase]);

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

        // Filter out null values from actionDefaultAttributes
        const filteredDefaultAttributes = {};
        Object.keys(actionDefaultAttributes).forEach((key) => {
          const attributeValue = actionDefaultAttributes[key];
          if (attributeValue !== null && attributeValue !== undefined) {
            filteredDefaultAttributes[key] = attributeValue;
          }
        });

        const newAction = {
          id: randomActionId(),
          phase: phaseIndex,
          records: [],
          attributes: {
            TypeSpecifier: actionTypeSpecifier || '',
            ActionType: actionType || '',
            ...filteredDefaultAttributes,
          },
          is_open: false,
        };

        addAction(newAction);
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
              onClick={() => setPhaseVisibility(phaseIndex, !phase.is_open)}
            >
              <span className={`fa-solid ${phase.is_open ? 'fa-minus' : 'fa-plus'}`} aria-hidden='true' />
            </button>
          )}
          {documentState === 'edit' && (
            <span className='pull-right'>
              <Dropdown items={phaseDropdownItems} small />
            </span>
          )}
          {attributeButton(phase.attributes, attributeTypes) && (
            <button
              type='button'
              className='btn btn-info btn-xs record-button pull-right'
              title={phase.is_attributes_open ? 'Piilota metatiedot' : 'Näytä metatiedot'}
              aria-label={phase.is_attributes_open ? 'Piilota metatiedot' : 'Näytä metatiedot'}
              onClick={() => setPhaseAttributesVisibility(phaseIndex, !phase.is_attributes_open)}
            >
              <span className={`fa-solid ${phase.is_attributes_open ? 'fa-minus' : 'fa-plus'}`} aria-hidden='true' />
            </button>
          )}
        </div>
      );
    }, [
      documentState,
      phase.actions,
      phase.attributes,
      phase.is_attributes_open,
      phase.is_open,
      phaseIndex,
      generateDropdownItems,
      setPhaseAttributesVisibility,
      setPhaseVisibility,
      attributeTypes,
    ]);

    const renderBasicAttributesContent = useCallback(() => {
      const classNames = classnames([
        'col-md-6',
        'basic-attribute',
        'phase-basic-attribute',
        documentState === 'edit' ? 'editable' : null,
      ]);

      const typeSpecifierElement = () => {
        if (mode === 'edit' && editingTypeSpecifier) {
          return (
            <div className='col-md-5 phase-title-input row'>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  updateTypeSpecifier(typeSpecifier);
                }}
              >
                <input
                  className='input-title form-control'
                  value={typeSpecifier || ''}
                  onChange={onTypeSpecifierChange}
                  autoFocus
                />
              </form>
            </div>
          );
        }

        return (
          <span
            className={classNames}
            onClick={editTypeSpecifier}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                editTypeSpecifier();
              }
            }}
            role='button'
            tabIndex={0}
          >
            {typeSpecifier}
          </span>
        );
      };

      const phaseTypeElement = () => {
        if (mode === 'edit' && editingType) {
          const phaseTypesAsOptions = Object.values(phaseTypes || {}).map((pt) => ({
            value: pt.value,
            label: getDisplayLabelForAttribute({
              attributeValue: pt.value,
              identifier: 'PhaseType',
            }),
          }));

          return (
            <div className='col-md-6 phase-title-dropdown'>
              <form onSubmit={updatePhaseType}>
                <select
                  className='form-control'
                  value={type || ''}
                  onChange={(e) => onTypeChange(e.target.value)}
                  autoFocus
                >
                  <option value=''>Select phase type...</option>
                  {phaseTypesAsOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </form>
            </div>
          );
        }

        const phaseTypeValue =
          type && getDisplayLabelForAttribute
            ? getDisplayLabelForAttribute({
                attributeValue: type,
                identifier: 'PhaseType',
              })
            : type;

        return (
          <span
            className={classNames}
            onClick={editType}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                editType();
              }
            }}
            role='button'
            tabIndex={0}
          >
            {phaseTypeValue}
          </span>
        );
      };

      if (phase.is_open && phase.actions && phase.actions.length > 0) {
        return (
          <RenderPropSticky topOffset={-1 * topOffset}>
            {({ isFixed, wrapperStyles, wrapperRef, holderStyles, holderRef }) => (
              <div ref={holderRef} style={holderStyles}>
                <div
                  className={isFixed ? 'phase-title-sticky' : 'phase-title'}
                  style={
                    isFixed
                      ? {
                          ...wrapperStyles,
                          ...{
                            position: 'fixed',
                            top: topOffset,
                            left: 0,
                          },
                        }
                      : wrapperStyles
                  }
                  ref={wrapperRef}
                >
                  <div className='basic-attributes'>
                    {phaseTypeElement()}
                    {typeSpecifierElement()}
                  </div>
                </div>
              </div>
            )}
          </RenderPropSticky>
        );
      }

      return (
        <div className={`phase-title ${phase.is_attributes_open ? 'phase-open' : 'phase-closed'}`}>
          <div className='basic-attributes'>
            {phaseTypeElement()}
            {typeSpecifierElement()}
          </div>
        </div>
      );
    }, [
      documentState,
      mode,
      editingTypeSpecifier,
      editingType,
      typeSpecifier,
      type,
      phase.is_attributes_open,
      phase.is_open,
      phase.actions,
      topOffset,
      phaseTypes,
      updateTypeSpecifier,
      onTypeSpecifierChange,
      editTypeSpecifier,
      updatePhaseType,
      onTypeChange,
      editType,
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
          renderBasicAttributes={renderBasicAttributesContent}
          renderButtons={renderPhaseButtons}
          updateAttribute={updatePhaseAttribute}
          updateType={updatePhaseType}
          updateTypeSpecifier={updateTypeSpecifier}
        />
      );
    }, [
      attributeTypes,
      documentState,
      phase.id,
      phase.attributes,
      phase.is_attributes_open,
      phaseTypes,
      renderBasicAttributesContent,
      renderPhaseButtons,
      updatePhaseAttribute,
      updatePhaseType,
      updateTypeSpecifier,
    ]);

    const renderActions = useCallback(
      (phaseActions) => {
        if (!phaseActions || !Array.isArray(phaseActions)) {
          return null;
        }

        return phaseActions.map((actionId) => {
          const action = actions[actionId];
          if (!action) {
            return null;
          }

          return (
            <Action
              key={actionId}
              action={action}
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
          );
        });
      },
      [
        actions,
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
              <div className={`actions ${phase.is_open ? '' : 'hidden'}`}>
                {phase.actions && renderActions(phase.actions)}
              </div>
            </div>
          )}

          {deleting && (
            <Popup
              closePopup={cancelDeletion}
              content={
                <DeleteView type='phase' target={getTargetName()} action={deletePhase} cancel={cancelDeletion} />
              }
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
