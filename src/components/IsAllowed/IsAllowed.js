import React, { Children } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { checkPermissions } from '../../utils/helpers';

class IsAllowed extends React.Component {
  render () {
    const { children, user, to } = this.props;
    const isAllowed = checkPermissions(user, to);

    return (
      !!isAllowed && Children.only(children)
    );
  }
}

IsAllowed.propTypes = {
  children: PropTypes.node,
  to: PropTypes.string,
  user: PropTypes.object
};

const mapStateToProps = (state) => {
  return {
    user: state.user.data
  };
};

export default connect(mapStateToProps)(IsAllowed);
