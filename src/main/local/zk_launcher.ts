import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {DemoParser} from "sdfz-demo-parser";
import {parse} from 'lua-json';
import { spawn } from 'node:child_process';
import type { SettingsManager } from './settings'

//this code is heavily inspired by the BAR debug launcher: https://github.com/beyond-all-reason/bar_debug_launcher


/*
TODO:

*/
export class ZkLauncher{
    private settingsManager: SettingsManager
    platform = "win64"
    engine_binary = "spring"
    engines = new Map()
    maps = new Map()
    menus = new Map()
    games = new Map()

    constructor(settingsManager: SettingsManager) {
        this.settingsManager = settingsManager
    }

    get basePath(): string {
        return this.settingsManager.getZeroKDirectory()
    }

    get baseEngineFolder(): string {
        return path.join(this.basePath, 'engine')
    }

    setGame(game: 'zerok' | 'bar'): void {
        // Game-specific path will be set from settings
    }

    findEngines():void{
        const enginesPath = path.join(this.baseEngineFolder,this.platform)
        if(!fs.existsSync(enginesPath)){
            console.log(`${enginesPath} does not exist!`)
            return
        }
        const engines = fs.readdirSync(enginesPath)
        engines.forEach(engine =>{
            const enginePath = path.join(enginesPath,engine)
            //check if spring is actually in the engine 
            this.engines.set(engine, enginePath)
        })
        if(this.engines.size == 0){
            console.log("no engines found!")
        }
    }
    //this just parses the lua cache
    parseCache():void{
        let cachefiles:string[] = []
        const cacheDir = path.join(this.basePath, 'cache')
        if(!fs.existsSync(cacheDir)){
            console.log("cache dir doesnt exist")
            return
        }
        cachefiles = fs.readdirSync(cacheDir).filter( file => {
            const isCacheFile = file.
            toLowerCase().
            includes("archive") && 
            file
            .toLowerCase()
            .endsWith('.lua')
            console.log(file)
            if(isCacheFile){
                console.log(`found a cache file ${file}`)
            }
            return isCacheFile
        }).map( file => {
            return [path.join(cacheDir,file), fs.statSync(path.join(cacheDir,file)).mtime]
        }).sort((a,b)=>{
            return (a[1].getTime() - b[1].getTime())
        })
        if(cachefiles.length == 0){
            console.log("no cache files")
            return
        }
        //console.log(`cacheFiles: ${cachefiles}`)
        for(const cachefile of cachefiles){
            const cachefilecontents = fs.readFileSync(cachefile[0]).toString()
            //console.log(cachefilecontents)
            const cache = parse(cachefilecontents)
            //console.log(`parsed cache ${cachefile}`)
            //console.log("OP")
            for(const archive of cache.archives){

                if(!('archivedata' in archive)){
                    continue
                }

                if(!('modtype' in archive.archivedata)){
                    continue
                }

                switch(archive.archivedata.modtype){
                    case 3:
                        this.maps.set(archive.archivedata.name, archive.name)
                    break;
                    case 5:
                        this.menus.set(archive.archivedata.name, archive.name)
                    break;
                    case 1:
                        this.games.set(archive.archivedata.name, archive.name)
                }

                //console.log(this.maps)




            }
        }



    }

