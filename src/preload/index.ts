import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
    getApiKey: () => ipcRenderer.invoke('get-api-key'),
    getKeys: () => ipcRenderer.invoke('get-keys'),
    addKey: (key: string) => ipcRenderer.invoke('add-key', key),
    removeKey: (key: string) => ipcRenderer.invoke('remove-key', key),
    setActiveKey: (key: string) => ipcRenderer.invoke('set-active-key', key),
    validateKey: (key: string) => ipcRenderer.invoke('validate-key', key),
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    onCpuUsageUpdate: (callback: (usage: number) => void) => {
        ipcRenderer.on('cpu-usage-update', (_, usage) => callback(usage))
    }
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    ; (window as any).electron = electronAPI
        ; (window as any).api = api
}
