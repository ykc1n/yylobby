import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { DemoParser } from 'sdfz-demo-parser'
import type { SettingsManager } from './settings'
import { hasMeaningfulAnalysisData, type AnalysisResult } from './replay_analyzer'

interface ParsedReplay {
    filename: string
    map: string
    game: string
    gameType: string
    duration: number
    date: string
    players: Array<{ name: string; allyTeamId: number; [key: string]: unknown }>
    winners?: number[]
    teams: Record<number, Array<{ name: string; [key: string]: unknown }>>
    cachedAt: number  // file mtime when cached
}

export interface ReplayListItem extends ParsedReplay {
    hasAnalysis: boolean
}

interface ReplayMetadataCache {
    version: number
    replays: Record<string, ParsedReplay>  // keyed by filename
}

interface ReplayAnalysisCache {
    version: number
    analyses: Record<string, { analysis: AnalysisResult; cachedAt: number; savedAt: number }>
}

export interface ReplayAnalysisStatus {
    filename: string
    status: 'queued' | 'running'
    queuedAt: number
    startedAt?: number
    progress: number
}

interface ReplayAnalysisJob {
    filename: string
    runAnalysis: () => Promise<AnalysisResult>
    resolve: (result: AnalysisResult) => void
    reject: (error: unknown) => void
    queuedAt: number
}

const REPLAY_CACHE_VERSION = 2
const ANALYSIS_CACHE_VERSION = 1

export class ReplayManager {
    private settingsManager: SettingsManager
    private cachePath: string
    private analysisCachePath: string
    private replayCache: ReplayMetadataCache = { version: REPLAY_CACHE_VERSION, replays: {} }
    private analysisCache: ReplayAnalysisCache = { version: ANALYSIS_CACHE_VERSION, analyses: {} }
    private replayFiles: Array<{ filename: string; mtime: number; directory: string }> = []
    private parser = new DemoParser()
    private isInitialized = false
    private initPromise: Promise<void> | null = null
    private analysisQueue: ReplayAnalysisJob[] = []
    private analysisStatuses = new Map<string, ReplayAnalysisStatus>()
    private activeAnalysisPromises = new Map<string, Promise<AnalysisResult>>()
    private isProcessingAnalysisQueue = false

    constructor(settingsManager: SettingsManager) {
        this.settingsManager = settingsManager

        // Use app.getPath for proper user data location
        const userDataPath = app.getPath('userData')
        this.cachePath = path.join(userDataPath, 'replay-cache.json')
        this.analysisCachePath = path.join(userDataPath, 'replay-analysis-cache.json')

        // Start initialization in background
        this.initPromise = this.initialize()
    }

    getBaseReplayPath(): string {
        return path.join(this.settingsManager.getZeroKDirectory(), 'demos')
    }

    refreshPaths(): void {
        // Re-scan replay directories when settings change
        this.scanReplayDirectory()
    }

    private async initialize(): Promise<void> {
        // Load existing cache from disk
        this.loadReplayCache()
        this.loadAnalysisCache()

        // Scan replay directory
        await this.scanReplayDirectory()

        this.isInitialized = true
    }

    private loadReplayCache(): void {
        try {
            if (fs.existsSync(this.cachePath)) {
                const data = fs.readFileSync(this.cachePath, 'utf-8')
                const loaded = JSON.parse(data) as { version?: number; replays?: Record<string, ParsedReplay>; analyses?: Record<string, { analysis: AnalysisResult; cachedAt: number; savedAt?: number }> }

                // Check cache version compatibility
                if (loaded.version === REPLAY_CACHE_VERSION || loaded.version === 1) {
                    this.replayCache = {
                        version: REPLAY_CACHE_VERSION,
                        replays: loaded.replays ?? {}
                    }
                    console.log(`[ReplayManager] Loaded ${Object.keys(this.replayCache.replays).length} cached replays`)

                    if (!fs.existsSync(this.analysisCachePath) && loaded.analyses) {
                        this.analysisCache = {
                            version: ANALYSIS_CACHE_VERSION,
                            analyses: Object.fromEntries(
                                Object.entries(loaded.analyses).map(([filename, entry]) => [
                                    filename,
                                    {
                                        analysis: entry.analysis,
                                        cachedAt: entry.cachedAt,
                                        savedAt: entry.savedAt ?? Date.now()
                                    }
                                ])
                            )
                        }
                        this.saveAnalysisCache()
                    }
                } else {
                    console.log('[ReplayManager] Cache version mismatch, starting fresh')
                }
            }
        } catch (error) {
            console.error('[ReplayManager] Failed to load cache:', error)
        }
    }