    getAvailableAIs(): Array<{ shortName: string; version: string; displayName: string; description: string }> {
        const BLACKLIST = new Set(['CppTestAI', 'E323AI', 'HughAI', 'KAIK', 'NullAI', 'NullJavaAI', 'NullOOJavaAI', 'RAI', 'Shard', 'AAI'])

        const DISPLAY_NAMES: Record<string, string> = {
            'CircuitAIBeginner': 'AI: Beginner',
            'CircuitAINovice':   'AI: Novice',
            'CircuitAIEasy':     'AI: Easy',
            'CircuitAINormal':   'AI: Normal',
            'CircuitAIHard':     'AI: Hard',
            'CircuitAIBrutal':   'AI: Brutal',
            'CircuitTest':       'AI: Bleeding edge test',
        }

        const aiDir = path.join(this.basePath, 'AI', 'Skirmish')
        if (!fs.existsSync(aiDir)) {
            console.log(`AI directory not found: ${aiDir}`)
            return []
        }

        // Strip leading numeric/Dev prefix and 32/64 suffix to get the base AI name
        function getBaseName(folderName: string): string {
            return folderName.replace(/^\d+/, '').replace(/^Dev/, '').replace(/(?:64|32)$/, '')
        }

        function getVersionPrefix(folderName: string): number {
            const match = folderName.match(/^(\d+)/)
            return match ? parseInt(match[1], 10) : 0
        }

        // Map baseName -> best entry found (highest numeric version prefix wins)
        const bestByBase = new Map<string, { shortName: string; version: string; displayName: string; description: string; versionNum: number }>()

        for (const folderName of fs.readdirSync(aiDir)) {
            const folderPath = path.join(aiDir, folderName)
            if (!fs.statSync(folderPath).isDirectory()) continue
            if (!folderName.endsWith('64')) continue

            const baseName = getBaseName(folderName)
            if (BLACKLIST.has(baseName) || BLACKLIST.has(folderName)) continue

            for (const versionFolder of fs.readdirSync(folderPath)) {
                const versionPath = path.join(folderPath, versionFolder)
                if (!fs.statSync(versionPath).isDirectory()) continue

                const aiInfoPath = path.join(versionPath, 'AIInfo.lua')
                if (!fs.existsSync(aiInfoPath)) continue

                try {
                    const content = fs.readFileSync(aiInfoPath).toString()
                    const infos = parse(content) as Array<{ key: string; value: string }>

                    const fields: Record<string, string> = {}
                    for (const entry of infos) {
                        if (entry.key && entry.value != null) {
                            fields[entry.key] = String(entry.value)
                        }
                    }

                    const shortName = fields['shortName'] ?? folderName
                    const version = fields['version'] ?? versionFolder
                    const description = fields['description'] ?? ''
                    const displayName = DISPLAY_NAMES[baseName] ?? baseName

                    const versionNum = getVersionPrefix(folderName)
                    const existing = bestByBase.get(baseName)
                    if (!existing || versionNum > existing.versionNum) {
                        bestByBase.set(baseName, { shortName, version, displayName, description, versionNum })
                    }
                } catch (e) {
                    console.log(`Failed to parse ${aiInfoPath}: ${e}`)
                }
            }
        }

        return Array.from(bestByBase.values()).map(({ shortName, version, displayName, description }) => ({
            shortName, version, displayName, description
        }))
    }

    getLatestEngine(): string | null {
        this.findEngines()
        if (this.engines.size === 0) return null
        // Pick the engine with the highest version string
        let latest: string | null = null
        let latestPath = ''
        for (const [version, enginePath] of this.engines) {
            if (!latest || version.localeCompare(latest, undefined, { numeric: true }) > 0) {
                latest = version
                latestPath = enginePath
            }
        }
        return latestPath
    }

    getAvailableMaps(): Array<{ name: string; thumbnailPath?: string }> {
        this.parseCache()
        const result: Array<{ name: string; thumbnailPath?: string }> = []
        for (const [name] of this.maps) {
            const thumbnailPath = this.getMapThumbnailPath(name)
            result.push(thumbnailPath ? { name, thumbnailPath } : { name })
        }
        return result.sort((a, b) => a.name.localeCompare(b.name))
    }

    getMapThumbnailPath(mapName: string): string | null {
        const thumbnailDirectory = this.getMapThumbnailDirectory()
        if (!fs.existsSync(thumbnailDirectory)) {
            return null
        }

        const thumbnailBaseName = mapName.trim().replace(/ /g, '_')
        for (const extension of ['.jpg', '.jpeg', '.png', '.dds']) {
            const thumbnailPath = path.join(thumbnailDirectory, `${thumbnailBaseName}${extension}`)
            if (fs.existsSync(thumbnailPath)) {
                return thumbnailPath
            }
        }

        return null
    }

