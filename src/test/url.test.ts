import * as assert from 'assert';
import { buildTranslateUrl, buildUiUrl, joinUrl, normalizeBaseUrl } from '../url';

describe('normalizeBaseUrl', () => {
    it('strips trailing slashes from the default local address', () => {
        assert.strictEqual(normalizeBaseUrl('http://127.0.0.1:8989/'), 'http://127.0.0.1:8989');
        assert.strictEqual(normalizeBaseUrl('http://127.0.0.1:8989'), 'http://127.0.0.1:8989');
    });

    it('strips a trailing /translate path', () => {
        assert.strictEqual(
            normalizeBaseUrl('http://127.0.0.1:8989/translate'),
            'http://127.0.0.1:8989'
        );
    });

    it('keeps reverse-proxy path prefixes', () => {
        assert.strictEqual(
            normalizeBaseUrl('https://example.com/mt/'),
            'https://example.com/mt'
        );
    });

    it('rejects empty, invalid, or non-http addresses', () => {
        assert.throws(() => normalizeBaseUrl(''), /不能为空/);
        assert.throws(() => normalizeBaseUrl(undefined as unknown as string), /不能为空/);
        assert.throws(() => normalizeBaseUrl('not a url'), /无效的 MTranServer 地址/);
        assert.throws(() => normalizeBaseUrl('ftp://127.0.0.1:8989'), /仅支持 http\/https/);
    });

    it('drops query strings and hashes', () => {
        assert.strictEqual(
            normalizeBaseUrl('http://127.0.0.1:8989/?token=secret#ui'),
            'http://127.0.0.1:8989'
        );
    });
});

describe('buildTranslateUrl and buildUiUrl', () => {
    it('appends native API and UI paths', () => {
        assert.strictEqual(
            buildTranslateUrl('http://127.0.0.1:8989'),
            'http://127.0.0.1:8989/translate'
        );
        assert.strictEqual(
            buildUiUrl('http://127.0.0.1:8989'),
            'http://127.0.0.1:8989/ui'
        );
        assert.strictEqual(
            joinUrl('http://127.0.0.1:8989', 'health'),
            'http://127.0.0.1:8989/health'
        );
    });
});
