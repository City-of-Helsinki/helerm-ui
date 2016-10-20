import React from 'react';
import './SingleTOS.scss';

export class SingleTOS extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log('render');
    return (
      <div>
        Placeholder for a single TOS
      </div>
    );
  }
}

SingleTOS.propTypes = {
}

export default SingleTOS;
