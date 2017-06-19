import React from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';

const style = {
  border: '2px dashed #658fcd',
  padding: '0.2rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'move'
};

const itemSource = {
  beginDrag (props) {
    return {
      id: props.id,
      index: props.index
    };
  }
};

const itemTarget = {
  hover (props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveItem(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};

@DropTarget('item', itemTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource('item', itemSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))

export class ReorderItem extends React.Component {
  getLabels (labels) {
    const elements = [];
    for (const label of labels) {
      elements.push(
        <span key={label} className='reorder-label'>{label}</span>
      );
    }
    return elements;
  }

  render () {
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
    return connectDragSource(connectDropTarget(
      <div style={{ ...style, opacity, border }}>
        <i className='fa fa-arrows' aria-hidden='true' />
        {' '}
        {this.getLabels(labels)}
      </div>
    ));
  }
}

ReorderItem.propTypes = {
  connectDragSource: React.PropTypes.func,
  connectDropTarget: React.PropTypes.func,
  isDragging: React.PropTypes.bool,
  labels: React.PropTypes.array,
  target: React.PropTypes.string.isRequired
};

export default ReorderItem;
