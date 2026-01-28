import { create } from 'zustand'

// Mirror the types from main process
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export enum ChatPlace {
  Channel = 0,
  Battle = 1,
  BattlePrivate = 2,
  MessageBox = 3,
  User = 4,
  Server = 5
}

export interface ChatMessage {
  id: string
  user: string
  text: string
  time: string
  target: string
  place: ChatPlace
  isEmote: boolean
}

export interface ChannelData {
  name: string
  topic: string | null
  users: string[]
  isDeluge: boolean
  messages: ChatMessage[]
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
  activeChannel: string | null
  battles: BattleData[]
  lastUpdated: number
  users: Map<string, unknown>
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
  activeChannel: null,
  battles: [],
  lastUpdated: 0,
  users: new Map()
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

export const useUsers = () => useAppStore((state) => state.users)

export const useActiveChannel = (): string | null =>
  useAppStore((state) => state.activeChannel)

export const useActiveChannelData = (): ChannelData | null =>
  useAppStore((state) =>
    state.activeChannel ? state.channels[state.activeChannel] ?? null : null
  )

export const useChannelMessages = (channelName: string): ChatMessage[] =>
  useAppStore((state) => state.channels[channelName]?.messages ?? [])
