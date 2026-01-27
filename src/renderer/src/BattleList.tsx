import { useState } from 'react'
import { useThemeStore, themeColors } from './themeStore'

interface Battle {
  id: number
  title: string
  host: string
  map: string
  players: number
  maxPlayers: number
  duration: number
  isRunning: boolean
  isPassworded: boolean
}

const MOCK_BATTLES: Battle[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  title: ['Casual 4v4', 'Pro 1v1 Match', 'Team Games', 'Beginner Friendly', 'All Welcome'][i % 5],
  host: ['Commander_Alpha', 'IronForge', 'NovaPilot', 'SteelBrigade', 'MechWarrior'][i % 5],
  map: ['Speed Metal', 'Comet Catcher', 'Stronghold', 'Quicksilver', 'Tundra'][i % 5],
  players: Math.floor(Math.random() * 6) + 2,
  maxPlayers: 8,
  duration: Math.floor(Math.random() * 45) + 5,
  isRunning: Math.random() > 0.5,
  isPassworded: Math.random() > 0.8,
}))

export default function BattleList(): JSX.Element {
  const [battles] = useState<Battle[]>(MOCK_BATTLES)
  const [filter, setFilter] = useState<'all' | 'waiting' | 'running'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const filteredBattles = battles.filter(battle => {
    const matchesFilter = filter === 'all' ||
      (filter === 'waiting' && !battle.isRunning) ||
      (filter === 'running' && battle.isRunning)
    const matchesSearch = battle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      battle.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      battle.map.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const waitingCount = battles.filter(b => !b.isRunning).length
  const runningCount = battles.filter(b => b.isRunning).length

  return (
    <div className="h-full flex flex-col bg-neutral-950/70 border border-neutral-800/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white uppercase tracking-wider">Active Battles</h2>
          <span className="text-xs text-neutral-500">{battles.length} battles</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search battles..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors"
            style={{ ['--focus-border' as string]: `rgba(${theme.rgb}, 0.4)` }}
            onFocus={(e) => e.currentTarget.style.borderColor = `rgba(${theme.rgb}, 0.4)`}
            onBlur={(e) => e.currentTarget.style.borderColor = ''}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200
              ${filter === 'all'
                ? `${theme.bgSubtle} ${theme.text}`
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
              }`}
          >
            All ({battles.length})
          </button>
          <button
            onClick={() => setFilter('waiting')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200
              ${filter === 'waiting'
                ? 'bg-green-500/20 text-green-400'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
              }`}
          >
            Waiting ({waitingCount})
          </button>
          <button
            onClick={() => setFilter('running')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200
              ${filter === 'running'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
              }`}
          >
            In Progress ({runningCount})
          </button>
        </div>
      </div>

      {/* Battle List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredBattles.length > 0 ? (
          filteredBattles.map(battle => (
            <BattleCard key={battle.id} battle={battle} theme={theme} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-600">
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No battles found</p>
          </div>
        )}
      </div>

      {/* Create Battle Button */}
      <div className="p-3 border-t border-neutral-800/50">
        <button
          className={`w-full py-3 ${theme.bg} ${theme.bgHover} text-white text-sm font-semibold rounded-lg transition-all duration-200 ${theme.shadow} ${theme.shadowHover}`}
        >
          <svg className="w-4 h-4 inline-block mr-2 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Host New Battle
        </button>
      </div>
    </div>
  )
}

function BattleCard({ battle, theme }: { battle: Battle; theme: typeof themeColors[keyof typeof themeColors] }): JSX.Element {
  return (
    <div className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer group
      ${battle.isRunning
        ? 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40'
        : `bg-neutral-900/50 border-neutral-800 hover:bg-neutral-900 ${theme.borderHover}`
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Map Preview */}
        <div className="w-16 h-16 rounded bg-neutral-800/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>

        {/* Battle Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white text-sm truncate">{battle.title}</span>
            {battle.isPassworded && (
              <svg className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>

          <div className="text-xs text-neutral-500 mb-2">
            Hosted by <span className="text-neutral-400">{battle.host}</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Players */}
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className={battle.players >= battle.maxPlayers ? 'text-red-400' : 'text-neutral-400'}>
                {battle.players}/{battle.maxPlayers}
              </span>
            </div>

            {/* Map */}
            <div className="flex items-center gap-1.5 text-neutral-400">
              <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="truncate">{battle.map}</span>
            </div>

            {/* Status/Duration */}
            {battle.isRunning ? (
              <div className="flex items-center gap-1.5 text-yellow-400">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                <span>{battle.duration}m</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span>Waiting</span>
              </div>
            )}
          </div>
        </div>

        {/* Join Button */}
        <button
          disabled={battle.isRunning || battle.players >= battle.maxPlayers}
          className={`px-3 py-1.5 text-xs font-medium rounded ${theme.bgSubtle} ${theme.text} border ${theme.border} opacity-0 group-hover:opacity-100 transition-all duration-200 ${theme.bgHover} hover:text-white disabled:bg-neutral-800/50 disabled:text-neutral-600 disabled:border-neutral-700 disabled:cursor-not-allowed`}
        >
          {battle.isRunning ? 'Spectate' : 'Join'}
        </button>
      </div>
    </div>
  )
}
