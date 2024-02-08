import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { goBack } from 'connected-react-router';

import ClassificationTree from './ClassificationTree';

const mapDispatchToProps = (dispatch) => ({
  goBack: bindActionCreators(goBack, dispatch),
});

const mapStateToProps = (state) => ({
  tree: state.navigation.items,
});

export default connect(mapStateToProps, mapDispatchToProps)(ClassificationTree);
