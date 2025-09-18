import ZerokConnection from "./ZerokConnection"
import Lobby from "./Lobby"
import { createHash } from "crypto"
import { EventEmitter } from "stream"
import {RegisterCommand} from "./commands"
export default class ZerokLobbyInterface{
    connection:ZerokConnection
    lobby:Lobby
    webContents:Electron.WebContents
    serverEvents:EventEmitter
    clientEvents:EventEmitter
    constructor(connection:ZerokConnection,lobby:Lobby,webcontents:Electron.WebContents){
        this.connection = connection
        this.lobby = lobby
        this.webContents = webcontents
        this.serverEvents = this.connection.emitter
        this.clientEvents = new EventEmitter()
    }

    initialize():void{

       // console.log(this)
        this.connection.connect_to_zk()
        this.serverEvents.on('Welcome', this.handleWelcome)
        this.serverEvents.on('LoginResponse', this.handleLoginResponse)
        this.serverEvents.on('handleJoinChannelResponse', this.handleJoinChannelResponse)
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
    //let registerCommand:RegisterCommand = {name:"Register", data:account}
    this.connection.sendCommand("Register",account)
  }

  sendLobbyUpdate():void{
    console.log("sending lobby update")
    this.webContents.send("lobbyUpdate", this.lobby)
  }

  loginResultCode = -1
  handleLoginResponse(JSONdata): void{
    const data = JSON.parse(JSONdata)
    console.log('login response!')
    this.loginResultCode = data.ResultCode
    this.clientEvents.emit("LoginResponse", data);
    console.log(data)
  }

  handleRegisterResponse = (JSONdata): void => {
    const data = JSON.parse(JSONdata)
    console.log('Register Response!')
    console.log(data)
  }

  handleWelcome = (JSONdata: string): void => {
    const data = JSON.parse(JSONdata)
    this.lobby.setWelcomeMessage(data)
    this.sendLobbyUpdate()
  }

  handleJoinChannelResponse(JSONdata:string):void{
    const data = JSON.parse(JSONdata)
    this.lobby.channels.set(data.name, data)
    this.sendLobbyUpdate()
  }

}

