import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { EventEmitter } from 'events'

export interface AppSettings {
    zeroKDirectory: string
    replayDirectories: string[]
}

const DEFAULT_SETTINGS: AppSettings = {
    zeroKDirectory: 'C:/Program Files (x86)/Steam/steamapps/common/Zero-K',
    replayDirectories: []
}

export class SettingsManager extends EventEmitter {
    private settingsPath: string
    private settings: AppSettings

    constructor() {
        super()
        const userDataPath = app.getPath('userData')
        this.settingsPath = path.join(userDataPath, 'settings.json')
        this.settings = this.loadSettings()
    }

    private loadSettings(): AppSettings {
        try {
            if (fs.existsSync(this.settingsPath)) {
                const data = fs.readFileSync(this.settingsPath, 'utf-8')
                const loaded = JSON.parse(data) as Partial<AppSettings>
                console.log('[SettingsManager] Loaded settings from disk')
                return { ...DEFAULT_SETTINGS, ...loaded }
            }
        } catch (error) {
            console.error('[SettingsManager] Failed to load settings:', error)
        }
        return { ...DEFAULT_SETTINGS }
    }

    private saveSettings(): void {
        try {
            fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf-8')
            console.log('[SettingsManager] Saved settings to disk')
        } catch (error) {
            console.error('[SettingsManager] Failed to save settings:', error)
        }
    }

    getSettings(): AppSettings {
        return { ...this.settings }
    }

    getZeroKDirectory(): string {
        return this.settings.zeroKDirectory
    }

    setZeroKDirectory(directory: string): void {
        this.settings.zeroKDirectory = directory
        this.saveSettings()
        this.emit('settingsChanged', this.settings)
    }

    getReplayDirectories(): string[] {
        // Always include the default ZeroK demos folder
        const defaultDemos = path.join(this.settings.zeroKDirectory, 'demos')
        const allDirs = [defaultDemos, ...this.settings.replayDirectories]
        // Return unique directories
        return [...new Set(allDirs)]
    }

    setReplayDirectories(directories: string[]): void {
        this.settings.replayDirectories = directories
        this.saveSettings()
        this.emit('settingsChanged', this.settings)
    }

    addReplayDirectory(directory: string): void {
        if (!this.settings.replayDirectories.includes(directory)) {
            this.settings.replayDirectories.push(directory)
            this.saveSettings()
            this.emit('settingsChanged', this.settings)
        }
    }

    removeReplayDirectory(directory: string): void {
        this.settings.replayDirectories = this.settings.replayDirectories.filter(d => d !== directory)
        this.saveSettings()
        this.emit('settingsChanged', this.settings)
    }
}
