import axios from 'axios'
import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { SettingsManager } from './settings'

interface DownloadFileResponse {
    links: string[]
    torrent: string
    dependencies: string[]
    resourceType: string
    torrentName: string
}

export interface DownloadStatus {
    id: string
    kind: 'map-thumbnail'
    name: string
    status: 'queued' | 'running' | 'completed' | 'failed'
    progress: number
    queuedAt: number
    startedAt?: number
    completedAt?: number
    targetPath: string
    sourceUrl?: string
    error?: string
}

interface DownloadJob {
    id: string
    key: string
    mapName: string
    queuedAt: number
    resolve: (status: DownloadStatus) => void
    reject: (error: unknown) => void
}

export class ZerokDownloader {
    private readonly settingsManager: SettingsManager
    private readonly plasmaService = 'https://zero-k.info/contentService'
    private readonly statuses = new Map<string, DownloadStatus>()
    private readonly queue: DownloadJob[] = []
    private readonly activeDownloads = new Map<string, Promise<DownloadStatus>>()
    private isProcessingQueue = false

    constructor(settingsManager: SettingsManager) {
        this.settingsManager = settingsManager
        console.log('ZerokDownloader initialized')
    }

    async GetDownloadInfo(name: string): Promise<null | DownloadFileResponse> {
        const response = await axios.post(
            this.plasmaService,
            `DownloadFileRequest ${JSON.stringify({ InternalName: name })}\n`,
            { responseType: 'json' }
        ).catch((error) => {
            console.error('Error downloading:', error)
            return null
        })

        if (!response?.data) {
            return null
        }

        return response.data as DownloadFileResponse
    }

    async DownloadResource(name: string): Promise<void> {
        const downloadInfo = await this.GetDownloadInfo(name)
        if (!downloadInfo?.links[0]) {
            return
        }

        const response = await axios.get(downloadInfo.links[0], { responseType: 'stream' })
        const writer = fs.createWriteStream(`${name}.sd7`)
        await pipeline(response.data, writer)
    }

    getDownloadStatuses(): DownloadStatus[] {
        return Array.from(this.statuses.values()).sort((a, b) => {
            const statusOrder = this.getStatusOrder(a.status) - this.getStatusOrder(b.status)
            if (statusOrder !== 0) {
                return statusOrder
            }

            return b.queuedAt - a.queuedAt
        })
    }

    async queueMapThumbnailDownload(mapName: string): Promise<DownloadStatus> {
        const key = this.getMapKey(mapName)
        const targetPath = this.getMapThumbnailTargetPath(mapName)
        const existing = this.activeDownloads.get(key)
        if (existing) {
            return existing
        }

        if (fs.existsSync(targetPath)) {
            const status = this.upsertStatus({
                id: `map-thumbnail:${key}`,
                kind: 'map-thumbnail',
                name: mapName,
                status: 'completed',
                progress: 100,
                queuedAt: Date.now(),
                completedAt: Date.now(),
                targetPath
            })
            return status
        }

        const queuedAt = Date.now()
        const promise = new Promise<DownloadStatus>((resolve, reject) => {
            this.queue.push({
                id: `map-thumbnail:${key}`,
                key,
                mapName,
                queuedAt,
                resolve,
                reject
            })
        })

        this.activeDownloads.set(key, promise)
        this.upsertStatus({
            id: `map-thumbnail:${key}`,
            kind: 'map-thumbnail',
            name: mapName,
            status: 'queued',
            progress: 6,
            queuedAt,
            targetPath
        })

        void this.processQueue()
        return promise
    }

    async testDownload(): Promise<void> {
        await this.queueMapThumbnailDownload('Ravaged_v2')
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessingQueue) {
            return
        }

