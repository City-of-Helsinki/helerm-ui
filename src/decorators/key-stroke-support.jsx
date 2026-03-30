import { Component } from 'react';
import PropTypes from 'prop-types';

const KeyStrokeWrapper = (WrappedComponent) => {
  // eslint-disable-next-line @eslint-react/component-hook-factories
  class KeyStrokeSupport extends Component {
    constructor(props) {
      super(props);
      this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    // eslint-disable-next-line @eslint-react/no-unsafe-component-will-mount
    UNSAFE_componentWillMount() {
      document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
      document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown(e) {
      switch (e.keyCode) {
        case 13:
          this.props.submit(e);
          break;
        case 27:
          this.props.cancel(e);
          break;
        default:
          break;
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  KeyStrokeSupport.propTypes = {
    cancel: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
  };

  return KeyStrokeSupport;
};

export default KeyStrokeWrapper;
