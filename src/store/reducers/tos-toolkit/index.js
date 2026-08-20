import tosReducer from './main';

export {
  // Thunks
  fetchTOSThunk,
  saveDraftThunk,
  changeStatusThunk,

  // Action creators
  clearTos,
  resetTos,
  editMetaData,
  editValidDates,
  setDocumentState,
  setClassificationVisibility,
  setMetadataVisibility,
  updateTosVisibility,
  setVersionVisibility,

  // Selectors
  selectedTOSSelector,
  isFetchingSelector,

  // Action reducers
  addAction,
  editAction,
  editActionAttribute,
  removeAction,
  setActionVisibility,

  // Phase reducers
  addPhase,
  editPhase,
  editPhaseAttribute,
  removePhase,
  setPhaseAttributesVisibility,
  setPhaseVisibility,
  setPhasesVisibility,

  // Record reducers
  addRecord,
  editRecord,
  editRecordAttribute,
  removeRecord,
  setRecordVisibility,

  // Other reducers
  executeImport,
  receiveTemplate,
  executeOrderChange,
} from './main';

export { createNewAction } from './action';
export { createNewPhase } from './phase';
export { createNewRecord } from './record';
export { importItemsThunk } from './importView';
export { cloneFromTemplateThunk } from './cloneView';
export { changeOrderThunk } from './reorder';

export default tosReducer;
