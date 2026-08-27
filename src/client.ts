import { buildTranslateBody, buildTranslateHeaders } from './request';
import { formatNetworkError, parseTranslateResponse } from './response';
import { MTranServerSettings } from './settings';
import { buildTranslateUrl } from './url';

export async function translateText(params: {
    settings: MTranServerSettings;
    text: string;
    from: string;
    to: string;
    fetchImpl?: typeof fetch;
}): Promise<string> {
    const fetchImpl = params.fetchImpl ?? fetch;
    const url = buildTranslateUrl(params.settings.baseUrl);
    const headers = buildTranslateHeaders(params.settings.apiToken);
    const body = JSON.stringify(buildTranslateBody({
        from: params.from,
        to: params.to,
        text: params.text,
        html: params.settings.html,
    }));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), params.settings.timeout);

    let response: Response;
    try {
        response = await fetchImpl(url, {
            method: 'POST',
            headers,
            body,
            signal: controller.signal,
        });
    } catch (err) {
        throw formatNetworkError(err, params.settings.baseUrl);
    } finally {
        clearTimeout(timer);
    }

    const bodyText = await response.text();
    return parseTranslateResponse(response.status, bodyText);
}
