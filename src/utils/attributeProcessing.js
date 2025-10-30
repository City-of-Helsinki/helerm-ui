/**
 * Helper function to process complex attribute values.
 * Extracts the 'value' property from objects that have the structure:
 * { checked: true, value: 'something' }
 *
 * @param {any} attributeValue - The attribute value to process
 * @returns {any} - The processed value (extracted .value if it's a complex object, otherwise the original value)
 */
const getProcessedAttributeValue = (attributeValue) => {
  let processedValue = attributeValue;

  if (typeof attributeValue === 'object' && attributeValue !== null && 'value' in attributeValue) {
    processedValue = attributeValue.value;
  }

  return processedValue;
};

export default getProcessedAttributeValue;
