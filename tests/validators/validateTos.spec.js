import { validateTOS } from 'utils/validators';

import attributeRules from './attributeRules.json';
import validTOS from './validTOS.json';
import TOSmissingSSN from './TOSmissingSSN.json';
import unallowedPublicityClassTOS from './unallowedPublicityClassTOS';

describe('(TOS validation)', () => {
  describe('(TOS validation errors) Error validation', () => {
    describe('Valid TOS', () => {
      const errors = validateTOS(validTOS, attributeRules);

      it('Should return an array', () => {
        expect(Array.isArray(errors)).to.equal(true);
      });

      it('Should not have errors', () => {
        expect(errors.length).to.equal(0);
      });
    });

    describe('Single missing value (SocialSecurityNumber)', () => {
      const errors = validateTOS(TOSmissingSSN, attributeRules);

      it('Should return an array', () => {
        expect(Array.isArray(errors)).to.equal(true);
      });

      it('Should have one error', () => {
        expect(errors.length).to.equal(1);
      });
    });

    describe('Single value outside allowed values (PublicityClass)', () => {
      const errors = validateTOS(unallowedPublicityClassTOS, attributeRules);

      it('Should return an array', () => {
        expect(Array.isArray(errors)).to.equal(true);
      });

      it('Should have one error', () => {
        expect(errors.length).to.equal(1);
      });

      it('The error should be PublicityClass', () => {
        expect(errors[0]).to.equal('PublicityClass');
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

      it('Should return an array', () => {
        expect(Array.isArray(errors)).to.equal(true);
      });

      it('Should not have errors', () => {
        expect(errors.length).to.equal(0);
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

      it('Should return an array', () => {
        expect(Array.isArray(errors)).to.equal(true);
      });

      it('Should have one error', () => {
        expect(errors.length).to.equal(1);
      });

      it('The error should be RetentionPeriodStart', () => {
        expect(errors[0]).to.equal('RetentionPeriodStart');
      });
    });
  });
});
