/* eslint-disable no-restricted-syntax */

/**
 * Attributes should be displayed in the UI as "value name",
 * the name part being optionally defined. As only part of the
 * attribute content might be accessible in a given component, this
 * general helper can be used to map the value to "value name" format.
 * If it doesn't find any name it simply passes back the value received
 * as argument.
 * @param {string} attributeValue
 * @param {object} attributeTypes
 * @param {string?} id
 * @param {string?} identifier
 * @param {string?} name
 */
const getDisplayLabelForAttribute = ({
  attributeValue,
  id = null,
  identifier = null,
  name = null,
  attributeTypes
}) => {

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

export default getDisplayLabelForAttribute;
