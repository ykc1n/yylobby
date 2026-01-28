import { createHash } from 'crypto'
import type ZerokConnection from './ZerokConnection'
import type { ZerokLobbyState } from './ZerokLobbyState'
import { ChatPlace } from './types/AppState'
import {User } from './commands'
interface LoginResponse {
  ResultCode: number
  Name?: string
  Message?: string
}

interface WelcomeData {
  Engine: string
  Game: string
  UserCount: number
}

interface JoinChannelData {
  ChannelName: string
  Channel?: {
    Topic?: { Text: string }
    Users?: string[]
    IsDeluge?: boolean
  }
}

interface SayData {
  User: string
  Text: string
  Time: string
  Target: string
  Place: number
  IsEmote: boolean
  Ring?: boolean
}

interface ChannelUserData{
  ChannelName: string,
  UserName: string
} 

/**
 * ZerokLobbyInterface is the controller that wires connection events to state updates.
 * It listens to ZerokConnection events and updates StateManager accordingly.
 */
export default class ZerokLobbyInterface {
  private readonly loginResultCodes = new Map<number, string>([
    [0, 'Success'],
    [1, 'Invalid Name'],
    [2, 'Invalid Password'],
    [4, 'Banned']
  ])

  private pendingRequests = new Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }>()

  constructor(
    private readonly connection: ZerokConnection,
    private readonly lobbyState: ZerokLobbyState
  ) {
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    const { events } = this.connection

    // Connection lifecycle events
    events.on('connecting', () => {
      console.log('[LobbyInterface] Connecting...')
      this.lobbyState.updateConnection('connecting')
    })

    events.on('connected', () => {
      console.log('[LobbyInterface] Connected')
      this.lobbyState.updateConnection('connected')
    })

    events.on('disconnected', () => {
      console.log('[LobbyInterface] Disconnected')
      this.lobbyState.resetOnDisconnect()
    })

    events.on('error', (err: Error) => {
      console.error('[LobbyInterface] Connection error:', err.message)
      this.lobbyState.updateConnection('disconnected', err.message)
    })

    // Server commands
    events.on('command', ({ name, data }: { name: string; data: unknown }) => {
      this.handleCommand(name, data)
    })
  }

  private handleCommand(name: string, data: unknown): void {
    switch (name) {
      case 'Welcome':
        this.handleWelcome(data as WelcomeData)
        break
      case 'LoginResponse':
        this.handleLoginResponse(data as LoginResponse)
        break
      case 'JoinChannelResponse':
        this.handleJoinChannelResponse(data as JoinChannelData)
        break
      case 'RegisterResponse':
        this.handleRegisterResponse(data)
        break
      case 'Say':
        this.handleSay(data as SayData)
        break
      case 'User':
        this.handleUser(data as User)
        break
      // Add more command handlers as needed
      case 'ChannelUserAdded':
        this.handleChannelUserAdded(data as ChannelUserData)  
      break
      case 'ChannelUserRemoved':
         this.handleChannelUserRemoved(data as ChannelUserData)  
      break
      default:
        // Silently ignore common noisy commands
        if (!['BattleAdded', 'BattleUpdate', 'UserDisconnected', 'MatchMakerStatus'].includes(name)) {
          console.log(`[LobbyInterface] Unhandled command: ${name}`)
        }
    }
  }
  private handleUser(data: User): void {
    this.lobbyState.addUser(data)
  }

  private handleChannelUserAdded(data: ChannelUserData): void {
    console.log(data)
    this.lobbyState.addUserToChannel(data.ChannelName, data.UserName)
  }

  private handleChannelUserRemoved(data: ChannelUserData): void {
    this.lobbyState.removeUserFromChannel(data.ChannelName, data.Username)
  }

  private handleWelcome(data: WelcomeData): void {
    console.log('[LobbyInterface] Welcome received:', data)
    this.lobbyState.updateLobby({
      engine: data.Engine,
      game: data.Game,
      userCount: data.UserCount
    })
  }

  private handleLoginResponse(data: LoginResponse): void {
    console.log('[LobbyInterface] Login response:', data)

    // Resolve pending login request
    const pending = this.pendingRequests.get('LoginResponse')
    if (pending) {
      clearTimeout(pending.timeout)
      pending.resolve(data)
      this.pendingRequests.delete('LoginResponse')
    }

    // Update auth state
    const message = this.loginResultCodes.get(data.ResultCode) ?? 'Unknown error'
    this.lobbyState.updateAuth({
      loggedIn: data.ResultCode === 0,
      username: data.ResultCode === 0 ? data.Name ?? null : null,
      loginMessage: message
    })
  }

  private handleJoinChannelResponse(data: JoinChannelData): void {
    console.log('[LobbyInterface] Join channel response:', data)
    if (data.Channel) {
      this.lobbyState.setChannel(data.ChannelName, {
        name: data.ChannelName,
        topic: data.Channel.Topic?.Text ?? null,
        users: data.Channel.Users ?? [],
        isDeluge: data.Channel.IsDeluge ?? false
      })
    }
  }

  private handleRegisterResponse(data: unknown): void {
    console.log('[LobbyInterface] Register response:', data)
    // Handle registration response if needed
  }

  private handleSay(data: SayData): void {
    // Only handle channel messages for now
    if (data.Place !== ChatPlace.Channel) {
      return
    }

    this.lobbyState.addMessage({
      id: `${data.Time}-${data.User}-${Math.random().toString(36).slice(2, 8)}`,
      user: data.User,
      text: data.Text,
      time: data.Time,
      target: data.Target,
      place: data.Place as ChatPlace,
      isEmote: data.IsEmote
    })
  }

  // Public actions

  connect(): void {
    this.connection.connect('production')
  }

  disconnect(): void {
    this.connection.disconnect()
  }

  login(username: string, password: string): Promise<LoginResponse> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete('LoginResponse')
        reject(new Error('Login timed out'))
      }, 10000)

      this.pendingRequests.set('LoginResponse', { resolve, reject, timeout })

      this.connection.send('Login', {
        Name: username,
        PasswordHash: createHash('md5').update(password).digest('base64'),
        UserID: 0,
        InstallID: 0,
        LobbyVersion: 0,
        SteamAuthToken: '',
        Dlc: ''
      })
    })
  }

  register(username: string, password: string): void {
    this.connection.send('Register', {
      Name: username,
      PasswordHash: createHash('md5').update(password).digest('base64'),
      UserID: 0,
      InstallID: 0,
      LobbyVersion: 0,
      SteamAuthToken: '',
      Dlc: ''
    })
  }

  joinChannel(channelName: string, password = ''): void {
    this.connection.send('JoinChannel', { ChannelName: channelName, Password: password })
  }

  sendMessage(target: string, text: string, place: ChatPlace = ChatPlace.Channel): void {
    this.connection.send('Say', {
      Place: place,
      Target: target,
      Text: text,
      IsEmote: false
    })
  }

  setActiveChannel(channelName: string): void {
    this.lobbyState.setActiveChannel(channelName)
  }
}
