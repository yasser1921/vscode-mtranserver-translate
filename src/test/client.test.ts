import * as assert from 'assert';
import { AddressInfo } from 'net';
import * as http from 'http';
import { translateText } from '../client';
import { DEFAULT_SETTINGS, MTranServerSettings } from '../settings';

function settings(overrides: Partial<MTranServerSettings> = {}): MTranServerSettings {
    return { ...DEFAULT_SETTINGS, ...overrides };
}

describe('translateText', () => {
    it('includes html=true when configured', async () => {
        let body = '';
        const fetchImpl: typeof fetch = async (_input, init) => {
            body = String(init?.body);
            return new Response(JSON.stringify({ result: '<p>你好</p>' }), { status: 200 });
        };

        await translateText({
            settings: settings({ html: true }),
            text: '<p>Hello</p>',
            from: 'en',
            to: 'zh-Hans',
            fetchImpl,
        });

        assert.strictEqual(JSON.parse(body).html, true);
    });

    it('posts JSON to /translate and returns result', async () => {
        let captured: { url?: string; method?: string; headers?: http.IncomingHttpHeaders; body?: string } = {};

        const fetchImpl: typeof fetch = async (input, init) => {
            captured = {
                url: String(input),
                method: init?.method,
                headers: init?.headers as http.IncomingHttpHeaders,
                body: String(init?.body),
            };
            return new Response(JSON.stringify({ result: '你好，世界！' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        };

        const result = await translateText({
            settings: settings({ apiToken: 'secret' }),
            text: 'Hello, world!',
            from: 'en',
            to: 'zh-Hans',
            fetchImpl,
        });

        assert.strictEqual(result, '你好，世界！');
        assert.strictEqual(captured.url, 'http://127.0.0.1:8989/translate');
        assert.strictEqual(captured.method, 'POST');
        assert.deepStrictEqual(JSON.parse(captured.body || '{}'), {
            from: 'en',
            to: 'zh-Hans',
            text: 'Hello, world!',
            html: false,
        });
    });

    it('maps timeout abort into a timeout error', async () => {
        const fetchImpl: typeof fetch = async (_input, init) => {
            const signal = init?.signal;
            return await new Promise<Response>((_resolve, reject) => {
                signal?.addEventListener('abort', () => {
                    const error = new Error('aborted');
                    error.name = 'AbortError';
                    reject(error);
                });
            });
        };

        await assert.rejects(
            () => translateText({
                settings: settings({ timeout: 20 }),
                text: 'Hello',
                from: 'en',
                to: 'zh-Hans',
                fetchImpl,
            }),
            /请求超时/
        );
    });

    it('maps fetch failures into connection errors', async () => {
        const fetchImpl: typeof fetch = async () => {
            throw Object.assign(new TypeError('fetch failed'), {
                cause: { code: 'ECONNREFUSED' },
            });
        };

        await assert.rejects(
            () => translateText({
                settings: settings(),
                text: 'Hello',
                from: 'en',
                to: 'zh-Hans',
                fetchImpl,
            }),
            /连接失败/
        );
    });

    it('translates against a real HTTP server', async () => {
        const server = http.createServer((req, res) => {
            assert.strictEqual(req.method, 'POST');
            assert.strictEqual(req.url, '/translate');
            assert.strictEqual(req.headers.authorization, 'Bearer demo-token');

            let raw = '';
            req.on('data', (chunk) => {
                raw += chunk;
            });
            req.on('end', () => {
                const payload = JSON.parse(raw);
                assert.strictEqual(payload.from, 'en');
                assert.strictEqual(payload.to, 'zh-Hans');
                assert.strictEqual(payload.text, 'Hello, world!');
                assert.strictEqual(payload.html, false);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ result: '你好，世界！' }));
            });
        });

        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
        const { port } = server.address() as AddressInfo;

        try {
            const result = await translateText({
                settings: settings({
                    baseUrl: `http://127.0.0.1:${port}`,
                    apiToken: 'demo-token',
                }),
                text: 'Hello, world!',
                from: 'en',
                to: 'zh-Hans',
            });
            assert.strictEqual(result, '你好，世界！');
        } finally {
            await new Promise<void>((resolve, reject) => {
                server.close((err) => (err ? reject(err) : resolve()));
            });
        }
    });
});
