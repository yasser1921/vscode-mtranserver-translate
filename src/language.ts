const SIMPLIFIED_CHINESE = new Set([
    'zh',
    'zh-cn',
    'zh-sg',
    'zh-hans',
    'cmn',
    'chinese',
]);

const TRADITIONAL_CHINESE = new Set([
    'zh-tw',
    'zh-hk',
    'zh-mo',
    'zh-hant',
    'cht',
]);

/**
 * Map Comment Translate / VS Code language codes to MTranServer codes.
 */
export function mapLanguageCode(code: string | undefined, fallback = 'auto'): string {
    const source = (code ?? '').trim();
    if (!source) {
        if (!fallback || fallback.trim().toLowerCase() === 'auto') {
            return 'auto';
        }
        return mapLanguageCode(fallback, 'auto');
    }

    const normalized = source.replace(/_/g, '-').toLowerCase();
    if (normalized === 'auto') {
        return 'auto';
    }

    if (SIMPLIFIED_CHINESE.has(normalized)) {
        return 'zh-Hans';
    }
    if (TRADITIONAL_CHINESE.has(normalized)) {
        return 'zh-Hant';
    }

    const parts = normalized.split('-');
    if (parts.length === 2 && parts[1].length === 2) {
        return parts[0];
    }

    return source.replace(/_/g, '-');
}