    getGameName(): string | null {
        this.parseCache()
        if (this.games.size === 0) return null
        // Return first game found (usually Zero-K or BAR)
        return this.games.keys().next().value ?? null
    }

    generateStartScript(opts: {
        gameName: string
        mapName: string
        playerName: string
        teams: Array<{
            allyTeam: number
            players: Array<{ name: string; isBot: boolean; aiShortName?: string; aiVersion?: string }>
        }>
    }): string {
        const lines: string[] = ['[GAME]', '{']

        let playerIndex = 0
        let aiIndex = 0
        let teamIndex = 0
        const allyTeams = new Set<number>()
        let numPlayers = 0
        let numAIs = 0

        // Build players, AIs, and teams
        for (const team of opts.teams) {
            allyTeams.add(team.allyTeam)
            for (const p of team.players) {
                const currentTeam = teamIndex

                if (p.isBot) {
                    lines.push(`\t[ai${aiIndex}]`, '\t{')
                    lines.push(`\t\tName = ${p.name};`)
                    lines.push(`\t\tShortName = ${p.aiShortName ?? 'CircuitAINormal'};`)
                    lines.push(`\t\tVersion = ${p.aiVersion ?? ''};`)
                    lines.push(`\t\tTeam = ${currentTeam};`)
                    lines.push(`\t\tIsFromDemo = 0;`)
                    lines.push(`\t\tHost = 0;`)
                    lines.push('\t}')
                    aiIndex++
                    numAIs++
                } else {
                    lines.push(`\t[player${playerIndex}]`, '\t{')
                    lines.push(`\t\tName = ${p.name};`)
                    lines.push(`\t\tTeam = ${currentTeam};`)
                    lines.push(`\t\tIsFromDemo = 0;`)
                    lines.push(`\t\tSpectator = 0;`)
                    lines.push(`\t\trank = 0;`)
                    lines.push('\t}')
                    playerIndex++
                    numPlayers++
                }

                // Team entry
                lines.push(`\t[team${currentTeam}]`, '\t{')
                lines.push(`\t\tTeamLeader = 0;`)
                lines.push(`\t\tAllyTeam = ${team.allyTeam};`)
                lines.push('\t}')
                teamIndex++
            }
        }

        // AllyTeam entries
        for (const at of allyTeams) {
            lines.push(`\t[allyTeam${at}]`, '\t{')
            lines.push(`\t\tnumallies = 0;`)
            lines.push('\t}')
        }

        // Global settings
        lines.push(`\tgametype = ${opts.gameName};`)
        lines.push(`\thostip = 127.0.0.1;`)
        lines.push(`\thostport = 0;`)
        lines.push(`\tishost = 1;`)
        lines.push(`\tmapname = ${opts.mapName};`)
        lines.push(`\tmyplayername = ${opts.playerName};`)
        lines.push(`\tnumplayers = ${numPlayers};`)
        lines.push(`\tnumusers = ${numPlayers + numAIs};`)
        lines.push(`\tstartpostype = 2;`)
        lines.push(`\tGameStartDelay = 0;`)
        lines.push(`\tnohelperais = 0;`)

        lines.push('}')
        return lines.join('\n')
    }

