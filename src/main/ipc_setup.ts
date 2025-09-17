import { BrowserWindow } from 'electron'
import { createIPCHandler } from 'electron-trpc/main'
import { appRouter } from './router'
import { createContext } from './router/context'
import ZerokLobbyInterface from './ZerokLobbyInterface'
let ipcHandler: ReturnType<typeof createIPCHandler> | undefined

export function attachWindow(window: BrowserWindow): void {
  if (ipcHandler) {
    ipcHandler.attachWindow(window)
  } else {
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
