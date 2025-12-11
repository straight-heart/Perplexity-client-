import { app, shell, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import os from 'os'

// Disable cache to fix permission errors
app.commandLine.appendSwitch('disable-http-cache')
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')
app.commandLine.appendSwitch('disable-gpu-cache')

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        frame: false,
        icon,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            contextIsolation: true,
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow?.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    mainWindow.on('close', (event) => {
        if (tray && !isQuitting) {
            event.preventDefault()
            mainWindow?.hide()
        }
        return false
    })
}

if (require('electron-squirrel-startup')) {
    app.quit()
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.electron')

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    const iconPath = join(__dirname, '../../resources/icon.png')
    tray = new Tray(iconPath)

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: () => mainWindow?.show() },
        { type: 'separator' },
        {
            label: 'Quit', click: () => {
                isQuitting = true
                app.quit()
            }
        }
    ])

    tray.setToolTip('Perplexity Client')
    tray.setContextMenu(contextMenu)

    tray.on('click', () => {
        if (mainWindow?.isVisible()) {
            mainWindow.hide()
        } else {
            mainWindow?.show()
        }
    })

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // We don't quit here if we want to stay in tray
    }
})

// Config Management
const configPath = join(app.getPath('userData'), 'config.json')

interface ApiKey {
    key: string
    name: string
    isActive: boolean
    createdAt: number
}

interface Config {
    apiKeys: ApiKey[]
}

function loadConfig(): Config {
    try {
        if (existsSync(configPath)) {
            const data = JSON.parse(readFileSync(configPath, 'utf8'))
            if (!data.apiKeys) return { apiKeys: [] }
            return data
        }
    } catch (e) {
        console.error('Failed to load config', e)
    }
    return {
        apiKeys: []

    }
}

function saveConfig(config: Config) {
    try {
        writeFileSync(configPath, JSON.stringify(config, null, 2))
    } catch (e) {
        console.error('Failed to save config', e)
    }
}

// IPC Handlers
ipcMain.handle('get-api-key', () => {
    const config = loadConfig()
    return config.apiKeys.find(k => k.isActive)?.key || ''
})

ipcMain.handle('get-keys', () => {
    return loadConfig().apiKeys
})

ipcMain.handle('add-key', (_, key: string) => {
    const config = loadConfig()
    if (config.apiKeys.some(k => k.key === key)) throw new Error('Key already exists')

    const newKey = {
        key,
        name: `Key ${config.apiKeys.length + 1}`,
        isActive: config.apiKeys.length === 0,
        createdAt: Date.now()
    }
    config.apiKeys.push(newKey)
    saveConfig(config)
    return config.apiKeys
})

ipcMain.handle('remove-key', (_, key: string) => {
    const config = loadConfig()
    const wasActive = config.apiKeys.find(k => k.key === key)?.isActive

    config.apiKeys = config.apiKeys.filter(k => k.key !== key)

    if (wasActive && config.apiKeys.length > 0) {
        config.apiKeys[0].isActive = true
    }
    saveConfig(config)
    return config.apiKeys
})

ipcMain.handle('set-active-key', (_, key: string) => {
    const config = loadConfig()
    config.apiKeys.forEach(k => k.isActive = (k.key === key))
    saveConfig(config)
    return config.apiKeys
})

ipcMain.handle('validate-key', async (_, key: string) => {
    try {
        if (!key.startsWith('pplx-')) return { valid: false, message: 'Invalid format' }
        return { valid: true, message: 'Valid' }
    } catch (e: any) {
        return { valid: false, message: e.message }
    }
})

ipcMain.on('window-minimize', () => {
    mainWindow?.minimize()
})

ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize()
    } else {
        mainWindow?.maximize()
    }
})

ipcMain.on('window-close', () => {
    mainWindow?.close()
})

// CPU Usage Monitoring
function getCpuInfo() {
    const cpus = os.cpus()
    let user = 0
    let nice = 0
    let sys = 0
    let idle = 0
    let irq = 0

    for (const cpu of cpus) {
        user += cpu.times.user
        nice += cpu.times.nice
        sys += cpu.times.sys
        idle += cpu.times.idle
        irq += cpu.times.irq
    }

    return {
        idle: idle,
        total: user + nice + sys + idle + irq
    }
}

let lastCpuInfo = getCpuInfo()

setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return

    const currentCpuInfo = getCpuInfo()
    const idleDiff = currentCpuInfo.idle - lastCpuInfo.idle
    const totalDiff = currentCpuInfo.total - lastCpuInfo.total

    const usage = 1 - (idleDiff / totalDiff)
    mainWindow.webContents.send('cpu-usage-update', usage * 100)

    lastCpuInfo = currentCpuInfo
}, 500)
