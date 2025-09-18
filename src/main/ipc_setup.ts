import { BrowserWindow } from 'electron'
import { createIPCHandler } from '@janwirth/electron-trpc-link/main'
import { appRouter } from './router'
import { createContext } from './router/context'
import ZerokLobbyInterface from './ZerokLobbyInterface'
let ipcHandler: ReturnType<typeof createIPCHandler> | undefined

export function attachWindow(window: BrowserWindow): void {
  console.log("attaching window")
  if (ipcHandler) {
    ipcHandler.attachWindow(window)
  } else {
    console.log("setup once..")
    ipcHandler = createIPCHandler({
      router: appRouter,
      windows: [window],
      createContext
    })
  }
}

export function detachWindow(window: BrowserWindow): void {
  if (!ipcHandler) return
  ipcHandler.detachWindow(window)
}
