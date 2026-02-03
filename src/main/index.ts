import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon1.png?asset'
import { ZerokLobbyState } from './ZerokLobbyState'
import ZerokConnection from './ZerokConnection'
import ZerokLobbyInterface from './ZerokLobbyInterface'
import { attachWindow } from './ipc_setup'
import { ReplayManager } from './local/replays'
import { ZkLauncher } from './local/zk_launcher'
import { SettingsManager } from './local/settings'

console.log('[Main] Starting application')

// Create singleton instances - these exist for the lifetime of the app
export const settingsManager = new SettingsManager()
export const lobbyState = new ZerokLobbyState()
export const connection = new ZerokConnection()
export const lobbyInterface = new ZerokLobbyInterface(connection, lobbyState)
export const replayManager = new ReplayManager(settingsManager)
export const zk_launcher = new ZkLauncher(settingsManager)

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    resizable: true,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    attachWindow(mainWindow)
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer based on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Debug window for viewing lobby state in real-time (development only)
function createDebugWindow(): void {
  const debugWindow = new BrowserWindow({
    width: 600,
    height: 800,
    title: 'Lobby State Debug',
    resizable: true,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  debugWindow.on('ready-to-show', () => {
    attachWindow(debugWindow)
    debugWindow.show()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    debugWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/debug.html`)
  } else {
    debugWindow.loadFile(join(__dirname, '../renderer/debug.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // Open debug window in development mode
  if (is.dev) {
    createDebugWindow()
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
