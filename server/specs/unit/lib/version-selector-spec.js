const expect = require('chai').expect;

const versionSelector = require('../../../lib/version-selector');

describe('version selector', () => {

  describe('selectVersion', () => {

    [
      {
        expectedVersion: undefined,
        appVersion: '1.1.1',
        versions: []
      },
      {
        expectedVersion: undefined,
        appVersion: '1.1.1',
        versions: undefined
      },
      {
        expectedVersion: '1.1.1',
        appVersion: '1.1.1',
        versions: [
          '2.0.1',
          '1.0.0',
          '1.0.1',
          '1.1.0',
          '1.1.1',
          '3.0.1'
        ]
      },
      {
        expectedVersion: '1.1.0',
        appVersion: '1.1.1',
        versions: [
          '2.0.1',
          '1.0.0',
          '1.0.1',
          '1.1.0',
          '1.1.2',
          '3.0.1'
        ]
      },
      {
        expectedVersion: '1.1.2',
        appVersion: '1.1.2',
        versions: [
          '1.0.0',
          '1.0.1',
          '1.1.2',
          '1.2.0',
          '1.2.1',
          '1.3.0'
        ]
      },
      {
        expectedVersion: '1.1.2',
        appVersion: '1.2.0',
        versions: [
          '1.0.0',
          '1.0.1',
          '1.1.2',
          '1.2.1',
          '1.2.2',
          '1.3.0'
        ]
      },
      {
        expectedVersion: '1.1.2',
        appVersion: '1.2.0',
        versions: [
          '3.0.1',
          '3.0.2',
          '3.1.0',
          '3.2.1',
          '2.0.1',
          '2.0.2',
          '2.1.0',
          '2.2.1',
          '1.0.1',
          '1.1.2',
          '1.2.1',
          '1.2.2',
          '1.3.0'
        ]
      },
      {
        expectedVersion: '1.2.1',
        appVersion: '1.2.1',
        versions: [
          '3.0.1',
          '3.0.2',
          '3.1.0',
          '3.2.1',
          '2.0.1',
          '2.0.2',
          '2.1.0',
          '2.2.1',
          '1.0.1',
          '1.1.2',
          '1.2.1',
          '1.2.2',
          '1.3.0'
        ]
      }
    ].forEach((testCase) => {
      it(`correctly filters out '${testCase.expectedVersion}' from '${testCase.versions}'`, () => {
        const version = versionSelector.selectVersion(testCase.appVersion, testCase.versions);
        expect(version).to.eql(testCase.expectedVersion);
      });
    });

  });

});