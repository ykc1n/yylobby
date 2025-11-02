
import fs from 'node:fs'
import path from 'node:path'
import { DemoModel, DemoParser } from 'sdfz-demo-parser'
export class ReplayManager{
    baseReplayPath = 'C:/Program Files (x86)/Steam/steamapps/common/Zero-K/demos'
    currentGame: 'zerok' | 'bar' = 'zerok'
    replaysMap:Map<string,string[]> = new Map()
    CachedReplaysMap:Map<string,DemoModel.Demo[]> = new Map()

    page=0
    pageSize = 30
    parser = new DemoParser()

    private replayPaths = {
        zerok: 'C:/Program Files (x86)/Steam/steamapps/common/Zero-K/demos',
        bar: 'C:\Program Files\Beyond-All-Reason\data\engine'
    }

    constructor(){
        this.loadReplays()
    }

    setGame(game: 'zerok' | 'bar'): void {
        if (this.currentGame !== game) {
            this.currentGame = game
            this.baseReplayPath = this.replayPaths[game]
            this.parsedReplays = []
            this.loadReplays()
        }
    }

    private loadReplays(): void {
        //initialize replays array
        if(fs.existsSync(this.baseReplayPath)){
        
        const directory = fs.readdirSync(this.baseReplayPath)
        const replays  = directory.filter((filename)=>{
          return fs.statSync(`${this.baseReplayPath}/${filename}`)
        })
        .sort((a,b)=>{
          const astat = fs.statSync(`${this.baseReplayPath}/${a}`)
          const bstat = fs.statSync(`${this.baseReplayPath}/${b}`)
          return new Date(bstat.birthtime).getTime() - new Date(astat.birthtime).getTime()
        })
        this.replaysMap.set(this.currentGame,replays)
      } else{
        console.log("DOES NOT EXIST LEL ")
        console.log(this.baseReplayPath)
      }
      

    }
    async getCurrentPage():Promise<object>{
        const cachedReplays =  this.CachedReplaysMap.get(this.currentGame)??[]
        if (cachedReplays.length > 0){
            console.log("cached replays time!")
            return cachedReplays
        }
        
        if(this.replaysMap.get(this.currentGame))
            this.loadReplays()
        const replays = this.replaysMap.get(this.currentGame)
        console.log(replays)
        const currentReplays = replays.slice(this.page, this.pageSize)
        //console.log(currentReplays)
        console.log(path.join(this.baseReplayPath,currentReplays[0]))
        const replayPaths = currentReplays
            .map( replay => path.join(this.baseReplayPath,replay))
        //console.log(replayPaths)
        
        // Parse replays with error handling for each one
        const parseResults = await Promise.allSettled(
            replayPaths.map(replay => this.parser.parseDemo(replay))
        )
        
        // Filter out failed parses and map to data
        const data = parseResults
            .map((result, index) => {
                if (result.status === 'fulfilled') {
                    const replay = result.value
                    
                    // Calculate game type (e.g., "4v4", "3v2v1")
                    const teamCounts = new Map<number, number>()
                    replay.info.players.forEach(player => {
                        const teamId = player.allyTeamId
                        teamCounts.set(teamId, (teamCounts.get(teamId) || 0) + 1)
                    })
                    const teamSizes = Array.from(teamCounts.values()).sort((a, b) => b - a)
                    const gameType = teamSizes.join('v')
                    const teams = new Map()
                    const winners = replay.statistics?.winningAllyTeamIds
                    const players = replay.info.players
                    players.forEach( player =>{
                        if(!teams.has(player.allyTeamId)){
                            teams.set(player.allyTeamId,[])
                        
                        }
                        const team = teams.get(player.allyTeamId)
                        team.push(player)
                        teams.set(player.allyTeamId, team)


                    })

                    return {
                        filename: currentReplays[index],
                        map: replay.info.meta.map,
                        game: replay.info.meta.game,
                        gameType: gameType,
                        duration: replay.info.meta.durationMs,
                        date: replay.info.meta.startTime,
                        players: replay.info.players,
                        winners: replay.statistics?.winningAllyTeamIds,
                        teams: teams
                    }
                } else {
                    console.error(`Failed to parse ${currentReplays[index]}:`, result.reason)
                    return null
                }
            })
            .filter(item => item !== null)
        
        this.CachedReplaysMap.set(this.currentGame, data)
        return data
    }
    nextPage():void{
        this.page +=1
    }


}