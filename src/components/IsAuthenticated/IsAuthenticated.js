import React, { PropTypes, Children } from 'react';
import { connect } from 'react-redux';

class IsAuthenticated extends React.Component {
  render () {
    const { children, user } = this.props;

    return (
      !!user.token && Children.only(children)
    );
  }
}

IsAuthenticated.propTypes = {
  children: PropTypes.node,
  user: PropTypes.object
};

const mapStateToProps = (state) => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps)(IsAuthenticated);
