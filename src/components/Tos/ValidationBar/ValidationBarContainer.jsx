import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ValidationBar from './ValidationBar';
import { setValidationVisibility } from './reducer';

const mapDispatchToProps = (dispatch) => ({
  setValidationVisibility: bindActionCreators(setValidationVisibility, dispatch),
});

const mapStateToProps = (state) => {
  const { ui, selectedTOS } = state;

  return {
    attributeTypes: ui.attributeTypes,
    selectedTOS,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ValidationBar);
