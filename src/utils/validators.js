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
      if (!tos.attributes[key]) {
        errors.push(key);
      }
    }
    if (rules[key].requiredIf.length) {
      for (const item in key.requiredIf) {
        if (item.key === key && !item.values.includes(tos.attributes[key])) {
          errors.push(key);
        }
      }
    }
  }
  return errors;
};
