const expect = require('chai').expect;
const versionSorter = require('../../../../lib/utils/version-sorter');

describe('version-sorter', () => {

  [
    {
      preSort: [ '2.0.0', '4.0.0', '3.0.0', '1.0.0' ],
      postSort: [ '1.0.0', '2.0.0', '3.0.0', '4.0.0' ]
    },
    {
      preSort: [ '2.1.1', '2.1.0', '2.7.1', '2.3.2', '2.3.1', '2.2.7' ],
      postSort: [ '2.1.0', '2.1.1', '2.2.7', '2.3.1', '2.3.2', '2.7.1' ]
    }
  ].forEach((testCase) => {

    it(`should correctly sort an version array: ${testCase.preSort}`, () => {
      let array = testCase.preSort;
      versionSorter(array);
      
      expect(array.length).to.eql(testCase.postSort.length);

      for (let i = 0; i < array.length; i++) {
        expect(array[i]).to.eql(testCase.postSort[i]);
      }
    });
  });

  describe('descending true', () => {

    [
      {
        preSort: [ '2.0.0', '4.0.0', '3.0.0', '1.0.0' ],
        postSort: [ '4.0.0', '3.0.0', '2.0.0', '1.0.0' ]
      },
      {
        preSort: [ '2.1.1', '2.1.0', '2.7.1', '2.3.2', '2.3.1', '2.2.7' ],
        postSort: [ '2.7.1', '2.3.2', '2.3.1', '2.2.7', '2.1.1', '2.1.0' ]
      }
    ].forEach((testCase) => {

      it(`should correctly sort an version array: ${testCase.preSort}`, () => {
        let array = testCase.preSort;
        versionSorter(array, true);

        expect(array.length).to.eql(testCase.postSort.length);

        for (let i = 0; i < array.length; i++) {
          expect(array[i]).to.eql(testCase.postSort[i]);
        }
      });
    });
  });
});
