import { useEffect, useRef, useState } from 'react'
import {trpc} from '../../../utils/trpc'
import { useThemeStore, themeColors } from '../../themeStore'
import { GlassPanel } from '../../components/GlassPanel'
import { MapThumbnail } from '../../components/MapThumbnail'

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
    mapThumbnailPath?: string | null
    game: string
    gameType: string
    duration: number
    date: string
    players: PlayerData[]
    winners?: number[]
    teams: Record<number, PlayerData[]>
    hasAnalysis: boolean
}

interface ReplayAnalysisStatusData {
    filename: string
    status: 'queued' | 'running'
    queuedAt: number
    startedAt?: number
    progress: number
}

function AnalysisStatusBadge(props: { analysisStatus: ReplayAnalysisStatusData }): JSX.Element {
    return (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide border ${
            props.analysisStatus.status === 'running'
                ? 'text-amber-300 border-amber-500/30 bg-amber-500/10'
                : 'text-sky-300 border-sky-500/30 bg-sky-500/10'
        }`}>
            {props.analysisStatus.status === 'running' ? 'Analyzing' : 'Queued'}
        </span>
    )
}

function AnalysisCompleteBadge(): JSX.Element {
    return (
        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide border text-emerald-300 border-emerald-500/30 bg-emerald-500/10">
            Analyzed
        </span>
    )
}

function AnalysisProgressBar(props: { analysisStatus: ReplayAnalysisStatusData; compact?: boolean }): JSX.Element {
    return (
        <div className={`${props.compact ? 'mt-2' : 'mt-3'} h-1.5 rounded-full bg-white/[0.05] overflow-hidden`}>
            <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                    props.analysisStatus.status === 'running'
                        ? 'bg-gradient-to-r from-amber-400/90 via-amber-300/80 to-amber-200/75'
                        : 'bg-gradient-to-r from-sky-400/90 via-sky-300/80 to-sky-200/75'
                }`}
                style={{ width: `${Math.max(props.analysisStatus.progress, 3)}%` }}
            />
        </div>
    )
}

