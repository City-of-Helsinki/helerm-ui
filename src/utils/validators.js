/**
 * Validate TOS against rules
 * @param tos
 * @param rules
 * @returns {Array}
 */
export const validateTOS = (tos, rules) => {
  let errors = [];
  for (const key in rules) {
    if (rules[key].required && rules[key].requiredIn.includes('function')) {
      if (rules[key].requiredIf.length) {
        for (const item of rules[key].requiredIf) {
          if (tos.attributes[item.key] && item.values.includes(tos.attributes[item.key])) {
            errors.push(key);
          }
        }
      } else {
        if (!tos.attributes[key]) {
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
  let errors = [];
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
  let errors = [];
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
  let errors = [];
  for (const key in rules) {
    if (rules[key].required && rules[key].requiredIn.includes('record')) {
      if (rules[key].requiredIf.length) {
        for (const item of rules[key].requiredIf) {
          if (record.attributes[item.key] && item.values.includes(record.attributes[item.key])) {
            errors.push(key);
          }
        }
      } else {
        if (!record.attributes[key]) {
          errors.push(key);
        }
      }
    }
  }
  return errors;
};
