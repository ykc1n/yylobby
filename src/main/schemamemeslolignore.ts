export class ElectronApiHandler {
  //apiChannels: string[]
  ipcMain: Electron.IpcMain
  api: LobbyApi
  /*
  return type = function that runs ipc

  */
  constructor(
    ipcMain
    //, api: LobbyApi
  ) {
    this.ipcMain = ipcMain
    //this.api = api
    this.addRendererToMainFunctions()
    //this.apiChannels = []
  }

  addRendererToMainFunctions(): void {
    this.api.rendererToMainFunctions.forEach((rendererToMainFunction, rendererToMainChannel) => {
      this.ipcMain.on(rendererToMainChannel, rendererToMainFunction)
    })
  }
}

class LobbyApi {
  rendererToMainFunctions: Map<string, (e, data) => void>

  constructor() {
    this.rendererToMainFunctions = new Map<string, (e, data) => void>()
  }
}

class ApiFunction {
  channel: string
  //input: object
  apiFunction: (e, data) => void

  constructor(channel)
}

//
