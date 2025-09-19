//import { ElectronAPI } from '@electron-toolkit/preload'
 export default class Lobby {
  LoggedIn = false
  LoginStatusMessage="N/A"
  Engine = "N/A"
  Game="N/A"
  UserCount=0
  battles = []
  channels = new Map<string,object>();

  setWelcomeMessage(welcomeMessageInfo):void{
    this.Engine = welcomeMessageInfo.Engine
    this.Game = welcomeMessageInfo.Game
    this.UserCount = welcomeMessageInfo.UserCount
  }

  
}