function Replay(props:{
    replaySelector: (filename: string) => void
    replayData: ReplayData
    selected: boolean
    theme: typeof themeColors[keyof typeof themeColors]
    analysisStatus?: ReplayAnalysisStatusData
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
                <MapThumbnail
                    mapName={props.replayData.map}
                    thumbnailPath={props.replayData.mapThumbnailPath}
                    className="w-14 h-14 rounded-lg flex-shrink-0"
                    iconClassName="w-6 h-6 text-neutral-600"
                    compactFallback
                />

                {/* Replay Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="font-normal text-white/85 text-sm tracking-wide min-w-0 truncate">{gameType} on {map}</div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            {props.replayData.hasAnalysis && <AnalysisCompleteBadge />}
                            {props.analysisStatus && <AnalysisStatusBadge analysisStatus={props.analysisStatus} />}
                        </div>
                    </div>
                    <div className="text-xs text-neutral-500 mb-2 tracking-wide">
                        {date ? new Date(date).toLocaleDateString() : 'Unknown'} · {durationMinutes} min
                    </div>
                    {props.analysisStatus && (
                        <AnalysisProgressBar analysisStatus={props.analysisStatus} compact />
                    )}
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


function frameToTime(frame: number): string {
    const totalSeconds = Math.floor(frame / 30)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

interface AnalysisResultData {
    success: boolean
    error?: string
    players: Array<{ name: string; teamId: number; elo: number; isAI?: boolean }>
    winner?: string
    durationFrames?: number
    events: Array<{ frame: number; type: string; team?: number; unitName?: string; description: string }>
    endGameStats?: { headers: string[]; values: number[][] }
    firstFactories?: Array<{ name: string; teamId: number; factoryName: string; frame: number; isAI?: boolean }>
}

function hasMeaningfulAnalysisData(data: AnalysisResultData | null | undefined): boolean {
    if (!data?.success) {
        return false
    }

    return data.players.length > 0 ||
        data.events.length > 0 ||
        (data.firstFactories?.length ?? 0) > 0 ||
        (data.endGameStats?.values.length ?? 0) > 0
}

function AnalysisResults({ data, theme }: { data: AnalysisResultData; theme: typeof themeColors[keyof typeof themeColors] }): JSX.Element {
    if (!data.success) {
        return (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                Analysis failed: {data.error}
            </div>
        )
    }

    if (!hasMeaningfulAnalysisData(data)) {
        return (
            <div className="mt-3 p-3 rounded-lg bg-neutral-800/50 border border-white/10 text-sm text-neutral-400">
                Analysis completed, but no replay data was extracted.
            </div>
        )
    }

    return (
        <div className="mt-3 space-y-3">
            {/* First Factories */}
            {data.firstFactories && data.firstFactories.length > 0 && (
                <div className="p-3 rounded-lg bg-neutral-800/50 border border-white/10">
                    <div className="text-[10px] tracking-wide text-neutral-500 uppercase mb-2">First Factories</div>
                    <div className="space-y-2">
                        {data.firstFactories.map((factory) => (
                            <div key={`${factory.teamId}-${factory.factoryName}`} className="flex items-center justify-between gap-3 text-sm">
                                <div className="min-w-0">
                                    <div className="text-neutral-200 truncate">
                                        {factory.name}
                                        {factory.isAI && <span className="text-neutral-600 text-xs ml-1">(AI)</span>}
                                    </div>
                                    <div className="text-xs text-neutral-500 truncate">{factory.factoryName}</div>
                                </div>
                                <div className={`${theme.text} text-xs font-mono shrink-0`}>
                                    {frameToTime(factory.frame)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Players */}
            {data.players.length > 0 && (
                <div className="p-3 rounded-lg bg-neutral-800/50 border border-white/10">
                    <div className="text-[10px] tracking-wide text-neutral-500 uppercase mb-2">Players</div>
                    <div className="space-y-1">
                        {data.players.map((p) => (
                            <div key={`${p.name}-${p.teamId}`} className={`flex items-center justify-between text-sm ${data.winner && p.name === data.winner ? 'text-emerald-400' : 'text-neutral-300'}`}>
                                <span className="truncate">
                                    {p.name}
                                    {p.isAI && <span className="text-neutral-600 text-xs ml-1">(AI)</span>}
                                    {data.winner && p.name === data.winner && <span className="text-emerald-500 text-xs ml-1">Winner</span>}
                                </span>
                                <span className="text-neutral-500 text-xs ml-2">Team {p.teamId} · {p.elo} ELO</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Duration */}
            {data.durationFrames && (
                <div className="text-xs text-neutral-500">
                    Game duration: {frameToTime(data.durationFrames)}
                </div>
            )}

            {/* Key Events */}
            {data.events.length > 0 && (
                <div className="p-3 rounded-lg bg-neutral-800/50 border border-white/10">
                    <div className="text-[10px] tracking-wide text-neutral-500 uppercase mb-2">Events ({data.events.length})</div>
                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                        {data.events.slice(0, 200).map((evt, i) => (
                            <div key={i} className="flex gap-2 text-xs">
                                <span className={`${theme.text} font-mono shrink-0 w-12 text-right`}>{frameToTime(evt.frame)}</span>
                                <span className="text-neutral-400 truncate">{evt.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* End Game Stats Summary */}
            {data.endGameStats && data.endGameStats.values.length > 0 && (
                <div className="p-3 rounded-lg bg-neutral-800/50 border border-white/10">
                    <div className="text-[10px] tracking-wide text-neutral-500 uppercase mb-2">End Game Stats</div>
                    <div className="max-h-32 overflow-y-auto">
                        <div className="text-xs text-neutral-500 font-mono">
                            {data.endGameStats.headers.slice(0, 10).map((h, i) => {
                                const lastRow = data.endGameStats!.values[data.endGameStats!.values.length - 1]
                                return (
                                    <div key={i} className="flex justify-between">
                                        <span className="truncate mr-2">{h}</span>
                                        <span className="text-neutral-300">{lastRow?.[i]?.toFixed(0) ?? '-'}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function SelectedReplay(props:{
    replayData:ReplayData
    playReplay: ReturnType<typeof trpc.openReplay.useMutation>
    theme: typeof themeColors[keyof typeof themeColors]
    analysisStatus?: ReplayAnalysisStatusData
}):JSX.Element{
    const teams = props.replayData.teams
    const winners = props.replayData.winners?.[0]
    const durationMinutes = Math.floor(props.replayData.duration / 60000)
    const theme = props.theme
    const utils = trpc.useUtils()
    const analysisQuery = trpc.getReplayAnalysis.useQuery(
        { filename: props.replayData.filename },
        {
            refetchInterval: props.analysisStatus ? 1000 : false,
            refetchIntervalInBackground: true
        }
    )
    const analyzeReplay = trpc.analyzeReplay.useMutation({
        onMutate: async () => {
            utils.getReplayAnalysisStatuses.setData(undefined, (current) => {
                const next = current ? [...current] : []
                if (next.some((status) => status.filename === props.replayData.filename)) {
                    return next
                }
                next.push({
                    filename: props.replayData.filename,
                    status: 'queued',
                    queuedAt: Date.now(),
                    progress: 6
                })
                return next
            })
        },
        onSettled: async () => {
            await utils.getReplayAnalysis.invalidate({ filename: props.replayData.filename })
            await utils.getReplayAnalysisStatuses.invalidate()
            await utils.getReplays.invalidate()
        }
    })
    const previousAnalysisStatus = useRef<ReplayAnalysisStatusData | undefined>(props.analysisStatus)

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

    const handleAnalyze = (): void => {
        analyzeReplay.mutate({ filename: props.replayData.filename })
    }

    const cachedAnalysis = analysisQuery.data as AnalysisResultData | null | undefined
    const displayedAnalysis = hasMeaningfulAnalysisData(cachedAnalysis) ? cachedAnalysis : null
    const failedAnalysis = analyzeReplay.data && !analyzeReplay.data.success ? analyzeReplay.data as AnalysisResultData : null
    const analyzeButtonLabel = props.analysisStatus
        ? props.analysisStatus.status === 'queued' ? 'Queued...' : 'Analyzing...'
        : displayedAnalysis ? 'Re-analyze Replay' : 'Analyze Replay'

    useEffect(() => {
        if (previousAnalysisStatus.current && !props.analysisStatus) {
            void analysisQuery.refetch()
        }
        previousAnalysisStatus.current = props.analysisStatus
    }, [analysisQuery, props.analysisStatus])

    return (
        <GlassPanel className="p-4">
            {/* Map Preview */}
            <MapThumbnail
                mapName={props.replayData.map}
                thumbnailPath={props.replayData.mapThumbnailPath}
                className="aspect-video rounded-lg mb-4 border border-white/10 bg-neutral-800/50"
                iconClassName="w-10 h-10 text-neutral-700"
            />

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

            {(props.analysisStatus || props.replayData.hasAnalysis) && (
                <div className="mb-4 rounded-lg border border-white/10 bg-neutral-800/45 px-3 py-3">
                    <div className="flex items-center gap-2">
                        {props.replayData.hasAnalysis && <AnalysisCompleteBadge />}
                        {props.analysisStatus && <AnalysisStatusBadge analysisStatus={props.analysisStatus} />}
                    </div>
                    <p className="mt-2 text-sm text-neutral-400">
                        {props.analysisStatus
                            ? displayedAnalysis
                                ? 'A fresh analysis is running. Saved results remain visible until it finishes.'
                                : 'This replay is being analyzed now.'
                            : 'Saved replay analysis is available on disk.'}
                    </p>
                    {props.analysisStatus && <AnalysisProgressBar analysisStatus={props.analysisStatus} />}
                </div>
            )}

            <button
                onClick={handlePlayReplay}
                className={`w-full py-2.5 ${theme.bg} ${theme.bgHover} text-white text-sm font-normal tracking-[0.1em] uppercase rounded-lg transition-all duration-200`}
            >
                <svg className="w-4 h-4 inline-block mr-2 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
                Play Replay
            </button>

            <div className="mt-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-[10px] tracking-wide text-neutral-500 uppercase">Analysis</div>
                    {props.replayData.hasAnalysis && !props.analysisStatus && <AnalysisCompleteBadge />}
                </div>

                <div className="mb-3 rounded-lg bg-neutral-800/50 border border-white/10 p-3">
                    <p className="text-sm text-neutral-400 mb-3">
                        {props.analysisStatus
                            ? 'Analysis is in progress. You can stay on this replay or switch away and come back.'
                            : displayedAnalysis
                                ? 'Saved analysis is shown below. Re-analyze to refresh stale or outdated data.'
                                : 'This replay has not been analyzed yet.'}
                    </p>
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzeReplay.isPending || Boolean(props.analysisStatus)}
                        className={`w-full py-2.5 bg-neutral-700/50 hover:bg-neutral-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-normal tracking-[0.1em] uppercase rounded-lg transition-all duration-200 border border-white/10`}
                    >
                        {analyzeReplay.isPending || props.analysisStatus ? (
                            <>
                                <div
                                    className="w-4 h-4 inline-block mr-2 -mt-0.5 border-2 rounded-full animate-spin"
                                    style={{ borderColor: `rgba(${theme.rgb}, 0.2)`, borderTopColor: `rgba(${theme.rgb}, 0.8)` }}
                                />
                                {analyzeButtonLabel}
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 inline-block mr-2 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                {analyzeButtonLabel}
                            </>
                        )}
                    </button>
                </div>

                {displayedAnalysis && (
                    <AnalysisResults data={displayedAnalysis} theme={theme} />
                )}

                {!displayedAnalysis && analysisQuery.isPending && !props.analysisStatus && (
                    <div className="p-3 rounded-lg bg-neutral-800/50 border border-white/10 text-sm text-neutral-500">
                        Loading saved analysis...
                    </div>
                )}

                {failedAnalysis && (
                    <AnalysisResults data={failedAnalysis} theme={theme} />
                )}
            </div>
        </GlassPanel>
    )
}

const ITEMS_PER_PAGE = 10

export default function ReplaysVeiw():JSX.Element{
    const [selectedGame, setSelectedGame] = useState<'zerok' | 'bar'>('zerok')
    const [currentPage, setCurrentPage] = useState(1)
    const replayQuery = trpc.getReplays.useQuery({ game: selectedGame })
    const analysisStatusQuery = trpc.getReplayAnalysisStatuses.useQuery(undefined, {
        refetchInterval: 1000,
        refetchIntervalInBackground: true
    })
    const replayOpener = trpc.openReplay.useMutation()
    const replays = new Map<string, ReplayData>()
    const [selectedReplay,setSelectedReplay] = useState("");
    const themeColor = useThemeStore((state) => state.themeColor)
    const theme = themeColors[themeColor]
    const analysisStatuses = analysisStatusQuery.data ?? []

    const getAnalysisStatus = (filename: string): ReplayAnalysisStatusData | undefined => {
        return analysisStatuses.find((status) => status.filename === filename)
    }

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
            {analysisStatuses.length > 0 && (
                <div className="mx-4 mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
                    <div className="mb-3 text-sm text-amber-200/90 tracking-wide">
                            {analysisStatuses.length === 1 ? '1 replay is being analyzed' : `${analysisStatuses.length} replays are being analyzed`}
                    </div>
                    <div className="space-y-2">
                        {analysisStatuses.map((status) => (
                            <div key={status.filename} className="rounded-lg border border-white/10 bg-black/10 px-3 py-2">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 text-sm text-neutral-200 truncate">{status.filename}</div>
                                    <AnalysisStatusBadge analysisStatus={status} />
                                </div>
                                <AnalysisProgressBar analysisStatus={status} compact />
                            </div>
                        ))}
                        </div>
                </div>
            )}

            <div className='flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden min-h-0 min-w-0'>
                {/* Replay List */}
                <div className='col-span-2 flex flex-col overflow-hidden min-w-0'>
                    <GlassPanel className="flex-1 flex flex-col overflow-hidden relative">
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
                                            analysisStatus={getAnalysisStatus(replay.filename)}
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
                    </GlassPanel>
                </div>

                {/* Selected Replay Details */}
                <div className="overflow-y-auto min-w-0">
                    {selectedReplay && replays.has(selectedReplay) ? (
                        <SelectedReplay
                            key={selectedReplay}
                            replayData={replays.get(selectedReplay)!}
                            playReplay={replayOpener}
                            theme={theme}
                            analysisStatus={getAnalysisStatus(selectedReplay)}
                        />
                    ) : (
                        <GlassPanel className="p-6 text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-neutral-800/50 border border-white/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-neutral-600 text-sm">Select a replay</p>
                        </GlassPanel>
                    )}
                </div>
            </div>
        </div>
    )
}
