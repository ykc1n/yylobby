import { create } from 'zustand'

// Mirror the types from main process
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

interface AppStore extends AppState {
  // Action to sync state from main process
  setState: (state: AppState) => void
}

const initialState: AppState = {
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
  lastUpdated: 0
}

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,
  setState: (state: AppState) => set(state)
}))

// Selector hooks for common patterns
export const useConnectionStatus = (): ConnectionStatus =>
  useAppStore((state) => state.connection.status)

export const useConnectionError = (): string | null =>
  useAppStore((state) => state.connection.lastError)

export const useAuth = () => useAppStore((state) => state.auth)

export const useIsLoggedIn = (): boolean => useAppStore((state) => state.auth.loggedIn)

export const useLobbyInfo = () => useAppStore((state) => state.lobby)

export const useUserCount = (): number => useAppStore((state) => state.lobby.userCount)

export const useChannels = () => useAppStore((state) => state.channels)

export const useBattles = () => useAppStore((state) => state.battles)
