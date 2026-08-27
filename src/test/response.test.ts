import * as assert from 'assert';
import { formatNetworkError, parseTranslateResponse } from '../response';

describe('parseTranslateResponse', () => {
    it('returns result from a successful native response', () => {
        assert.strictEqual(
            parseTranslateResponse(200, JSON.stringify({ result: '你好，世界！' })),
            '你好，世界！'
        );
    });

    it('explains unauthorized responses', () => {
        assert.throws(
            () => parseTranslateResponse(401, JSON.stringify({ error: 'Unauthorized' })),
            /认证失败（401）/
        );
    });

    it('explains unsupported language pairs', () => {
        assert.throws(
            () => parseTranslateResponse(400, JSON.stringify({ error: 'Language pair is not supported: en to zh' })),
            /语言对不受支持/
        );
    });

    it('includes status and server message for other errors', () => {
        assert.throws(
            () => parseTranslateResponse(500, JSON.stringify({ error: 'Internal Server Error' })),
            /请求失败（500）：Internal Server Error/
        );
        assert.throws(
            () => parseTranslateResponse(503, 'bad gateway'),
            /请求失败（503）：bad gateway/
        );
        assert.throws(
            () => parseTranslateResponse(500, JSON.stringify({ message: 'boom' })),
            /boom/
        );
    });

    it('rejects responses without a string result', () => {
        assert.throws(
            () => parseTranslateResponse(200, JSON.stringify({ translated: 'x' })),
            /缺少 result 字段/
        );
        assert.throws(
            () => parseTranslateResponse(200, ''),
            /缺少 result 字段/
        );
    });

    it('uses a fallback message when the error body is empty', () => {
        assert.throws(
            () => parseTranslateResponse(500, ''),
            /未知错误/
        );
        assert.throws(
            () => parseTranslateResponse(500, '{}'),
            /请求失败（500）：\{\}/
        );
    });
});

describe('formatNetworkError', () => {
    it('describes timeouts', () => {
        const error = formatNetworkError({ name: 'AbortError', message: 'aborted' }, 'http://127.0.0.1:8989');
        assert.match(error.message, /请求超时/);
    });

    it('describes connection failures', () => {
        const refused = formatNetworkError(
            { message: 'fetch failed', cause: { code: 'ECONNREFUSED' } },
            'http://127.0.0.1:8989'
        );
        assert.match(refused.message, /连接失败/);

        const reset = formatNetworkError(
            { message: 'read', code: 'ECONNRESET' },
            'http://127.0.0.1:8989'
        );
        assert.match(reset.message, /连接失败/);

        const notFound = formatNetworkError(
            { message: 'getaddrinfo', code: 'ENOTFOUND' },
            'http://127.0.0.1:8989'
        );
        assert.match(notFound.message, /连接失败/);

        const unreachable = formatNetworkError(
            { message: 'connect', code: 'EHOSTUNREACH' },
            'http://127.0.0.1:8989'
        );
        assert.match(unreachable.message, /连接失败/);

        const fetchFailed = formatNetworkError(
            { message: 'fetch failed' },
            'http://127.0.0.1:8989'
        );
        assert.match(fetchFailed.message, /连接失败/);
    });

    it('treats ABORT_ERR as a timeout', () => {
        const byCode = formatNetworkError({ message: 'aborted', code: 'ABORT_ERR' }, 'http://127.0.0.1:8989');
        assert.match(byCode.message, /请求超时/);
        const byCause = formatNetworkError(
            { message: 'aborted', cause: { code: 'ABORT_ERR' } },
            'http://127.0.0.1:8989'
        );
        assert.match(byCause.message, /请求超时/);
    });

    it('falls back to the original message', () => {
        const error = formatNetworkError(new Error('socket hang up'), 'http://127.0.0.1:8989');
        assert.match(error.message, /socket hang up/);
        const unknown = formatNetworkError('boom', 'http://127.0.0.1:8989');
        assert.match(unknown.message, /boom/);
        const objectWithoutMessage = formatNetworkError({ name: 'Error' }, 'http://127.0.0.1:8989');
        assert.match(objectWithoutMessage.message, /\[object Object\]/);
    });
});
