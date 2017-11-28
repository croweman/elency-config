const expect = require('chai').expect,
  versionNumber = require('../../../../lib/validation/version-number');


describe('validation - version number', () => {

  [
    { versionNumber: '1', valid: false },
    { versionNumber: '1.', valid: false },
    { versionNumber: '1.1', valid: false },
    { versionNumber: '12.12', valid: false },
    { versionNumber: '1.1.1', valid: true },
    { versionNumber: '12.12.12', valid: true },
    { versionNumber: '1.1.1.1', valid: false },
    { versionNumber: '12.12.12.12', valid: false },
    { versionNumber: '1.1.1.1.', valid: false },
    { versionNumber: '12.12.12.12.', valid: false },
    { versionNumber: '1.1.1.1.1', valid: false },
    { versionNumber: '12.12.12.12.12', valid: false },
    { versionNumber: 'a', valid: false },
    { versionNumber: 'a.a', valid: false },
    { versionNumber: 'a.a.a', valid: false },
    { versionNumber: 'a.a.a.a', valid: false },
    { versionNumber: undefined, valid: false },
    { versionNumber: '', valid: false },
    { versionNumber: '1 1.1', valid: false }
  ].forEach((testCase) => {

    it(`versionNumber '${testCase.versionNumber}' should be ${testCase.valid ? 'valid' : 'invalid'}`, () => {
      expect(versionNumber.validate(testCase.versionNumber)).to.eql(testCase.valid);
    });

  });

});