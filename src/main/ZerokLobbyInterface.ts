import ZerokConnection from "./ZerokConnection"
import Lobby from "./Lobby"
import { createHash } from "crypto"
import { EventEmitter } from "stream"

export default class ZerokLobbyInterface{
    connection:ZerokConnection
    lobby:Lobby
    emitter:EventEmitter
    webContents:Electron.WebContents
    constructor(connection:ZerokConnection,lobby:Lobby,webcontents:Electron.WebContents){
        this.connection = connection
        this.lobby = lobby
        this.webContents = webcontents
        this.emitter = new EventEmitter
    }

    initialize():void{

       // console.log(this)
        this.connection.connect_to_zk()


    }

    login(username, password): void {
     console.log("test")
    if (this.loginResultCode == 0) {
      return
    }
    const account = {
      Name: username,
      UserID: 0,
      InstallID: 0,
      LobbyVersion: 0,
      PasswordHash: createHash('md5').update(password).digest('base64'),
      SteamAuthToken: '',
      Dlc: ''
    }
    this.connection.sendCommand("Login", account)
  }

  register(username, password): void {
    if (this.loginResultCode == 0) {
      return
    }
    const account = {
      Name: username,
      UserID: 0,
      InstallID: 0,
      LobbyVersion: 0,
      PasswordHash: createHash('md5').update(password).digest('base64'),
      SteamAuthToken: '',
      Dlc: ''
    }
    this.connection.sendCommand("Register",account)
  }

  loginResultCode = -1
  handleLoginResponse = (JSONdata): void => {
    const data = JSON.parse(JSONdata)
    console.log('login response!')
    //if(data.Response)
    this.loginResultCode = data.ResultCode

    this.webContents?.send('LoginUpdate')

    console.log(data)
  }

  handleRegisterResponse = (JSONdata): void => {
    const data = JSON.parse(JSONdata)
    console.log('Register Response!')
    console.log(data)
  }

  handleSay = (JSONdata: string): void => {
    const data = JSON.parse(JSONdata)
    this.webContents?.send('ChatMessage', data)
  }

  // Send connection status updates to renderer
  sendConnectionStatus = (status: 'connected' | 'disconnected' | 'connecting'): void => {
    this.webContents?.send('ConnectionStatus', { status })
  }

  // Send user list updates
  sendUserListUpdate = (users: unknown[]): void => {
    this.webContents?.send('UserListUpdate', users)
  }

  handleWelcome = (JSONdata: string): void => {
    const data = JSON.parse(JSONdata)
    this.lobby.welcomeMessage = data
    this.webContents?.send('Welcome', data)
  }

}

