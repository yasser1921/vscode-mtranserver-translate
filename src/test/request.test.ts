import * as assert from 'assert';
import { buildTranslateBody, buildTranslateHeaders } from '../request';

describe('buildTranslateHeaders', () => {
    it('does not send an Authorization header when token is empty', () => {
        assert.deepStrictEqual(buildTranslateHeaders(''), {
            'Content-Type': 'application/json',
        });
        assert.deepStrictEqual(buildTranslateHeaders('   '), {
            'Content-Type': 'application/json',
        });
    });

    it('sends Bearer token when apiToken is set', () => {
        assert.deepStrictEqual(buildTranslateHeaders('secret'), {
            'Content-Type': 'application/json',
            Authorization: 'Bearer secret',
        });
        assert.deepStrictEqual(buildTranslateHeaders('  secret  '), {
            'Content-Type': 'application/json',
            Authorization: 'Bearer secret',
        });
    });
});

describe('buildTranslateBody', () => {
    it('builds the native /translate payload', () => {
        assert.deepStrictEqual(
            buildTranslateBody({
                from: 'en',
                to: 'zh-Hans',
                text: 'Hello, world!',
                html: false,
            }),
            {
                from: 'en',
                to: 'zh-Hans',
                text: 'Hello, world!',
                html: false,
            }
        );
    });
});
