/// <reference types="vite/client" />

interface Window {
    api: {
        getApiKey: () => Promise<string>
        minimize: () => void
        maximize: () => void
        close: () => void
        onCpuUsageUpdate: (callback: (usage: number) => void) => void
        getKeys: () => Promise<any[]>
        addKey: (key: string) => Promise<boolean>
        removeKey: (key: string) => Promise<boolean>
        setActiveKey: (key: string) => Promise<boolean>
        validateKey: (key: string) => Promise<boolean>
    }
}
