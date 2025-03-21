//import { ElectronAPI } from '@electron-toolkit/preload'
import net from 'net'
import dataHandler from './dataHandler'
import { createHash } from 'crypto'
export default class Lobby {
  webContents: Electron.WebContents | undefined
  dataBuffer = ''
  connected = false
  connection = new net.Socket()
  ZK_SERVER = {
    host: 'zero-k.info',
    port: 8200
  }
  ZK_DEV_SERVER = {
    host: 'test.zero-k.info',
    port: 8202
  }
  TEST_SERVER = {
    host: '127.0.0.1',
    port: 8888
  }

  welcomeMessage = {
    Engine: 'N/A',
    Game: 'N/A',
    UserCount: 'N/A'
  }

  connect(): void {
    this.connection.connect(this.ZK_SERVER)
  }

  getConnectionStatus(): string {
    return this.connection.readyState
  }

  setConnectionListeners(webContents: Electron.WebContents): void {
    this.webContents = webContents
    this.connection
      .setEncoding('utf-8')
      .on('connect', () => {
        this.connected = true
      })
      .on('close', () => {
        this.connected = false
      })
    //const commandHandler = new replyHandler(webContents)
    this.connection.on('data', (e) => {
      this.dataBuffer = dataHandler(this.handleCommands, this.dataBuffer, e)
    })
  }
  handleCommands = (commandName, data): void => {
    // const command =
    //   this.commands.get(commandName) ?? ((): void => console.log('Command Not Available'))
    // command(data)
    switch (commandName) {
      case 'Welcome':
        this.handleWelcome(data)
        break
      case 'Say':
        this.handleSay(data)
        break
      case 'LoginResponse':
        this.handleLoginResponse(data)
        break
      case 'RegisterResponse':
        this.handleRegisterResponse(data)
        break
      default: {
        console.log('default')
        const out = {
          command: commandName,
          data: JSON.stringify(data)
        }
        try {
          this.webContents.send('idkCommand', out)
        } catch (e) {
          console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!ERROR ON ${commandName} `)
          console.log(e)
          console.log(data)
        }
      }
      //break
    }
  }

  loggedIn = false
  login(username, password): void {
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
    this.connection.write(`Login ${JSON.stringify(account)}\n`)
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
    this.connection.write(`Register ${JSON.stringify(account)}\n`)
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

  handleSay = (JSONdata): void => {
    const data = JSON.parse(JSONdata)
    this.webContents.send('Say', data)
  }

  handleWelcome = (JSONdata): void => {
    const data = JSON.parse(JSONdata)
    this.welcomeMessage = data
    this.webContents?.send('Welcome')
  }
}
