const valueRetrieval = require('../../../lib/value-retrieval'),
  expect = require('chai').expect;

describe.only('value-retrieval', () => {

  describe('getBoolean', () => {

    describe('no fallback', () => {

      it('returns "undefined" if value is "undefined"', () => {
        const value = valueRetrieval.getBoolean(undefined);
        expect(value).to.eql(undefined);
      });

      it('returns "undefined" if value is "null"', () => {
        const value = valueRetrieval.getBoolean(null);
        expect(value).to.eql(undefined);
      });

      it('returns "undefined" if value is "asdf"', () => {
        const value = valueRetrieval.getBoolean("asdf");
        expect(value).to.eql(undefined);
      });

      it('returns true if value is "1"', () => {
        const value = valueRetrieval.getBoolean("1");
        expect(value).to.eql(true);
      });

      it('returns true if value is "true"', () => {
        const value = valueRetrieval.getBoolean("true");
        expect(value).to.eql(true);
      });

      it('returns true if value is "TRUE"', () => {
        const value = valueRetrieval.getBoolean("TRUE");
        expect(value).to.eql(true);
      });

      it('returns false if value is "0"', () => {
        const value = valueRetrieval.getBoolean("0");
        expect(value).to.eql(false);
      });

      it('returns false if value is "false"', () => {
        const value = valueRetrieval.getBoolean("false");
        expect(value).to.eql(false);
      });

      it('returns false if value is "FALSE"', () => {
        const value = valueRetrieval.getBoolean("FALSE");
        expect(value).to.eql(false);
      });
    });

    describe('with fallback', () => {

      it('returns true if value is "undefined" and fallback is true', () => {
        const value = valueRetrieval.getBoolean(undefined, true);
        expect(value).to.eql(true);
      });

      it('returns false if value is "null" and fallback is false', () => {
        const value = valueRetrieval.getBoolean(null, false);
        expect(value).to.eql(false);
      });

      it('returns "false" if value is "asdf" and fallback is false', () => {
        const value = valueRetrieval.getBoolean("asdf", false);
        expect(value).to.eql(false);
      });

    });

  });

  describe('getDate', () => {

    describe('no fallback', () => {

      it('returns "undefined" if value is "undefined"', () => {
        const value = valueRetrieval.getDate(undefined);
        expect(value).to.eql(undefined);
      });

      it('returns "undefined" if value is "null"', () => {
        const value = valueRetrieval.getDate(null);
        expect(value).to.eql(undefined);
      });

      it('returns "undefined" if value is "asdf"', () => {
        const value = valueRetrieval.getDate("asdf");
        expect(value).to.eql(undefined);
      });

      it('returns Date object if value is "2018-02-06T12:35:45.970Z"', () => {
        const value = valueRetrieval.getDate('2018-02-06T12:35:45.970Z');
        expect(value.toISOString()).to.eql('2018-02-06T12:35:45.970Z');
      });
    });

    describe('with fallback', () => {

      it('returns "2018-02-06T12:35:45.970Z" if value is "undefined" and fallback is "2018-02-06T12:35:45.970Z"', () => {
        const value = valueRetrieval.getDate(undefined, new Date('2018-02-06T12:35:45.970Z'));
        expect(value.toISOString()).to.eql('2018-02-06T12:35:45.970Z');
      });

      it('returns "2018-02-06T12:35:45.970Z" if value is "null" and fallback is "2018-02-06T12:35:45.970Z"', () => {
        const value = valueRetrieval.getDate(null, new Date('2018-02-06T12:35:45.970Z'));
        expect(value.toISOString()).to.eql('2018-02-06T12:35:45.970Z');
      });

      it('returns "2018-02-06T12:35:45.970Z" if value is "asdf" and fallback is "2018-02-06T12:35:45.970Z"', () => {
        const value = valueRetrieval.getDate("asdf", new Date('2018-02-06T12:35:45.970Z'));
        expect(value.toISOString()).to.eql('2018-02-06T12:35:45.970Z');
      });

    });
  });

  describe('getInt', () => {

    describe('no fallback', () => {

      it('returns "undefined" if value is "undefined"', () => {
        const value = valueRetrieval.getInt(undefined);
        expect(value).to.eql(undefined);
      });

      it('returns "undefined" if value is "null"', () => {
        const value = valueRetrieval.getInt(null);
        expect(value).to.eql(undefined);
      });

      it('returns "undefined" if value is "asdf"', () => {
        const value = valueRetrieval.getInt("asdf");
        expect(value).to.eql(undefined);
      });

      it('returns 1 if value is "1"', () => {
        const value = valueRetrieval.getInt("1");
        expect(value).to.eql(1);
      });

    });

    describe('with fallback', () => {

      it('returns 10 if value is "undefined" and fallback is "10"', () => {
        const value = valueRetrieval.getInt(undefined, 10);
        expect(value).to.eql(10);
      });

      it('returns 20 if value is "null" and fallback is "20"', () => {
        const value = valueRetrieval.getInt(null, 20);
        expect(value).to.eql(20);
      });

      it('returns "15" if value is "asdf" and fallback is "15"', () => {
        const value = valueRetrieval.getInt("asdf", 15);
        expect(value).to.eql(15);
      });

    });

  });

  describe('getFloat', () => {

    describe('no fallback', () => {

      it('returns "undefined" if value is "undefined"', () => {
        const value = valueRetrieval.getFloat(undefined);
        expect(value).to.eql(undefined);
      });

      it('returns "undefined" if value is "null"', () => {
        const value = valueRetrieval.getFloat(null);
        expect(value).to.eql(undefined);
      });

      it('returns "undefined" if value is "asdf"', () => {
        const value = valueRetrieval.getFloat("asdf");
        expect(value).to.eql(undefined);
      });

      it('returns 1.12 if value is "1.12"', () => {
        const value = valueRetrieval.getFloat("1.12");
        expect(value).to.eql(1.12);
      });

    });

    describe('with fallback', () => {

      it('returns 1.3 if value is "undefined" and fallback is "1.3"', () => {
        const value = valueRetrieval.getFloat(undefined, 1.3);
        expect(value).to.eql(1.3);
      });

      it('returns 2.4 if value is "null" and fallback is "2.4"', () => {
        const value = valueRetrieval.getFloat(null, 2.4);
        expect(value).to.eql(2.4);
      });

      it('returns "2.5" if value is "asdf" and fallback is "2.5"', () => {
        const value = valueRetrieval.getFloat("asdf", 2.5);
        expect(value).to.eql(2.5);
      });

    });

  });

  describe('getObject', () => {

    describe('no fallback', () => {

      it('returns "undefined" if value is "undefined"', () => {
        const value = valueRetrieval.getObject(undefined);
        expect(value).to.eql(undefined);
      });

      it('returns "undefined" if value is "null"', () => {
        const value = valueRetrieval.getObject(null);
        expect(value).to.eql(undefined);
      });

      it('returns "undefined" if value is "asdf"', () => {
        const value = valueRetrieval.getObject("asdf");
        expect(value).to.eql(undefined);
      });

      it('returns a valid object if value is an object', () => {
        const value = valueRetrieval.getObject('{"a":{"b":"hello"}}');
        expect(value.a.b).to.eql('hello');
      });

    });

    describe('with fallback', () => {

      it('returns a fallback if value is "undefined"', () => {
        const value = valueRetrieval.getObject(undefined, { on: true });
        expect(value.on).to.eql(true);
      });

      it('returns a fallback if value is "null"', () => {
        const value = valueRetrieval.getObject(null, { on: true });
        expect(value.on).to.eql(true);
      });

      it('returns a fallback if value is "asdf"', () => {
        const value = valueRetrieval.getObject("asdf", { on: true });
        expect(value.on).to.eql(true);
      });

    });

  });
});