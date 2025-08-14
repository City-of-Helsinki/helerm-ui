import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import classnames from 'classnames';
import { min, uniqueId } from 'lodash';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { HEADER_HEIGHT } from '../../../constants';
import Phase from '../../../components/Tos/Phase/Phase';
import AddElementInput from '../../../components/Tos/AddElementInput/AddElementInput';
import Attribute from '../../../components/Tos/Attribute/Attribute';
import ReorderView from '../../../components/Tos/Reorder/ReorderView';
import ImportView from '../../../components/Tos/ImportView/ImportView';
import CloneView from '../../../components/Tos/CloneView/CloneView';
import EditorForm from '../../../components/Tos/EditorForm/EditorForm';
import TosHeader from '../../../components/Tos/Header/TosHeader';
import ClassificationHeader from '../../../components/Tos/Header/ClassificationHeader';
import ValidationBar from '../../../components/Tos/ValidationBar/ValidationBar';
import VersionData from '../../../components/Tos/Version/VersionData';
import VersionSelector from '../../../components/VersionSelector/VersionSelector';
import Popup from '../../../components/Popup';
import RouterPrompt from '../../../components/RouterPrompt/RouterPrompt';
import Sticky from '../../../components/Sticky/Sticky';
import { displayMessage, getStatusLabel } from '../../../utils/helpers';
import { generateDefaultAttributes } from '../../../utils/attributeHelper';
import { validateTOS, validatePhase, validateAction, validateRecord } from '../../../utils/validators';
import {
  fetchTOSThunk,
  clearTos,
  editMetaData,
  editValidDates,
  setClassificationVisibility,
  setMetadataVisibility,
  setVersionVisibility,
  setDocumentState,
  saveDraftThunk,
  changeStatusThunk,
  resetTos,
  addPhase,
  addAction,
  editAction,
  editActionAttribute,
  removeAction,
  setActionVisibility,
  editPhase,
  editPhaseAttribute,
  removePhase,
  setPhaseAttributesVisibility,
  addRecord,
  editRecord,
  editRecordAttribute,
  removeRecord,
  setRecordVisibility,
  importItemsThunk,
  changeOrderThunk,
  selectedTOSSelector,
  isFetchingSelector as isFetchingTosSelector,
  updateTosVisibility,
  cloneFromTemplateThunk,
} from '../../../store/reducers/tos-toolkit';
import {
  fetchClassificationThunk,
  clearClassification,
  classificationSelector,
} from '../../../store/reducers/classification';
import { isOpenSelector, setValidationVisibility } from '../../../store/reducers/validation';
import {
  actionTypesSelector,
  attributeTypesSelector,
  isFetchingSelector as isFetchingUiSelector,
  phaseTypesSelector,
  recordTypesSelector,
  templatesSelector,
} from '../../../store/reducers/ui';
import { setNavigationVisibility } from '../../../store/reducers/navigation';

import './ViewTos.scss';

const filterCheckedAttributes = (attributes) => {
  const filteredAttributes = {};
  Object.keys(attributes).forEach((key) => {
    if (attributes[key].checked) {
      filteredAttributes[key] = attributes[key];
    }
  });
  return filteredAttributes;
};

const buildTosVisibilityUpdate = (basicVisibility, metaDataVisibility, phases, actions, records) => {
  const allPhasesOpen = {};
  const allActionsOpen = {};
  const allRecordsOpen = {};

  Object.keys(phases).forEach((phaseKey) => {
    if (Object.hasOwn(phases, phaseKey)) {
      allPhasesOpen[phaseKey] = {
        ...phases[phaseKey],
        is_attributes_open: metaDataVisibility,
        is_open: basicVisibility,
      };

      Object.keys(actions).forEach((actionKey) => {
        const action = actions[actionKey];
        if (Object.hasOwn(actions, actionKey) && action.phase === phaseKey) {
          allActionsOpen[actionKey] = {
            ...action,
            is_open: metaDataVisibility,
          };

          action.records.forEach((recordKey) => {
            const record = records[recordKey];
            if (Object.hasOwn(records, recordKey)) {
              allRecordsOpen[recordKey] = {
                ...record,
                is_open: metaDataVisibility,
              };
            }
          });
        }
      });
    }
  });

  return {
    actions: allActionsOpen,
    phases: allPhasesOpen,
    records: allRecordsOpen,
    basicVisibility,
    metaDataVisibility,
  };
};

