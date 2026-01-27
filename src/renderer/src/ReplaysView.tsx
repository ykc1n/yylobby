import { useState } from 'react'
import {trpc} from '../utils/trpc'
import { useThemeStore, themeColors } from './themeStore'

interface PlayerData {
    name: string
    [key: string]: unknown
}

interface ReplayData {
    filename: string
    map: string
    game: string
    gameType: string
    duration: number
    date: Date
    players: PlayerData[]
    winners?: number[]
    teams: Map<number, PlayerData[]>
}

function Replay(props:{
    replaySelector: (filename: string) => void
    replayData: ReplayData
    selected: boolean
    theme: typeof themeColors[keyof typeof themeColors]
}):JSX.Element{

    const map = props.replayData.map
    const date = props.replayData.date
    const gameType = props.replayData.gameType
    const durationMinutes = Math.floor(props.replayData.duration / 60000)
    const winners = props.replayData.winners?.[0]
    const teams = props.replayData.teams
    const theme = props.theme

    const teamDivs = teams.keys().map(team=>(
        <div className={`flex flex-col gap-1 ${team==winners? 'text-emerald-400' : 'text-red-400'}`} key={`${team}`}>
            {teams.get(team)?.map(player => (
                <p key={player.name} className="text-sm truncate">{player.name}</p>
            ))}
        </div>
    )).toArray()

    return (
        <div
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 group
                ${props.selected
                    ? `${theme.border} ${theme.bgSubtle}`
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
            onClick={() => props.replaySelector(props.replayData.filename)}
        >
            <div className="flex items-start gap-4">
                {/* Map Preview */}
                <div className="w-16 h-16 rounded-lg bg-neutral-800/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                </div>

                {/* Replay Info */}
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm mb-1">{gameType} on {map}</div>
                    <div className="text-xs text-neutral-500 mb-3">
                        {date ? new Date(date).toLocaleDateString() : 'Unknown'} • {durationMinutes} min
                    </div>
                    <div className='flex gap-3 text-sm'>
                        {teamDivs.flatMap((div, idx) => idx === 0 ? [div] : [
                            <span key={`vs-${idx}`} className="text-neutral-600 self-center font-medium">vs</span>,
                            div
                        ])}
                    </div>
                </div>

                {/* Play Icon on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className={`w-5 h-5 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                </div>
            </div>
        </div>
    )
}


function SelectedReplay(props:{
    replayData:ReplayData
    playReplay: ReturnType<typeof trpc.openReplay.useMutation>
    theme: typeof themeColors[keyof typeof themeColors]
}):JSX.Element{
    const teams = props.replayData.teams
    const winners = props.replayData.winners?.[0]
    const durationMinutes = Math.floor(props.replayData.duration / 60000)
    const theme = props.theme

    const teamDivs = teams.keys().map(team=>(
        <div className={`flex flex-col gap-1 p-3 rounded-lg border ${team==winners? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-red-400 border-red-500/20 bg-red-500/5'}`} key={`${team}`}>
            <div className="text-[10px] uppercase tracking-wider mb-1 opacity-60">
                {team==winners ? 'Winner' : 'Defeated'}
            </div>
            {teams.get(team)?.map(player => (
                <p key={player.name} className="text-sm truncate">{player.name}</p>
            ))}
        </div>
    )).toArray()

    const handlePlayReplay = ():void=>{
        props.playReplay.mutate({filename:props.replayData.filename})
    }

    return (
        <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg p-4">
            {/* Map Preview */}
            <div className="aspect-video bg-neutral-800/50 rounded-lg mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            </div>

            <h3 className="text-lg font-semibold text-white mb-1">{props.replayData.gameType} on {props.replayData.map}</h3>
            <div className="text-sm text-neutral-500 mb-4">
                {props.replayData.date ? new Date(props.replayData.date).toLocaleString() : 'Unknown'} • {durationMinutes} min
            </div>

            {/* Teams */}
            <div className='flex gap-3 justify-center mb-4'>
                {teamDivs.flatMap((div, idx) => idx === 0 ? [div] : [
                    <span key={`vs-${idx}`} className="text-neutral-600 self-center font-semibold">VS</span>,
                    div
                ])}
            </div>

            <div className='text-xs text-neutral-600 font-mono truncate mb-4 p-2 bg-neutral-900/50 rounded'>
                {props.replayData.filename}
            </div>

            <button
                onClick={handlePlayReplay}
                className={`w-full py-3 ${theme.bg} ${theme.bgHover} text-white text-sm font-semibold rounded-lg transition-all duration-200 ${theme.shadow} ${theme.shadowHover}`}
            >
                <svg className="w-4 h-4 inline-block mr-2 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
                Play Replay
            </button>
        </div>
    )
}

const ITEMS_PER_PAGE = 10

export default function ReplaysVeiw():JSX.Element{
    const [selectedGame, setSelectedGame] = useState<'zerok' | 'bar'>('zerok')
    const [currentPage, setCurrentPage] = useState(1)
    const replayQuery = trpc.getReplays.useQuery({ game: selectedGame })
    const replayOpener = trpc.openReplay.useMutation()
    const replays = new Map<string, ReplayData>()
    const [selectedReplay,setSelectedReplay] = useState("");
    const themeColor = useThemeStore((state) => state.themeColor)
    const theme = themeColors[themeColor]

    if(replayQuery.isSuccess && Array.isArray(replayQuery.data.data)){
        replayQuery.data.data.forEach((replay: ReplayData) => replays.set(replay.filename, replay));
    }

    const allReplays = replays.values().toArray()
    const totalPages = Math.ceil(allReplays.length / ITEMS_PER_PAGE)
    const paginatedReplays = allReplays.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Reset to page 1 when game changes
    const handleGameChange = (game: 'zerok' | 'bar'): void => {
        setSelectedGame(game)
        setCurrentPage(1)
        setSelectedReplay("")
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950">
            {/* Game Type Tabs */}
            <div className='flex gap-2 p-4 border-b border-neutral-800/50'>
                <button
                    onClick={() => handleGameChange('zerok')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                        ${selectedGame === 'zerok'
                            ? `${theme.bgSubtle} ${theme.text} border ${theme.border}`
                            : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent'
                        }`}
                >
                    Zero-K
                </button>
                <button
                    onClick={() => handleGameChange('bar')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                        ${selectedGame === 'bar'
                            ? `${theme.bgSubtle} ${theme.text} border ${theme.border}`
                            : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent'
                        }`}
                >
                    Beyond All Reason
                </button>
            </div>

            <div className='flex-1 grid grid-cols-3 gap-6 p-6 overflow-hidden min-h-0 min-w-0'>
                {/* Replay List */}
                <div className='col-span-2 flex flex-col overflow-hidden min-w-0'>
                    <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg flex-1 flex flex-col overflow-hidden">
                        <div className="px-4 py-3 border-b border-neutral-800/50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium text-white uppercase tracking-wider">Your Replays</h2>
                                <span className="text-xs text-neutral-500">{allReplays.length} replays</span>
                            </div>
                        </div>

                        <div className='flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2'>
                           {replayQuery.isSuccess ? (
                               paginatedReplays.length > 0 ? (
                                   paginatedReplays.map(replay => {
                                        const selected = replay.filename === selectedReplay
                                        return <Replay
                                            key={replay.filename}
                                            replaySelector={setSelectedReplay}
                                            replayData={replay}
                                            selected={selected}
                                            theme={theme}
                                        />
                                   })
                               ) : (
                                   <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                                       <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                       </svg>
                                       <p className="text-sm">No replays found</p>
                                   </div>
                               )
                           ) : (
                               <div className="flex flex-col items-center justify-center h-full">
                                   <div className="relative w-12 h-12 mb-4">
                                       <div
                                           className="absolute top-0 left-0 w-full h-full border-4 rounded-full animate-spin"
                                           style={{ borderColor: `rgba(${theme.rgb}, 0.3)`, borderTopColor: `rgba(${theme.rgb}, 1)` }}
                                       ></div>
                                   </div>
                                   <div className="text-sm text-neutral-500">
                                       Loading replays...
                                   </div>
                               </div>
                           )}
                        </div>

                        {/* Pagination Controls */}
                        {replayQuery.isSuccess && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 p-3 border-t border-neutral-800/50">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-400 ${theme.textHover} hover:bg-white/5 rounded`}
                                >
                                    Prev
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => {
                                            return page === 1 ||
                                                   page === totalPages ||
                                                   Math.abs(page - currentPage) <= 1
                                        })
                                        .map((page, idx, arr) => {
                                            const prevPage = arr[idx - 1]
                                            const showEllipsis = prevPage && page - prevPage > 1

                                            return (
                                                <span key={page} className="flex items-center">
                                                    {showEllipsis && (
                                                        <span className="px-2 text-neutral-600">...</span>
                                                    )}
                                                    <button
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-8 h-8 text-xs font-medium rounded transition-all duration-200
                                                            ${currentPage === page
                                                                ? `${theme.bgSubtle} ${theme.text}`
                                                                : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </span>
                                            )
                                        })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1.5 text-xs font-medium tracking-wider uppercase transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-400 ${theme.textHover} hover:bg-white/5 rounded`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Replay Details */}
                <div className="overflow-y-auto min-w-0">
                    {selectedReplay && replays.has(selectedReplay) ? (
                        <SelectedReplay
                            replayData={replays.get(selectedReplay)!}
                            playReplay={replayOpener}
                            theme={theme}
                        />
                    ) : (
                        <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800/50 flex items-center justify-center">
                                <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-neutral-500 text-sm">Select a replay to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
