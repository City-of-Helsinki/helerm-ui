/* eslint-disable sonarjs/cognitive-complexity */
import { includes, difference, uniq } from 'lodash';

/**
 * Validate conditional rules
 * @param key
 * @param attributeTypes
 * @param attributes
 * @returns {Boolean}
 */
export const validateConditionalRules = (key, attributeTypes, attributes) => {
  const { requiredIf } = attributeTypes[key];
  let valid = false;
  Object.keys(attributes).forEach((attribute) => {
    // for each attribute
    requiredIf.forEach((item) => {
      // for each item in requiredIf
      if (item.key === attribute && includes(item.values, attributes[attribute].value)) {
        valid = true;
      }
    });
  });
  return valid;
};

/**
 * @typedef {function(obj:Object, rules:Object):string[]} Validator
 */
/**
 * @param  {string} type
 * @return {Validator}]
 */
const createValidateErrors = (type) => (obj, rules) => {
  const errors = [];
  Object.keys(rules).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(rules, key)) {
      const rule = rules[key];
      const isRequired = rules[key].required;
      const isRequiredInType = includes(rule.requiredIn, type);
      const objHasRuleAttribute = !!obj.attributes[key];
      const isAttributeAllowedInType = includes(rules[key].allowedIn, type);
      const isValid =
        includes(
          rule.values.map(({ value }) => value),
          obj.attributes[key]
        ) || rule.values.length === 0;
      const allowValuesOutsideChoices = includes(
        rule.allowValuesOutsideChoicesIn,
        type
      );
      if (
        (isRequired && isRequiredInType && !objHasRuleAttribute) ||
        (objHasRuleAttribute && !isValid && !allowValuesOutsideChoices) ||
        (!isAttributeAllowedInType && objHasRuleAttribute)
      ) {
        errors.push(key);
      }

      const isConditionallyRequired = rule.requiredIf.length !== 0;
      if (isConditionallyRequired) {
        rule.requiredIf.forEach((item) => {
          const predicateValue = obj.attributes[item.key];
          const hasPredicate = typeof predicateValue === 'string';
          const isPredicateRequired =
            hasPredicate && includes(item.values, predicateValue);

          if (
            (isPredicateRequired && !objHasRuleAttribute) ||
            (!isPredicateRequired && objHasRuleAttribute)
          ) {
            errors.push(key);
          }
        });
      }
    }
  });
  return errors;
};

const isValueValidOption = (value, options) => {
  const valueArray = value instanceof Array ? value : [value];
  const optionValues = options.map((option) => option.value);
  return difference(valueArray, optionValues).length === 0;
};

/**
 * @param  {string} type
 * @return {Validator}]
 */
const createValidateWarnings = (type) => (obj, rules) => {
  const warnings = [];
  Object.keys(rules).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(rules, key)) {
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
  });
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
