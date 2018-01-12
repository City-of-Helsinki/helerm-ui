import { includes, difference, uniq } from 'lodash';

/**
 * Validate conditional rules
 * @param key
 * @param attributeTypes
 * @param attributes
 * @returns {Boolean}
 */
export const validateConditionalRules = (key, attributeTypes, attributes) => {
  const requiredIf = attributeTypes[key].requiredIf;
  for (const attribute in attributes) {
    // for each attribute
    for (const item in requiredIf) {
      // for each item in requiredIf
      if (requiredIf[item].key === attribute) {
        // if requiredIf has attribute
        if (includes(requiredIf[item].values, attributes[attribute].value)) {
          // if requiredIf has same value as attribute
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * @typedef {function(obj:Object, rules:Object):string[]} Validator
 */
/**
 * @param  {string} type
 * @return {Validator}]
 */
const createValidateErrors = type => (obj, rules) => {
  const errors = [];
  for (const key in rules) {
    const rule = rules[key];
    const isRequired = rules[key].required;
    const isRequiredInType = includes(rule.requiredIn, type);
    const objHasRuleAttribute = !!obj.attributes[key];
    const isValid =
      includes(rule.values.map(obj => obj.value), obj.attributes[key]) ||
      rule.values.length === 0;
    const allowValuesOutsideChoices = includes(
      rule.allowValuesOutsideChoicesIn,
      type
    );

    if (
      (isRequired && isRequiredInType && !objHasRuleAttribute) ||
      (objHasRuleAttribute && !isValid && !allowValuesOutsideChoices)
    ) {
      errors.push(key);
    }

    const isConditionallyRequired = rule.requiredIf.length !== 0;
    if (isConditionallyRequired) {
      for (const item of rule.requiredIf) {
        const predicateValue = obj.attributes[item.key];
        const hasPredicate = typeof predicateValue === 'string';
        const isRequired =
          hasPredicate && includes(item.values, predicateValue);

        if (
          (isRequired && !objHasRuleAttribute) ||
          (!isRequired && objHasRuleAttribute)
        ) {
          errors.push(key);
        }
      }
    }
  }
  return errors;
};

/**
 * @param  {string} type
 * @return {Validator}]
 */
const createValidateWarnings = type => (obj, rules) => {
  const warnings = [];
  for (const key in rules) {
    const rule = rules[key];
    const attributeValue = obj.attributes[key];
    const allowOutsideValues = includes(
      rule.allowValuesOutsideChoicesIn,
      type
    );

    if (
      attributeValue &&
      rule.values.length &&
      !isValueValidOption(attributeValue, rule.values) &&
      allowOutsideValues
    ) {
      warnings.push(key);
    }
  }
  return uniq(warnings);
};

/**
 * Validate TOS against required rules
 */
export const validateTOS = createValidateErrors('function');

/**
 * Validate TOS against warning rules
 */
export const validateTOSWarnings = createValidateWarnings('function');

/**
 * Validate Phase against required rules
 */
export const validatePhase = createValidateErrors('phase');

/**
 * Validate Phase against warning rules
 */
export const validatePhaseWarnings = createValidateWarnings('phase');

/**
 * Validate Action against required rules
 */
export const validateAction = createValidateErrors('action');

/**
 * Validate Action against warning rules
 * @param action
 * @param rules
 * @returns {Array}
 */
export const validateActionWarnings = createValidateWarnings('action');

/**
 * Validate Record against required rules
 */
export const validateRecord = createValidateErrors('record');

/**
 * Validate Record against warn rules
 */
export const validateRecordWarnings = createValidateWarnings('record');

const isValueValidOption = (value, options) => {
  const valueArray = value instanceof Array ? value : [value];
  const optionValues = options.map(option => {
    return option.value;
  });
  return difference(valueArray, optionValues).length === 0;
};
