export interface TranslateRequestBody {
    from: string;
    to: string;
    text: string;
    html: boolean;
}

export function buildTranslateHeaders(apiToken: string): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    const token = apiToken.trim();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

export function buildTranslateBody(params: TranslateRequestBody): TranslateRequestBody {
    return {
        from: params.from,
        to: params.to,
        text: params.text,
        html: params.html,
    };
}
