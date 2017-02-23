import React, { PropTypes, Children } from 'react';

class IsAuthenticated extends React.Component {
  render () {
    const { children } = this.props;

    return (
      Children.only(children)
    );
  }
}

IsAuthenticated.propTypes = {
  children: PropTypes.node
};

export default IsAuthenticated;
