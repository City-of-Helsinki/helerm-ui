import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { displayMessage } from '../../../utils/helpers';

import { setNavigationVisibility } from '../../Navigation/reducer';

import {
  createTos,
  fetchClassification,
  clearClassification
} from '../reducer';

import ViewClassification from './ViewClassification';

const mapDispatchToProps = dispatch => {
  return {
    displayMessage: (msg, opts) => displayMessage(msg, opts),
    push: path => dispatch(push(path)),
    createTos: bindActionCreators(createTos, dispatch),
    fetchClassification: bindActionCreators(fetchClassification, dispatch),
    clearClassification: bindActionCreators(clearClassification, dispatch),
    setNavigationVisibility: bindActionCreators(
      setNavigationVisibility,
      dispatch
    )
  };
};

const mapStateToProps = state => {
  return {
    classification: state.classification
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewClassification);