    async startSkirmish(opts: {
        mapName: string
        teams: Array<{
            allyTeam: number
            players: Array<{ name: string; isBot: boolean; aiShortName?: string; aiVersion?: string }>
        }>
    }): Promise<{ success: boolean; error?: string }> {
        const enginePath = this.getLatestEngine()
        if (!enginePath) {
            return { success: false, error: 'No engine found' }
        }

        const gameName = this.getGameName()
        if (!gameName) {
            return { success: false, error: 'No game found in cache' }
        }

        const engineBinary = path.join(enginePath, this.engine_binary+".exe")
        if (!fs.existsSync(engineBinary)) {
            return { success: false, error: `Engine binary not found: ${engineBinary}` }
        }

        const scriptContent = this.generateStartScript({
            gameName,
            mapName: opts.mapName,
            playerName: 'Player',
            teams: opts.teams
        })

        // Write script to temp file
        const scriptPath = path.join(os.tmpdir(), `yylobby_script_${Date.now()}.txt`)
        fs.writeFileSync(scriptPath, scriptContent)
        console.log(`[startSkirmish] Script written to: ${scriptPath}`)
        console.log(scriptContent)

        const child = spawn(engineBinary, [
            '--isolation',
            '--write-dir', this.basePath,
            scriptPath
        ], { detached: true, stdio: 'ignore' })
        child.unref()
        child.on('error', (error) => console.log('[startSkirmish] error: ' + error))
        child.on('close', (code) => {
            console.log(`[startSkirmish] closed with code ${code}`)
            // Clean up temp script
            try { fs.unlinkSync(scriptPath) } catch {}
        })

        return { success: true }
    }

    async resolveEngineForReplay(replaypath: string): Promise<{ enginePath: string; mapName: string; modName: string; version: string } | null> {
        if(!replaypath.endsWith(".sdfz")){
            console.log("Invalid replay (does not end with sdfz)")
            return null
        }
        if(!fs.existsSync(replaypath)){
            console.log(`Filepath does not exist: ${replaypath}`)
            return null
        }
        const parser = new DemoParser()
        const demo = await parser.parseDemo(replaypath)

        const mapName = demo.info.meta.map
        const modName = demo.info.meta.game
        const version = demo.header.versionString

        this.findEngines()
        if (version.startsWith('2') && (version.match(/\./g)?.length == 2)){
            if(this.engines.has(version)){
                return { enginePath: this.engines.get(version), mapName, modName, version }
            } else {
                console.log("cant find engine for version", version)
                return null
            }
        } else {
            console.log("old version detected, not supported")
            return null
        }
    }

    async getEngineDir(replaypath: string): Promise<string | null> {
        try {
            const resolved = await this.resolveEngineForReplay(replaypath)
            return resolved?.enginePath ?? null
        } catch (error) {
            console.error("Error resolving engine for replay:", error)
            return null
        }
    }

    async start_replay(replaypath: string):Promise<void>{
        try {
            console.log("start_replay called with:", replaypath)
            const resolved = await this.resolveEngineForReplay(replaypath)
            if (!resolved) return

            const { enginePath: engine, mapName: mapname, modName: modname, version } = resolved
            console.log(`map name: ${mapname}, mod name: ${modname} version ${version}`)

            this.parseCache()
            if(!this.maps.has(mapname)){
                console.log("map not available")
            }

            if(!this.games.has(modname)){
                console.log("game not availabe")
            }

            const enginefullpath = path.join(engine, this.engine_binary)
            if(!fs.existsSync(enginefullpath)){
                console.log("does not exist")
                return
            }
            const runcmd = `"${enginefullpath}" --isolation --write-dir "${path.join(this.basePath)}"`
            console.log(runcmd)
            const child = spawn(`${enginefullpath}`,["--isolation","--write-dir",`${path.join(this.basePath)}`, `${replaypath}`],{detached:true, stdio:'ignore'})
            child.unref();
            child.on('error', error=>console.log('error rip: '+error))
            child.on('close', code =>console.log(`closed with ${code} op`))
        } catch (error) {
            console.error("Error parsing replay file:", error.message)
            console.log("This appears to be an issue with the sdfz-demo-parser library")
            console.log("The replay file exists but contains data that the parser cannot handle")
        }
    }

    private getMapThumbnailDirectory(): string {
        return path.join(this.basePath, 'LuaMenu', 'configs', 'gameConfig', 'zk', 'minimapThumbnail')
    }





}
