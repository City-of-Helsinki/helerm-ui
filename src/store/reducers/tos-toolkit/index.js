/* eslint-disable import/order */
import tosReducer, {
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
  executeOrderChange
} from './main';

import { createNewAction } from './action';
import { createNewPhase } from './phase';
import { createNewRecord } from './record';
import { importItemsThunk } from './importView';
import { cloneFromTemplateThunk } from './cloneView';
import { changeOrderThunk } from './reorder';

export {
  // Helpers
  createNewAction,
  createNewPhase,
  createNewRecord,

  // Thunks
  fetchTOSThunk,
  saveDraftThunk,
  changeStatusThunk,
  cloneFromTemplateThunk,
  importItemsThunk,
  changeOrderThunk,

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

  // Action action creators
  addAction,
  editAction,
  editActionAttribute,
  removeAction,
  setActionVisibility,

  // Phase action creators
  addPhase,
  editPhase,
  editPhaseAttribute,
  removePhase,
  setPhaseAttributesVisibility,
  setPhaseVisibility,
  setPhasesVisibility,

  // Record action creators
  addRecord,
  editRecord,
  editRecordAttribute,
  removeRecord,
  setRecordVisibility,

  // Import/Clone action creators
  executeImport,
  receiveTemplate,
  executeOrderChange,

  // Selectors
  selectedTOSSelector,
  isFetchingSelector
};

export default tosReducer;
