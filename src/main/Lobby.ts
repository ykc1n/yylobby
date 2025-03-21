//import { ElectronAPI } from '@electron-toolkit/preload'
import { WebContents } from 'electron'
import { ElectronApiHandler } from './schemamemeslolignore'
import net from 'net'
import dataHandler from './dataHandler'
import { replyHandler } from './commandHandler'

export default class Lobby {
  //webContents: Electron.WebContents | undefined
  dataBuffer = ''
  connected = false
  connection = new net.Socket()
  ZK_SERVER = {
    host: 'zero-k.info',
    port: 8200
  }
  ZK_DEV_SERVER = {
    host: 'test.zero-k.info',
    port: 8202
  }
  TEST_SERVER = {
    host: '127.0.0.1',
    port: 8888
  }
  //electronApiHandler: ElectronApiHandler

  //constructor(ipcMain) {
  //this.webContents = webContents
  //this.electronApiHandler = new ElectronApiHandler(ipcMain)
  //}

  connect(): void {
    this.connection.connect(this.ZK_SERVER)
  }

  getConnectionStatus(): string {
    return this.connection.readyState
  }

  setConnectionListeners(webContents: Electron.WebContents): void {
    this.connection
      .setEncoding('utf-8')
      .on('connect', () => {
        this.connected = true
      })
      .on('close', () => {
        this.connected = false
      })
    const commandHandler = new replyHandler(webContents)
    this.connection.on('data', (e) => {
      this.dataBuffer = dataHandler(commandHandler, this.dataBuffer, e)
    })
  }
}
