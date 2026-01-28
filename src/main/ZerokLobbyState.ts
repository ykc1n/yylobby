import { EventEmitter } from 'events'
import type { AppState, ConnectionStatus, ChannelData, BattleData, StateUpdate, ChatMessage } from './types/AppState'
import { User } from './commands'

const MAX_MESSAGES_PER_CHANNEL = 200

export class ZerokLobbyState extends EventEmitter {
  private state: AppState

  constructor() {
    super()
    this.state = this.getInitialState()
  }

  private getInitialState(): AppState {
    return {
      connection: {
        status: 'disconnected',
        lastError: null
      },
      auth: {
        loggedIn: false,
        username: null,
        loginMessage: ''
      },
      lobby: {
        engine: 'N/A',
        game: 'N/A',
        userCount: 0,
        welcomeMessage: null
      },
      channels: {},
      activeChannel: null,
      battles: [],
      lastUpdated: Date.now(),
      users: new Map(),
    }
  }

  getState(): AppState {
    return { ...this.state }
  }

  getConnectionStatus(): ConnectionStatus {
    return this.state.connection.status
  }

  updateConnection(status: ConnectionStatus, error?: string): void {
    this.state = {
      ...this.state,
      connection: {
        status,
        lastError: error ?? null
      },
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  updateAuth(auth: Partial<AppState['auth']>): void {
    this.state = {
      ...this.state,
      auth: { ...this.state.auth, ...auth },
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  updateLobby(lobby: Partial<AppState['lobby']>): void {
    this.state = {
      ...this.state,
      lobby: { ...this.state.lobby, ...lobby },
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  addUserToChannel(channelName: string, user: string): void {
    const channel = this.state.channels[channelName]
    console.log(user)
    if (!channel) return //this line might be meme
    if(channel.users.includes(user)) return
    const updatedUsers = [...channel.users, user]
    this.state = {
        ...this.state,
        channels: {
          ...this.state.channels,
          [channelName]: { ...channel, users: updatedUsers }
        },
        lastUpdated: Date.now()
    }
    this.emitStateChange()
    
  }

  removeUserFromChannel(channelName: string, user: string): void {
    const channel = this.state.channels[channelName]
    if (!channel) return
    const updatedUsers = channel.users.filter(u => u !== user)
    this.state = {
        ...this.state,
        channels: {
          ...this.state.channels,
          [channelName]: { ...channel, users: updatedUsers }
        },
        lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  setChannel(name: string, data: Omit<ChannelData, 'messages'>): void {
    const existingMessages = this.state.channels[name]?.messages ?? []
    this.state = {
      ...this.state,
      channels: {
        ...this.state.channels,
        [name]: { ...data, messages: existingMessages }
      },
      // Set as active channel if it's the first one
      activeChannel: this.state.activeChannel ?? name,
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  removeChannel(name: string): void {
    const { [name]: _, ...rest } = this.state.channels
    const channelNames = Object.keys(rest)
    this.state = {
      ...this.state,
      channels: rest,
      // If we removed the active channel, switch to another one
      activeChannel: this.state.activeChannel === name
        ? (channelNames[0] ?? null)
        : this.state.activeChannel,
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  setActiveChannel(name: string): void {
    if (this.state.channels[name]) {
      this.state = {
        ...this.state,
        activeChannel: name,
        lastUpdated: Date.now()
      }
      this.emitStateChange()
    }
  }
  addUser(user: User): void {
    this.state = {
      ...this.state,
      users: new Map(this.state.users).set(user.Name, user),
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  addMessage(message: ChatMessage): void {
    const channelName = message.target
    const channel = this.state.channels[channelName]
    if (!channel) {
      console.log(`[LobbyState] Message for unknown channel: ${channelName}`)
      return
    }

    // Add message and trim to max size
    const messages = [...channel.messages, message]
    if (messages.length > MAX_MESSAGES_PER_CHANNEL) {
      messages.splice(0, messages.length - MAX_MESSAGES_PER_CHANNEL)
    }

    this.state = {
      ...this.state,
      channels: {
        ...this.state.channels,
        [channelName]: { ...channel, messages }
      },
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  setBattles(battles: BattleData[]): void {
    this.state = {
      ...this.state,
      battles,
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  addBattle(battle: BattleData): void {
    this.state = {
      ...this.state,
      battles: [...this.state.battles, battle],
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  updateBattle(battleId: number, update: Partial<BattleData>): void {
    this.state = {
      ...this.state,
      battles: this.state.battles.map((b) =>
        b.battleId === battleId ? { ...b, ...update } : b
      ),
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  removeBattle(battleId: number): void {
    this.state = {
      ...this.state,
      battles: this.state.battles.filter((b) => b.battleId !== battleId),
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  resetOnDisconnect(): void {
    this.state = {
      ...this.getInitialState(),
      connection: { status: 'disconnected', lastError: null },
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  private emitStateChange(): void {
    const update: StateUpdate = {
      type: 'full',
      state: this.getState(),
      timestamp: Date.now()
    }
    this.emit('stateChange', update)
  }
}
