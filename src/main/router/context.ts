import { BrowserWindow } from 'electron'

export interface Context {
  window_id: number | null
}

export const createContext = async ({
  event
}: {
  event: Electron.IpcMainInvokeEvent
}): Promise<Context> => {
  const window = BrowserWindow.fromWebContents(event.sender)
  const window_id = window?.id ?? null
  return Promise.resolve({ window_id })
}
