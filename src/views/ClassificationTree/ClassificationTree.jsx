/* eslint-disable operator-assignment */
import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { fetchNavigationThunk, itemsSelector } from '../../store/reducers/navigation';
import { getStatusLabel } from '../../utils/helpers';

import './ClassificationTree.scss';

const BODY_CLASS = 'helerm-classification-tree';

const ClassificationTree = () => {
  const [tree, setTree] = useState([]);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const items = useSelector(itemsSelector);

  useEffect(() => {
    if (isEmpty(items)) {
      dispatch(fetchNavigationThunk());
    }

    if (!isEmpty(items)) {
      setTree(items);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    addBodyClass();

    return () => {
      removeBodyClass();
    };
  }, []);

  const addBodyClass = () => {
    if (document.body) {
      document.body.className = document.body.className + BODY_CLASS;
    }
  };

  const removeBodyClass = () => {
    if (document.body) {
      document.body.className = document.body.className.replace(BODY_CLASS, '');
    }
  };

  const renderClassificationData = (label, value) => {
    if (value) {
      return (
        <tr>
          <th scope='row'>{label}</th>
          <td>{value}</td>
        </tr>
      );
    }
    return null;
  };

  const renderClassification = (item) => {
    const description = renderClassificationData('Kuvaus', item.description);
    const descriptionInternal = renderClassificationData('Sisäinen kuvaus', item.description_internal);
    const related = renderClassificationData('Liittyvä tehtäväluokka', item.related_classification);
    const information = renderClassificationData('Lisätiedot', item.additional_information);
    const functionAllowed = renderClassificationData(
      'Käsittelyprosessi sallittu',
      item.function_allowed ? 'Kyllä' : 'Ei',
    );
    const state =
      item.function_allowed && item.function_state
        ? renderClassificationData('Käsittelyprosessin tila', getStatusLabel(item.function_state))
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
  };

  const getTreeItems = (items, current) => {
    const classificationData = renderClassification(current);
    const currentItems = [...items];
    const childrenList = current.children
      ? current.children.reduce((prev, currentChild) => {
          if (current === undefined) {
            return prev;
          }
          return getTreeItems(prev, currentChild);
        }, [])
      : null;

    currentItems.push(
      <div key={current.id}>
        {classificationData}
        {childrenList && <div className='classification-children'>{childrenList}</div>}
      </div>,
    );

    return currentItems;
  };

  if (!tree) {
    return null;
  }

  const treeItems = tree.reduce((prev, curr, key) => {
    if (key === undefined) {
      return prev;
    }
    return getTreeItems(prev, curr);
  }, []);

  return (
    <div className='classification-tree'>
      <div className='no-print'>
        <button type='button' className='btn btn-primary' onClick={navigate(-1)}>
          Takaisin
        </button>
      </div>
      {treeItems}
    </div>
  );
};

ClassificationTree.BODY_CLASS = BODY_CLASS;

export default ClassificationTree;
