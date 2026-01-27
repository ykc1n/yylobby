export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export interface ChannelData {
  name: string
  topic: string | null
  users: string[]
  isDeluge: boolean
}

export interface BattleData {
  battleId: number
  title: string
  founder: string
  map: string
  playerCount: number
  spectatorCount: number
  isRunning: boolean
  engine: string
  game: string
  mode: string
}

export interface AppState {
  connection: {
    status: ConnectionStatus
    lastError: string | null
  }
  auth: {
    loggedIn: boolean
    username: string | null
    loginMessage: string
  }
  lobby: {
    engine: string
    game: string
    userCount: number
    welcomeMessage: string | null
  }
  channels: Record<string, ChannelData>
  battles: BattleData[]
  lastUpdated: number
}

export interface StateUpdate {
  type: 'full' | 'partial'
  state: AppState
  timestamp: number
}
