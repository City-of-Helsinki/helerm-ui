import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';

import { displayMessage } from '../../utils/helpers';
import { setNavigationVisibility } from '../../components/Navigation/reducer';
import { createTos, fetchClassification, clearClassification } from './reducer';
import ViewClassification from './ViewClassification';

const mapDispatchToProps = (dispatch) => ({
  displayMessage: (msg, opts) => displayMessage(msg, opts),
  push: (path) => dispatch(push(path)),
  createTos: bindActionCreators(createTos, dispatch),
  fetchClassification: bindActionCreators(fetchClassification, dispatch),
  clearClassification: bindActionCreators(clearClassification, dispatch),
  setNavigationVisibility: bindActionCreators(setNavigationVisibility, dispatch),
});

const mapStateToProps = (state) => ({
  classification: state.classification,
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewClassification);
