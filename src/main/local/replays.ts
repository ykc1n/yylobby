import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { DemoParser } from 'sdfz-demo-parser'
import type { SettingsManager } from './settings'

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

interface ReplayCache {
    version: number
    replays: Record<string, ParsedReplay>  // keyed by filename
}

const CACHE_VERSION = 1

export class ReplayManager {
    private settingsManager: SettingsManager
    private cachePath: string
    private cache: ReplayCache = { version: CACHE_VERSION, replays: {} }
    private replayFiles: Array<{ filename: string; mtime: number; directory: string }> = []
    private parser = new DemoParser()
    private isInitialized = false
    private initPromise: Promise<void> | null = null

    constructor(settingsManager: SettingsManager) {
        this.settingsManager = settingsManager

        // Use app.getPath for proper user data location
        const userDataPath = app.getPath('userData')
        this.cachePath = path.join(userDataPath, 'replay-cache.json')

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
        this.loadCache()

        // Scan replay directory
        await this.scanReplayDirectory()

        this.isInitialized = true
    }

    private loadCache(): void {
        try {
            if (fs.existsSync(this.cachePath)) {
                const data = fs.readFileSync(this.cachePath, 'utf-8')
                const loaded = JSON.parse(data) as ReplayCache

                // Check cache version compatibility
                if (loaded.version === CACHE_VERSION) {
                    this.cache = loaded
                    console.log(`[ReplayManager] Loaded ${Object.keys(this.cache.replays).length} cached replays`)
                } else {
                    console.log('[ReplayManager] Cache version mismatch, starting fresh')
                }
            }
        } catch (error) {
            console.error('[ReplayManager] Failed to load cache:', error)
        }
    }

    private saveCache(): void {
        try {
            fs.writeFileSync(this.cachePath, JSON.stringify(this.cache), 'utf-8')
        } catch (error) {
            console.error('[ReplayManager] Failed to save cache:', error)
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

    async getCurrentPage(): Promise<ParsedReplay[]> {
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
            const cached = this.cache.replays[filename]

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
                    this.cache.replays[filename] = parsed
                    cacheUpdated = true
                } else {
                    console.error(`[ReplayManager] Failed to parse ${filename}:`, result.reason)
                }
            }

            // Save updated cache to disk
            if (cacheUpdated) {
                this.saveCache()
            }
        }

        // Filter out any gaps (failed parses)
        return results.filter(Boolean)
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
