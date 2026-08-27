import * as assert from 'assert';
import { resolveSettings, DEFAULT_SETTINGS } from '../settings';

describe('resolveSettings', () => {
    it('returns defaults when input is empty', () => {
        assert.deepStrictEqual(resolveSettings(), DEFAULT_SETTINGS);
        assert.deepStrictEqual(resolveSettings({}), DEFAULT_SETTINGS);
    });

    it('trims strings and ignores invalid numbers', () => {
        const settings = resolveSettings({
            baseUrl: '  http://192.168.1.8:8989  ',
            apiToken: '  token  ',
            timeout: -1,
            html: true,
            maxLen: 0,
            defaultFrom: '  en  ',
        });

        assert.strictEqual(settings.baseUrl, 'http://192.168.1.8:8989');
        assert.strictEqual(settings.apiToken, 'token');
        assert.strictEqual(settings.timeout, DEFAULT_SETTINGS.timeout);
        assert.strictEqual(settings.html, true);
        assert.strictEqual(settings.maxLen, DEFAULT_SETTINGS.maxLen);
        assert.strictEqual(settings.defaultFrom, 'en');
    });

    it('keeps valid timeout and maxLen', () => {
        const settings = resolveSettings({
            timeout: 30000,
            maxLen: 1200.9,
        });
        assert.strictEqual(settings.timeout, 30000);
        assert.strictEqual(settings.maxLen, 1200);
    });

    it('falls back when baseUrl or defaultFrom is blank', () => {
        const settings = resolveSettings({
            baseUrl: '   ',
            defaultFrom: '',
        });
        assert.strictEqual(settings.baseUrl, DEFAULT_SETTINGS.baseUrl);
        assert.strictEqual(settings.defaultFrom, DEFAULT_SETTINGS.defaultFrom);
    });
});
