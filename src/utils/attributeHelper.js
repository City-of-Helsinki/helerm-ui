/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable import/no-cycle */
/* eslint-disable no-restricted-syntax */

import { store } from '../init';
import { validateConditionalRules } from './validators';

/**
 * Attributes should be displayed in the UI as "value name",
 * the name part being optionally defined. As only part of the
 * attribute content might be accessible in a given component, this
 * general helper can be used to map the value to "value name" format.
 * If it doesn't find any name it simply passes back the value received
 * as argument.
 * @param {string} attributeValue
 * @param {string?} id
 * @param {string?} identifier
 * @param {string?} name
 */
export const getDisplayLabelForAttribute = ({
  attributeValue,
  id = null,
  identifier = null,
  name = null
}) => {

  const { attributeTypes } = store.getState().ui;

  if (identifier) {
    const identifierContent = attributeTypes[identifier];
    if (identifierContent && identifierContent.values) {
      const foundItem = identifierContent.values.find(
        (item) => item.value === attributeValue
      );
      if (foundItem && foundItem.name) {
        return `${foundItem.value} ${foundItem.name}`;
      }
    }
  } else if (id) {
    for (const identifierKey in attributeTypes) {
      if (attributeTypes[identifierKey].values) {
        const foundItem = attributeTypes[identifierKey].values.find(
          (item) => item.id === id && item.value === attributeValue
        );
        if (foundItem && foundItem.name) {
          return `${foundItem.value} ${foundItem.name}`;
        }
      }
    }
  } else if (name) {
    for (const identifierKey in attributeTypes) {
      if (attributeTypes[identifierKey].name === name) {
        const foundItem = attributeTypes[identifierKey].values.find(
          (item) => item.value === attributeValue
        );
        if (foundItem && foundItem.name) {
          return `${foundItem.value} ${foundItem.name}`;
        }
      }
    }
  }
  return attributeValue;
};

export const generateDefaultAttributes = (attributeTypes, type) => {
  const attributes = {};
  Object.keys(attributeTypes).forEach((key) => {
    if (
      Object.hasOwn(attributeTypes, key) &&
      ((this.state.showMore && attributeTypes[key].allowedIn.indexOf(type) >= 0 && key !== 'PhaseType') ||
        (!this.state.showMore && attributeTypes[key].defaultIn.indexOf(type) >= 0)) &&
      key !== 'TypeSpecifier'
    ) {
      if (attributeTypes[key].requiredIf.length) {
        if (validateConditionalRules(key, attributeTypes)) {
          attributes[key] = attributeTypes[key];
        }
      } else {
        attributes[key] = attributeTypes[key];
      }
    }
  });
  return attributes;
}

export const attributeButton = (attributes, attributeTypes) => {
  const actualAttributes = [];
  Object.keys(attributes).forEach((key) => {
    if (key !== 'TypeSpecifier' && key !== 'ActionType') {
      actualAttributes.push(key);
    }
  });
  Object.keys(attributeTypes).forEach((key) => {
    if (
      Object.hasOwn(attributeTypes, key) &&
      attributeTypes[key].defaultIn.indexOf('action') >= 0
    ) {
      actualAttributes.push(key);
    }
  });

  return !!actualAttributes.length;
}
