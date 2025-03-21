import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI, exposeElectronAPI } from '@electron-toolkit/preload'
import { exposeElectronTRPC } from 'electron-trpc/main'
// Custom APIs for renderer

class ClientAPI {
  sendLogin = (loginData): void => {
    ipcRenderer.send('login', loginData)
  }
  sendRegister = (registerData): void => {
    ipcRenderer.send('register', registerData)
  }

  constructor() {
    this.activeListeners = []
  }
  // onIDK = (cb):  => {
  //   return new ApiFunction('idkCommand', cb)
  // }
  // onWelcome = (cb):  => {
  //   return new ApiFunction('Welcome', cb)
  // }
  activeListeners: []
  mountListener = (channel, cb): void => {
    ipcRenderer.on(channel, (_event, data) => cb(data))
    this.activeListeners.push([channel, cb])
  }
  unmountListeners = (): void => {
    this.activeListeners.forEach(([channel, cb]) => {
      console.log('deregistering!')
      ipcRenderer.off(channel, (_event, data) => cb(data))
    })
  }
}

// class ApiFunction {
//   cb
//   channel
//   constructor(channel, cb) {
//     console.log(channel)
//     this.cb = cb
//     this.channel = channel
//   }

//   register = function (this: ApiFunction): void {
//     ipcRenderer.on(this.channel, (_event, data) => this.cb(data))
//   }
//   deregister = function (this: ApiFunction): void {
//     ipcRenderer.off(this.channel, (_event, data) => this.cb(data))
//   }
// }
// const api = new ClientAPI()
// console.log(api)

process.once('loaded', async () => {
  exposeElectronTRPC()
})

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    //contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', new ClientAPI())
    //exposeElectronTRPC()
    //contextBridge.exposeInMainWorld
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
