/* eslint-disable react/forbid-prop-types */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';

const style = {
  border: '2px dashed #658fcd',
  padding: '0.2rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'move',
};

const itemSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
    };
  },
};

const itemTarget = {
  hover(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex || !monitor.canDrop()) {
      return;
    }

    // Time to actually perform the action
    props.moveItem(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const collectSource = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
});

const collectTarget = (connect) => ({
  connectDropTarget: connect.dropTarget(),
});

class ReorderItem extends React.Component {
  getLabels(labels) {
    const elements = [];

    labels.forEach((label) => {
      elements.push(
        <span key={`${label.value}-${label.index}`} className='reorder-label'>
          {label.value}
        </span>,
      );
    });
    return elements;
  }

  render() {
    const { isDragging, connectDragSource, connectDropTarget, labels, target } = this.props;
    const opacity = isDragging ? 0 : 1;
    let border;
    switch (target) {
      case 'action':
        border = '2px dashed #658fcd';
        break;
      case 'phase':
        border = '2px dashed salmon';
        break;
      default:
        border = '2px dashed gray';
    }
    return connectDragSource(
      connectDropTarget(
        <div style={{ ...style, opacity, border }}>
          <i className='fa-solid fa-arrows' aria-hidden='true' /> {this.getLabels(labels)}
        </div>,
      ),
    );
  }
}

ReorderItem.propTypes = {
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  isDragging: PropTypes.bool,
  labels: PropTypes.array,
  target: PropTypes.string.isRequired,
};

// TODO: refactor to use new hook-API to get rid of this monstrosity
export default DropTarget(
  'item',
  itemTarget,
  collectTarget,
)(DragSource('item', itemSource, collectSource)(ReorderItem));
