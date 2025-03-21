import { app, shell, BrowserWindow, ipcMain, webContents } from 'electron'
import { join, sep } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import net from 'net'
import { createHash } from 'crypto'
import { replyHandler } from './commandHandler'
import Lobby from './Lobby'
import dataHandler from './dataHandler'
import { attachWindow } from './ipc_setup'
console.log('momo')

const connection = new net.Socket()
let isConnected = false
let dataBuffer = ''

export const yyLobby = new Lobby()

function login(data): void {
  const command = `Login ${JSON.stringify(data)}\n`
  connection.write(command, 'utf-8', () => {
    console.log('write!')
  })
  //connection.send
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    resizable: true,
    show: false,
    autoHideMenuBar: true,
    //backgroundMaterial: 'acrylic',
    //transparent: true,
    //frame:false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
      //transparent:true
    }
  })

  attachWindow(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.openDevTools()
    console.log('lololol')
    //const lobby = new Lobby(mainWindow.webContents, ipcMain)
    console.log(connection.readyState)
    if (yyLobby.connected) {
      //connection.destroy()
      return
    }
    yyLobby.connect()
    yyLobby.setConnectionListeners(mainWindow.webContents)

    //  const commandHandler = new replyHandler(mainWindow.webContents)
    //  connection
    //    .setEncoding('utf-8')
    //    .on('connect', () => {
    //      console.log('connect')
    //      isConnected = true
    //    })
    //    .on('data', (e) => {
    //      dataBuffer = dataHandler(commandHandler, dataBuffer, e)
    //    })
    //    .on('close', () => {
    //      console.log('connection closed!')
    //      //connection.destroy()
    //    })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('register', (event, data) => {
    console.log('register!!')
    const account = {
      Name: data.username,
      UserID: 0,
      InstallID: 0,
      LobbyVersion: 0,
      PasswordHash: createHash('md5').update(data.password).digest('base64'),
      SteamAuthToken: '',
      Dlc: ''
    }
    connection.write(`Register ${JSON.stringify(account)}\n`, () => {
      console.log('sent!')
    })
    console.log(account)
    //   const command = `Register ${JSON.stringify(DEV_ACCOUNT)}\n`
    //   connection.write(command, 'utf-8', () => {
    //     console.log('write!')
    //   })
  })

  ipcMain.on('login', (event, data) => {
    console.log('login!!!')
    console.log(data)
    const account = {
      Name: data.username,
      UserID: 0,
      InstallID: 0,
      LobbyVersion: 0,
      PasswordHash: createHash('md5').update(data.password).digest('base64'),
      SteamAuthToken: '',
      Dlc: ''
    }
    connection.write(`Login ${JSON.stringify(account)}\n`, () => {
      console.log('sent!')
    })
    console.log(account)
  })

  //ipcMain.on()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  //connection.destroy()
  //console.log('close?')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
