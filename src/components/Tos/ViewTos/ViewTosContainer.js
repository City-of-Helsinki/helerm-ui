import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';

import { displayMessage, itemById } from '../../../utils/helpers';
import { setNavigationVisibility } from '../../Navigation/reducer';

import {
  changeStatus,
  clearTOS,
  editMetaData,
  editValidDates,
  fetchTOS,
  resetTOS,
  saveDraft,
  setClassificationVisibility,
  setDocumentState,
  setMetadataVisibility,
  setTosVisibility,
  setVersionVisibility
} from '../reducer';

import {
  addAction,
  editAction,
  editActionAttribute,
  removeAction,
  setActionVisibility
} from '../Action/reducer';

import {
  addPhase,
  editPhase,
  editPhaseAttribute,
  removePhase,
  setPhaseAttributesVisibility,
  setPhaseVisibility
} from '../Phase/reducer';

import {
  addRecord,
  editRecord,
  editRecordAttribute,
  removeRecord,
  setRecordVisibility
} from '../Record/reducer';

import { importItems } from '../ImportView/reducer';
import { cloneFromTemplate } from '../CloneView/reducer';
import { changeOrder } from '../Reorder/reducer';
import { setValidationVisibility } from '../ValidationBar/reducer';

import ViewTOS from './ViewTos';

const mapDispatchToProps = dispatch => ({
  addAction: bindActionCreators(addAction, dispatch),
  addPhase: bindActionCreators(addPhase, dispatch),
  addRecord: bindActionCreators(addRecord, dispatch),
  changeOrder: bindActionCreators(changeOrder, dispatch),
  changeStatus: bindActionCreators(changeStatus, dispatch),
  clearTOS: bindActionCreators(clearTOS, dispatch),
  cloneFromTemplate: bindActionCreators(cloneFromTemplate, dispatch),
  displayMessage: (msg, opts) => displayMessage(msg, opts),
  editMetaData: bindActionCreators(editMetaData, dispatch),
  editPhase: bindActionCreators(editPhase, dispatch),
  editPhaseAttribute: bindActionCreators(editPhaseAttribute, dispatch),
  editAction: bindActionCreators(editAction, dispatch),
  editActionAttribute: bindActionCreators(editActionAttribute, dispatch),
  editRecord: bindActionCreators(editRecord, dispatch),
  editRecordAttribute: bindActionCreators(editRecordAttribute, dispatch),
  editValidDates: bindActionCreators(editValidDates, dispatch),
  fetchTOS: bindActionCreators(fetchTOS, dispatch),
  importItems: bindActionCreators(importItems, dispatch),
  push: path => dispatch(push(path)),
  removeAction: bindActionCreators(removeAction, dispatch),
  removePhase: bindActionCreators(removePhase, dispatch),
  removeRecord: bindActionCreators(removeRecord, dispatch),
  resetTOS: bindActionCreators(resetTOS, dispatch),
  saveDraft: bindActionCreators(saveDraft, dispatch),
  setClassificationVisibility: bindActionCreators(setClassificationVisibility, dispatch),
  setDocumentState: bindActionCreators(setDocumentState, dispatch),
  setActionVisibility: bindActionCreators(setActionVisibility, dispatch),
  setNavigationVisibility: bindActionCreators(
    setNavigationVisibility,
    dispatch
  ),
  setMetadataVisibility: bindActionCreators(setMetadataVisibility, dispatch),
  setPhaseAttributesVisibility: bindActionCreators(setPhaseAttributesVisibility, dispatch),
  setPhaseVisibility: bindActionCreators(setPhaseVisibility, dispatch),
  setRecordVisibility: bindActionCreators(setRecordVisibility, dispatch),
  setTosVisibility: bindActionCreators(setTosVisibility, dispatch),
  setValidationVisibility: bindActionCreators(setValidationVisibility, dispatch),
  setVersionVisibility: bindActionCreators(setVersionVisibility, dispatch)
});

const getClassification = (tos, items) => {
  if (tos && tos.classification && items) {
    return itemById(items, tos.classification);
  }
  return null;
};

const mapStateToProps = state => ({
  actionTypes: state.ui.actionTypes,
  attributeTypes: state.ui.attributeTypes,
  classification: getClassification(state.selectedTOS, state.navigation.items),
  isFetching: state.ui.isFetching || state.selectedTOS.isFetching,
  items: state.navigation.items,
  phaseTypes: state.ui.phaseTypes,
  recordTypes: state.ui.recordTypes,
  selectedTOS: state.selectedTOS,
  showValidationBar: state.validation.is_open,
  templates: state.ui.templates
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewTOS);
