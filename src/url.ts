const TRANSLATE_SUFFIX = '/translate';

export function normalizeBaseUrl(baseUrl: string): string {
    const trimmed = (baseUrl ?? '').trim();
    if (!trimmed) {
        throw new Error('mtranserverTranslate.baseUrl 不能为空。');
    }

    let url: URL;
    try {
        url = new URL(trimmed);
    } catch {
        throw new Error(`无效的 MTranServer 地址：${trimmed}`);
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`MTranServer 地址仅支持 http/https：${trimmed}`);
    }

    let pathname = url.pathname.replace(/\/+$/, '');
    if (pathname.endsWith(TRANSLATE_SUFFIX)) {
        pathname = pathname.slice(0, -TRANSLATE_SUFFIX.length);
    }

    url.pathname = pathname || '/';
    url.search = '';
    url.hash = '';

    return url.toString().replace(/\/+$/, '');
}

export function joinUrl(baseUrl: string, path: string): string {
    const root = normalizeBaseUrl(baseUrl);
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${root}${suffix}`;
}

export function buildTranslateUrl(baseUrl: string): string {
    return joinUrl(baseUrl, '/translate');
}

export function buildUiUrl(baseUrl: string): string {
    return joinUrl(baseUrl, '/ui');
}
