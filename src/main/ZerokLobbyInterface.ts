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
    loginResultCodes = new Map<number, string>([
    //set by me lel
    [-1, ''],
    //set by API (LobbyClient/Protocol in zk infra)
    [0, ''], //successful login
    [1, 'Invalid Name'],
    [2, 'Invalid Password'],
    [4, 'Ban hammeur']
  ])

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

    login = (username, password): void => {
     console.log("test")
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

  register = (username, password):void => {
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

  sendLobbyUpdate = ():void=>{
    this.clientEvents.emit("lobbyUpdate", this.lobby)
  }

  handleLoginResponse = (JSONdata): void=>{
    const data = JSON.parse(JSONdata)
    console.log('login response!')
    console.log(this.lobby)
    //this.loginResultCode = data.ResultCode

    if(data.ResultCode == 0){
      this.lobby.LoggedIn = true
    }
    this.lobby.LoginStatusMessage = this.loginResultCodes.get(data.ResultCode)??"Not sure what happened."
    this.sendLobbyUpdate()
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

