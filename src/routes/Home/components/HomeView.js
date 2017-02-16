import React from 'react';
import Navigation from '../../../components/Navigation/components/Navigation';
import Alert from 'components/Alert';
import './HomeView.scss';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export class HomeView extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      showAlert: this.props.message.active
    };
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.message) {
      this.setState({ showAlert: nextProps.message.active });
    }
  }

  render () {
    const {
      fetchNavigation,
      setNavigationVisibility,
      navigation,
      fetchTOS,
      selectedTOSPath,
      message
    } = this.props;
    let alertMessage = null;
    if (this.state.showAlert === true) {
      alertMessage = (
        <Alert
          message={message.text}
          style={(message.success ? 'alert-success' : 'alert-danger')}
          close={this.props.closeMessage}
        />
      );
      setTimeout(this.props.closeMessage, 6000);
    }
    return (
      <div>
        <Navigation
          fetchTOS={fetchTOS}
          fetchNavigation={fetchNavigation}
          navigation={navigation}
          setNavigationVisibility={setNavigationVisibility}
          selectedTOSPath={selectedTOSPath}
        />

        <ReactCSSTransitionGroup
          transitionName={'alert-position'}
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={600}>
          { this.state.showAlert &&
          alertMessage
          }
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

HomeView.propTypes = {
  closeMessage: React.PropTypes.func.isRequired,
  fetchNavigation: React.PropTypes.func.isRequired,
  fetchTOS: React.PropTypes.func.isRequired,
  message: React.PropTypes.object.isRequired,
  navigation: React.PropTypes.object.isRequired,
  selectedTOSPath: React.PropTypes.array.isRequired,
  setNavigationVisibility: React.PropTypes.func.isRequired
};
export default HomeView;
