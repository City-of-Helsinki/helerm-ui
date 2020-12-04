import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { goBack } from 'connected-react-router';

import ClassificationTree from './ClassificationTree';

const mapDispatchToProps = dispatch => {
  return {
    goBack: bindActionCreators(goBack, dispatch)
  };
};

const mapStateToProps = state => {
  return {
    tree: state.navigation.items
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ClassificationTree);
