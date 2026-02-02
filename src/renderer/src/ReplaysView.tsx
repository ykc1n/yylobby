import { useState } from 'react'
import {trpc} from '../utils/trpc'
import { useThemeStore, themeColors } from './themeStore'

// Hexagon grid pattern - proper honeycomb tiling
const hexGridSvg = `data:image/svg+xml,${encodeURIComponent(
  `<svg width="24" height="42" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0l12 7v14l-12 7-12-7V7z" fill="none" stroke="rgba(255,255,255,0.012)"/>
    <path d="M0 21l12 7v14l-12 7-12-7V28z" fill="none" stroke="rgba(255,255,255,0.012)"/>
    <path d="M24 21l12 7v14l-12 7-12-7V28z" fill="none" stroke="rgba(255,255,255,0.012)"/>
  </svg>`
)}`

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
    date: string
    players: PlayerData[]
    winners?: number[]
    teams: Record<number, PlayerData[]>
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

    const teamDivs = Object.entries(teams).map(([teamId, teamPlayers]) => (
        <div className={`flex flex-col gap-0.5 ${Number(teamId) === winners ? 'text-emerald-400/80' : 'text-red-400/70'}`} key={teamId}>
            {teamPlayers.map(player => (
                <p key={player.name} className="text-sm truncate">{player.name}</p>
            ))}
        </div>
    ))

    return (
        <div
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group shadow-lg
                ${props.selected
                    ? 'bg-gradient-to-br from-neutral-700/55 to-neutral-800/50 border border-white/20'
                    : 'bg-gradient-to-br from-neutral-800/45 to-neutral-900/35 hover:from-neutral-700/55 hover:to-neutral-800/50 border border-white/10 hover:border-white/20'
                }`}
            onClick={() => props.replaySelector(props.replayData.filename)}
        >
            <div className="flex items-start gap-3">
                {/* Map Preview */}
                <div className="w-14 h-14 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                </div>

                {/* Replay Info */}
                <div className="flex-1 min-w-0">
                    <div className="font-normal text-white/85 text-sm tracking-wide mb-1">{gameType} on {map}</div>
                    <div className="text-xs text-neutral-500 mb-2 tracking-wide">
                        {date ? new Date(date).toLocaleDateString() : 'Unknown'} · {durationMinutes} min
                    </div>
                    <div className='flex gap-3 text-sm tracking-wide'>
                        {teamDivs.flatMap((div, idx) => idx === 0 ? [div] : [
                            <span key={`vs-${idx}`} className="text-neutral-600 self-center text-xs">vs</span>,
                            div
                        ])}
                    </div>
                </div>

                {/* Play Icon on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className={`w-4 h-4 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
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

    const teamDivs = Object.entries(teams).map(([teamId, teamPlayers]) => (
        <div className={`flex flex-col gap-0.5 p-2.5 rounded-lg border ${Number(teamId) === winners ? 'text-emerald-400/80 border-emerald-500/10 bg-emerald-500/[0.03]' : 'text-red-400/70 border-red-500/10 bg-red-500/[0.03]'}`} key={teamId}>
            <div className="text-[10px] tracking-wide mb-0.5 opacity-50">
                {Number(teamId) === winners ? 'Winner' : 'Defeated'}
            </div>
            {teamPlayers.map(player => (
                <p key={player.name} className="text-sm truncate">{player.name}</p>
            ))}
        </div>
    ))

    const handlePlayReplay = ():void=>{
        props.playReplay.mutate({filename:props.replayData.filename})
    }

    return (
        <div className="bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl p-4 shadow-xl shadow-black/30">
            {/* Map Preview */}
            <div className="aspect-video bg-neutral-800/50 rounded-lg mb-4 flex items-center justify-center border border-white/10">
                <svg className="w-10 h-10 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            </div>

            <h3 className="text-base font-normal tracking-wide text-white/90 mb-1">{props.replayData.gameType} on {props.replayData.map}</h3>
            <div className="text-sm text-neutral-500 mb-4 tracking-wide">
                {props.replayData.date ? new Date(props.replayData.date).toLocaleString() : 'Unknown'} · {durationMinutes} min
            </div>

            {/* Teams */}
            <div className='flex gap-2 justify-center mb-4'>
                {teamDivs.flatMap((div, idx) => idx === 0 ? [div] : [
                    <span key={`vs-${idx}`} className="text-neutral-600 self-center text-xs">vs</span>,
                    div
                ])}
            </div>

            <div className='text-[11px] text-neutral-600 font-mono truncate mb-4 p-2 bg-neutral-800/50 rounded-lg border border-white/10'>
                {props.replayData.filename}
            </div>

            <button
                onClick={handlePlayReplay}
                className={`w-full py-2.5 ${theme.bg} ${theme.bgHover} text-white text-sm font-normal tracking-[0.1em] uppercase rounded-lg transition-all duration-200`}
            >
                <svg className="w-4 h-4 inline-block mr-2 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
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

    const allReplays = Array.from(replays.values())
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
        <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden">

            <div className='flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden min-h-0 min-w-0'>
                {/* Replay List */}
                <div className='col-span-2 flex flex-col overflow-hidden min-w-0'>
                    <div className="bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl flex-1 flex flex-col overflow-hidden relative shadow-xl shadow-black/30">
                        {/* Hex Grid Background */}
                        <div
                            className="absolute inset-0 opacity-100 pointer-events-none"
                            style={{ backgroundImage: `url("${hexGridSvg}")` }}
                        />
                        <div className="px-4 py-3 relative z-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-normal text-white/80 tracking-[0.12em] uppercase">Replays</h2>
                                <span className="text-xs text-neutral-500">{allReplays.length}</span>
                            </div>
                        </div>

                        <div className='flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1.5 relative z-10'>
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
                                       <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                       </svg>
                                       <p className="text-sm text-neutral-600">No replays found</p>
                                   </div>
                               )
                           ) : (
                               <div className="flex flex-col items-center justify-center h-full">
                                   <div className="relative w-10 h-10 mb-3">
                                       <div
                                           className="absolute top-0 left-0 w-full h-full border-2 rounded-full animate-spin"
                                           style={{ borderColor: `rgba(${theme.rgb}, 0.2)`, borderTopColor: `rgba(${theme.rgb}, 0.8)` }}
                                       ></div>
                                   </div>
                                   <div className="text-sm text-neutral-600">
                                       Loading...
                                   </div>
                               </div>
                           )}
                        </div>

                        {/* Pagination Controls */}
                        {replayQuery.isSuccess && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 p-3 relative z-10">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-500 hover:text-neutral-400 hover:bg-white/10 rounded"
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
                                                        className={`w-7 h-7 text-xs font-medium rounded-md transition-all duration-200
                                                            ${currentPage === page
                                                                ? `bg-white/20 ${theme.text}`
                                                                : "text-neutral-500 hover:text-neutral-400 hover:bg-white/10"
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
                                    className="px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-500 hover:text-neutral-400 hover:bg-white/10 rounded"
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
                        <div className="bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl p-6 text-center shadow-xl shadow-black/30">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-neutral-800/50 border border-white/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-neutral-600 text-sm">Select a replay</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
