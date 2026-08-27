export const CONFIG_SECTION = 'mtranserverTranslate';
export const TRANSLATE_KEY = 'mtranserver';

export interface MTranServerSettings {
    baseUrl: string;
    apiToken: string;
    timeout: number;
    html: boolean;
    maxLen: number;
    defaultFrom: string;
}

export const DEFAULT_SETTINGS: MTranServerSettings = {
    baseUrl: 'http://127.0.0.1:8989',
    apiToken: '',
    timeout: 120000,
    html: false,
    maxLen: 5000,
    defaultFrom: 'auto',
};

export function resolveSettings(raw?: Partial<MTranServerSettings>): MTranServerSettings {
    const timeout = raw?.timeout;
    const maxLen = raw?.maxLen;
    const baseUrl = (raw?.baseUrl ?? DEFAULT_SETTINGS.baseUrl).trim();
    const defaultFrom = (raw?.defaultFrom ?? DEFAULT_SETTINGS.defaultFrom).trim();

    return {
        baseUrl: baseUrl || DEFAULT_SETTINGS.baseUrl,
        apiToken: (raw?.apiToken ?? '').trim(),
        timeout: typeof timeout === 'number' && Number.isFinite(timeout) && timeout > 0
            ? timeout
            : DEFAULT_SETTINGS.timeout,
        html: Boolean(raw?.html),
        maxLen: typeof maxLen === 'number' && Number.isFinite(maxLen) && maxLen > 0
            ? Math.floor(maxLen)
            : DEFAULT_SETTINGS.maxLen,
        defaultFrom: defaultFrom || DEFAULT_SETTINGS.defaultFrom,
    };
}