    private loadAnalysisCache(): void {
        try {
            if (fs.existsSync(this.analysisCachePath)) {
                const data = fs.readFileSync(this.analysisCachePath, 'utf-8')
                const loaded = JSON.parse(data) as ReplayAnalysisCache
                if (loaded.version === ANALYSIS_CACHE_VERSION) {
                    this.analysisCache = {
                        version: ANALYSIS_CACHE_VERSION,
                        analyses: loaded.analyses ?? {}
                    }
                    console.log(`[ReplayManager] Loaded ${Object.keys(this.analysisCache.analyses).length} cached replay analyses`)
                }
            }
        } catch (error) {
            console.error('[ReplayManager] Failed to load analysis cache:', error)
        }
    }

    private saveReplayCache(): void {
        try {
            fs.writeFileSync(this.cachePath, JSON.stringify(this.replayCache), 'utf-8')
        } catch (error) {
            console.error('[ReplayManager] Failed to save cache:', error)
        }
    }

    private saveAnalysisCache(): void {
        try {
            fs.writeFileSync(this.analysisCachePath, JSON.stringify(this.analysisCache), 'utf-8')
        } catch (error) {
            console.error('[ReplayManager] Failed to save analysis cache:', error)
        }
    }

    private async scanReplayDirectory(): Promise<void> {
        const replayDirs = this.settingsManager.getReplayDirectories()
        this.replayFiles = []

        for (const replayDir of replayDirs) {
            if (!fs.existsSync(replayDir)) {
                console.log('[ReplayManager] Replay directory not found:', replayDir)
                continue
            }

            try {
                const files = fs.readdirSync(replayDir)

                // Get file stats in one pass and filter for .sdfz files
                const dirFiles = files
                    .filter(filename => filename.endsWith('.sdfz'))
                    .map(filename => {
                        try {
                            const stat = fs.statSync(path.join(replayDir, filename))
                            return { filename, mtime: stat.mtimeMs, directory: replayDir }
                        } catch {
                            return null
                        }
                    })
                    .filter((item): item is { filename: string; mtime: number; directory: string } => item !== null)

                this.replayFiles.push(...dirFiles)
                console.log(`[ReplayManager] Found ${dirFiles.length} replay files in ${replayDir}`)
            } catch (error) {
                console.error('[ReplayManager] Failed to scan directory:', replayDir, error)
            }
        }

        // Sort all files by most recent first
        this.replayFiles.sort((a, b) => b.mtime - a.mtime)
        console.log(`[ReplayManager] Total ${this.replayFiles.length} replay files`)
    }

    setGame(game: 'zerok' | 'bar'): void {
        // TODO: Update baseReplayPath based on game
        // For now, just log
        console.log(`[ReplayManager] Game set to: ${game}`)
    }

