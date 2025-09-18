import { BrowserWindow } from 'electron'
import { lobbyInterface } from '../index'
import ZerokLobbyInterface from '../ZerokLobbyInterface'

export interface Context {
  window_id: number | null
  lobbyInterface: ZerokLobbyInterface
}

export const createContext = async ({
  event
}: {
  event: Electron.IpcMainInvokeEvent
}): Promise<Context> => {
  const window = BrowserWindow.fromWebContents(event.sender)
  const window_id = window?.id ?? null
  
  return Promise.resolve({ window_id, lobbyInterface })
}
