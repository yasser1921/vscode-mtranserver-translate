import * as assert from 'assert';
import { MTranServerTranslate } from '../mtranserverTranslate';
import { DEFAULT_SETTINGS, MTranServerSettings } from '../settings';

function createTranslator(
    overrides: Partial<MTranServerSettings> = {},
    fetchImpl?: typeof fetch,
    onDidChangeConfiguration?: (listener: () => void) => { dispose(): void }
): MTranServerTranslate {
    const current = { ...DEFAULT_SETTINGS, ...overrides };
    return new MTranServerTranslate({
        getSettings: () => current,
        fetchImpl,
        onDidChangeConfiguration,
    });
}

describe('MTranServerTranslate', () => {
    it('maps language codes before calling the API', async () => {
        let body = '';
        const fetchImpl: typeof fetch = async (_input, init) => {
            body = String(init?.body);
            return new Response(JSON.stringify({ result: '你好' }), { status: 200 });
        };

        const translator = createTranslator({}, fetchImpl);
        const result = await translator.translate('Hello', { from: 'auto', to: 'zh-CN' });

        assert.strictEqual(result, '你好');
        assert.deepStrictEqual(JSON.parse(body), {
            from: 'auto',
            to: 'zh-Hans',
            text: 'Hello',
            html: false,
        });
    });

    it('uses defaultFrom when source language is missing', async () => {
        let body = '';
        const fetchImpl: typeof fetch = async (_input, init) => {
            body = String(init?.body);
            return new Response(JSON.stringify({ result: 'ok' }), { status: 200 });
        };

        const translator = createTranslator({ defaultFrom: 'en' }, fetchImpl);
        await translator.translate('Hello', { to: 'ja' });
        assert.strictEqual(JSON.parse(body).from, 'en');
    });

    it('exposes configurable maxLen and always reports supported', () => {
        const translator = createTranslator({ maxLen: 1234 });
        assert.strictEqual(translator.maxLen, 1234);
        assert.strictEqual(translator.isSupported('en'), true);
    });

    it('links hover text to the local Web UI without embedding the token', () => {
        const translator = createTranslator({
            baseUrl: 'http://127.0.0.1:8989',
            apiToken: 'should-not-appear',
        });
        const link = translator.link('Hello', { from: 'en', to: 'zh-CN' });
        assert.strictEqual(link, '[MTranServer](http://127.0.0.1:8989/ui)');
        assert.ok(!link.includes('should-not-appear'));
    });

    it('falls back to the default UI link when baseUrl is invalid', () => {
        const translator = createTranslator({ baseUrl: 'not-a-url' });
        assert.strictEqual(translator.link('Hello'), '[MTranServer](http://127.0.0.1:8989/ui)');
    });

    it('reloads settings after configuration changes', async () => {
        let current = { ...DEFAULT_SETTINGS, html: false };
        let listener: (() => void) | undefined;
        let body = '';

        const translator = new MTranServerTranslate({
            getSettings: () => current,
            onDidChangeConfiguration: (next) => {
                listener = next;
                return { dispose() {} };
            },
            fetchImpl: async (_input, init) => {
                body = String(init?.body);
                return new Response(JSON.stringify({ result: 'ok' }), { status: 200 });
            },
        });

        current = { ...DEFAULT_SETTINGS, html: true };
        listener?.();
        await translator.translate('Hello', { from: 'en', to: 'zh-CN' });
        assert.strictEqual(JSON.parse(body).html, true);
    });
});
