import { BrowserWindow } from 'electron'
import { lobbyInterface, replayManager, zk_launcher } from '../index'
import ZerokLobbyInterface from '../ZerokLobbyInterface'
import { ReplayManager } from '../local/replays'
import { ZkLauncher } from '../local/zk_launcher'

export interface Context {
  window_id: number | null
  lobbyInterface: ZerokLobbyInterface
  replayManager: ReplayManager
  zk_launcher: ZkLauncher
}

export const createContext = async ({
  event
}: {
  event: Electron.IpcMainInvokeEvent
}): Promise<Context> => {
  const window = BrowserWindow.fromWebContents(event.sender)
  const window_id = window?.id ?? null
  
  return Promise.resolve({ window_id, lobbyInterface, replayManager, zk_launcher })
}
