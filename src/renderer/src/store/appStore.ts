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

export interface User {
    AccountID: number;
    Avatar: string;
    AwaySince?: Date;
    BanMute: boolean;
    BanVotes: boolean;
    BanSpecChat: boolean;
    BattleID?: number;
    Clan: string;
    Country: string;
    DisplayName: string;
    Faction: string;
    InGameSince?: Date;
    IsAdmin: boolean;
    IsBot: boolean;
    LobbyVersion: string;
    Name: string;
    SteamID: string;
    Badges: string[];
    Icon: string;
    EffectiveMmElo: number;
    EffectiveElo: number;
    Level: number;
    Rank: number;
}

export interface ChannelData {
  name: string
  topic: string | null
  users: string[]
  isDeluge: boolean
  messages: ChatMessage[]
}

enum AutohostMode {
    None = "None",
    Planetwars = "Planetwars",
    Generic = "Generic",
    Teams = "Teams",
    GameChickens = "GameChickens",
    GameFFA = "GameFFA"
}

export interface BattleData {
    BattleID?: number;
    Engine: string;
    Founder: string;
    Game: string;
    IsMatchMaker?: boolean;
    IsRunning?: boolean;
    Map: string;
    MaxPlayers?: number;
    Mode?: AutohostMode;
    Password: string;
    PlayerCount?: number;
    RunningSince?: Date;
    SpectatorCount?: number;
    Title: string;
    TimeQueueEnabled?: boolean;
    MaxEvenPlayers?: number;
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
  battles: Map<number, BattleData>
  lastUpdated: number
  users: Map<string, User>
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
  battles: new Map(),
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

export const useChannels = (): Record<string, ChannelData> => useAppStore((state) => state.channels)

export const useBattles = (): Map<number, BattleData> => useAppStore((state) => state.battles)

export const useUsers = (): Map<string, User> => useAppStore((state) => state.users)

export const useActiveChannel = (): string | null =>
  useAppStore((state) => state.activeChannel)

export const useActiveChannelData = (): ChannelData | null =>
  useAppStore((state) =>
    state.activeChannel ? state.channels[state.activeChannel] ?? null : null
  )

export const useChannelMessages = (channelName: string): ChatMessage[] =>
  useAppStore((state) => state.channels[channelName]?.messages ?? [])
