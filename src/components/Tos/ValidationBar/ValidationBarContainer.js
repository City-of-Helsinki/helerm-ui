import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ValidationBar from './ValidationBar';
import { setValidationVisibility } from './reducer';

const mapDispatchToProps = (dispatch) => {
  return {
    setValidationVisibility: bindActionCreators(setValidationVisibility, dispatch)
  };
};

const mapStateToProps = (state) => {
  const { validation, ui, selectedTOS } = state;

  return {
    is_open: validation.is_open,
    attributeTypes: ui.attributeTypes,
    selectedTOS
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ValidationBar);
