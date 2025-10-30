import fs from 'node:fs'
import path from 'node:path'
import {DemoParser} from "sdfz-demo-parser";
//this code is heavily inspired by the BAR debug launcher: https://github.com/beyond-all-reason/bar_debug_launcher
export class ZkLauncher{
    baseEngineFolder = 'C:/Program Files (x86)/Steam/steamapps/common/Zero-K/engine'
    platform = "win64"
    engine_binary = "spring"
    engines = new Map()
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
            console.log(`map name: ${mapname}, mod name: ${modname}`)
        } catch (error) {
            console.error("Error parsing replay file:", error.message)
            console.log("This appears to be an issue with the sdfz-demo-parser library")
            console.log("The replay file exists but contains data that the parser cannot handle")
            // Don't re-throw the error so the app doesn't crash
        }
    }



}
