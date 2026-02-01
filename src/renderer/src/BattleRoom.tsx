import { useState, useRef, useEffect } from 'react'
import { useThemeStore, themeColors } from './themeStore'

interface Player {
  id: string
  name: string
  isHost: boolean
}

interface Team {
  id: number
  name: string
  players: Player[]
}

interface ChatMessage {
  id: string
  user: string
  text: string
  time: string
}

// Mock data for the battleroom - 4v4v4v4
const MOCK_TEAMS: Team[] = [
  {
    id: 1,
    name: 'Team 1',
    players: [
      { id: '1', name: 'Commander_Alpha', isHost: true },
      { id: '2', name: 'IronForge', isHost: false },
      { id: '3', name: 'NovaPilot', isHost: false },
      { id: '4', name: 'Striker', isHost: false },
    ]
  },
  {
    id: 2,
    name: 'Team 2',
    players: [
      { id: '5', name: 'SteelBrigade', isHost: false },
      { id: '6', name: 'MechWarrior', isHost: false },
      { id: '7', name: 'Phoenix', isHost: false },
    ]
  },
  {
    id: 3,
    name: 'Team 3',
    players: [
      { id: '8', name: 'Vanguard', isHost: false },
      { id: '9', name: 'Titan', isHost: false },
    ]
  },
  {
    id: 4,
    name: 'Team 4',
    players: [
      { id: '10', name: 'Reaper', isHost: false },
      { id: '11', name: 'Ghost', isHost: false },
      { id: '12', name: 'Shadow', isHost: false },
      { id: '13', name: 'Blade', isHost: false },
    ]
  }
]

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', user: 'Commander_Alpha', text: 'Welcome to the battle!', time: new Date().toISOString() },
  { id: '2', user: 'IronForge', text: 'Ready when you are', time: new Date().toISOString() },
  { id: '3', user: 'SteelBrigade', text: 'glhf', time: new Date().toISOString() },
]

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

/*
TODO: 
- add yes no vote component
- add a map vote component
   what other votes are there?
- finish spec list

*/


function YesNoVote(): JSX.Element {
  const votes = {
    yes: 0,
    no: 0
  }

  return (
      <div>
        <div className="grid grid-cols-6 mb-2">
        <button className="p-4 border col-start-2 col-span-1 border-white/[0.1] rounded-lg text-sm text-white bg-green-400/[.3] hover:bg-green-400/[0.05] transition-all">
          Yes
          </button>
          <button className="p-4 border col-start-5  border-white/[0.1] rounded-lg text-sm text-white bg-red-400/[.3] hover:bg-red-400/[0.1] transition-all">
          No
          </button>  
        </div>

        <div className="grid grid-cols-6">
          <div className="bg-green-400 p-1"></div>
        </div>
      </div>
  )
}