const ViewTOS = () => {
  const originalTosRef = useRef({});
  const prevParamsRef = useRef({ id: null, version: null });

  const [state, setState] = useState({
    complementingMetaData: false,
    createPhaseMode: false,
    editingMetaData: false,
    phaseDefaultAttributes: {},
    phaseTypeSpecifier: '',
    phaseType: '',
    isDirty: false,
    scrollTop: HEADER_HEIGHT,
    showCancelEditView: false,
    showCloneView: false,
    showImportView: false,
    showReorderView: false,
    showMore: false,
    topOffset: 0,
  });

  const phases = useRef({});
  const metadata = useRef(null);
  const header = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const selectedTOS = useSelector(selectedTOSSelector);
  const classification = useSelector(classificationSelector);
  const actionTypes = useSelector(actionTypesSelector);
  const attributeTypes = useSelector(attributeTypesSelector);
  const phaseTypes = useSelector(phaseTypesSelector);
  const recordTypes = useSelector(recordTypesSelector);
  const showValidationBar = useSelector(isOpenSelector);
  const templates = useSelector(templatesSelector);

  const uiIsFetching = useSelector(isFetchingUiSelector);
  const tosIsFetching = useSelector(isFetchingTosSelector);
  const isFetching = uiIsFetching || tosIsFetching;

  const handleScroll = useCallback(
    (event) => {
      const element = event.srcElement.scrollingElement || event.srcElement.documentElement || {};
      const scrollTop = HEADER_HEIGHT - min([HEADER_HEIGHT, element.scrollTop || 0]);
      if (scrollTop >= 0 && scrollTop !== state.scrollTop) {
        setState((prevState) => ({ ...prevState, scrollTop }));
      }
    },
    [state.scrollTop],
  );

  const updateTopOffsetForSticky = useCallback(() => {
    const menuEl = document.getElementById('navigation-menu');
    const menuHeight = menuEl ? menuEl.getBoundingClientRect().height : 0;
    setState((prevState) => ({ ...prevState, topOffset: menuHeight }));
  }, []);

  const getClassificationInfo = useCallback((tosResponse) => {
    if (tosResponse?.payload) {
      return tosResponse.payload.classification;
    }
    return null;
  }, []);

  const setTosVisibility = useCallback(
    (basicDataVisibility, metaDataVisibility) => {
      dispatch((dispatch, getState) => {
        const state = getState();
        const currentSelectedTOS = selectedTOSSelector(state);

        const visibility = buildTosVisibilityUpdate(
          basicDataVisibility,
          metaDataVisibility,
          currentSelectedTOS.phases,
          currentSelectedTOS.actions,
          currentSelectedTOS.records,
        );
        dispatch(updateTosVisibility(visibility));
      });
    },
    [dispatch],
  );

  const fetchTOS = useCallback(
    (id, requestParams = {}) => {
      return dispatch(fetchTOSThunk({ tosId: id, params: requestParams }))
        .then((res) => {
          dispatch(setNavigationVisibility(false));
          setTosVisibility(true, false);

          const classificationInfo = getClassificationInfo(res);

          if (classificationInfo) {
            dispatch(
              fetchClassificationThunk({ id: classificationInfo.id, params: { version: classificationInfo.version } }),
            ).catch(() => {
              displayMessage(
                {
                  title: 'Virhe',
                  body: `Tehtäväluokan versio ${classificationInfo.version} haku epäonnistui`,
                },
                { type: 'error' },
              );
            });
          }
          return res;
        })
        .catch((err) => {
          if (err instanceof URIError) {
            navigate(`/404?tos-id=${id}`);
          }
          throw err;
        });
    },
    [dispatch, navigate, getClassificationInfo, setTosVisibility],
  );

  const setTosDocumentState = useCallback(
    (documentState) => {
      setState((prevState) => ({ ...prevState, isDirty: true }));
      dispatch(setDocumentState(documentState));
    },
    [dispatch],
  );

  const evaluateAttributes = useCallback((items, validate, attrTypes) => {
    let isValid = true;
    Object.keys(items).forEach((item) => {
      if (Object.hasOwn(items, item)) {
        const validAttributes = validate(items[item], attrTypes).length === 0;
        if (!validAttributes) {
          isValid = false;
        }
      }
    });
    return isValid;
  }, []);

  const validateAttributes = useCallback(() => {
    const invalidTOSAttributes = validateTOS(selectedTOS, attributeTypes).length > 0;
    const invalidPhaseAttributes = !evaluateAttributes(selectedTOS.phases, validatePhase, attributeTypes);
    const invalidActionAttributes = !evaluateAttributes(selectedTOS.actions, validateAction, attributeTypes);
    const invalidRecordAttributes = !evaluateAttributes(selectedTOS.records, validateRecord, attributeTypes);

    return !invalidTOSAttributes && !invalidPhaseAttributes && !invalidActionAttributes && !invalidRecordAttributes;
  }, [selectedTOS, attributeTypes, evaluateAttributes]);

  const saveDraft = useCallback(() => {
    setState((prevState) => ({ ...prevState, isDirty: false }));
    return dispatch(saveDraftThunk())
      .then((res) => {
        if (res?.version && res?.id) {
          navigate(`/view-tos/${res.id}/version/${res.version}`);
        }
        return displayMessage({
          title: 'Luonnos',
          body: 'Luonnos tallennettu!',
        });
      })
      .catch((err) =>
        displayMessage(
          {
            title: 'Virhe',
            body: `"${err.message}"`,
          },
          { type: 'error' },
        ),
      );
  }, [dispatch, navigate]);

  const changeStatus = useCallback(
    (status) => {
      const { state: currentState } = selectedTOS;
      return dispatch(changeStatusThunk(status))
        .then(() =>
          displayMessage({
            title: 'Tila vaihdettu!',
            body: `${getStatusLabel(currentState)} => ${getStatusLabel(status)}`,
          }),
        )
        .catch((err) =>
          displayMessage(
            {
              title: 'Virhe',
              body: `"${err.message}"`,
            },
            { type: 'error' },
          ),
        );
    },
    [dispatch, selectedTOS],
  );

  const review = useCallback(
    (status) => {
      if (validateAttributes()) {
        changeStatus(status);
      } else {
        dispatch(setValidationVisibility(true));
      }
    },
    [dispatch, validateAttributes, changeStatus],
  );

  const addPhaseHandler = useCallback(() => {
    setState((prevState) => ({ ...prevState, createPhaseMode: true }));
  }, []);

  const createNewPhase = useCallback(
    (event) => {
      event.preventDefault();

      if (!state.phaseType) {
        displayMessage('Valitse käsittelyvaiheen tyyppi', { type: 'error' });
        return;
      }

      dispatch(
        addPhase({
          typeSpecifier: state.phaseTypeSpecifier || '',
          type: state.phaseType || '',
          attributes: filterCheckedAttributes(state.phaseDefaultAttributes || {}),
          parent: selectedTOS.id,
        }),
      );

      setState((prevState) => ({
        ...prevState,
        createPhaseMode: false,
        phaseDefaultAttributes: {},
        phaseTypeSpecifier: '',
        phaseType: '',
      }));

      displayMessage({
        title: 'Käsittelyvaihe',
        body: 'Käsittelyvaiheen lisäys onnistui!',
      });
    },
    [dispatch, selectedTOS.id, state.phaseDefaultAttributes, state.phaseType, state.phaseTypeSpecifier],
  );

  const cancelPhaseCreation = useCallback((event) => {
    event.preventDefault();
    setState((prevState) => ({
      ...prevState,
      phaseDefaultAttributes: {},
      phaseTypeSpecifier: '',
      createPhaseMode: false,
    }));
  }, []);

  const onPhaseDefaultAttributeChange = useCallback((key, value) => {
    setState((prevState) => ({
      ...prevState,
      phaseDefaultAttributes: {
        ...prevState.phaseDefaultAttributes,
        [key]: value,
      },
    }));
  }, []);

  const onPhaseTypeChange = useCallback((value) => {
    setState((prevState) => ({ ...prevState, phaseType: value }));
  }, []);

  const onPhaseTypeInputChange = useCallback((event) => {
    setState((prevState) => ({ ...prevState, phaseType: event.target.value }));
  }, []);

  const onPhaseTypeSpecifierChange = useCallback((event) => {
    setState((prevState) => ({ ...prevState, phaseTypeSpecifier: event.target.value }));
  }, []);

  const onAddFormShowMorePhase = useCallback((e) => {
    e.preventDefault();
    setState((prevState) => ({
      ...prevState,
      showMore: !prevState.showMore,
    }));
  }, []);

  const onEditFormShowMoreMetaData = useCallback((e) => {
    e.preventDefault();
    setState((prevState) => ({
      ...prevState,
      showMore: !prevState.showMore,
    }));
  }, []);

  const editMetaDataWithForm = useCallback(
    (attributes, stopEditing = true) => {
      if (stopEditing) {
        setState((prevState) => ({
          ...prevState,
          editingMetaData: false,
          complementingMetaData: false,
        }));
      }
      dispatch(editMetaData({ attributes: filterCheckedAttributes(attributes) }));
    },
    [dispatch],
  );

  const cancelMetaDataEdit = useCallback(() => {
    setState((prevState) => ({ ...prevState, editingMetaData: false }));
  }, []);

  const cancelMetaDataComplement = useCallback(() => {
    setState((prevState) => ({ ...prevState, complementingMetaData: false }));
  }, []);

  const toggleReorderView = useCallback(() => {
    setState((prevState) => ({ ...prevState, showReorderView: !prevState.showReorderView }));
  }, []);

  const toggleImportView = useCallback(() => {
    setState((prevState) => ({ ...prevState, showImportView: !prevState.showImportView }));
  }, []);

  const toggleCloneView = useCallback(() => {
    setState((prevState) => ({ ...prevState, showCloneView: !prevState.showCloneView }));
  }, []);

  const toggleCancelEditView = useCallback(
    (confirmed) => {
      setState((prevState) => ({
        ...prevState,
        isDirty: false,
        showCancelEditView: false,
      }));

      if (confirmed) {
        dispatch(resetTos(originalTosRef.current));
      }
    },
    [dispatch],
  );

  const cloneFromTemplate = useCallback(
    (selectedMethod, id) => {
      return dispatch(cloneFromTemplateThunk(selectedMethod, id))
        .then(() => {
          displayMessage({
            title: 'Kuvaus',
            body: 'Kuvauksen tuonti onnistui!',
          });
          toggleCloneView();
        })
        .catch((err) => {
          displayMessage(
            {
              title: 'Virhe',
              body: `"${err.message}"`,
            },
            { type: 'warning' },
          );
        });
    },
    [dispatch, toggleCloneView],
  );

  const scrollToMetadata = useCallback(() => {
    if (metadata.current) {
      window.scrollTo(0, metadata.current.offsetTop + HEADER_HEIGHT);
    }
  }, []);

  const scrollToType = useCallback(
    (type, id) => {
      if (type === 'phase' && phases.current[id]) {
        phases.current[id].scrollToPhase();
      } else if (type === 'action') {
        const action = selectedTOS.actions[id];

        if (action?.phase && phases.current[action?.phase]) {
          phases.current[action?.phase].scrollToAction(id);
        }
      } else if (type === 'record') {
        const record = selectedTOS.records[id];

        if (record?.action) {
          const action = selectedTOS.actions[record?.action];

          if (action?.phase && phases.current[action?.phase]) {
            phases.current[action?.phase].scrollToActionRecord(record?.action, id);
          }
        }
      }
    },
    [selectedTOS.actions, selectedTOS.records],
  );

  const cancelEdit = useCallback(() => {
    setState((prevState) => ({ ...prevState, showCancelEditView: true }));
  }, []);

  const onVersionSelectorChange = useCallback(
    (item) => {
      navigate(`/view-tos/${selectedTOS.id}/version/${item.value}`);
    },
    [navigate, selectedTOS.id],
  );

  const updateFunctionAttribute = useCallback(
    (attribute, attributeIndex) => {
      const updatedTOSAttribute = {
        tosAttribute: attribute,
        attributeIndex,
      };
      dispatch(editRecordAttribute(updatedTOSAttribute));
    },
    [dispatch],
  );

  const setPhaseVisibility = useCallback(
    (phaseId, isVisible) => {
      dispatch(setPhaseVisibility({ phaseId, isVisible }));
    },
    [dispatch],
  );

  const generateTypeOptions = useCallback((typeOptions) => {
    const options = [];

    Object.keys(typeOptions).forEach((key) => {
      if (Object.hasOwn(typeOptions, key)) {
        options.push({
          label: typeOptions[key].value,
          value: typeOptions[key].value,
        });
      }
    });

    return options;
  }, []);

  const generateMetaDataButtons = useCallback(() => {
    const { documentState, is_open: isOpen } = selectedTOS;
    const isEdit = documentState === 'edit';

    return (
      <div className='pull-right'>
        {isEdit && (
          <button type='button' className='btn btn-link' onClick={toggleCloneView}>
            Tuo kuvaus
          </button>
        )}
        {isEdit && (
          <button
            type='button'
            className='btn btn-link'
            onClick={() => setState((prevState) => ({ ...prevState, editingMetaData: true }))}
          >
            Muokkaa metatietoja
          </button>
        )}
        <button
          type='button'
          className='btn btn-info btn-sm'
          title={isOpen ? 'Pienennä' : 'Laajenna'}
          aria-label={isOpen ? 'Pienennä' : 'Laajenna'}
          onClick={() => dispatch(setMetadataVisibility(!isOpen))}
        >
          <span className={`fa-solid ${isOpen ? 'fa-minus' : 'fa-plus'}`} aria-hidden='true' />
        </button>
      </div>
    );
  }, [selectedTOS, toggleCloneView, dispatch]);

  const generateMetaData = useCallback(
    (attrTypes, attributes) => {
      const { documentState, is_open: isOpen } = selectedTOS;
      const attributeElements = [];

      // Check if attrTypes and attributes are valid objects
      if (!attrTypes || typeof attrTypes !== 'object') {
        return null;
      }
      const safeAttributes = attributes && typeof attributes === 'object' ? attributes : {};

      Object.keys(attrTypes).forEach((key) => {
        if ((Object.hasOwn(safeAttributes, key) && safeAttributes[key]) || key === 'InformationSystem') {
          attributeElements.push(
            <Attribute
              key={key}
              attributeIndex={key}
              attributeKey={attrTypes[key].name}
              attribute={safeAttributes[key]}
              type='attribute'
              attributeTypes={attrTypes}
              documentState={documentState}
              editable
              editRecord={editRecord}
              showAttributes={isOpen}
              tosAttribute
              updateFunctionAttribute={updateFunctionAttribute}
              parentType='function'
            />,
          );
        }
      });

      return (
        <div>
          <div className={`metadata-data-row__secondary ${selectedTOS.is_open ? '' : 'hidden'}`}>
            {attributeElements}
          </div>
        </div>
      );
    },
    [selectedTOS, updateFunctionAttribute],
  );

  const generatePhases = useCallback(
    (phaseData, phasesOrder) => {
      const phaseElements = [];

      if (phaseData) {
        Object.keys(phaseData).forEach((key) => {
          if (Object.hasOwn(phaseData, key)) {
            phaseElements.push(
              <Phase
                key={key}
                phaseIndex={phaseData[key].id}
                phase={selectedTOS.phases[key]}
                phasesOrder={phasesOrder}
                setActionVisibility={(actionId, isVisible) => dispatch(setActionVisibility({ actionId, isVisible }))}
                setPhaseAttributesVisibility={(phaseId, isVisible) =>
                  dispatch(setPhaseAttributesVisibility({ phaseId, isVisible }))
                }
                setPhaseVisibility={setPhaseVisibility}
                setRecordVisibility={(recordId, isVisible) => dispatch(setRecordVisibility({ recordId, isVisible }))}
                actions={selectedTOS.actions}
                actionTypes={actionTypes}
                phases={selectedTOS.phases}
                phaseTypes={phaseTypes}
                records={selectedTOS.records}
                recordTypes={recordTypes}
                documentState={selectedTOS.documentState}
                attributeTypes={attributeTypes}
                addAction={(action) => dispatch(addAction(action))}
                addRecord={(record) => dispatch(addRecord(record))}
                editAction={(action) => dispatch(editAction(action))}
                editActionAttribute={(data) => dispatch(editActionAttribute(data))}
                editPhase={(phase) => dispatch(editPhase(phase))}
                editPhaseAttribute={(data) => dispatch(editPhaseAttribute(data))}
                editRecord={(record) => dispatch(editRecord(record))}
                editRecordAttribute={(data) => dispatch(editRecordAttribute(data))}
                removeAction={(actionId) => dispatch(removeAction(actionId))}
                removePhase={(phaseId) => dispatch(removePhase(phaseId))}
                removeRecord={(recordId) => dispatch(removeRecord(recordId))}
                displayMessage={displayMessage}
                changeOrder={(data) => dispatch(changeOrderThunk(data))}
                importItems={(data) => dispatch(importItemsThunk(data))}
                ref={(element) => {
                  phases.current[key] = element;
                }}
              />,
            );
          }
        });
      }

      return phaseElements;
    },
    [
      selectedTOS.actions,
      selectedTOS.phases,
      selectedTOS.records,
      selectedTOS.documentState,
      actionTypes,
      phaseTypes,
      recordTypes,
      attributeTypes,
      dispatch,
      setPhaseVisibility,
    ],
  );

  const memoizedTosData = useMemo(() => {
    if (!selectedTOS.id || !selectedTOS.phases) {
      return {
        phasesOrder: [],
        phaseElements: [],
        metaDataButtons: null,
        TOSMetaData: null,
        reorderPhases: [],
      };
    }

    const phasesOrder = Object.keys(selectedTOS.phases);
    const phaseElements = generatePhases(selectedTOS.phases, phasesOrder);
    const metaDataButtons = generateMetaDataButtons();
    const TOSMetaData = generateMetaData(attributeTypes, selectedTOS.attributes);
    const reorderPhases = Object.keys(selectedTOS.phases).map((phaseId) => ({
      id: phaseId,
      key: uniqueId(phaseId),
    }));

    return {
      phasesOrder,
      phaseElements,
      metaDataButtons,
      TOSMetaData,
      reorderPhases,
    };
  }, [
    selectedTOS.id,
    selectedTOS.phases,
    selectedTOS.attributes,
    generatePhases,
    generateMetaDataButtons,
    generateMetaData,
    attributeTypes,
  ]);

  useEffect(() => {
    const { id, version } = params;
    const requestParams = version ? { version } : {};

    fetchTOS(id, requestParams)
      .then((res) => {
        if (res?.payload) {
          originalTosRef.current = res.payload;
        }
      })
      .catch(() => {
        displayMessage(
          {
            title: 'Virhe',
            body: 'TOS-tietojen haku epäonnistui',
          },
          { type: 'error' },
        );
      });

    window.addEventListener('resize', updateTopOffsetForSticky);
    document.addEventListener('scroll', handleScroll);

    return () => {
      dispatch(clearTos());
      dispatch(clearClassification());
      dispatch(setValidationVisibility(false));

      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateTopOffsetForSticky);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, params.version]);

  useEffect(() => {
    if (!selectedTOS.id) return;

    const currentId = selectedTOS.id;
    const currentVersion = selectedTOS.version;

    if (prevParamsRef.current.id !== currentId || prevParamsRef.current.version !== currentVersion) {
      prevParamsRef.current = { id: currentId, version: currentVersion };

      originalTosRef.current = JSON.parse(JSON.stringify(selectedTOS));
    }
  }, [selectedTOS]);

  useEffect(() => {
    if (selectedTOS.documentState === 'view') {
      setState((prevState) => ({
        ...prevState,
        editingMetaData: false,
        complementingMetaData: false,
        isDirty: false,
      }));
    }
  }, [selectedTOS.documentState]);

  if (!isFetching && selectedTOS.id) {
    const { phasesOrder, phaseElements, metaDataButtons, TOSMetaData, reorderPhases } = memoizedTosData;
    const { scrollTop } = state;
    const headerHeight = header.current ? header.current.clientHeight : 0;

    return (
      <DndProvider backend={HTML5Backend} context={window}>
        <div key={`${params.id}.${params.version}`}>
          <RouterPrompt
            when={state.isDirty}
            onOK={() => {
              return true;
            }}
            onCancel={() => {
              return false;
            }}
          />
          <div className='col-xs-12 single-tos-container'>
            <div id='single-tos-header-container' ref={header}>
              <Sticky
                topOffset={-1 * state.topOffset}
                stickyStyle={{
                  position: 'fixed',
                  top: state.topOffset,
                  left: 0,
                }}
                stickyClassName='single-tos-header-sticky'
              >
                <div className='single-tos-header-wrapper'>
                  <TosHeader
                    cancelEdit={cancelEdit}
                    classification={classification}
                    classificationId={selectedTOS.classification.id}
                    changeStatus={changeStatus}
                    currentVersion={selectedTOS.version}
                    documentState={selectedTOS.documentState}
                    fetchTos={fetchTOS}
                    functionId={selectedTOS.function_id}
                    isValidationBarVisible={showValidationBar}
                    name={selectedTOS.name}
                    state={selectedTOS.state}
                    setDocumentState={setTosDocumentState}
                    setTosVisibility={setTosVisibility}
                    setValidationVisibility={(isVisible) => dispatch(setValidationVisibility(isVisible))}
                    review={review}
                    saveDraft={saveDraft}
                    tosId={selectedTOS.id}
                    versions={selectedTOS.version_history}
                  />
                </div>
              </Sticky>
            </div>
            <div className='single-tos-wrapper'>
              <div className={classnames([showValidationBar ? 'col-xs-9 validation-bar-open' : 'col-xs-12'])}>
                <div className='single-tos-content'>
                  <ClassificationHeader
                    classification={classification}
                    isOpen={selectedTOS.is_classification_open}
                    setVisibility={(isVisible) => dispatch(setClassificationVisibility(isVisible))}
                  />
                  <VersionSelector
                    versionId={selectedTOS.id}
                    currentVersion={selectedTOS.version}
                    versions={selectedTOS.version_history}
                    onChange={onVersionSelectorChange}
                    label='Käsittelyprosessin versio:'
                  />
                  <VersionData
                    attributeTypes={attributeTypes}
                    displayMessage={displayMessage}
                    editValidDates={(dates) => dispatch(editValidDates(dates))}
                    selectedTOS={selectedTOS}
                    setVersionVisibility={(isVisible) => dispatch(setVersionVisibility(isVisible))}
                  />
                  <div className='row tos-metadata-header' ref={metadata}>
                    <div className='col-xs-6'>
                      <h4>Käsittelyprosessin tiedot</h4>
                    </div>
                    <div className='col-xs-6'>{metaDataButtons}</div>
                  </div>
                  <div className='row tos-metadata'>
                    {state.editingMetaData && (
                      <EditorForm
                        onShowMore={onEditFormShowMoreMetaData}
                        targetId={selectedTOS.id}
                        attributes={selectedTOS.attributes}
                        attributeTypes={attributeTypes}
                        editMetaDataWithForm={editMetaDataWithForm}
                        editorConfig={{
                          type: 'function',
                          action: 'edit',
                        }}
                        closeEditorForm={cancelMetaDataEdit}
                        displayMessage={displayMessage}
                      />
                    )}
                    {state.complementingMetaData && (
                      <EditorForm
                        onShowMore={onEditFormShowMoreMetaData}
                        targetId={selectedTOS.id}
                        attributes={selectedTOS.attributes}
                        attributeTypes={attributeTypes}
                        editMetaDataWithForm={editMetaDataWithForm}
                        editorConfig={{
                          type: 'function',
                          action: 'complement',
                        }}
                        closeEditorForm={cancelMetaDataComplement}
                        displayMessage={displayMessage}
                      />
                    )}
                    {!state.editingMetaData && !state.complementingMetaData && (
                      <div className='col-xs-12'>{TOSMetaData}</div>
                    )}
                  </div>
                  <div className='row'>
                    <div className='col-xs-3'>
                      <h4 className='phases-title'>Vaiheet</h4>
                    </div>
                    {selectedTOS.documentState === 'edit' && !state.createPhaseMode && (
                      <div className='col-xs-9 phases-actions'>
                        <button type='button' className='btn btn-link pull-right' onClick={toggleReorderView}>
                          Järjestä käsittelyvaiheita
                        </button>
                        <button type='button' className='btn btn-link pull-right' onClick={toggleImportView}>
                          Tuo käsittelyvaihe
                        </button>
                        <button type='button' className='btn btn-link pull-right' onClick={addPhaseHandler}>
                          Uusi käsittelyvaihe
                        </button>
                      </div>
                    )}
                  </div>
                  <div className='row'>
                    <div className='col-xs-12'>
                      {state.createPhaseMode && (
                        <AddElementInput
                          type='phase'
                          submit={createNewPhase}
                          typeOptions={generateTypeOptions(phaseTypes)}
                          defaultAttributes={generateDefaultAttributes(attributeTypes, 'phase', state.showMore)}
                          newDefaultAttributes={state.phaseDefaultAttributes}
                          newTypeSpecifier={state.phaseTypeSpecifier}
                          newType={state.phaseType}
                          onDefaultAttributeChange={onPhaseDefaultAttributeChange}
                          onTypeSpecifierChange={onPhaseTypeSpecifierChange}
                          onTypeChange={onPhaseTypeChange}
                          onTypeInputChange={onPhaseTypeInputChange}
                          cancel={cancelPhaseCreation}
                          onAddFormShowMore={onAddFormShowMorePhase}
                          showMoreOrLess={state.showMore}
                        />
                      )}
                      {phaseElements}
                      {state.showReorderView && (
                        <Popup
                          content={
                            <ReorderView
                              target='phase'
                              toggleReorderView={toggleReorderView}
                              items={reorderPhases}
                              values={selectedTOS.phases}
                              changeOrder={(data) => dispatch(changeOrderThunk(data))}
                              parent={null}
                              attributeTypes={attributeTypes}
                              parentName={`${selectedTOS.function_id} ${selectedTOS.name}`}
                            />
                          }
                          closePopup={toggleReorderView}
                        />
                      )}
                      {state.showImportView && (
                        <Popup
                          content={
                            <ImportView
                              level='phase'
                              toggleImportView={toggleImportView}
                              phases={selectedTOS.phases}
                              phasesOrder={phasesOrder}
                              actions={selectedTOS.actions}
                              records={selectedTOS.records}
                              importItems={(data) => dispatch(importItemsThunk(data))}
                              title='käsittelyvaiheita'
                              targetText={`Tos-kuvaukseen ${selectedTOS.name}`}
                              itemsToImportText='käsittelyvaiheet'
                            />
                          }
                          closePopup={toggleImportView}
                        />
                      )}
                      {state.showCloneView && (
                        <Popup
                          content={
                            <CloneView
                              cloneFromTemplate={(selectedMethod, id) => cloneFromTemplate(selectedMethod, id)}
                              setNavigationVisibility={(isVisible) => dispatch(setNavigationVisibility(isVisible))}
                              templates={templates}
                              toggleCloneView={toggleCloneView}
                            />
                          }
                          closePopup={toggleCloneView}
                        />
                      )}
                      {state.showCancelEditView && (
                        <Popup
                          content={
                            <div className='cancelEditView'>
                              <h3>Peruutetaanko muutokset?</h3>
                              <button
                                type='button'
                                className='btn btn-default'
                                onClick={() => toggleCancelEditView(false)}
                              >
                                Ei
                              </button>
                              <button
                                type='button'
                                className='btn btn-danger'
                                onClick={() => toggleCancelEditView(true)}
                              >
                                Kyllä
                              </button>
                            </div>
                          }
                          closePopup={() => toggleCancelEditView(false)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {showValidationBar && (
                <div className='col-xs-3 validation-bar-container'>
                  <ValidationBar
                    scrollToMetadata={scrollToMetadata}
                    scrollToType={scrollToType}
                    top={headerHeight + scrollTop}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DndProvider>
    );
  }

  return isFetching ? <div>Loading...</div> : null;
};

export default ViewTOS;
