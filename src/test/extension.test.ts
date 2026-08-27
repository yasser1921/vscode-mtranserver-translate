import * as assert from 'assert';
import { activate, deactivate } from '../extension';
import { MTranServerTranslate } from '../mtranserverTranslate';
import { TRANSLATE_KEY } from '../settings';

describe('extension', () => {
    it('registers the MTranServer translate source', () => {
        const exports = activate({} as any);
        let key = '';
        let ctor: unknown;
        exports.extendTranslate((translation, translate) => {
            key = translation;
            ctor = translate;
        });

        assert.strictEqual(key, TRANSLATE_KEY);
        assert.strictEqual(ctor, MTranServerTranslate);
    });

    it('provides a no-op deactivate hook', () => {
        assert.doesNotThrow(() => deactivate());
    });
});
