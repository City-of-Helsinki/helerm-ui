// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ValidationBar from './ValidationBar';

const mapStateToProps = (state) => {
  const { ui, selectedTOS } = state;

  return {
    attributeTypes: ui.attributeTypes,
    selectedTOS
  };
};

export default connect(mapStateToProps)(ValidationBar);
