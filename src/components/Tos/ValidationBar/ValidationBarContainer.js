// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ValidationBar from './ValidationBar';

const mapStateToProps = (state) => {
  const { selectedTOS } = state;

  return {
    selectedTOS
  };
};

export default connect(mapStateToProps)(ValidationBar);
