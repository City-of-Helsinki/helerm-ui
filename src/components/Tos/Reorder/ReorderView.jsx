import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ReorderView.scss';
import capitalize from 'lodash/capitalize';

import ReorderItem from './ReorderItem';
import { getBaseValues } from '../../../utils/helpers';

const ReorderView = ({
  target,
  items: initialItems,
  attributeTypes,
  changeOrder,
  toggleReorderView,
  parent,
  values,
  parentName,
}) => {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
    }
  }, [initialItems]);

  const getValues = (attributes, targetType) => {
    const valuesList = [];
    const baseValues = getBaseValues(attributeTypes, targetType);

    baseValues.forEach((value, index) => {
      if ((value === 'TypeSpecifier' || value === `${capitalize(targetType)}Type`) && attributes[value] !== undefined) {
        valuesList.push({ value: attributes[value], index });
      }
    });
    return valuesList;
  };

  const handleChangeOrder = (itemsList) => {
    const itemsMap = itemsList.map((item) => item.id);

    changeOrder({
      newOrder: itemsMap,
      itemType: target,
      itemParent: parent,
    });
    toggleReorderView();
  };

  const moveItem = (dragIndex, hoverIndex) => {
    const dragItem = items[dragIndex];

    setItems((prevItems) => {
      const newItems = [...prevItems];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, dragItem);
      return newItems;
    });
  };

  return (
    <div className='row' data-testid='reorder-view'>
      <h3 className='col-xs-12'>Järjestä</h3>
      {target === 'phase' && (
        <span className='col-xs-12 reorder-subtext' data-testid='reorder-subtext-phase'>
          Järjestä TOS:n <strong className='reorder-subtext-highlight'>{parentName || ''}</strong> käsittelyvaiheita
        </span>
      )}
      {target === 'action' && (
        <span className='col-xs-12 reorder-subtext' data-testid='reorder-subtext-action'>
          Järjestä käsittelyvaiheen <strong className='reorder-subtext-highlight'>{parentName || ''}</strong>{' '}
          toimenpiteet
        </span>
      )}
      <div className='col-xs-12 reorder-list' data-testid='reorder-list'>
        {items.map((item, index) => (
          <ReorderItem
            key={item.key}
            id={item.id}
            index={index}
            moveItem={moveItem}
            labels={getValues(values[item.id].attributes, target)}
            target={target}
          />
        ))}
      </div>
      <div className='col-xs-12 button-row' data-testid='reorder-button-row'>
        <button
          type='button'
          onClick={() => handleChangeOrder(items)}
          className='btn btn-primary pull-right'
          data-testid='reorder-save-button'
        >
          Tallenna
        </button>
        <button
          type='button'
          onClick={toggleReorderView}
          className='btn btn-danger pull-right'
          data-testid='reorder-cancel-button'
        >
          Peruuta
        </button>
      </div>
    </div>
  );
};

ReorderView.propTypes = {
  attributeTypes: PropTypes.object,
  changeOrder: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  parent: PropTypes.string,
  parentName: PropTypes.string,
  target: PropTypes.string.isRequired,
  toggleReorderView: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
};

export default ReorderView;
