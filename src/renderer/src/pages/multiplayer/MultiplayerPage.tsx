import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import BattleList from './BattleList'
import BattleRoom from './BattleRoom'
import LobbySidebar from './LobbySidebar'
import { GlassPanel } from '../../components/GlassPanel'

const hexGridSvg = `data:image/svg+xml,${encodeURIComponent(
  `<svg width="24" height="42" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0l12 7v14l-12 7-12-7V7z" fill="none" stroke="rgba(255,255,255,0.012)"/>
    <path d="M0 21l12 7v14l-12 7-12-7V28z" fill="none" stroke="rgba(255,255,255,0.012)"/>
    <path d="M24 21l12 7v14l-12 7-12-7V28z" fill="none" stroke="rgba(255,255,255,0.012)"/>
  </svg>`
)}`

function MatchmakingPanel(): JSX.Element {
  const [activeQueue, setActiveQueue] = useState<string | null>(null)

  const queues = [
    { id: '1v1', name: '1v1', description: 'Ranked duel', icon: '⚔️', players: '1 vs 1' },
    { id: 'small', name: 'Small Teams', description: 'Fast team battles', icon: '👥', players: '2v2 - 3v3' },
    { id: 'medium', name: 'Medium Teams', description: 'Strategic warfare', icon: '⚔️', players: '4v4 - 6v6' },
    { id: 'coop', name: 'Coop', description: 'Fight together vs AI', icon: '🤝', players: 'PvE' }
  ]

  const handleQueueToggle = (queueId: string): void => {
    setActiveQueue(activeQueue === queueId ? null : queueId)
  }

  return (
    <GlassPanel className="relative h-full flex flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{ backgroundImage: `url("${hexGridSvg}")` }}
      />

      <div className="relative z-10 px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-normal uppercase tracking-[0.12em] text-white/80">Matchmaking</h2>
          {activeQueue && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              In Queue
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10 flex-1 space-y-2 overflow-y-auto p-3">
        {queues.map((queue) => (
          <button
            key={queue.id}
            onClick={() => handleQueueToggle(queue.id)}
            className={`w-full rounded-lg border p-4 text-left shadow-lg transition-all duration-200 ${
              activeQueue === queue.id
                ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-900/60 to-neutral-900/50 hover:border-emerald-500/50'
                : 'border-white/10 bg-gradient-to-br from-neutral-800/45 to-neutral-900/35 hover:border-white/20 hover:from-neutral-700/55 hover:to-neutral-800/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${activeQueue === queue.id ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                  {queue.icon}
                </div>
                <div>
                  <div className={`mb-0.5 text-sm font-normal tracking-wide ${activeQueue === queue.id ? 'text-emerald-400' : 'text-white/85'}`}>
                    {queue.name}
                  </div>
                  <div className="text-xs text-neutral-500">{queue.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-1 text-xs text-neutral-500">{queue.players}</div>
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

      <div className="relative z-10 p-3">
        {activeQueue ? (
          <button
            onClick={() => setActiveQueue(null)}
            className="w-full rounded-lg bg-red-500/80 py-2.5 text-sm font-normal uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-red-500"
          >
            Leave Queue
          </button>
        ) : (
          <div className="py-2 text-center text-xs text-neutral-600">Select a queue to start matchmaking</div>
        )}
      </div>
    </GlassPanel>
  )
}

function BattlesView(): JSX.Element {
  return (
    <div className="grid h-full grid-cols-4 gap-3">
      <div className="col-span-2 flex min-h-0 flex-col">
        <BattleList />
      </div>
      <div className="col-span-2 flex min-h-0 flex-col">
        <LobbySidebar />
      </div>
    </div>
  )
}

function MatchmakingView(): JSX.Element {
  return (
    <div className="grid h-full grid-cols-4 gap-3">
      <div className="col-span-2 flex min-h-0 flex-col">
        <MatchmakingPanel />
      </div>
      <div className="col-span-2 flex min-h-0 flex-col">
        <LobbySidebar />
      </div>
    </div>
  )
}

export default function MultiplayerPage(): JSX.Element {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden p-3">
        <Routes>
          <Route path="Battles" element={<BattlesView />} />
          <Route path="Matchmaking" element={<MatchmakingView />} />
          <Route path="Battleroom" element={<BattleRoom />} />
          <Route path="" element={<Navigate to="/Multiplayer/Battles" replace />} />
        </Routes>
      </div>
    </div>
  )
}
