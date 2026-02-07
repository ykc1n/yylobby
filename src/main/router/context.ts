import { BrowserWindow } from 'electron'
import { lobbyState, lobbyInterface, replayManager, zk_launcher, settingsManager, zerokDownloader } from '../index'
import type { ZerokLobbyState } from '../ZerokLobbyState'
import type ZerokLobbyInterface from '../ZerokLobbyInterface'
import type { ReplayManager } from '../local/replays'
import type { ZkLauncher } from '../local/zk_launcher'
import type { SettingsManager } from '../local/settings'
import { ZerokDownloader } from '../local/ZeroKDownloader'

export interface Context {
  windowId: number | null
  lobbyState: ZerokLobbyState
  lobbyInterface: ZerokLobbyInterface
  replayManager: ReplayManager
  zk_launcher: ZkLauncher
  settingsManager: SettingsManager
  zerokDownloader: ZerokDownloader
}

export const createContext = async ({
  event
}: {
  event: Electron.IpcMainInvokeEvent
}): Promise<Context> => {
  const window = BrowserWindow.fromWebContents(event.sender)
  const windowId = window?.id ?? null

  return { windowId, lobbyState, lobbyInterface, replayManager, zk_launcher, settingsManager, zerokDownloader }
}
