import { includes, findIndex } from 'lodash';

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
        if (tos.attributes[item.key] && includes(item.values, tos.attributes[item.key]) && !tos.attributes[key]) {
          errors.push(key);
        }
      }
    }
    if (tos.attributes[key] && rules[key].values.length) {
      const values = tos.attributes[key] instanceof Array ? tos.attributes[key] : [tos.attributes[key]];
      for (const value in values) {
        if (findIndex(rules[key].values, (ruleValue) => { return ruleValue.value === values[value]; }) < 0) {
          errors.push(key);
          break;
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
  for (const key in rules) {
    if (phase.attributes[key] && rules[key].values.length) {
      const values = phase.attributes[key] instanceof Array ? phase.attributes[key] : [phase.attributes[key]];
      for (const value in values) {
        if (findIndex(rules[key].values, (ruleValue) => { return ruleValue.value === values[value]; }) < 0) {
          errors.push(key);
          break;
        }
      }
    }
  }
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
  for (const key in rules) {
    if (action.attributes[key] && rules[key].values.length) {
      const values = action.attributes[key] instanceof Array ? action.attributes[key] : [action.attributes[key]];
      for (const value in values) {
        if (findIndex(rules[key].values, (ruleValue) => { return ruleValue.value === values[value]; }) < 0) {
          errors.push(key);
          break;
        }
      }
    }
  }
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
        if (record.attributes[item.key] && includes(item.values, record.attributes[item.key]) && !record.attributes[key]) {
          errors.push(key);
        }
      }
    }
    if (record.attributes[key] && rules[key].values.length) {
      const values = record.attributes[key] instanceof Array ? record.attributes[key] : [record.attributes[key]];
      for (const value in values) {
        if (findIndex(rules[key].values, (ruleValue) => { return ruleValue.value === values[value]; }) < 0) {
          errors.push(key);
          break;
        }
      }
    }
  }
  return errors;
};
