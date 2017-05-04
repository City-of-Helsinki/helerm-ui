import includes from 'lodash/includes';

/**
 * Validate conditional rules
 * @param key
 * @param attributeTypes
 * @param attributes
 * @returns {Boolean}
 */
export const validateConditionalRules = (key, attributeTypes, attributes) => {
  const requiredIf = attributeTypes[key].requiredIf;
  for (const attribute in attributes) {                                         // for each attribute
    for (const item in requiredIf) {                                            // for each item in requiredIf
      if (requiredIf[item].key === attribute) {                                 // if requiredIf has attribute
        if (includes(requiredIf[item].values, attributes[attribute].value)) {   // if requiredIf has same value as attribute
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * Validate TOS against rules
 * @param tos
 * @param rules
 * @returns {Array}
 */
export const validateTOS = (tos, rules) => {
  const errors = [];
  for (const key in rules) {
    if (rules[key].required && includes(rules[key].requiredIn, 'function')) {
      if (!tos.attributes[key]) {
        errors.push(key);
      }
    }
    if (rules[key].requiredIf.length) {
      for (const item of rules[key].requiredIf) {
        if (tos.attributes[item.key] && includes(item.values, tos.attributes[item.key])) {
          errors.push(key);
        }
      }
    }
  }
  return errors;
};

/**
 * Validate Phase against rules
 * @param phase
 * @param rules
 * @returns {Array}
 */
export const validatePhase = (phase, rules) => {
  const errors = [];
  // TODO: implementation
  return errors;
};

/**
 * Validate Action against rules
 * @param action
 * @param rules
 * @returns {Array}
 */
export const validateAction = (action, rules) => {
  const errors = [];
  // TODO: implementation
  return errors;
};

/**
 * Validate Record against rules
 * @param record
 * @param rules
 * @returns {Array}
 */
export const validateRecord = (record, rules) => {
  const errors = [];
  for (const key in rules) {
    if (rules[key].required && includes(rules[key].requiredIn, 'record')) {
      if (!record.attributes[key]) {
        errors.push(key);
      }
    }
    if (rules[key].requiredIf.length) {
      for (const item of rules[key].requiredIf) {
        if (record.attributes[item.key] && includes(item.values, record.attributes[item.key])) {
          errors.push(key);
        }
      }
    }
  }
  return errors;
};
