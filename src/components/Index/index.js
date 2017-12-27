import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { setNavigationVisibility } from '../Navigation/reducer';

class IndexPage extends React.Component {
  componentDidMount () {
    this.props.openNavigation();
  }

  render () {
    return null;
  }
}

IndexPage.propTypes = {
  openNavigation: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      openNavigation: () => setNavigationVisibility(true)
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(IndexPage);
