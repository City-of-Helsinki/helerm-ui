import { difference, includes, uniq } from 'lodash';

const hasAttributeValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined && value !== null && value !== '';
};

/**
 * Validate conditional rules
 * @param key
 * @param attributeTypes
 * @param attributes
 * @returns {Boolean}
 */
export const validateConditionalRules = (key, attributeTypes, attributes = {}) => {
  const { requiredIf } = attributeTypes[key];

  if (!attributes) {
    return false;
  }

  let valid = false;

  Object.keys(attributes).forEach((attribute) => {
    // for each attribute
    requiredIf.forEach((item) => {
      // for each item in requiredIf and if requiredIf has attribute
      const attributeValue = attributes[attribute]?.value;
      const matchesRequiredIf = Array.isArray(attributeValue)
        ? attributeValue.some((value) => includes(item.values, value))
        : includes(item.values, attributeValue);

      if (item.key === attribute && matchesRequiredIf) {
        // if requiredIf has same value as attribute
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
  const keys = Object.keys(rules).filter((key) => Object.hasOwn(rules, key));

  const matchesAllowedValues = (rule, value) => {
    if (!rule.values.length) {
      return true;
    }

    if (!hasAttributeValue(value)) {
      return false;
    }

    return isValueValidOption(value, rule.values);
  };

  const errors = keys.filter((key) => {
    const rule = rules[key];

    const isRequired = rules[key].required;
    const isRequiredInType = includes(rule.requiredIn, type);
    const objHasRuleAttribute = hasAttributeValue(obj.attributes[key]);

    const isAttributeAllowedInType = includes(rules[key].allowedIn, type);
    const isValid = matchesAllowedValues(rule, obj.attributes[key]);
    const allowValuesOutsideChoices = includes(rule.allowValuesOutsideChoicesIn, type);

    return (
      (isRequired && isRequiredInType && !objHasRuleAttribute) ||
      (objHasRuleAttribute && !isValid && !allowValuesOutsideChoices) ||
      (!isAttributeAllowedInType && objHasRuleAttribute)
    );
  });

  const isPredicateRequired = (predicateValue, values) => {
    const hasPredicate = Array.isArray(predicateValue) ? predicateValue.length > 0 : typeof predicateValue === 'string';

    if (!hasPredicate) {
      return false;
    }

    if (Array.isArray(predicateValue)) {
      return predicateValue.some((value) => includes(values, value));
    }

    return includes(values, predicateValue);
  };

  const conditionallyRequired = keys
    .filter((key) => rules[key].requiredIf.length > 0)
    .map((key) => ({ key, items: rules[key].requiredIf }))
    .filter(({ key, items }) =>
      items.some((item) => {
        const predicateValue = obj.attributes[item.key];
        const requiredByPredicate = isPredicateRequired(predicateValue, item.values);

        const objHasRuleAttribute = hasAttributeValue(obj.attributes[key]);

        return (requiredByPredicate && !objHasRuleAttribute) || (!requiredByPredicate && objHasRuleAttribute);
      }),
    )
    .map(({ key }) => key);

  return [...errors, ...conditionallyRequired];
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
    if (Object.hasOwn(rules, key)) {
      const rule = rules[key];
      const attributeValue = obj.attributes[key];
      const allowOutsideValues = includes(rule.allowValuesOutsideChoicesIn, type);

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
