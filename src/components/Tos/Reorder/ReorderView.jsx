/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/no-unused-state */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-unused-class-component-methods */
import React from 'react';
import PropTypes from 'prop-types';
import './ReorderView.scss';
import capitalize from 'lodash/capitalize';
import update from 'immutability-helper';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

import ReorderItem from './ReorderItem';
import { getBaseValues } from '../../../utils/helpers';

class ReorderView extends React.Component {
  constructor(props) {
    super(props);
    this.moveItem = this.moveItem.bind(this);
    this.state = {
      target: this.props.target,
      keys: this.props.keys,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.keys) {
      this.setState({ keys: nextProps.keys });
    }
  }

  getValues(attributes, target) {
    const values = [];
    const baseValues = getBaseValues(this.props.attributeTypes, target);
    baseValues.forEach((value) => {
      if ((value === 'TypeSpecifier' || value === `${capitalize(target)}Type`) && attributes[value] !== undefined) {
        values.push(attributes[value]);
      }
    });
    return values;
  }

  changeOrder(keys) {
    this.props.changeOrder(keys, this.props.target, this.props.parent);
    this.props.toggleReorderView();
  }

  moveItem(dragIndex, hoverIndex) {
    const { keys } = this.state;
    const dragItem = keys[dragIndex];

    this.setState((prev) =>
      update(prev, {
        keys: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragItem],
          ],
        },
      }),
    );
  }

  stop(e) {
    e.stopPropagation();
  }

  render() {
    const { keys } = this.state;
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
          <DndProvider backend={HTML5Backend}>
            {keys.map((key, index) => (
              <ReorderItem
                key={values[key].index}
                index={index.toString()}
                id={values[key].index}
                labels={this.getValues(values[key].attributes, target)}
                moveItem={this.moveItem}
                target={target}
              />
            ))}
          </DndProvider>
        </div>
        <div className='col-xs-12 button-row'>
          <button
            type='button'
            onClick={() => this.changeOrder(this.state.keys)}
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
  keys: PropTypes.array.isRequired,
  parent: PropTypes.string,
  parentName: PropTypes.string,
  target: PropTypes.string.isRequired,
  toggleReorderView: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
};

export default ReorderView;