function TeamBox({ team, theme }: { team: Team; theme: typeof themeColors[keyof typeof themeColors] }): JSX.Element {
  return (
    <div className="flex-1 border border-white/[0.08] rounded-lg p-2   min-w-0 flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1 border-b">
        <h3 className="text-lg font-medium tracking-wide text-neutral-300">{team.name}</h3>
        <span className="text-xs text-neutral-600">{team.players.length}/4</span>
      </div>

      <div className="flex-1">
        {team.players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center gap-2 px-3 `}
          >
            <span className={`text-sm text-neutral-300 truncate ${player.isHost ? 'text-yellow-200' : 'text-neutral-300'}`}>{player.name}</span>
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: Math.max(0, 4 - team.players.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="px-3 py-2 border border-dashed border-white/[0.06] rounded-lg text-neutral-700 text-sm text-center">
            Empty
          </div>
        ))}
      </div>
    </div>
  )
}

function BattleRoomChat({ messages, theme }: { messages: ChatMessage[]; theme: typeof themeColors[keyof typeof themeColors] }): JSX.Element {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = (): void => {
    if (inputValue.trim()) {
      console.log('Send message:', inputValue)
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h3 className="text-sm font-normal text-neutral-300 tracking-[0.1em] uppercase">Battle Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="group">
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className={`text-sm font-normal tracking-wide ${theme.text}`}>{msg.user}</span>
              <span className="text-[10px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatTime(msg.time)}
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed break-words">{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* yes no vote */}
      <div className="p-3 border-t border-white/[0.06]">
      <YesNoVote />
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.12] transition-colors"
          />
        </div>
      </div>
    </div>
  )
}

export default function BattleRoom(): JSX.Element {
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]
  const [isReady, setIsReady] = useState(false)

  const battleInfo = {
    title: 'FFA 4v4v4v4 - All Welcome',
    map: 'Speed Metal',
    host: 'Commander_Alpha',
    maxPlayers: 16,
    currentPlayers: 13,
  }

  return (
    <div className="h-full flex gap-3">
      {/* Left Half: Teams Section */}
      <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl p-4 shadow-xl shadow-black/30 flex flex-col">
        {/* Battle Header */}
        <div className="mb-4 pb-3 border-b border-white/[0.06]">
          <h2 className="text-base font-normal tracking-wide text-white mb-1">{battleInfo.title}</h2>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span>Host: <span className={theme.text}>{battleInfo.host}</span></span>
            <span className="w-1 h-1 bg-neutral-600 rounded-full" />
            <span>{battleInfo.currentPlayers}/{battleInfo.maxPlayers} Players</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-5 gap-3 min-h-0">

        <div>
          <div className='p-3 border border-white/[0.06]'>
            <h3 className="text-lg font-medium tracking-wide text-neutral-300 mb-2 border-b">Spectators</h3>

          </div>
        </div>

        {/* Teams Grid - 2x2 */}
        <div className="flex-1 col-span-4 flexgap-3 min-h-0 overflow-auto space-y-4">
          {MOCK_TEAMS.map((team) => (
            <TeamBox key={team.id} team={team} theme={theme} />
          ))}
        </div>        
        
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm rounded-lg transition-all">
            Leave Battle
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsReady(!isReady)}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                isReady
                  ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white'
                  : 'bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300'
              }`}
            >
              {isReady ? 'Ready!' : 'Not Ready'}
            </button>
            <button className={`px-5 py-2 ${theme.bg} ${theme.bgHover} text-white text-sm font-medium rounded-lg transition-all`}>
              Start Game
            </button>
          </div>
        </div>
      </div>

      {/* Right Half: Chat + Map stacked */}
      <div className="flex-1 flex flex-col gap-3">
                {/* Map Section - bottom */}
        <div className="h-48 bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl p-3 shadow-xl shadow-black/30 flex gap-4">
          {/* Map Preview */}
          <div className="w-40 h-full bg-black/40 rounded-lg border border-white/[0.08] flex items-center justify-center overflow-hidden flex-shrink-0">
            <svg className="w-12 h-12 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>

          {/* Map Info */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">{battleInfo.map}</h3>
              <button className={`text-xs ${theme.text} hover:underline`}>Change Map</button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-500">
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="text-neutral-400">16x16</span>
              </div>
              <div className="flex justify-between">
                <span>Players:</span>
                <span className="text-neutral-400">16</span>
              </div>
              <div className="flex justify-between">
                <span>Wind:</span>
                <span className="text-neutral-400">0-2.5</span>
              </div>
              <div className="flex justify-between">
                <span>Tidal:</span>
                <span className="text-neutral-400">13</span>
              </div>
            </div>

            {/* Spectators & Settings */}
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Spectators:</span>
                <span className="text-xs text-neutral-400 bg-white/[0.04] px-1.5 py-0.5 rounded">Watcher1</span>
                <span className="text-xs text-neutral-400 bg-white/[0.04] px-1.5 py-0.5 rounded">Obs_Guy</span>
              </div>
              <button className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-400 text-xs rounded-lg transition-all">
                Settings
              </button>
            </div>
          </div>
        </div>
        {/* Chat - takes most of the space */}
        <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl shadow-xl shadow-black/30 overflow-hidden">
          <BattleRoomChat messages={MOCK_MESSAGES} theme={theme} />
        </div>


      </div>
    </div>
  )
}
