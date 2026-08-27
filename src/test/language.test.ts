import * as assert from 'assert';
import { mapLanguageCode } from '../language';

describe('mapLanguageCode', () => {
    it('returns auto when source is auto or empty', () => {
        assert.strictEqual(mapLanguageCode('auto'), 'auto');
        assert.strictEqual(mapLanguageCode('AUTO'), 'auto');
        assert.strictEqual(mapLanguageCode(''), 'auto');
        assert.strictEqual(mapLanguageCode('   '), 'auto');
        assert.strictEqual(mapLanguageCode(undefined), 'auto');
    });

    it('uses fallback when source is empty and fallback is not auto', () => {
        assert.strictEqual(mapLanguageCode('', 'en'), 'en');
        assert.strictEqual(mapLanguageCode(undefined, 'zh-CN'), 'zh-Hans');
    });

    it('maps simplified Chinese aliases to zh-Hans', () => {
        assert.strictEqual(mapLanguageCode('zh-CN'), 'zh-Hans');
        assert.strictEqual(mapLanguageCode('zh'), 'zh-Hans');
        assert.strictEqual(mapLanguageCode('zh-Hans'), 'zh-Hans');
        assert.strictEqual(mapLanguageCode('zh_CN'), 'zh-Hans');
        assert.strictEqual(mapLanguageCode('zh-SG'), 'zh-Hans');
    });

    it('maps traditional Chinese aliases to zh-Hant', () => {
        assert.strictEqual(mapLanguageCode('zh-TW'), 'zh-Hant');
        assert.strictEqual(mapLanguageCode('zh-HK'), 'zh-Hant');
        assert.strictEqual(mapLanguageCode('zh-Hant'), 'zh-Hant');
        assert.strictEqual(mapLanguageCode('zh-MO'), 'zh-Hant');
    });

    it('takes the primary language for region-specific codes', () => {
        assert.strictEqual(mapLanguageCode('en-US'), 'en');
        assert.strictEqual(mapLanguageCode('en-GB'), 'en');
        assert.strictEqual(mapLanguageCode('pt-BR'), 'pt');
        assert.strictEqual(mapLanguageCode('ja-JP'), 'ja');
    });

    it('passes through other language codes', () => {
        assert.strictEqual(mapLanguageCode('en'), 'en');
        assert.strictEqual(mapLanguageCode('ja'), 'ja');
        assert.strictEqual(mapLanguageCode('ko'), 'ko');
        assert.strictEqual(mapLanguageCode('sr-Latn'), 'sr-Latn');
    });
});
