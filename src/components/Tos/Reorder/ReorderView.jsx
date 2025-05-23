import React from 'react';
import PropTypes from 'prop-types';
import './ReorderView.scss';
import capitalize from 'lodash/capitalize';
import update from 'immutability-helper';

import ReorderItem from './ReorderItem';
import { getBaseValues } from '../../../utils/helpers';

class ReorderView extends React.Component {
  constructor(props) {
    super(props);
    this.moveItem = this.moveItem.bind(this);
    this.state = {
      target: this.props.target,
      items: this.props.items,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.items) {
      this.setState({ items: nextProps.items });
    }
  }

  getValues(attributes, target) {
    const values = [];
    const baseValues = getBaseValues(this.props.attributeTypes, target);
    baseValues.forEach((value, index) => {
      if ((value === 'TypeSpecifier' || value === `${capitalize(target)}Type`) && attributes[value] !== undefined) {
        values.push({ value: attributes[value], index });
      }
    });
    return values;
  }

  changeOrder(items) {
    const itemsMap = items.map((item) => item.id);

    this.props.changeOrder(itemsMap, this.props.target, this.props.parent);
    this.props.toggleReorderView();
  }

  moveItem(dragIndex, hoverIndex) {
    const { items } = this.state;
    const dragItem = items[dragIndex];

    this.setState((prev) =>
      update(prev, {
        items: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragItem],
          ],
        },
      }),
    );
  }

  render() {
    const { items } = this.state;
    const { target, values, toggleReorderView, parentName } = this.props;

    return (
      <div className='row'>
        <h3 className='col-xs-12'>Järjestä</h3>
        {target === 'phase' && (
          <span className='col-xs-12 reorder-subtext'>
            Järjestä TOS:n <strong className='reorder-subtext-highlight'>{parentName || ''}</strong> käsittelyvaiheita
          </span>
        )}
        {target === 'action' && (
          <span className='col-xs-12 reorder-subtext'>
            Järjestä käsittelyvaiheen <strong className='reorder-subtext-highlight'>{parentName || ''}</strong>{' '}
            toimenpiteet
          </span>
        )}
        <div className='col-xs-12 reorder-list'>
          {items.map((item, index) => (
            <ReorderItem
              key={item.key}
              id={item.id}
              index={index.toString()}
              moveItem={this.moveItem}
              labels={this.getValues(values[item.id].attributes, target)}
              target={target}
            />
          ))}
        </div>
        <div className='col-xs-12 button-row'>
          <button
            type='button'
            onClick={() => this.changeOrder(this.state.items)}
            className='btn btn-primary pull-right'
          >
            Tallenna
          </button>
          <button type='button' onClick={toggleReorderView} className='btn btn-danger pull-right'>
            Peruuta
          </button>
        </div>
      </div>
    );
  }
}

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
