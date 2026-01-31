import { useState } from 'react'
import { useThemeStore, themeColors } from './themeStore'
import { useBattles } from './store/appStore'



interface Battle {
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

// Hexagon grid pattern - proper honeycomb tiling
// Each hex: 24w x 28h, row offset 21, column offset 12 for alt rows
const hexGridSvg = `data:image/svg+xml,${encodeURIComponent(
  `<svg width="24" height="42" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0l12 7v14l-12 7-12-7V7z" fill="none" stroke="rgba(255,255,255,0.012)"/>
    <path d="M0 21l12 7v14l-12 7-12-7V28z" fill="none" stroke="rgba(255,255,255,0.012)"/>
    <path d="M24 21l12 7v14l-12 7-12-7V28z" fill="none" stroke="rgba(255,255,255,0.012)"/>
  </svg>`
)}`

export default function BattleList(): JSX.Element {
  const battles = useBattles() // Replace with actual battles from store
  const [filter, setFilter] = useState<'all' | 'waiting' | 'running'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const filteredBattles = battles.values().filter(battle => {
    const matchesFilter = filter === 'all' ||
      (filter === 'waiting' && !battle.IsRunning) ||
      (filter === 'running' && battle.IsRunning)
      console.log(battle)
    const matchesSearch = battle.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      battle.Founder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      battle.Map.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  }).toArray()

  const waitingCount = battles.values().filter(b => !b.IsRunning).toArray().length
  const runningCount = battles.values().filter(b => b.IsRunning).toArray().length

  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl overflow-hidden relative shadow-xl shadow-black/30">
      {/* Hex Grid Background */}
      <div
        className="absolute inset-0 opacity-100 pointer-events-none"
        style={{ backgroundImage: `url("${hexGridSvg}")` }}
      />
      {/* Header */}
      <div className="px-4 py-3 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-normal text-white/80 tracking-[0.12em] uppercase">Battles</h2>
          <span className="text-xs text-neutral-500">{battles.size}</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.12] transition-colors tracking-wide"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-normal tracking-wide rounded-md transition-all duration-200
              ${filter === 'all'
                ? `bg-white/20 ${theme.text}`
                : 'text-neutral-500 hover:text-neutral-400 hover:bg-white/10'
              }`}
          >
            All ({battles.size})
          </button>
          <button
            onClick={() => setFilter('waiting')}
            className={`px-3 py-1.5 text-xs font-normal tracking-wide rounded-md transition-all duration-200
              ${filter === 'waiting'
                ? 'bg-emerald-500/30 text-emerald-400'
                : 'text-neutral-500 hover:text-neutral-400 hover:bg-white/10'
              }`}
          >
            Waiting ({waitingCount})
          </button>
          <button
            onClick={() => setFilter('running')}
            className={`px-3 py-1.5 text-xs font-normal tracking-wide rounded-md transition-all duration-200
              ${filter === 'running'
                ? 'bg-amber-500/30 text-amber-400'
                : 'text-neutral-500 hover:text-neutral-400 hover:bg-white/10'
              }`}
          >
            In Progress ({runningCount})
          </button>
        </div>
      </div>

      {/* Battle List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 relative z-10">
        {filteredBattles.length > 0 ? (
          filteredBattles.map(battle => (
            <BattleCard key={battle.BattleID} battle={battle} theme={theme} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-600">
            <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-neutral-600">No battles found</p>
          </div>
        )}
      </div>

      {/* Create Battle Button */}
      <div className="p-3 relative z-10">
        <button
          className={`w-full py-2.5 ${theme.bg} ${theme.bgHover} text-white text-sm font-normal tracking-[0.1em] uppercase rounded-lg transition-all duration-200`}
        >
          <svg className="w-4 h-4 inline-block mr-2 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          Host Battle
        </button>
      </div>
    </div>
  )
}

function BattleCard({ battle, theme }: { battle: Battle; theme: typeof themeColors[keyof typeof themeColors] }): JSX.Element {
  return (
    <div className={`p-3 rounded-lg transition-all duration-200 cursor-pointer group shadow-lg
      ${battle.IsRunning
        ? 'bg-gradient-to-br from-amber-950/50 to-neutral-900/40 hover:from-amber-950/65 hover:to-neutral-800/55 border border-amber-500/20 hover:border-amber-500/40'
        : 'bg-gradient-to-br from-neutral-800/45 to-neutral-900/35 hover:from-neutral-700/55 hover:to-neutral-800/50 border border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Map Preview */}
        <div className="w-14 h-14 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0 overflow-hidden">
          <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>

        {/* Battle Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-normal text-white/85 text-sm tracking-wide truncate">{battle.Title}</span>
            {false && (
              <svg className="w-3 h-3 text-amber-400/60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>

          <div className="text-xs text-neutral-500 mb-2 tracking-wide">
            {battle.Founder}
          </div>

          <div className="flex items-center gap-4 text-xs tracking-wide">
            {/* Players */}
            <div className="flex items-center gap-1.5">
              <span className={battle.PlayerCount >= battle.MaxPlayers ? 'text-red-400/70' : 'text-neutral-500'}>
                {battle.PlayerCount}/{battle.MaxPlayers}
              </span>
            </div>

            {/* Map */}
            <div className="text-neutral-500 truncate">
              {battle.Map}
            </div>

            {/* Status/Duration */}
            {battle.IsRunning ? (
              <div className="flex items-center gap-1.5 text-amber-400/70">
                <span className="w-1 h-1 bg-amber-400/70 rounded-full animate-pulse" />
                <span>min</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400/70">
                <span className="w-1 h-1 bg-emerald-400/70 rounded-full" />
                <span>Open</span>
              </div>
            )}
          </div>
        </div>

        {/* Join Button */}
        <button
          disabled={battle.IsRunning || battle.PlayerCount >= battle.MaxPlayers}
          className={`px-3 py-1.5 text-xs font-medium rounded-md bg-white/20 ${theme.text} opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/30 disabled:bg-white/10 disabled:text-neutral-600 disabled:cursor-not-allowed`}
        >
          {battle.IsRunning ? 'Spectate' : 'Join'}
        </button>
      </div>
    </div>
  )
}
