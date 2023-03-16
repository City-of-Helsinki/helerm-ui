/* eslint-disable jest/valid-title */
import { validateTOS, validateTOSWarnings } from '../validators';
import attributeRules from './testdata/attributeRules.json';
import validTOS from './testdata/validTOS.json';
import TOSmissingSSN from './testdata/TOSmissingSSN.json';
import unallowedPublicityClassTOS from './testdata/unallowedPublicityClassTOS.json';
import errorsAndWarningsTOS from './testdata/errorsAndWarningsTOS.json';

const SHOULD_RETURN_ARRAY_STRING = 'Should return an array';
const SHOULD_HAVE_ONE_ERROR_STRING = 'Should have one error';

describe('(TOS validation)', () => {
  describe('(TOS validation errors) Error validation', () => {
    describe('Valid TOS', () => {
      const errors = validateTOS(validTOS, attributeRules);

      it(SHOULD_RETURN_ARRAY_STRING, () => {
        expect(Array.isArray(errors)).toEqual(true);
      });

      it('Should not have errors', () => {
        expect(errors.length).toEqual(0);
      });
    });

    describe('Single missing value (SocialSecurityNumber)', () => {
      const errors = validateTOS(TOSmissingSSN, attributeRules);

      it(SHOULD_RETURN_ARRAY_STRING, () => {
        expect(Array.isArray(errors)).toEqual(true);
      });

      it(SHOULD_HAVE_ONE_ERROR_STRING, () => {
        expect(errors.length).toEqual(1);
      });
    });

    describe('Single value outside allowed values (PublicityClass)', () => {
      const errors = validateTOS(unallowedPublicityClassTOS, attributeRules);

      it(SHOULD_RETURN_ARRAY_STRING, () => {
        expect(Array.isArray(errors)).toEqual(true);
      });

      it(SHOULD_HAVE_ONE_ERROR_STRING, () => {
        expect(errors.length).toEqual(1);
      });

      it('The error should be PublicityClass', () => {
        expect(errors[0]).toEqual('PublicityClass');
      });
    });

    describe('Value outside allowed values in multi (InformationSystem)', () => {
      const errors = validateTOS(
        {
          ...validTOS,
          attributes: {
            ...validTOS.attributes,
            InformationSystem: ['Ahjo', 'Arvojoukon ulkopuolinen järjestelmä']
          }
        },
        attributeRules
      );

      it(SHOULD_RETURN_ARRAY_STRING, () => {
        expect(Array.isArray(errors)).toEqual(true);
      });

      it('Should not have errors', () => {
        expect(errors.length).toEqual(0);
      });
    });

    describe('"All or none" - RetentionPeriod of -1 shouldn\'t have RetentionPeriodStart', () => {
      const errors = validateTOS(
        {
          ...validTOS,
          attributes: {
            ...validTOS.attributes,
            RetentionPeriod: '-1',
            RetentionPeriodStart: 'Asian lopullinen ratkaisu'
          }
        },
        attributeRules
      );

      it(SHOULD_RETURN_ARRAY_STRING, () => {
        expect(Array.isArray(errors)).toEqual(true);
      });

      it(SHOULD_HAVE_ONE_ERROR_STRING, () => {
        expect(errors.length).toEqual(1);
      });

      it('The error should be RetentionPeriodStart', () => {
        expect(errors[0]).toEqual('RetentionPeriodStart');
      });
    });
    describe('InformationSystem has value outside of allowed values', () => {
      const errors = validateTOS(
        {
          ...validTOS,
          attributes: {
            ...validTOS.attributes,
            InformationSystem: 'Muu järjestelmä'
          }
        },
        attributeRules
      );

      it(SHOULD_RETURN_ARRAY_STRING, () => {
        expect(Array.isArray(errors)).toEqual(true);
      });

      it('Should have no errors', () => {
        expect(errors.length).toEqual(0);
      });
    });
  });

  describe('(TOS validation warnings) Warning validation', () => {
    describe('No warnings', () => {
      const warnings = validateTOSWarnings(validTOS, attributeRules);

      it(SHOULD_RETURN_ARRAY_STRING, () => {
        expect(Array.isArray(warnings)).toEqual(true);
      });

      it('Should not have warnings', () => {
        expect(warnings.length).toEqual(0);
      });
    });

    describe('InformationSystem has value outside of allowed values', () => {
      const warnings = validateTOSWarnings(
        {
          ...validTOS,
          attributes: {
            ...validTOS.attributes,
            InformationSystem: 'Muu järjestelmä'
          }
        },
        attributeRules
      );

      it(SHOULD_RETURN_ARRAY_STRING, () => {
        expect(Array.isArray(warnings)).toEqual(true);
      });

      it('Should have one warning', () => {
        expect(warnings.length).toEqual(1);
      });

      it('The warning should be "InformationSystem"', () => {
        expect(warnings[0]).toEqual('InformationSystem');
      });
    });

    describe('PublicityClass has value outside of allowed values', () => {
      const warnings = validateTOSWarnings(
        unallowedPublicityClassTOS,
        attributeRules
      );

      it(SHOULD_RETURN_ARRAY_STRING, () => {
        expect(Array.isArray(warnings)).toEqual(true);
      });

      it('Should have no warnings', () => {
        expect(warnings.length).toEqual(0);
      });
    });
  });

  describe('(TOS validation errors & warnings)', () => {
    describe('(Errors)', () => {
      const errors = validateTOS(errorsAndWarningsTOS, attributeRules);

      it('Should have two errors', () => {
        expect(errors.length).toEqual(2);
      });

      it('Should have PublicityClass error', () => {
        expect(errors.includes('PublicityClass')).toBeTruthy();
      });
      it('Should have RetentionPeriodStart error', () => {
        expect(errors.includes('RetentionPeriodStart')).toBeTruthy();
      });
    });

    describe('(Warnings)', () => {
      const warnings = validateTOSWarnings(
        errorsAndWarningsTOS,
        attributeRules
      );
      it('Should have 1 warning', () => {
        expect(warnings.length).toEqual(1);
      });

      it('Should have InformationSystem warning', () => {
        expect(warnings.includes('InformationSystem')).toBeTruthy();
      });
    });
  });
});
