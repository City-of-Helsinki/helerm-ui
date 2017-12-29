import { validateRecord, validateRecordWarnings } from 'utils/validators';

import attributeRules from './attributeRules.json';
import record from './record.json';

describe('(Record validation) Test some example record', () => {
  const errors = validateRecord(record, attributeRules);
  const warnings = validateRecordWarnings(record, attributeRules);
  describe('(Errors)', () => {
    it('Should be an array', () => {
      expect(Array.isArray(errors)).to.equal(true);
    });

    it('Should have 1 error', () => {
      expect(errors.length).to.equal(1);
    });

    it(`The error should be RetentionPeriodStart -
        conditionally required attribute that's not required now`, () => {
      expect(errors).to.include('RetentionPeriodStart');
    });
  });

  describe('(Warnings)', () => {
    it('Should be an array', () => {
      expect(Array.isArray(warnings)).to.equal(true);
    });

    it('Should have 1 warning', () => {
      expect(warnings.length).to.equal(1);
    });

    it(`The warning should be InformationSystem -
        one of the values is outside attributes values list`, () => {
      expect(warnings).to.include('InformationSystem');
    });
  });
});