    async getCurrentPage(): Promise<ReplayListItem[]> {
        // Wait for initialization if needed
        if (!this.isInitialized && this.initPromise) {
            await this.initPromise
        }

        const pageSize = 30
        const filesToProcess = this.replayFiles.slice(0, pageSize)

        const results: ParsedReplay[] = []
        const needsParsing: Array<{ filename: string; mtime: number; directory: string; index: number }> = []

        // Check which replays are already cached and still valid
        for (let i = 0; i < filesToProcess.length; i++) {
            const { filename, mtime, directory } = filesToProcess[i]
            const cached = this.replayCache.replays[filename]

            if (cached && cached.cachedAt >= mtime) {
                // Cache is valid
                results[i] = cached
            } else {
                // Needs parsing
                needsParsing.push({ filename, mtime, directory, index: i })
            }
        }

        console.log(`[ReplayManager] ${results.filter(Boolean).length} cached, ${needsParsing.length} need parsing`)

        // Parse any uncached replays in parallel
        if (needsParsing.length > 0) {
            const parseResults = await Promise.allSettled(
                needsParsing.map(({ filename, directory }) =>
                    this.parser.parseDemo(path.join(directory, filename))
                )
            )

            let cacheUpdated = false

            for (let i = 0; i < parseResults.length; i++) {
                const result = parseResults[i]
                const { filename, mtime, index } = needsParsing[i]

                if (result.status === 'fulfilled') {
                    const replay = result.value
                    const parsed = this.extractReplayData(filename, mtime, replay)

                    results[index] = parsed
                    this.replayCache.replays[filename] = parsed
                    cacheUpdated = true
                } else {
                    console.error(`[ReplayManager] Failed to parse ${filename}:`, result.reason)
                }
            }

            // Save updated cache to disk
            if (cacheUpdated) {
                this.saveReplayCache()
            }
        }

        // Filter out any gaps (failed parses)
        return results
            .filter(Boolean)
            .map((replay) => ({
                ...replay,
                hasAnalysis: this.getReplayAnalysis(replay.filename) !== null
            }))
    }

    getReplayAnalysis(filename: string): AnalysisResult | null {
        const replayFile = this.replayFiles.find((file) => file.filename === filename)
        const cachedAnalysis = this.analysisCache.analyses[filename]

        if (!replayFile || !cachedAnalysis) {
            return null
        }

        if (cachedAnalysis.cachedAt < replayFile.mtime) {
            delete this.analysisCache.analyses[filename]
            this.saveAnalysisCache()
            return null
        }

        if (!hasMeaningfulAnalysisData(cachedAnalysis.analysis)) {
            delete this.analysisCache.analyses[filename]
            this.saveAnalysisCache()
            return null
        }

        return cachedAnalysis.analysis
    }

    saveReplayAnalysis(filename: string, analysis: AnalysisResult): void {
        const replayFile = this.replayFiles.find((file) => file.filename === filename)
        if (!replayFile) {
            return
        }

        if (!hasMeaningfulAnalysisData(analysis)) {
            delete this.analysisCache.analyses[filename]
            this.saveAnalysisCache()
            return
        }

        this.analysisCache.analyses[filename] = {
            analysis,
            cachedAt: replayFile.mtime,
            savedAt: Date.now()
        }
        this.saveAnalysisCache()
    }

    getReplayAnalysisStatuses(): ReplayAnalysisStatus[] {
        return Array.from(this.analysisStatuses.values()).sort((a, b) => {
            if (a.status !== b.status) {
                return a.status === 'running' ? -1 : 1
            }
            return a.queuedAt - b.queuedAt
        }).map((status, index) => ({
            ...status,
            progress: this.getAnalysisProgress(status, index)
        }))
    }

    getReplayAnalysisCacheInfo(): { sizeBytes: number; entryCount: number } {
        let sizeBytes = 0

        try {
            if (fs.existsSync(this.analysisCachePath)) {
                sizeBytes = fs.statSync(this.analysisCachePath).size
            } else {
                sizeBytes = Buffer.byteLength(JSON.stringify(this.analysisCache), 'utf-8')
            }
        } catch (error) {
            console.error('[ReplayManager] Failed to read analysis cache size:', error)
        }

        return {
            sizeBytes,
            entryCount: Object.keys(this.analysisCache.analyses).length
        }
    }

