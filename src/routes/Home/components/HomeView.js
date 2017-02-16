import React from 'react';
import Navigation from '../../../components/Navigation/components/Navigation';
import Loader from 'components/Loader';
import Alert from 'components/Alert';
import ViewTOS from '../../ViewTOS/components/ViewTOS';
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
      alertMessage =
        <Alert
          message={message.text}
          style={(message.success ? 'alert-success' : 'alert-danger')}
          close={this.props.closeMessage}
        />;
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
  phases: React.PropTypes.object.isRequired,
  actions: React.PropTypes.object.isRequired,
  records: React.PropTypes.object.isRequired,
  fetchTOS: React.PropTypes.func.isRequired,
  fetchNavigation: React.PropTypes.func.isRequired,
  navigation: React.PropTypes.object.isRequired,
  setNavigationVisibility: React.PropTypes.func.isRequired,
  selectedTOS: React.PropTypes.object.isRequired,
  selectedTOSPath: React.PropTypes.array.isRequired,
  setPhaseVisibility: React.PropTypes.func.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  setPhasesVisibility: React.PropTypes.func.isRequired,
  documentState: React.PropTypes.string.isRequired,
  setDocumentState: React.PropTypes.func.isRequired,
  addAction: React.PropTypes.func.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  addPhase: React.PropTypes.func.isRequired,
  changeOrder: React.PropTypes.func.isRequired,
  importItems: React.PropTypes.func.isRequired,
  message: React.PropTypes.object.isRequired,
  closeMessage: React.PropTypes.func.isRequired
};
export default HomeView;
