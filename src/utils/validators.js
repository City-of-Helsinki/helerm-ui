import { includes, difference, uniq } from 'lodash';

import { VALIDATION_SPECIAL_CASES } from '../../config/constants';

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
 * Validate TOS against required rules
 * @param tos
 * @param rules
 * @returns {Array}
 */
export const validateTOS = (tos, rules) => {
  const errors = [];
  for (const key in rules) {
    const rule = rules[key];
    const isRequired = rules[key].required;
    const isRequiredInFunction = includes(rule.requiredIn, 'function');
    const tosHasRuleAttribute = !!tos.attributes[key];
    const isValid =
      includes(rule.values.map(obj => obj.value), tos.attributes[key]) ||
      rule.values.length === 0;
    const allowValuesOutsideChoices = includes(
      VALIDATION_SPECIAL_CASES.function.allow_values_outside_choices,
      key
    );

    if (
      (isRequired && isRequiredInFunction && !tosHasRuleAttribute) ||
      (tosHasRuleAttribute && !isValid && !allowValuesOutsideChoices)
    ) {
      errors.push(key);
    }

    const isConditionallyRequired = rule.requiredIf.length !== 0;
    if (isConditionallyRequired) {
      for (const item of rule.requiredIf) {
        const predicateValue = tos.attributes[item.key];
        const hasPredicate = typeof predicateValue === 'string';
        const isRequired =
          hasPredicate && includes(item.values, predicateValue);

        if (
          (isRequired && !tosHasRuleAttribute) ||
          (!isRequired && tosHasRuleAttribute)
        ) {
          errors.push(key);
        }
      }
    }
  }
  return errors;
};

/**
 * Validate TOS against warning rules
 * @param tos
 * @param rules
 * @returns {Array}
 */
export const validateTOSWarnings = (tos, rules) => {
  const warnings = [];
  for (const key in rules) {
    const rule = rules[key];
    const attributeValue = tos.attributes[key];
    const allowOutsideValues = includes(
      VALIDATION_SPECIAL_CASES.function.allow_values_outside_choices,
      key
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
 * Validate Phase against required rules
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
 * Validate Phase against warning rules
 * @param phase
 * @param rules
 * @returns {Array}
 */
export const validatePhaseWarnings = (phase, rules) => {
  const errors = [];
  for (const key in rules) {
    if (
      phase.attributes[key] &&
      rules[key].values.length &&
      !isValueValidOption(phase.attributes[key], rules[key].values)
    ) {
      errors.push(key);
    }
  }
  return errors;
};

/**
 * Validate Action against required rules
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
 * Validate Action against warning rules
 * @param action
 * @param rules
 * @returns {Array}
 */
export const validateActionWarnings = (action, rules) => {
  const errors = [];
  for (const key in rules) {
    if (
      action.attributes[key] &&
      rules[key].values.length &&
      !isValueValidOption(action.attributes[key], rules[key].values)
    ) {
      errors.push(key);
    }
  }
  return errors;
};

/**
 * Validate Record against required rules
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
        if (
          record.attributes[item.key] &&
          includes(item.values, record.attributes[item.key]) &&
          !record.attributes[key]
        ) {
          errors.push(key);
        }
      }
    }
  }
  return errors;
};

/**
 * Validate Record against warn rules
 * @param record
 * @param rules
 * @returns {Array}
 */
export const validateRecordWarnings = (record, rules) => {
  const errors = [];
  for (const key in rules) {
    if (
      record.attributes[key] &&
      rules[key].values.length &&
      !isValueValidOption(record.attributes[key], rules[key].values)
    ) {
      errors.push(key);
    }
    if (rules[key].requiredIf.length) {
      for (const item of rules[key].requiredIf) {
        if (
          record.attributes[item.key] &&
          !includes(item.values, record.attributes[item.key]) &&
          record.attributes[key]
        ) {
          errors.push(key);
        }
      }
    }
  }
  return uniq(errors);
};

const isValueValidOption = (value, options) => {
  const valueArray = value instanceof Array ? value : [value];
  const optionValues = options.map(option => {
    return option.value;
  });
  return difference(valueArray, optionValues).length === 0;
};
