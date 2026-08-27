import Module from 'module';

const defaults: Record<string, unknown> = {
    baseUrl: 'http://127.0.0.1:8989',
    apiToken: '',
    timeout: 120000,
    html: false,
    maxLen: 5000,
    defaultFrom: 'auto',
};

type ConfigMap = Record<string, unknown>;
type LoadFunction = (request: string, parent: unknown, isMain: boolean) => unknown;

let currentConfig: ConfigMap = { ...defaults };
const changeListeners: Array<(event: { affectsConfiguration: (section: string) => boolean }) => void> = [];

export function setWorkspaceConfig(config: ConfigMap): void {
    currentConfig = { ...defaults, ...config };
}

export function resetWorkspaceConfig(): void {
    currentConfig = { ...defaults };
}

export function emitConfigurationChange(section: string): void {
    for (const listener of changeListeners) {
        listener({
            affectsConfiguration: (value) => value === section,
        });
    }
}

class EventEmitter {
    event() {
        return () => {};
    }
    fire(_value?: unknown) {}
    dispose() {}
}

export const vscodeStub = {
    EventEmitter,
    workspace: {
        getConfiguration: () => ({
            get: <T>(key: string): T | undefined => currentConfig[key] as T | undefined,
        }),
        onDidChangeConfiguration: (
            listener: (event: { affectsConfiguration: (section: string) => boolean }) => void
        ) => {
            changeListeners.push(listener);
            return {
                dispose() {
                    const index = changeListeners.indexOf(listener);
                    if (index >= 0) {
                        changeListeners.splice(index, 1);
                    }
                },
            };
        },
    },
};

const nodeModule = Module as unknown as { _load: LoadFunction };
const originalLoad: LoadFunction = nodeModule._load.bind(Module);

nodeModule._load = (request: string, parent: unknown, isMain: boolean) => {
    if (request === 'vscode') {
        return vscodeStub;
    }
    return originalLoad(request, parent, isMain);
};
