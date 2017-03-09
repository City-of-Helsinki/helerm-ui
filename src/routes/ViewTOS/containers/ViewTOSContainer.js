import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';

import { setNavigationVisibility } from '../../../components/Navigation/navigationReducer';

import {
  addAction,
  addPhase,
  addRecord,
  changeOrder,
  clearTOS,
  editAction,
  editPhase,
  editRecord,
  editRecordAttribute,
  fetchTOS,
  importItems,
  removeAction,
  removePhase,
  removeRecord,
  resetTOS,
  saveDraft,
  setDocumentState,
  setPhasesVisibility,
  setPhaseVisibility
} from '../tosReducer';

import { displayMessage } from '../../../store/uiReducer';

import ViewTOS from '../components/ViewTOS';

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTOS: bindActionCreators(fetchTOS, dispatch),
    clearTOS: bindActionCreators(clearTOS, dispatch),
    resetTOS: bindActionCreators(resetTOS, dispatch),
    setPhaseVisibility: bindActionCreators(setPhaseVisibility, dispatch),
    setPhasesVisibility: bindActionCreators(setPhasesVisibility, dispatch),
    addAction: bindActionCreators(addAction, dispatch),
    addPhase: bindActionCreators(addPhase, dispatch),
    addRecord: bindActionCreators(addRecord, dispatch),
    editAction: bindActionCreators(editAction, dispatch),
    editPhase: bindActionCreators(editPhase, dispatch),
    editRecord: bindActionCreators(editRecord, dispatch),
    editRecordAttribute: bindActionCreators(editRecordAttribute, dispatch),
    removeAction: bindActionCreators(removeAction, dispatch),
    removePhase: bindActionCreators(removePhase, dispatch),
    removeRecord: bindActionCreators(removeRecord, dispatch),
    push: (path) => dispatch(push(path)),
    setDocumentState: bindActionCreators(setDocumentState, dispatch),
    importItems: bindActionCreators(importItems, dispatch),
    changeOrder: bindActionCreators(changeOrder, dispatch),
    saveDraft: bindActionCreators(saveDraft, dispatch),
    setNavigationVisibility: bindActionCreators(setNavigationVisibility, dispatch),
    displayMessage: bindActionCreators(displayMessage, dispatch)
  };
};

const mapStateToProps = (state) => {
  return {
    attributeTypes: state.ui.attributeTypes,
    isFetching: state.ui.isFetching || state.selectedTOS.isFetching,
    items: state.navigation.items,
    recordTypes: state.ui.recordTypes,
    selectedTOS: state.selectedTOS
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewTOS);
