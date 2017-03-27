import React, { PropTypes, Component } from 'react';

export default function (WrappedComponent) {
  class KeyStrokeSupport extends Component {

    static propTypes = {
      cancel: PropTypes.func.isRequired,
      submit: PropTypes.func.isRequired
    };

    constructor (props) {
      super(props);
      this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentWillMount () {
      document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount () {
      document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown (e) {
      switch (e.keyCode) {
        case 13:
          this.props.submit(e);
          break;
        case 27:
          this.props.cancel(e);
          break;
      }
    }

    render () {
      return (<WrappedComponent {...this.props}/>);
    }
  }

  return KeyStrokeSupport;
};
