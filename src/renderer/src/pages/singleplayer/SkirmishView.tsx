import { useState, useRef, useEffect } from 'react'
import { useThemeStore, themeColors } from '../../themeStore'
import { GlassPanel } from '@renderer/components/panels'
import { trpc } from '../../../utils/trpc'

interface AI {
  shortName: string
  version: string
  displayName: string
  description: string
}

interface PlayerOrBot {
  name: string
  isBot: boolean
  aiShortName?: string
}

interface Team {
  id: number
  name: string
  players: PlayerOrBot[]
}

interface ChatMessage {
  id: string
  user: string
  text: string
  time: string
}

const INITIAL_TEAMS: Team[] = [
  {
    id: 1,
    name: 'Team 1',
    players: [
    ]
  },
  {
    id: 2,
    name: 'Team 2',
    players: [
    ]
  },
]

const MOCK_MESSAGES: ChatMessage[] = [
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
things that are joinable:
- spectator list
- team slots

join button should show when:
- I havent joined the team
- there is space for me to join


*/



function TeamBox({ team, theme, onJoin, onAddBot, onSetBotAI, isMyTeam, availableAIs }: {
  team: Team
  theme: typeof themeColors[keyof typeof themeColors]
  onJoin: (teamId: number) => void
  onAddBot: (teamId: number) => void
  onSetBotAI: (teamId: number, playerIndex: number, aiShortName: string) => void
  isMyTeam: boolean
  availableAIs: AI[]
}): JSX.Element {
  return (
    <div className="flex-1 border border-white/[0.08] rounded-lg p-2 min-w-0 flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1 border-b">
        <h3 className="text-lg font-medium tracking-wide text-neutral-300">{team.name}</h3>
        <span className="text-xs text-neutral-600">{team.players.length}</span>
      </div>

      <div className="flex-1 flex flex-col gap-0.5">
        {team.players.map((player, i) => (
          <div key={i} className={`flex items-center gap-2 px-3 py-1 rounded ${!player.isBot && isMyTeam ? 'bg-white/[0.06]' : ''}`}>
            <span className={`text-sm truncate flex-1 ${!player.isBot && isMyTeam ? theme.text : 'text-neutral-300'}`}>
              {player.name}
            </span>
            {player.isBot && (
              <select
                value={player.aiShortName ?? ''}
                onChange={(e) => onSetBotAI(team.id, i, e.target.value)}
                className="text-xs bg-white/[0.04] border border-white/[0.08] rounded px-1 py-0.5 text-neutral-400 focus:outline-none focus:border-white/[0.15] cursor-pointer"
              >
                {availableAIs.length === 0 ? (
                  <option value="">Loading...</option>
                ) : (
                  availableAIs.map((ai) => (
                    <option key={ai.shortName} value={ai.shortName}>{ai.displayName}</option>
                  ))
                )}
              </select>
            )}
          </div>
        ))}

        <div className="flex gap-1 mt-1">
          {!isMyTeam && (
            <button
              className="flex-1 px-3 py-1 border border-dashed border-white/[0.06] rounded-lg transition-colors duration-500 hover:bg-white/20 text-sm text-center text-neutral-300 cursor-pointer"
              onClick={() => onJoin(team.id)}
            >
              Join
            </button>
          )}
          <button
            className="flex-1 px-3 py-1 border border-dashed border-white/[0.06] rounded-lg transition-colors duration-500 hover:bg-white/20 text-sm text-center text-neutral-500 cursor-pointer"
            onClick={() => onAddBot(team.id)}
          >
            + Bot
          </button>
        </div>
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
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS)
  const [currentTeam, setCurrentTeam] = useState<number | null>(null)
  const battleTitle = teams.map(t => t.players.length).join('v')

  const aiQuery = trpc.getAvailableAIs.useQuery()
  const availableAIs: AI[] = aiQuery.data ?? []
  const mapsQuery = trpc.getAvailableMaps.useQuery()
  const availableMaps = mapsQuery.data ?? []
  const startSkirmish = trpc.startSkirmish.useMutation()

  const [selectedMap, setSelectedMap] = useState('Speed Metal')
  const [startError, setStartError] = useState<string | null>(null)

  const battleInfo = {
    map: selectedMap,
  }
  function joinTeam(teamId: number): void {
    if (currentTeam === teamId) return
    setTeams((prevTeams) => prevTeams.map((team) => {
      if (team.id === teamId) return { ...team, players: [...team.players, { name: 'Player', isBot: false }] }
      if (team.id === currentTeam) return { ...team, players: team.players.filter(p => p.isBot) }
      return team
    }))
    setCurrentTeam(teamId)
  }

  function addBot(teamId: number): void {
    const defaultAI = availableAIs[0]?.shortName ?? ''
    setTeams((prevTeams) => prevTeams.map((team) => {
      if (team.id !== teamId) return team
      const botCount = team.players.filter(p => p.isBot).length
      return { ...team, players: [...team.players, { name: `Bot ${botCount + 1}`, isBot: true, aiShortName: defaultAI }] }
    }))
  }

  function setBotAI(teamId: number, playerIndex: number, aiShortName: string): void {
    setTeams((prevTeams) => prevTeams.map((team) => {
      if (team.id !== teamId) return team
      const players = team.players.map((p, i) => i === playerIndex ? { ...p, aiShortName } : p)
      return { ...team, players }
    }))
  }

  function handleStartGame(): void {
    setStartError(null)
    const hasPlayers = teams.some(t => t.players.length > 0)
    if (!hasPlayers) {
      setStartError('Add at least one player or bot to start')
      return
    }
    // Find the AI version for a given shortName
    function findAIVersion(shortName: string): string | undefined {
      return availableAIs.find(ai => ai.shortName === shortName)?.version
    }
    startSkirmish.mutate({
      mapName: selectedMap,
      teams: teams.map((team, i) => ({
        allyTeam: i,
        players: team.players.map(p => ({
          name: p.name,
          isBot: p.isBot,
          aiShortName: p.aiShortName,
          aiVersion: p.isBot ? findAIVersion(p.aiShortName ?? '') : undefined,
        }))
      }))
    }, {
      onError: (err) => setStartError(err.message),
      onSuccess: (data) => {
        if (!data.success) setStartError(data.error ?? 'Failed to start game')
      }
    })
  }

  return (
    <div className="h-full flex gap-3">
      {/* Left Half: Teams Section */}
      <GlassPanel className="flex-1 p-4 flex flex-col">
        {/* Battle Header */}
        <div className="mb-4 pb-3 border-b border-white/[0.06]">
          <h2 className="text-base font-normal tracking-wide text-white mb-1">{battleTitle}</h2>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
          </div>
        </div>
        <div className="flex-1 grid grid-cols-5 gap-3 min-h-0">

        <div>
          <div className=' border border-white/[0.06]'>
            <h3 className=" px-3  text-lg font-medium tracking-wide text-neutral-300 border-b">Spectators</h3>
              <div className='py-1 border border-dashed border-white/[0.06] transition-colors duration-500 hover:bg-white/20 text-sm text-center text-neutral-500'>
             Join
        </div>
          </div>
        </div>

        {/* Teams Grid - 2x2 */}
        <div className="flex-1 col-span-4 flexgap-3 min-h-0 overflow-auto space-y-4">
          {teams.map((team) => (
            <TeamBox key={team.id} team={team} theme={theme} onJoin={joinTeam} onAddBot={addBot} onSetBotAI={setBotAI} isMyTeam={currentTeam === team.id} availableAIs={availableAIs} />
          ))}
        </div>

        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm rounded-lg transition-all">
            Spectate
          </button>
          <div className="flex items-center gap-3">
            {startError && <span className="text-xs text-red-400">{startError}</span>}
            <button
              className={`px-5 py-2 ${theme.bg} ${theme.bgHover} text-white text-sm font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50`}
              onClick={handleStartGame}
              disabled={startSkirmish.isPending}
            >
              {startSkirmish.isPending ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        </div>
      </GlassPanel>

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
              <select
                value={selectedMap}
                onChange={(e) => setSelectedMap(e.target.value)}
                className="text-sm font-medium bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-white focus:outline-none focus:border-white/[0.15] cursor-pointer max-w-[200px] truncate"
              >
                {availableMaps.length === 0 ? (
                  <option value={selectedMap}>{selectedMap}</option>
                ) : (
                  availableMaps.map((m) => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))
                )}
              </select>
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
