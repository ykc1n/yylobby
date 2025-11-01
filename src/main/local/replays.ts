
import fs from 'node:fs'
import path from 'node:path'
import { DemoModel, DemoParser } from 'sdfz-demo-parser'
export class ReplayManager{
    baseReplayPath = 'C:/Program Files (x86)/Steam/steamapps/common/Zero-K/demos'
    replays:string[] = []
    parsedReplays:DemoModel.Demo[]= []
    page=0
    pageSize = 30
    parser = new DemoParser()


    constructor(){
        //initialize replays array
        if(fs.existsSync(this.baseReplayPath)){
        
        const directory = fs.readdirSync(this.baseReplayPath)
        this.replays = directory.filter((filename)=>{
          return fs.statSync(`${this.baseReplayPath}/${filename}`)
        })
        .sort((a,b)=>{
          const astat = fs.statSync(`${this.baseReplayPath}/${a}`)
          const bstat = fs.statSync(`${this.baseReplayPath}/${b}`)
          return new Date(bstat.birthtime).getTime() - new Date(astat.birthtime).getTime()
        })
        
      }
    }
    async getCurrentPage():Promise<object>{
        if (this.parsedReplays.length > 0){
            console.log("cached replays time!")
            return this.parsedReplays
        }
        const currentReplays = this.replays.slice(this.page, this.pageSize)
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
        
        this.parsedReplays = data
        return data
    }
    nextPage():void{
        this.page +=1
    }


}