import React from 'react';
import './HomeView.scss';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export class HomeView extends React.Component {
  render () {
    return (
      <div>
        <ReactCSSTransitionGroup
          transitionName={'alert-position'}
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={600} />
      </div>
    );
  }
}

export default HomeView;
