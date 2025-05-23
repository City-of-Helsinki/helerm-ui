/* eslint-disable sonarjs/todo-tag */
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';

const ReorderItem = ({ id, index, moveItem, labels, target }) => {
  const ref = useRef(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'item',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    // eslint-disable-next-line no-unused-vars
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveItem(dragIndex, hoverIndex);

      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'item',
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const getLabels = (labelItems) =>
    labelItems.map((label) => (
      <span key={`${label.value}-${label.index}`} className='reorder-label'>
        {label.value}
      </span>
    ));

  const getBorderStyle = (target) => {
    switch (target) {
      case 'action':
        return '2px dashed #658fcd';
      case 'phase':
        return '2px dashed salmon';
      default:
        return '2px dashed gray';
    }
  };

  const opacity = isDragging ? 0 : 1;

  return (
    <div
      ref={ref}
      style={{
        ...{
          border: '2px dashed #658fcd',
          padding: '0.2rem 1rem',
          marginBottom: '.5rem',
          backgroundColor: 'white',
          cursor: 'move',
        },
        opacity,
        border: getBorderStyle(target),
      }}
      data-handler-id={handlerId}
    >
      <i className='fa-solid fa-arrows' aria-hidden='true' /> {getLabels(labels)}
    </div>
  );
};

ReorderItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  index: PropTypes.number.isRequired,
  moveItem: PropTypes.func.isRequired,
  labels: PropTypes.array,
  target: PropTypes.string.isRequired,
};

export default ReorderItem;
