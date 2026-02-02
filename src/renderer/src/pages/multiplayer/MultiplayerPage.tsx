import { useState } from 'react'
import BattleList from './BattleList'
import BattleRoom from './BattleRoom'
import LobbySidebar from './LobbySidebar'
import { useThemeStore, themeColors } from '../../themeStore'

// Hexagon grid pattern for matchmaking container
const hexGridSvg = `data:image/svg+xml,${encodeURIComponent(
  `<svg width="24" height="42" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0l12 7v14l-12 7-12-7V7z" fill="none" stroke="rgba(255,255,255,0.012)"/>
    <path d="M0 21l12 7v14l-12 7-12-7V28z" fill="none" stroke="rgba(255,255,255,0.012)"/>
    <path d="M24 21l12 7v14l-12 7-12-7V28z" fill="none" stroke="rgba(255,255,255,0.012)"/>
  </svg>`
)}`

function MatchmakingPanel(): JSX.Element {
  const [activeQueue, setActiveQueue] = useState<string | null>(null)
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const queues = [
    { id: '1v1', name: '1v1', description: 'Ranked duel', icon: '⚔️', players: '1 vs 1' },
    { id: 'small', name: 'Small Teams', description: 'Fast team battles', icon: '👥', players: '2v2 - 3v3' },
    { id: 'medium', name: 'Medium Teams', description: 'Strategic warfare', icon: '⚔️', players: '4v4 - 6v6' },
    { id: 'coop', name: 'Coop', description: 'Fight together vs AI', icon: '🤝', players: 'PvE' },
  ]

  const handleQueueToggle = (queueId: string): void => {
    setActiveQueue(activeQueue === queueId ? null : queueId)
  }

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
          <h2 className="text-sm font-normal text-white/80 tracking-[0.12em] uppercase">Matchmaking</h2>
          {activeQueue && (
            <span className="text-xs text-emerald-400/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              In Queue
            </span>
          )}
        </div>
      </div>

      {/* Queue Buttons */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 relative z-10">
        {queues.map((queue) => (
          <button
            key={queue.id}
            onClick={() => handleQueueToggle(queue.id)}
            className={`w-full p-4 rounded-lg transition-all duration-200 text-left shadow-lg
              ${activeQueue === queue.id
                ? `bg-gradient-to-br from-emerald-900/60 to-neutral-900/50 border border-emerald-500/30 hover:border-emerald-500/50`
                : 'bg-gradient-to-br from-neutral-800/45 to-neutral-900/35 hover:from-neutral-700/55 hover:to-neutral-800/50 border border-white/10 hover:border-white/20'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg
                  ${activeQueue === queue.id ? 'bg-emerald-500/20' : 'bg-white/10'}`}
                >
                  {queue.icon}
                </div>
                <div>
                  <div className={`font-normal text-sm tracking-wide mb-0.5
                    ${activeQueue === queue.id ? 'text-emerald-400' : 'text-white/85'}`}
                  >
                    {queue.name}
                  </div>
                  <div className="text-xs text-neutral-500">{queue.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-500 mb-1">{queue.players}</div>
                {activeQueue === queue.id ? (
                  <span className="text-xs text-emerald-400/80">Searching...</span>
                ) : (
                  <span className="text-xs text-neutral-600">--:--</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 relative z-10">
        {activeQueue ? (
          <button
            onClick={() => setActiveQueue(null)}
            className="w-full py-2.5 bg-red-500/80 hover:bg-red-500 text-white text-sm font-normal tracking-[0.1em] uppercase rounded-lg transition-all duration-200"
          >
            Leave Queue
          </button>
        ) : (
          <div className="text-center text-xs text-neutral-600 py-2">
            Select a queue to start matchmaking
          </div>
        )}
      </div>
    </div>
  )
}

export default function MultiplayerPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'battles' | 'matchmaking' | 'battleroom'>('battles')
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const navLinkClass = (tab: string): string => {
    if (activeTab === tab) {
      return `relative px-4 py-2 text-sm font-normal tracking-[0.1em] uppercase transition-all duration-200 ${theme.text} after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-px after:bg-current after:opacity-60`
    }
    return "relative px-4 py-2 text-sm font-normal tracking-[0.1em] uppercase transition-all duration-200 text-neutral-500 hover:text-neutral-400"
  }

  return (
    <div className="h-[calc(100vh-52px)] flex flex-col overflow-hidden">
      {/* Sub-navbar */}
      <div className="bg-black/30 backdrop-blur-xl border-b border-white/[0.08] flex items-center gap-1 px-3 py-1">
        <button onClick={() => setActiveTab('battles')} className={navLinkClass('battles')}>
          Battles
        </button>
        <button onClick={() => setActiveTab('matchmaking')} className={navLinkClass('matchmaking')}>
          Matchmaking
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-white/[0.1] mx-2" />

        <button onClick={() => setActiveTab('battleroom')} className={navLinkClass('battleroom')}>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Battleroom
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-hidden">
        {activeTab === 'battleroom' ? (
          <BattleRoom />
        ) : (
          <div className="h-full grid grid-cols-4 gap-3">
            {/* Left Panel - Battle List or Matchmaking */}
            <div className="col-span-2 flex flex-col min-h-0">
              {activeTab === 'battles' ? <BattleList /> : <MatchmakingPanel />}
            </div>

            {/* Lobby Sidebar (Chat + Player List) - takes 2 columns */}
            <div className="col-span-2 flex flex-col min-h-0">
              <LobbySidebar />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
