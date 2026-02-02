import { useState } from 'react'
import { useThemeStore, themeColors } from '../../themeStore'

interface Mission {
  id: string
  name: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  status: 'locked' | 'available' | 'completed'
  chapter: number
}

const CAMPAIGNS = [
  {
    id: 'tutorial',
    name: 'Boot Camp',
    description: 'Learn the basics of Zero-K combat',
    missions: [
      { id: 't1', name: 'First Steps', description: 'Learn basic movement and construction', difficulty: 'Easy' as const, status: 'completed' as const, chapter: 1 },
      { id: 't2', name: 'Combat Training', description: 'Master the art of unit combat', difficulty: 'Easy' as const, status: 'completed' as const, chapter: 1 },
      { id: 't3', name: 'Economy 101', description: 'Build and manage your resource economy', difficulty: 'Easy' as const, status: 'available' as const, chapter: 1 },
      { id: 't4', name: 'Advanced Tactics', description: 'Learn advanced combat strategies', difficulty: 'Medium' as const, status: 'locked' as const, chapter: 1 },
    ]
  },
  {
    id: 'main',
    name: 'The Machine War',
    description: 'The main Zero-K campaign storyline',
    missions: [
      { id: 'm1', name: 'Awakening', description: 'The first signs of the machine uprising', difficulty: 'Medium' as const, status: 'available' as const, chapter: 1 },
      { id: 'm2', name: 'Gathering Storm', description: 'Rally your forces for the battles ahead', difficulty: 'Medium' as const, status: 'locked' as const, chapter: 1 },
      { id: 'm3', name: 'Steel Rain', description: 'Survive the orbital bombardment', difficulty: 'Hard' as const, status: 'locked' as const, chapter: 2 },
      { id: 'm4', name: 'Last Stand', description: 'Defend the final human stronghold', difficulty: 'Hard' as const, status: 'locked' as const, chapter: 2 },
    ]
  }
]

const difficultyColors = {
  Easy: 'text-green-400 bg-green-400/10 border-green-400/30',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/30'
}

export default function CampaignView(): JSX.Element {
  const [selectedCampaign, setSelectedCampaign] = useState(CAMPAIGNS[0].id)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const campaign = CAMPAIGNS.find(c => c.id === selectedCampaign)

  const completedCount = campaign?.missions.filter(m => m.status === 'completed').length ?? 0
  const totalCount = campaign?.missions.length ?? 0

  return (
    <div className="h-[calc(100vh-100px)] p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Campaign</h1>
          <p className="text-neutral-500">Experience the Zero-K story through challenging missions</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Campaign Selection */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Campaigns</h2>
            {CAMPAIGNS.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCampaign(c.id)
                  setSelectedMission(null)
                }}
                className={`w-full p-4 rounded-lg border text-left transition-all duration-300
                  ${selectedCampaign === c.id
                    ? `${theme.border} ${theme.bgSubtle}`
                    : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700'
                  }`}
              >
                <div className="font-medium text-white text-sm mb-1">{c.name}</div>
                <div className="text-xs text-neutral-500">{c.missions.length} missions</div>
              </button>
            ))}
          </div>

          {/* Mission List */}
          <div className="col-span-2">
            <div className="bg-black/30 backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Missions</h2>
                <div className="text-xs text-neutral-500">
                  {completedCount}/{totalCount} completed
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-neutral-800 rounded-full mb-4 overflow-hidden">
                <div
                  className={`h-full ${theme.bg} transition-all duration-500`}
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>

              <div className="space-y-2">
                {campaign?.missions.map((mission, idx) => (
                  <button
                    key={mission.id}
                    onClick={() => mission.status !== 'locked' && setSelectedMission(mission)}
                    disabled={mission.status === 'locked'}
                    className={`w-full p-4 rounded-lg border text-left transition-all duration-300 group
                      ${mission.status === 'locked'
                        ? 'border-neutral-800/50 bg-neutral-900/30 opacity-50 cursor-not-allowed'
                        : selectedMission?.id === mission.id
                          ? `${theme.border} ${theme.bgSubtle}`
                          : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Mission Number */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
                        ${mission.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : mission.status === 'locked'
                            ? 'bg-neutral-800 text-neutral-600'
                            : `${theme.bgSubtle} ${theme.text}`
                        }`}
                      >
                        {mission.status === 'completed' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : mission.status === 'locked' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>

                      {/* Mission Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white text-sm">{mission.name}</span>
                          <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border ${difficultyColors[mission.difficulty]}`}>
                            {mission.difficulty}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 truncate">{mission.description}</div>
                      </div>

                      {/* Play Icon */}
                      {mission.status === 'available' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className={`w-5 h-5 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mission Details */}
          <div>
            {selectedMission ? (
              <div className="bg-black/30 backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 rounded-lg p-4 sticky top-4">
                <div className="aspect-video bg-neutral-800/50 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{selectedMission.name}</h3>
                <p className="text-sm text-neutral-400 mb-4">{selectedMission.description}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Difficulty</span>
                    <span className={`px-2 py-0.5 text-xs uppercase tracking-wider rounded border ${difficultyColors[selectedMission.difficulty]}`}>
                      {selectedMission.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Status</span>
                    <span className={selectedMission.status === 'completed' ? 'text-green-400' : theme.text}>
                      {selectedMission.status === 'completed' ? 'Completed' : 'Available'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Chapter</span>
                    <span className="text-neutral-300">{selectedMission.chapter}</span>
                  </div>
                </div>

                <button className={`w-full py-5 font-semibold rounded-lg text-white ${theme.bg} ${theme.bgHover} transition-all duration-300 flex items-center justify-center`}>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  {selectedMission.status === 'completed' ? 'Replay Mission' : 'Start Mission'}
                </button>
              </div>
            ) : (
              <div className="bg-black/30 backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800/50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <p className="text-neutral-500 text-sm">Select a mission to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
