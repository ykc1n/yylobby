import { BattleHeader, User } from "../commands"

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

// Chat message places
export enum ChatPlace {
  Channel = 0,
  Battle = 1,
  BattlePrivate = 2,
  MessageBox = 3,
  User = 4,  // Private message
  Server = 5
}
//hmmmm idk if this should perfectly model the archivecache..
export interface MapArchiveEntry {
  name: string;
  path: string;
}


export interface ChatMessage {
  id: string
  user: string
  text: string
  time: string
  target: string  // channel name, battle id, or username
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

export interface ActiveBattle {
    BattleID: number;
    Bots: any[]; // UpdateBotStatus[]
    Options: Record<string, string>;
    Players: any[]; // UpdateUserBattleStatus[]
    MapOptions: Record<string, string>;
}

export interface NewsItem {
  Header: string
  Text: string
  Url: string
  Time: string
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
  battles: Map<number, BattleHeader>
  lastUpdated: number
  users: Map<string, User>
  news: NewsItem[]
}

export interface StateUpdate {
  type: 'full' | 'partial'
  state: AppState
  timestamp: number
}
