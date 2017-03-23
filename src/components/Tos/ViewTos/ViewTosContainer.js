import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';
import { displayMessage } from '../../../utils/helpers';

import { setNavigationVisibility } from '../../Navigation/reducer';

import {
  changeStatus,
  clearTOS,
  editMetaData,
  fetchTOS,
  resetTOS,
  saveDraft,
  setDocumentState
} from '../reducer';

import {
  addAction,
  editAction,
  removeAction
} from '../Action/reducer';

import {
  addPhase,
  editPhase,
  removePhase,
  setPhasesVisibility,
  setPhaseVisibility
} from '../Phase/reducer';

import {
  addRecord,
  editRecord,
  editRecordAttribute,
  removeRecord
} from '../Record/reducer';

import { importItems } from '../ImportView/reducer';
import { changeOrder } from '../Reorder/reducer';

import ViewTOS from './ViewTos';

const mapDispatchToProps = (dispatch) => {
  return {
    addAction: bindActionCreators(addAction, dispatch),
    addPhase: bindActionCreators(addPhase, dispatch),
    addRecord: bindActionCreators(addRecord, dispatch),
    changeOrder: bindActionCreators(changeOrder, dispatch),
    changeStatus: bindActionCreators(changeStatus, dispatch),
    clearTOS: bindActionCreators(clearTOS, dispatch),
    displayMessage: (msg, opts) => displayMessage(msg, opts),
    editAction: bindActionCreators(editAction, dispatch),
    editMetaData: bindActionCreators(editMetaData, dispatch),
    editPhase: bindActionCreators(editPhase, dispatch),
    editRecord: bindActionCreators(editRecord, dispatch),
    editRecordAttribute: bindActionCreators(editRecordAttribute, dispatch),
    fetchTOS: bindActionCreators(fetchTOS, dispatch),
    importItems: bindActionCreators(importItems, dispatch),
    push: (path) => dispatch(push(path)),
    removeAction: bindActionCreators(removeAction, dispatch),
    removePhase: bindActionCreators(removePhase, dispatch),
    removeRecord: bindActionCreators(removeRecord, dispatch),
    resetTOS: bindActionCreators(resetTOS, dispatch),
    saveDraft: bindActionCreators(saveDraft, dispatch),
    setDocumentState: bindActionCreators(setDocumentState, dispatch),
    setNavigationVisibility: bindActionCreators(setNavigationVisibility, dispatch),
    setPhasesVisibility: bindActionCreators(setPhasesVisibility, dispatch),
    setPhaseVisibility: bindActionCreators(setPhaseVisibility, dispatch)
  };
};

const mapStateToProps = (state) => {
  return {
    attributeTypes: state.ui.attributeTypes,
    isFetching: state.ui.isFetching || state.selectedTOS.isFetching,
    items: state.navigation.items,
    recordTypes: state.ui.recordTypes,
    selectedTOS: state.selectedTOS,
    templates: state.ui.templates
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewTOS);
