import { EventEmitter } from 'events'
import type { AppState, ConnectionStatus, ChannelData, BattleData, StateUpdate } from './types/AppState'

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
      battles: [],
      lastUpdated: Date.now()
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

  setChannel(name: string, data: ChannelData): void {
    this.state = {
      ...this.state,
      channels: { ...this.state.channels, [name]: data },
      lastUpdated: Date.now()
    }
    this.emitStateChange()
  }

  removeChannel(name: string): void {
    const { [name]: _, ...rest } = this.state.channels
    this.state = {
      ...this.state,
      channels: rest,
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
