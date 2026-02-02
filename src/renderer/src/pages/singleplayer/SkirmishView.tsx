import { useState } from 'react'
import { useThemeStore, themeColors } from '../../themeStore'

interface AIPlayer {
  id: number
  name: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Brutal'
  team: number
}

const MAPS = [
  { id: 'speedmetal', name: 'Speed Metal', players: '2-8', size: 'Medium' },
  { id: 'comet', name: 'Comet Catcher', players: '2-4', size: 'Small' },
  { id: 'stronghold', name: 'Stronghold', players: '2-6', size: 'Large' },
  { id: 'quicksilver', name: 'Quicksilver', players: '2-4', size: 'Medium' },
  { id: 'tundra', name: 'Tundra', players: '2-8', size: 'Large' },
  { id: 'nuclear', name: 'Nuclear Winter', players: '2-4', size: 'Small' },
]

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Brutal'] as const

export default function SkirmishVeiw(): JSX.Element {
  const [selectedMap, setSelectedMap] = useState(MAPS[0].id)
  const [aiPlayers, setAiPlayers] = useState<AIPlayer[]>([
    { id: 1, name: 'AI Commander', difficulty: 'Medium', team: 2 }
  ])
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const addAI = (): void => {
    if (aiPlayers.length < 7) {
      setAiPlayers([...aiPlayers, {
        id: Date.now(),
        name: `AI Commander ${aiPlayers.length + 1}`,
        difficulty: 'Medium',
        team: 2
      }])
    }
  }

  const removeAI = (id: number): void => {
    setAiPlayers(aiPlayers.filter(ai => ai.id !== id))
  }

  const updateAIDifficulty = (id: number, difficulty: AIPlayer['difficulty']): void => {
    setAiPlayers(aiPlayers.map(ai =>
      ai.id === id ? { ...ai, difficulty } : ai
    ))
  }

  const updateAITeam = (id: number, team: number): void => {
    setAiPlayers(aiPlayers.map(ai =>
      ai.id === id ? { ...ai, team } : ai
    ))
  }

  const selectedMapData = MAPS.find(m => m.id === selectedMap)

  return (
    <div className="h-[calc(100vh-100px)] p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Skirmish Setup</h1>
          <p className="text-neutral-500">Configure your battle against AI opponents</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Map Selection */}
          <div className="col-span-2 space-y-4">
            <div className="bg-black/30 backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 rounded-lg p-4">
              <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Select Map</h2>

              <div className="grid grid-cols-3 gap-3">
                {MAPS.map(map => (
                  <button
                    key={map.id}
                    onClick={() => setSelectedMap(map.id)}
                    className={`relative p-4 rounded-lg border transition-all duration-300 text-left
                      ${selectedMap === map.id
                        ? `${theme.border} ${theme.bgSubtle}`
                        : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                      }`}
                  >
                    {selectedMap === map.id && (
                      <div
                        className={`absolute top-2 right-2 w-2 h-2 ${theme.bg} rounded-full`}
                        style={{ boxShadow: `0 0 6px rgba(${theme.rgb}, 0.5)` }}
                      />
                    )}
                    <div className="aspect-video bg-neutral-800/50 rounded mb-3 flex items-center justify-center">
                      <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div className="font-medium text-white text-sm">{map.name}</div>
                    <div className="text-xs text-neutral-500 mt-1">{map.players} players • {map.size}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Game Settings */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 rounded-lg p-4">
              <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Game Settings</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-2">Starting Resources</label>
                  <select className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/40">
                    <option>Normal</option>
                    <option>Low</option>
                    <option>High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-500 mb-2">Game Speed</label>
                  <select className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/40">
                    <option>Normal (1x)</option>
                    <option>Fast (1.5x)</option>
                    <option>Very Fast (2x)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Players Panel */}
          <div className="space-y-4">
            {/* You */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 rounded-lg p-4">
              <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Your Team</h2>

              <div className={`p-3 ${theme.bgSubtle} border ${theme.border} rounded-lg`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${theme.bgSubtle} rounded-lg flex items-center justify-center`}>
                    <svg className={`w-5 h-5 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">You</div>
                    <div className={`text-xs ${theme.text}`}>Team 1</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Players */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">AI Opponents</h2>
                <button
                  onClick={addAI}
                  disabled={aiPlayers.length >= 7}
                  className={`text-xs ${theme.text} hover:opacity-80 disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors`}
                >
                  + Add AI
                </button>
              </div>

              <div className="space-y-2">
                {aiPlayers.map(ai => (
                  <div key={ai.id} className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm">{ai.name}</div>
                      </div>
                      <button
                        onClick={() => removeAI(ai.id)}
                        className="text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={ai.difficulty}
                        onChange={(e) => updateAIDifficulty(ai.id, e.target.value as AIPlayer['difficulty'])}
                        className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:outline-none"
                      >
                        {DIFFICULTIES.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                      <select
                        value={ai.team}
                        onChange={(e) => updateAITeam(ai.id, parseInt(e.target.value))}
                        className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs text-white focus:outline-none"
                      >
                        <option value={1}>Team 1 (Ally)</option>
                        <option value={2}>Team 2 (Enemy)</option>
                      </select>
                    </div>
                  </div>
                ))}

                {aiPlayers.length === 0 && (
                  <div className="text-center py-4 text-neutral-600 text-sm">
                    No AI opponents added
                  </div>
                )}
              </div>
            </div>

            {/* Start Button */}
            <button className={`w-full py-6 text-lg font-semibold rounded-lg text-white ${theme.bg} ${theme.bgHover} transition-all duration-300 flex items-center justify-center`}>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Launch Skirmish
            </button>

            {/* Selected Map Info */}
            {selectedMapData && (
              <div className="text-center text-xs text-neutral-600">
                {selectedMapData.name} • {selectedMapData.size} map • {aiPlayers.length + 1} players
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
