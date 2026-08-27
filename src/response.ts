export function parseTranslateResponse(status: number, bodyText: string): string {
    const parsed = parseJsonBody(bodyText);

    if (status === 401) {
        throw new Error('认证失败（401）：服务端设置了 MT_API_TOKEN，请在 mtranserverTranslate.apiToken 中填写相同 token。');
    }

    if (status >= 400) {
        const message = extractErrorMessage(parsed, bodyText);
        if (/language pair/i.test(message)) {
            throw new Error(`语言对不受支持：${message}。可关闭 MT_OFFLINE，或预先下载对应模型。`);
        }
        throw new Error(`MTranServer 请求失败（${status}）：${message}`);
    }

    if (!parsed || typeof parsed !== 'object' || typeof (parsed as { result?: unknown }).result !== 'string') {
        throw new Error('MTranServer 响应缺少 result 字段。');
    }

    return (parsed as { result: string }).result;
}

export function formatNetworkError(err: unknown, baseUrl: string): Error {
    const info = asErrorInfo(err);

    if (info.name === 'AbortError' || info.code === 'ABORT_ERR' || info.causeCode === 'ABORT_ERR') {
        return new Error(`请求超时：无法在限定时间内连接 MTranServer（${baseUrl}）。首次翻译可能正在下载模型，可增大 mtranserverTranslate.timeout。`);
    }

    const code = info.code || info.causeCode;
    if (
        code === 'ECONNREFUSED' ||
        code === 'ENOTFOUND' ||
        code === 'EHOSTUNREACH' ||
        code === 'ECONNRESET' ||
        /fetch failed/i.test(info.message)
    ) {
        return new Error(`连接失败：无法访问 MTranServer（${baseUrl}）。请确认服务已启动，并检查 mtranserverTranslate.baseUrl。`);
    }

    return new Error(`请求 MTranServer 失败：${info.message}`);
}

function parseJsonBody(bodyText: string): unknown {
    if (!bodyText) {
        return {};
    }

    try {
        return JSON.parse(bodyText);
    } catch {
        return bodyText;
    }
}

function extractErrorMessage(parsed: unknown, bodyText: string): string {
    if (parsed && typeof parsed === 'object') {
        const record = parsed as { error?: unknown; message?: unknown };
        if (typeof record.error === 'string' && record.error.trim()) {
            return record.error;
        }
        if (typeof record.message === 'string' && record.message.trim()) {
            return record.message;
        }
    }

    if (typeof parsed === 'string' && parsed.trim()) {
        return parsed;
    }

    return bodyText || '未知错误';
}

function asErrorInfo(err: unknown): {
    name: string;
    message: string;
    code?: string;
    causeCode?: string;
} {
    if (err && typeof err === 'object') {
        const record = err as {
            name?: unknown;
            message?: unknown;
            code?: unknown;
            cause?: { code?: unknown };
        };
        return {
            name: typeof record.name === 'string' ? record.name : '',
            message: typeof record.message === 'string' ? record.message : String(err),
            code: typeof record.code === 'string' ? record.code : undefined,
            causeCode: typeof record.cause?.code === 'string' ? record.cause.code : undefined,
        };
    }

    return {
        name: '',
        message: String(err),
    };
}
