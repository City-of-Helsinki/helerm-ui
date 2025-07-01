import { validateRecord, validateRecordWarnings } from '../validators';
import { attributeRules, record } from '../__mocks__/mockHelpers';

describe('(Record validation) Test some example record', () => {
  const errors = validateRecord(record, attributeRules);
  const warnings = validateRecordWarnings(record, attributeRules);
  describe('(Errors)', () => {
    it('Should be an array', () => {
      expect(Array.isArray(errors)).toEqual(true);
    });

    it('Should have 1 error', () => {
      expect(errors.length).toEqual(1);
    });

    it(`The error should be RetentionPeriodStart -
        conditionally required attribute that's not required now`, () => {
      expect(errors).toContain('RetentionPeriodStart');
    });
  });

  describe('(Warnings)', () => {
    it('Should be an array', () => {
      expect(Array.isArray(warnings)).toEqual(true);
    });

    it('Should have 1 warning', () => {
      expect(warnings.length).toEqual(1);
    });

    it(`The warning should be InformationSystem -
        one of the values is outside attributes values list`, () => {
      expect(warnings).toContain('InformationSystem');
    });
  });
});
