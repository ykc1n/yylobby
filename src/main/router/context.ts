import { BrowserWindow } from 'electron'
import ZerokLobbyInterface from '../ZerokLobbyInterface'
import ZerokConnection from '../ZerokConnection'
import Lobby from '../Lobby'

export interface Context {
  window_id: number | null,
  lobbyInterface: ZerokLobbyInterface
}

export const createContext = async ({event}: {event: Electron.IpcMainInvokeEvent}): Promise<Context> => {
  const window = BrowserWindow.fromWebContents(event.sender)
  const window_id = window?.id ?? null
  const connection = new ZerokConnection();
  const lobby = new Lobby();
  const lobbyInterface = new ZerokLobbyInterface(connection, lobby, window?.webContents)
  lobbyInterface.initialize()
  return Promise.resolve({ window_id, lobbyInterface })
}
