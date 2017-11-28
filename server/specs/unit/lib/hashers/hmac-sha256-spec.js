'use strict';

const expect = require('chai').expect,
    hasher = require('../../../../lib/hashers/hmac-sha256');

describe('HMAC-256 lib', function() {

    describe('hash', () => {
        it('correctly hashes a string', async () => {
            const hash = await hasher.hash('TheValueToEncrypt', 'aGVsbG93b3JsZA==');
            expect(hash).to.eql('j8l2ru3YrVfmCsfF51eIDw4RZ9gCh9Mm0KbSm5JfeJ0=');
        });
    });

    describe('hashSync', () => {
        it('correctly hashes a string', () => {
            const hash = hasher.hashSync('TheValueToEncrypt', 'aGVsbG93b3JsZA==');
            expect(hash).to.eql('j8l2ru3YrVfmCsfF51eIDw4RZ9gCh9Mm0KbSm5JfeJ0=');
        });
    });

})