import fs from 'node:fs'
import path from 'node:path'
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

    async start_replay(replaypath: string):Promise<void>{
        try {
            console.log("start_replay called with:", replaypath)
            if(!replaypath.endsWith(".sdfz")){
                console.log("Invalid replay (does not end with sdfz)")
                return 
            }
            if(!fs.existsSync(replaypath)){
                console.log(`Filepath does not exist: ${replaypath}`)
                return
            }
            console.log("parsing!")
            const parser = new DemoParser()

            const demo = await parser.parseDemo(replaypath)

            const mapname = demo.info.meta.map
            const modname = demo.info.meta.game
            const version = demo.header.versionString
            console.log(`map name: ${mapname}, mod name: ${modname} version ${version}`)
            console.log(version.match(/\./))
            //new version check
            this.findEngines()
            let engine = ''
            if (version.startsWith('2') && (version.match(/\./g)?.length == 2)){
                console.log(`clocked as new version ${version}`)
                const subversions = version.split('.')
                const releaseID = `rel${subversions[0].slice(2)}${subversions[1]}`
                const enginedir = `${releaseID}.${version}`
                console.log(enginedir)
                console.log(this.engines)

                if(this.engines.has(version)){
                    engine = this.engines.get(version)
                    console.log("found engine omg")
                } else {
                    console.log("cant find engine")
                    return
                }


                
            } else {
                console.log("old version detected lol lemme implement that waa")
                return
            }
            this.parseCache()
            if(!this.maps.has(mapname)){
                console.log("map not available")
            }

            if(!this.games.has(modname)){
                console.log("game not availabe")
            }

            
            const enginefullpath = path.join(engine, this.engine_binary)
            if(fs.existsSync(enginefullpath)){
                console.log("does not exist")
                return
            }
            const runcmd = `"${enginefullpath}" --isolation --write-dir "${path.join(this.basePath)}"`
            console.log(runcmd)
            // console.log("Launching engine for replay with: "+runcmd)
            const child = spawn(`${enginefullpath}`,["--isolation","--write-dir",`${path.join(this.basePath)}`, `${replaypath}`],{detached:true, stdio:'ignore'})
            child.unref();
            child.on('error', error=>console.log('error rip: '+error))
            child.on('close', code =>console.log(`closed with ${code} op`))
        } catch (error) {
            console.error("Error parsing replay file:", error.message)
            console.log("This appears to be an issue with the sdfz-demo-parser library")
            console.log("The replay file exists but contains data that the parser cannot handle")
            // Don't re-throw the error so the app doesn't crash
        }
    }





}