    clearReplayAnalysisCache(): { success: true } {
        this.analysisCache = {
            version: ANALYSIS_CACHE_VERSION,
            analyses: {}
        }
        this.saveAnalysisCache()
        return { success: true }
    }

    async enqueueReplayAnalysis(filename: string, runAnalysis: () => Promise<AnalysisResult>): Promise<AnalysisResult> {
        const existing = this.activeAnalysisPromises.get(filename)
        if (existing) {
            return existing
        }

        const queuedAt = Date.now()
        const promise = new Promise<AnalysisResult>((resolve, reject) => {
            this.analysisQueue.push({ filename, runAnalysis, resolve, reject, queuedAt })
        })

        this.activeAnalysisPromises.set(filename, promise)
        this.analysisStatuses.set(filename, {
            filename,
            status: 'queued',
            queuedAt,
            progress: 6
        })

        void this.processAnalysisQueue()
        return promise
    }

    private async processAnalysisQueue(): Promise<void> {
        if (this.isProcessingAnalysisQueue) {
            return
        }

        this.isProcessingAnalysisQueue = true
        try {
            while (this.analysisQueue.length > 0) {
                const job = this.analysisQueue.shift()
                if (!job) {
                    continue
                }

                const startedAt = Date.now()
                this.analysisStatuses.set(job.filename, {
                    filename: job.filename,
                    status: 'running',
                    queuedAt: job.queuedAt,
                    startedAt,
                    progress: 15
                })

                try {
                    const analysis = await job.runAnalysis()
                    if (hasMeaningfulAnalysisData(analysis)) {
                        this.saveReplayAnalysis(job.filename, analysis)
                    }
                    job.resolve(analysis)
                } catch (error) {
                    job.reject(error)
                } finally {
                    this.analysisStatuses.delete(job.filename)
                    this.activeAnalysisPromises.delete(job.filename)
                }
            }
        } finally {
            this.isProcessingAnalysisQueue = false
        }
    }

    private getAnalysisProgress(status: ReplayAnalysisStatus, queueIndex: number): number {
        if (status.status === 'queued') {
            return Math.max(4, 10 - (queueIndex * 2))
        }

        const elapsedMs = status.startedAt ? Math.max(0, Date.now() - status.startedAt) : 0
        const easedProgress = 18 + ((1 - Math.exp(-elapsedMs / 12000)) * 74)
        return Math.min(94, Math.round(easedProgress))
    }

    private extractReplayData(filename: string, mtime: number, replay: any): ParsedReplay {
        // Calculate game type (e.g., "4v4", "3v2v1")
        const teamCounts = new Map<number, number>()
        const players = replay.info.players || []

        players.forEach((player: any) => {
            const teamId = player.allyTeamId
            teamCounts.set(teamId, (teamCounts.get(teamId) || 0) + 1)
        })

        const teamSizes = Array.from(teamCounts.values()).sort((a, b) => b - a)
        const gameType = teamSizes.length > 0 ? teamSizes.join('v') : 'FFA'

        // Group players by team
        const teamsMap = new Map<number, any[]>()
        players.forEach((player: any) => {
            if (!teamsMap.has(player.allyTeamId)) {
                teamsMap.set(player.allyTeamId, [])
            }
            teamsMap.get(player.allyTeamId)!.push(player)
        })

        // Convert to serializable object
        const teams: Record<number, any[]> = {}
        teamsMap.forEach((teamPlayers, teamId) => {
            teams[teamId] = teamPlayers
        })

        return {
            filename,
            map: replay.info.meta?.map || 'Unknown',
            game: replay.info.meta?.game || 'Unknown',
            gameType,
            duration: replay.info.meta?.durationMs || 0,
            date: replay.info.meta?.startTime || new Date().toISOString(),
            players,
            winners: replay.statistics?.winningAllyTeamIds,
            teams,
            cachedAt: mtime
        }
    }

    nextPage(): void {
        // Not currently used with caching approach
    }
}
