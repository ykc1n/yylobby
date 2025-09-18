import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI, exposeElectronAPI } from '@electron-toolkit/preload'
import { exposeElectronTRPC } from '@janwirth/electron-trpc-link/main'
// Custom APIs for renderer

interface LoginData {
  username: string
  password: string
}

type IpcCallback = (data: any) => void
type ListenerEntry = [string, IpcCallback]

class ClientAPI {
  private activeListeners: ListenerEntry[] = []

  sendLogin = (loginData: LoginData): void => {
    ipcRenderer.send('login', loginData)
  }

  sendRegister = (registerData: LoginData): void => {
    ipcRenderer.send('register', registerData)
  }

  mountListener = (channel: string, callback: IpcCallback): void => {
    const wrappedCallback = (_event: any, data: any) => callback(data)
    ipcRenderer.on(channel, wrappedCallback)
    this.activeListeners.push([channel, wrappedCallback])
  }

  unmountListeners = (): void => {
    this.activeListeners.forEach(([channel, callback]) => {
      ipcRenderer.off(channel, callback)
    })
    this.activeListeners = []
  }

  // Specific listeners for type safety
  onWelcome = (callback: (data: any) => void): void => {
    this.mountListener('Welcome', callback)
  }

  onLoginUpdate = (callback: () => void): void => {
    this.mountListener('LoginUpdate', callback)
  }

  onRawOutput = (callback: (data: { command: string; data: string }) => void): void => {
    this.mountListener('RawOutput', callback)
  }

  onMMSetup = (callback:(data:any)=>void): void =>{
    this.mountListener('mmsetup', callback)
  }
}


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
