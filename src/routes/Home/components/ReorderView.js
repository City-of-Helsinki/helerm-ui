import React from 'react';
import ReorderItem from './ReorderItem';
import './ReorderView.scss';
import update from 'immutability-helper';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

@DragDropContext(HTML5Backend)
export class ReorderView extends React.Component {
  constructor (props) {
    super(props);
    this.moveItem = this.moveItem.bind(this);
    this.state = {
      target: this.props.target,
      keys: this.props.keys
    };
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.keys) {
      this.setState({ keys: nextProps.keys });
    }
  }
  commitOrderChanges (keys) {
    this.props.commitOrderChanges(keys, this.props.target, this.props.parent);
    this.props.toggleReorderView();
  }
  moveItem (dragIndex, hoverIndex) {
    const { keys } = this.state;
    const dragItem = keys[dragIndex];

    this.setState(update(this.state, {
      keys: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragItem]
        ]
      }
    }));
  }
  stop (e) {
    e.stopPropagation();
  }
  render () {
    const { keys } = this.state;
    const { target, values, toggleReorderView, parentName } = this.props;
    return (
      <div className='popup-outer-background' onClick={toggleReorderView}>
        <div className='popup-inner-background' onClick={(e) => this.stop(e)}>
          <h3>Järjestä</h3>
          { target === 'phase' &&
            <h4>Järjestä TOS:n <strong>{parentName}</strong> käsittelyvaiheita</h4>
          }
          { target === 'action' &&
            <h4>Järjestä käsittelyvaiheen <strong>{parentName}</strong> toimenpiteet</h4>
          }
          <div>
            { keys.map((key, index) => (
              <ReorderItem
                key={values[key].index}
                index={index}
                id={values[key].index}
                name={values[key].name}
                moveItem={this.moveItem}
                target={target}
              />
            )) }
          </div>
          <div className='col-sm-8 col-sm-offset-2'>
            <button
              onClick={() => this.commitOrderChanges(this.state.keys)}
              className='btn btn-primary pull-right'>
              Tallenna
            </button>
            <button onClick={toggleReorderView} className='btn btn-default pull-right'>Peruuta</button>
          </div>
        </div>
      </div>
    );
  }
}

ReorderView.propTypes = {
  target: React.PropTypes.string.isRequired,
  toggleReorderView: React.PropTypes.func.isRequired,
  keys: React.PropTypes.array.isRequired,
  values: React.PropTypes.object.isRequired,
  parent: React.PropTypes.string,
  commitOrderChanges: React.PropTypes.func.isRequired,
  parentName: React.PropTypes.string.isRequired
};

export default ReorderView;
