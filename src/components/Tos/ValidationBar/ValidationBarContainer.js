// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ValidationBar from './ValidationBar';

const mapStateToProps = (state) => {
  const { validation, ui, selectedTOS } = state;

  return {
    is_open: validation.is_open,
    attributeTypes: ui.attributeTypes,
    selectedTOS
  };
};

export default connect(mapStateToProps)(ValidationBar);
