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


class LobbyRendererInterface{
  onLobbyUpdate = (callback):void => {
    ipcRenderer.on('lobbyUpdate', (_event, data)=>callback(data))
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
    console.log()
    //contextBridge.exposeInMainWorld('electron', electronAPI)
    const api = new LobbyRendererInterface()
    contextBridge.exposeInMainWorld('zkLobbyApi', api)
    //exposeElectronTRPC()
    //contextBridge.exposeInMainWorld
  } catch (error) {
    console.error(error)
  }
} else {
  console.log("lmaoooooo")
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
