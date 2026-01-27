import { useState } from 'react'
import { useThemeStore, themeColors } from './themeStore'

interface Player {
  id: number
  name: string
  status: 'online' | 'in-game' | 'away' | 'offline'
  isFriend: boolean
  game?: string
}

const MOCK_PLAYERS: Player[] = [
  // Friends
  { id: 1, name: 'Commander_Alpha', status: 'online', isFriend: true },
  { id: 2, name: 'IronForge', status: 'in-game', isFriend: true, game: 'Speed Metal 4v4' },
  { id: 3, name: 'NovaPilot', status: 'away', isFriend: true },
  { id: 4, name: 'SteelBrigade', status: 'offline', isFriend: true },
  // Active players
  { id: 5, name: 'MechWarrior', status: 'online', isFriend: false },
  { id: 6, name: 'TacticalOps', status: 'online', isFriend: false },
  { id: 7, name: 'BattleHawk', status: 'in-game', isFriend: false, game: 'Comet Catcher 1v1' },
  { id: 8, name: 'IronClad', status: 'online', isFriend: false },
  { id: 9, name: 'StormBringer', status: 'in-game', isFriend: false, game: 'Quicksilver 2v2' },
  { id: 10, name: 'VoidWalker', status: 'online', isFriend: false },
  { id: 11, name: 'ThunderStrike', status: 'away', isFriend: false },
  // Inactive/Offline players
  { id: 12, name: 'ShadowMech', status: 'offline', isFriend: false },
  { id: 13, name: 'NightOwl', status: 'offline', isFriend: false },
  { id: 14, name: 'GhostUnit', status: 'offline', isFriend: false },
]

const statusColors = {
  online: 'bg-green-500',
  'in-game': 'bg-yellow-500',
  away: 'bg-orange-500',
  offline: 'bg-neutral-600',
}

const statusLabels = {
  online: 'Online',
  'in-game': 'In Game',
  away: 'Away',
  offline: 'Offline',
}

export default function PlayerList(): JSX.Element {
  const [players] = useState<Player[]>(MOCK_PLAYERS)
  const [searchQuery, setSearchQuery] = useState('')
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const friends = filteredPlayers.filter(p => p.isFriend)
  const activePlayers = filteredPlayers.filter(p => !p.isFriend && p.status !== 'offline')
  const inactivePlayers = filteredPlayers.filter(p => !p.isFriend && p.status === 'offline')

  const friendsOnline = friends.filter(f => f.status !== 'offline').length

  return (
    <div className="h-full flex flex-col bg-neutral-950/70 border border-neutral-800/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white uppercase tracking-wider">Players</h2>
          <span className="text-xs text-neutral-500">{players.filter(p => p.status !== 'offline').length} online</span>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players..."
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-white placeholder-neutral-600 focus:outline-none transition-colors"
            onFocus={(e) => e.currentTarget.style.borderColor = `rgba(${theme.rgb}, 0.4)`}
            onBlur={(e) => e.currentTarget.style.borderColor = ''}
          />
        </div>
      </div>

      {/* Player List */}
      <div className="flex-1 overflow-y-auto">
        {/* Friends Section */}
        {friends.length > 0 && (
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Friends</span>
              <span className="text-[10px] text-neutral-600">{friendsOnline}/{friends.length}</span>
            </div>
            <div className="space-y-0.5">
              {friends.map(player => (
                <PlayerItem key={player.id} player={player} theme={theme} />
              ))}
            </div>
          </div>
        )}

        {/* Active Players Section */}
        {activePlayers.length > 0 && (
          <div className="p-2 border-t border-neutral-800/50">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Online</span>
              <span className="text-[10px] text-neutral-600">{activePlayers.length}</span>
            </div>
            <div className="space-y-0.5">
              {activePlayers.map(player => (
                <PlayerItem key={player.id} player={player} theme={theme} />
              ))}
            </div>
          </div>
        )}

        {/* Inactive Players Section */}
        {inactivePlayers.length > 0 && (
          <div className="p-2 border-t border-neutral-800/50">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
              <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full" />
              <span className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Offline</span>
              <span className="text-[10px] text-neutral-700">{inactivePlayers.length}</span>
            </div>
            <div className="space-y-0.5 opacity-50">
              {inactivePlayers.map(player => (
                <PlayerItem key={player.id} player={player} theme={theme} inactive />
              ))}
            </div>
          </div>
        )}

        {filteredPlayers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-600 p-4">
            <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-xs">No players found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PlayerItem({
  player,
  theme,
  inactive = false
}: {
  player: Player
  theme: typeof themeColors[keyof typeof themeColors]
  inactive?: boolean
}): JSX.Element {
  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors cursor-pointer group
      ${inactive ? 'hover:bg-white/3' : 'hover:bg-white/5'}`}
    >
      {/* Avatar */}
      <div className="relative">
        <div className={`w-7 h-7 rounded ${inactive ? 'bg-neutral-800' : 'bg-neutral-800'} flex items-center justify-center`}>
          <span className={`text-xs font-medium ${inactive ? 'text-neutral-600' : 'text-neutral-400'}`}>
            {player.name.charAt(0).toUpperCase()}
          </span>
        </div>
        {/* Status indicator */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-neutral-950 ${statusColors[player.status]}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium truncate ${inactive ? 'text-neutral-600' : 'text-neutral-300'}`}>
          {player.name}
        </div>
        {player.status === 'in-game' && player.game && (
          <div className="text-[10px] text-yellow-500/70 truncate">{player.game}</div>
        )}
      </div>

      {/* Actions (show on hover) */}
      {!inactive && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Message */}
          <button className="p-1 text-neutral-500 hover:text-white transition-colors" title="Message">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          {/* Add friend / View profile */}
          {!player.isFriend && (
            <button className={`p-1 text-neutral-500 ${theme.textHover} transition-colors`} title="Add Friend">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
