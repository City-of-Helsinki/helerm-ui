/* eslint-disable operator-assignment */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import { getStatusLabel } from '../../utils/helpers';

import './ClassificationTree.scss';

class ClassificationTree extends React.Component {
  componentDidMount() {
    this.addBodyClass();
  }

  componentWillUnmount() {
    this.removeBodyClass();
  }

  getTreeItems(items, current) {
    const classificationData = this.renderClassification(current);
    const currentItems = [...items];
    const childrenList = current.children
      ? current.children.reduce((prev, currentChild) => {
          if (current === undefined) {
            return prev;
          }
          return this.getTreeItems(prev, currentChild);
        }, [])
      : null;

    currentItems.push(
      <div key={current.id}>
        {classificationData}
        {childrenList && <div className='classification-children'>{childrenList}</div>}
      </div>,
    );

    return currentItems;
  }

  addBodyClass() {
    if (document.body) {
      document.body.className = document.body.className + ClassificationTree.BODY_CLASS;
    }
  }

  removeBodyClass() {
    if (document.body) {
      document.body.className = document.body.className.replace(ClassificationTree.BODY_CLASS, '');
    }
  }

  renderClassificationData(label, value) {
    if (value) {
      return (
        <tr>
          <th scope='row'>{label}</th>
          <td>{value}</td>
        </tr>
      );
    }
    return null;
  }

  renderClassification(item) {
    const description = this.renderClassificationData('Kuvaus', item.description);
    const descriptionInternal = this.renderClassificationData('Sisäinen kuvaus', item.description_internal);
    const related = this.renderClassificationData('Liittyvä tehtäväluokka', item.related_classification);
    const information = this.renderClassificationData('Lisätiedot', item.additional_information);
    const functionAllowed = this.renderClassificationData(
      'Käsittelyprosessi sallittu',
      item.function_allowed ? 'Kyllä' : 'Ei',
    );
    const state =
      item.function_allowed && item.function_state
        ? this.renderClassificationData('Käsittelyprosessin tila', getStatusLabel(item.function_state))
        : null;
    return (
      <div key={item.id}>
        <table>
          <tbody>
            <tr className='classification-title'>
              <th scope='row'>
                <h4>{item.code}</h4>
              </th>
              <td>
                <h4>{item.title}</h4>
              </td>
            </tr>
            {description}
            {descriptionInternal}
            {related}
            {information}
            {functionAllowed}
            {state}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    const { tree, goBack } = this.props;
    if (tree) {
      const treeItems = tree.reduce((prev, curr, key) => {
        if (key === undefined) {
          return prev;
        }
        return this.getTreeItems(prev, curr);
      }, []);

      return (
        <div className='classification-tree'>
          <div className='no-print'>
            <button type='button' className='btn btn-primary' onClick={goBack}>
              Takaisin
            </button>
          </div>
          {treeItems}
        </div>
      );
    }
    return null;
  }
}

ClassificationTree.propTypes = {
  goBack: PropTypes.func.isRequired,
  tree: PropTypes.array,
};

ClassificationTree.BODY_CLASS = 'helerm-classification-tree';

export default ClassificationTree;