        this.isProcessingQueue = true
        try {
            while (this.queue.length > 0) {
                const job = this.queue.shift()
                if (!job) {
                    continue
                }

                const targetPath = this.getMapThumbnailTargetPath(job.mapName)
                const startedAt = Date.now()
                this.upsertStatus({
                    id: job.id,
                    kind: 'map-thumbnail',
                    name: job.mapName,
                    status: 'running',
                    progress: 12,
                    queuedAt: job.queuedAt,
                    startedAt,
                    targetPath
                })

                try {
                    const completedStatus = await this.downloadMapThumbnail(job.mapName, targetPath, (progress, sourceUrl) => {
                        const current = this.statuses.get(job.id)
                        if (!current) {
                            return
                        }

                        this.statuses.set(job.id, {
                            ...current,
                            status: 'running',
                            startedAt,
                            progress,
                            sourceUrl
                        })
                    })
                    job.resolve(completedStatus)
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Download failed'
                    const failedStatus = this.upsertStatus({
                        id: job.id,
                        kind: 'map-thumbnail',
                        name: job.mapName,
                        status: 'failed',
                        progress: 100,
                        queuedAt: job.queuedAt,
                        startedAt,
                        completedAt: Date.now(),
                        targetPath,
                        error: message
                    })
                    job.reject(error)
                    void failedStatus
                } finally {
                    this.activeDownloads.delete(job.key)
                }
            }
        } finally {
            this.isProcessingQueue = false
        }
    }

    private async downloadMapThumbnail(
        mapName: string,
        targetPath: string,
        onProgress: (progress: number, sourceUrl: string) => void
    ): Promise<DownloadStatus> {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true })

        const urlCandidates = this.getThumbnailUrlCandidates(mapName)
        let lastError: unknown = null

        for (const sourceUrl of urlCandidates) {
            try {
                const response = await axios.get(sourceUrl, { responseType: 'stream' })
                const totalBytes = Number(response.headers['content-length'] ?? 0)
                let downloadedBytes = 0

                response.data.on('data', (chunk: Buffer) => {
                    downloadedBytes += chunk.length
                    if (totalBytes > 0) {
                        const progress = Math.min(96, Math.max(14, Math.round((downloadedBytes / totalBytes) * 100)))
                        onProgress(progress, sourceUrl)
                    } else {
                        onProgress(75, sourceUrl)
                    }
                })

                const writer = fs.createWriteStream(targetPath)
                await pipeline(response.data, writer)

                return this.upsertStatus({
                    id: `map-thumbnail:${this.getMapKey(mapName)}`,
                    kind: 'map-thumbnail',
                    name: mapName,
                    status: 'completed',
                    progress: 100,
                    queuedAt: this.statuses.get(`map-thumbnail:${this.getMapKey(mapName)}`)?.queuedAt ?? Date.now(),
                    startedAt: this.statuses.get(`map-thumbnail:${this.getMapKey(mapName)}`)?.startedAt ?? Date.now(),
                    completedAt: Date.now(),
                    targetPath,
                    sourceUrl
                })
            } catch (error) {
                lastError = error
            }
        }

        throw lastError instanceof Error ? lastError : new Error(`No thumbnail found for ${mapName}`)
    }

    private getThumbnailUrlCandidates(mapName: string): string[] {
        const sanitizedMapName = this.getMapKey(mapName)
        return [`https://zero-k.info/Resources/${sanitizedMapName}.thumbnail.jpg`]
    }

    private getMapThumbnailTargetPath(mapName: string): string {
        return path.join(
            this.getMapThumbnailDirectory(),
            `${this.getMapKey(mapName)}.jpg`
        )
    }

    private getMapKey(mapName: string): string {
        return mapName.trim().replace(/ /g, '_')
    }

    private getMapThumbnailDirectory(): string {
        return path.join(this.settingsManager.getZeroKDirectory(), 'LuaMenu', 'configs', 'gameConfig', 'zk', 'minimapThumbnail')
    }

    private upsertStatus(status: DownloadStatus): DownloadStatus {
        this.statuses.set(status.id, status)
        this.trimStatuses()
        return status
    }

    private trimStatuses(): void {
        const statuses = Array.from(this.statuses.values()).sort((a, b) => b.queuedAt - a.queuedAt)
        const keep = new Set(statuses.slice(0, 100).map((status) => status.id))

        for (const id of this.statuses.keys()) {
            if (!keep.has(id) && !this.activeDownloads.has(id.replace('map-thumbnail:', ''))) {
                this.statuses.delete(id)
            }
        }
    }

    private getStatusOrder(status: DownloadStatus['status']): number {
        switch (status) {
            case 'running':
                return 0
            case 'queued':
                return 1
            case 'failed':
                return 2
            case 'completed':
                return 3
        }
    }
}
