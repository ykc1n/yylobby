import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'

// Verbatim from zkstats/Widgets/replay_speed.lua
const REPLAY_SPEED_LUA = `function widget:GetInfo() return {
\tname    = "SpringRTS Replay Speed",
\tdesc    = "[v0.0.1] Sets the replay speed to an extremely high value during demo mode replays.",
\tauthor  = "esainane",
\tdate    = "2019-07-07",
\tlicense = "GNU GPL v2 or later",
\tlayer   = -1,
\tenabled = true,
} end


local function IsSpectator()
\tlocal playerID = Spring.GetMyPlayerID()
\tlocal _, _, spec = Spring.GetPlayerInfo(playerID, false)

\tif spec then
\t\treturn true
\tend

\treturn false
end

function widget:Initialize()
\tif (not IsSpectator()) then
\t\tSpring.Echo("<Replay Speed> Not spectating. Widget removed.")
\t\twidgetHandler:RemoveWidget()
\t\treturn
\tend
\tif (not Spring.IsReplay()) then
\t\tSpring.Echo("<Replay Speed> Not a replay. Widget removed.")
\t\twidgetHandler:RemoveWidget()
\t\treturn
\tend
\tSpring.Echo("<Replay Speed> We appear to be in a replay/spectator, maxing out game speed.")
\tlocal old_speed = Spring.GetGameSpeed()
\tSpring.SendCommands ("setmaxspeed " .. 3000.0)
\tSpring.SendCommands ("setminspeed " .. 3000.0)
\tSpring.SendCommands ("setmaxspeed " .. 3000.0)
\tSpring.Echo("<Replay Speed> Replay speed is now: " .. Spring.GetGameSpeed() .. ", from " .. old_speed .. ".")
\twidgetHandler:RemoveWidget()
end
`

// Verbatim from zkstats/Widgets/replay_stats.lua
const REPLAY_STATS_LUA = `function widget:GetInfo() return {
\tname    = "SpringRTS Replay Stats",
\tdesc    = "[v0.0.1] Tracks stats from a replay and saves them to a file. Makes use of the state graph data.",
\tauthor  = "esainane",
\tdate    = "2019-07-07",
\tlicense = "GNU GPL v2 or later",
\tlayer   = -1,
\tenabled = true,
} end

--
-- Widget state
--
local logfile
local gameOver = false

--
-- Constants
--
local STATS_FOLDER = LUAUI_DIRNAME .. "Logs/replay_stats/"
local STATS_OUTPUT = STATS_FOLDER .. "__yylobby_analysis/events.log"

local directStats = {
\tmetalProduced = true,
\tmetalUsed = true
}
local rulesParamStats = {
\tmetal_excess = true,
\tmetal_overdrive = true,
\tmetal_reclaim = true,
\tunit_value = true,
\tunit_value_army = true,
\tunit_value_def = true,
\tunit_value_econ = true,
\tunit_value_other = true,
\tunit_value_killed = true,
\tunit_value_lost = true,
\tmetal_income = true,
\tenergy_income = true,
\tdamage_dealt = true,
\tdamage_received = true,
}
local hiddenStats = {
\tdamage_dealt = true,
\tunit_value_killed = true,
}

--
-- Constant function cache
--
local spGetTeam\t\t\t          = Spring.GetUnitTeam
local spGetLastAttacker\t\t    = Spring.GetUnitLastAttacker
local GetHiddenTeamRulesParam = Spring.Utilities.GetHiddenTeamRulesParam


--
-- Utility functions
--

local function starts_with(str, start)
\tif not str then
\t\tlog("--- WARNING --- starts_with on null string")
\tend
\tif (not str.sub) then
\t\tlog("--- WARNING --- starts_with where sub is nil")
\t\tfor k,v in pairs(str) do
\t\t\tlog("sub[" .. k .. "] = " .. v)
\t\tend
\tend
\treturn str:sub(1, #start) == start
end

local function printArray(arr)
\tlocal res
\tfor k,v in pairs(arr) do
\t\tres = (res and (res .. ',') or '') .. v
\tend
\treturn res
end

local function log(msg)
\tline = "[" .. Spring.GetGameFrame() .. "] " .. msg
\tSpring.Echo("<Replay Stats> " .. line)
\tif logfile then
\t\tlogfile:write(line .. '\\n')
\tend
end

local function AddEvent(str, unitDefId, _, _, pos)
\tlog('Event [' .. (pos and (printArray(pos)) or 'undefined') .. ']: ' .. str)
end

local function IsSpectator()
\tlocal playerID = Spring.GetMyPlayerID()
\tlocal _, _, spec = Spring.GetPlayerInfo(playerID, false)

\tif spec then
\t\treturn true
\tend

\treturn false
end


--
-- Print player information at startup. Simplified from start_boxes.lua gadget
--

local PLAYERINFO_CUSTOMKEYS = Spring.GetGameRulesParam("GetPlayerInfoCustomKeysIndex") or 10

-- name, elo, clanShort, clanLong, isAI
local function GetPlayerInfo (teamID)
\tlocal _,playerID,_,isAI = Spring.GetTeamInfo(teamID, false)

\tlocal name = Spring.GetPlayerInfo(playerID, false) or "?"
\tlocal customKeys = select(PLAYERINFO_CUSTOMKEYS, Spring.GetPlayerInfo(playerID)) or {}
\tlocal clanShort = customKeys.clan     or ""
\tlocal clanLong  = customKeys.clanfull or ""
\tlocal elo       = customKeys.elo      or "0"
\tline = name .. ", team: " .. teamID .. ", elo:" .. elo
\tif customKeys.lobbyid then
\t\tline = line .. ', userid: ' .. customKeys.lobbyid
\tend
\tif isAI then
\t\tline = line .. ', ai: ' .. select(2, Spring.GetAIInfo(teamID))
\tend

\tlog(line)

\tif isAI then
\t\tSpring.Echo(name .. ' team:' .. teamID .. ', elo: ', elo .. ' (AI)')
\t\treturn select(2, Spring.GetAIInfo(teamID)), -1000, "", "", true
\tend
\treturn name, tonumber(elo), clanShort, clanLong, false
end

local function GetTeamInfo(allyTeamID)
\tlocal teamList = Spring.GetTeamList(allyTeamID) or {}
\tif #teamList == 0 then
\t\treturn "Empty", "Empty"
\tend

\tfor i = 1, #teamList do
\t\tlocal name, elo, clanShort, clanLong, isAI = GetPlayerInfo(teamList[i])
\tend
end


--
-- Print a graph summary at the end. Simplified from gui_chili_endgraph.lua
-- Note that as we're just creating a log, we don't care about saving or mapping player names as we go
--

function widget:GameOver()
\tgameOver = true
end

local function addTeamScores(dest, stats, graphLength, statistic)
\tfor b = 1, graphLength do
\t\tdest[b] = (dest[b] or {})
\t\tdest[b][statistic] = (dest[b][statistic] or 0) + (stats[b][statistic] or 0)
\tend
end

local function getGameEndStats()
\tlocal teams = Spring.GetTeamList()
\tlocal graphLength = Spring.GetGameRulesParam("gameover_historyframe")

  -- teamID/allyTeamID => time => statisticName => value
\tlocal teamScores = {}
\tlocal allyTeamScores = {}

\tlocal gaiaID = Spring.GetGaiaTeamID()
\tlocal gaiaAllyTeamID = select(6, Spring.GetTeamInfo(gaiaID, false))

\tfor i = 1, #teams do
\t\tlocal teamID = teams[i]
\t\tlocal stats = Spring.GetTeamStatsHistory(teamID, 0, graphLength)
\t\tif gaiaID ~= teamID and stats then
\t\t  local allyTeamID = select(6, Spring.GetTeamInfo(teamID, false))
\t\t\tteamScores[teamID] = teamScores[teamID] or {}
\t\t\tallyTeamScores[allyTeamID] = allyTeamScores[allyTeamID] or {}

\t\t\tfor statistic,_ in pairs(rulesParamStats) do
\t\t\t\tstats = {}
\t\t\t\tfor i = 0, graphLength do
\t\t\t\t\tstats[i] = stats[i] or {}
\t\t\t\t\tif hiddenStats[statistic] and gameOver then
\t\t\t\t\t\tstats[i][statistic] = GetHiddenTeamRulesParam(teamID, "stats_history_" .. statistic .. "_" .. i) or 0
\t\t\t\t\telse
\t\t\t\t\t\tif not stats or stats == '?' then
\t\t\t\t\t\t\tlog('stats is ?')
\t\t\t\t\t\tend
\t\t\t\t\t\tif i == nil or i == '?' then
\t\t\t\t\t\t\tlog('i is ?')
\t\t\t\t\t\tend
\t\t\t\t\t\tif not statistic or statistic == '?' then
\t\t\t\t\t\t\tlog('statistic is ?')
\t\t\t\t\t\tend
\t\t\t\t\t\tlocal res = Spring.GetTeamRulesParam(teamID, "stats_history_" .. statistic .. "_" .. i) or 0
\t\t\t\t\t\tstats[i][statistic] = res
\t\t\t\t\tend
\t\t\t\tend
\t\t\t\taddTeamScores(teamScores[teamID], stats, graphLength, statistic)
\t\t\t\taddTeamScores(allyTeamScores[allyTeamID], stats, graphLength, statistic)
\t\t\tend
\t\t\tfor statistic,_ in pairs(directStats) do
\t\t\t\taddTeamScores(teamScores[teamID], stats, graphLength, statistic)
\t\t\t\taddTeamScores(allyTeamScores[allyTeamID], stats, graphLength, statistic)
\t\t\tend
\t\tend
\tend
\treturn teamScores, allyTeamScores, graphLength
end

local function allStatNames()
\tlocal ret = {}
\tfor statistic,_ in pairs(rulesParamStats) do
\t\tret[statistic] = true
\tend
\tfor statistic,_ in pairs(directStats) do
\t\tret[statistic] = true
\tend
\treturn ret
end

local function printGameEndStats(teamScores, allyTeamScores, graphLength)
\tlocal s = ''
\tstatNames = allStatNames()
\tfor statName in pairs(statNames) do
\t\tfor allyTeamID,_ in pairs(allyTeamScores) do
\t\t\ts = s .. ',allyTeam' .. allyTeamID .. '_' .. statName
\t\tend
\t\tfor teamID,_ in pairs(teamScores) do
\t\t\ts = s .. ',team' .. teamID .. '_' .. statName
\t\tend
\tend
\tlog('Game End Stats Header: time' .. s)
\tfor i = 0, graphLength do
\t\ts = i
\t\tfor statName in pairs(statNames) do
\t\t\tfor _,allyTeamStats in pairs(allyTeamScores) do
\t\t\t\ts = s .. ',' .. (allyTeamStats[i] and allyTeamStats[i][statName] or '"\\"-\\""')
\t\t\tend
\t\t\tfor _,teamStats in pairs(teamScores) do
\t\t\t\ts = s .. ',' .. (teamStats[i] and teamStats[i][statName] or '"\\"-\\""')
\t\t\tend
\t\tend
\t\tlog('Game End Stats Values: ' .. s)
\tend
end

-- Dump a copy of the game's graph to the log. This is going to be heavy.
local function printStats()
\tlocal teamScores, allyTeamScores, graphLength = getGameEndStats()
\tprintGameEndStats(teamScores, allyTeamScores, graphLength)
end

--
-- Simple spam to make sure that the widget is working.
--

local function startup()
\tlocal modOptions = Spring.GetModOptions() or {}
\tlocal noElo = Spring.Utilities.tobool(modOptions.noelo)
\tif noElo then
\t\tlog('Game has noElo set.')
\tend
\tlocal allyTeamList = Spring.GetAllyTeamList()

\tfor i = 1, #allyTeamList do
\t\tlocal allyTeamID = allyTeamList[i]
\t\tlocal longName, shortName, clanLong, clanShort = GetTeamInfo(allyTeamID)
\tend
end

local done_startup = false

function widget:GameFrame(f)
\t-- spring v104.0.1-1239/Zero-K v1.7.5.1 doesn't call widget:GameFrame on frame 0
\tif (not done_startup and f >= 0) then
\t\tstartup()
\t\tdone_startup = true
\tend
\tif gameOver then
\t\tprintStats()
\t\twidgetHandler:RemoveCallIn("GameFrame")
\tend
end

function widget:Initialize()
\tif (not IsSpectator()) then
\t\tSpring.Echo("<Replay Stats> Not spectating. Widget removed.")
\t\twidgetHandler:RemoveWidget()
\t\treturn
\tend
\tif (not Spring.IsReplay()) then
\t\tSpring.Echo("<Replay Stats> Not a replay. Widget removed.")
\t\twidgetHandler:RemoveWidget()
\t\treturn
\tend
\tSpring.Echo("<Replay Stats> We appear to be in a replay/spectator. Writing stats to file.")
\tlocal filename = STATS_OUTPUT
\tSpring.Echo("<Replay Stats> Attempting to open " .. filename)
\tlocal err
\tlogfile, err = io.open(filename, 'w+')
\tif not logfile then
\t\tSpring.Echo('<Replay Stats> Something went wrong opening the output file! Was the parent directory created before spring was run?')
\t\tSpring.Echo('<Replay Stats> Error: ' .. err)
\t\twidgetHandler:RemoveWidget()
\t\treturn
\tend
end

function widget:Shutdown()
\tif logfile then
\t\tio.close(logfile)
\tend
end

function widget:AddConsoleMessage(msg)
\tif not msg then
\t\tlog("--- WARNING --- Received null console message")
\t\treturn
\tend
\t-- Listen for 'game_message:' messages
\tif msg.msgtype == "game_message" then
\t\tlog("Received game_message: " .. msg.text)
\telseif msg.msgtype == 'autohost' then
\t\tif msg.text == '> exiting game' then
\t\t\tlog('autohost exit')
\t\telseif msg.text:find('^> Players .* did not choose a start position. Game will be aborted.$') ~= nil then
\t\t\tlog('player nonplacement')
\t\tend
\telseif msg.msgtype == 'other' then
\t\tif msg.text == 'No clients connected, shutting down server' then
\t\t\tlog('all players disconnected')
\t\tend
\tend
end


--
-- Log unit creation/destruction messages as we encounter the events. Simplified from gui_news_ticker
--

function widget:UnitDestroyed(unitID, unitDefID, unitTeam)
\t--don't report cancelled constructions etc.
\tlocal killer = spGetLastAttacker(unitID)
\tif killer == nil or killer == -1 then return end
\tlocal ud = UnitDefs[unitDefID]

\tlocal pos = {Spring.GetUnitPosition(unitID)}

\tlocal humanName = Spring.Utilities.GetHumanName(ud)
\tAddEvent(unitTeam .. ' lost unit ' .. humanName, unitDefID, nil, "unitLost", pos)
end

function widget:UnitFinished(unitID, unitDefID, unitTeam)
\tlocal ud = UnitDefs[unitDefID]
\tlocal pos = {Spring.GetUnitPosition(unitID)}

\tlocal humanName = Spring.Utilities.GetHumanName(ud)
\tAddEvent(unitTeam .. ' finished unit ' .. humanName, unitDefID, nil, "structureComplete", pos)
end

function widget:UnitIdle(unitID, unitDefID, unitTeam)
\tlocal ud = UnitDefs[unitDefID]
\tif ud.isFactory and (spGetTeam(unitID) == myTeam) then
\t\tlocal pos = {Spring.GetUnitPosition(unitID)}
\t\tAddEvent(Spring.Utilities.GetHumanName(ud) .. ": factory idle", unitDefID, nil, "factoryIdle", pos)
\tend
end

function widget:TeamDied(teamID)
\tlocal player = Spring.GetPlayerList(teamID)[1]
\t-- chicken team has no players (normally)
\tif player then
\t\tlocal playerName = Spring.GetPlayerInfo(player, false)
\t\tAddEvent(playerName .. ' died', nil, colorOrange)
\tend
end

function widget:PlayerChanged(playerID)
\tlocal playerName,active,isSpec,teamID = Spring.GetPlayerInfo(playerID, false)
  local _,_,isDead = Spring.GetTeamInfo(teamID, false)
\tif (isSpec) then
\t\tif not isDead then
\t\t\tAddEvent(playerName .. ' resigned')
\t\tend
\telseif (Spring.GetDrawFrame()>120) then --// skip \`changed status\` message flood when entering the game
\t\tAddEvent(playerName .. ' changed status')
\tend
end

function widget:PlayerRemoved(playerID, reason)
\tlocal playerName,active,isSpec = Spring.GetPlayerInfo(playerID, false)
\tif spec then return end
\tif reason == 0 then
\t\tAddEvent(playerName .. ' timed out')
\telseif reason == 1 then
\t\tAddEvent(playerName .. ' quit')
\telseif reason == 2 then
\t\tAddEvent(playerName .. ' got kicked')
\telse
\t\tAddEvent(playerName .. ' left (unknown reason)')
\tend
end
`

// Simplified autoquit for headless - no mouse/keyboard cancel since headless has no input
const HEADLESS_AUTOQUIT_LUA = `function widget:GetInfo() return {
\tname    = "Headless Autoquit",
\tdesc    = "Automatically quits 2s after game ends (headless mode)",
\tauthor  = "yylobby",
\tlayer   = 0,
\tenabled = true,
} end

local endTime = false

local function IsSpectator()
\tlocal playerID = Spring.GetMyPlayerID()
\tlocal _, _, spec = Spring.GetPlayerInfo(playerID, false)
\treturn spec == true
end

function widget:Initialize()
\tif (not IsSpectator()) or (not Spring.IsReplay()) then
\t\twidgetHandler:RemoveWidget()
\t\treturn
\tend
end

function widget:GameOver()
\tendTime = Spring.GetTimer()
\tSpring.Echo("<headless_autoquit> Game over, quitting in 2 seconds.")
end

function widget:Update()
\tif endTime and Spring.DiffTimers(Spring.GetTimer(), endTime) > 2 then
\t\tSpring.Echo("<headless_autoquit> Sending quitforce.")
\t\tSpring.SendCommands("quitforce")
\tend
end
`

export interface AnalysisResult {
    success: boolean
    error?: string
    players: Array<{ name: string; teamId: number; elo: number; isAI?: boolean }>
    winner?: string
    durationFrames?: number
    events: Array<{ frame: number; type: string; team?: number; unitName?: string; description: string }>
    endGameStats?: { headers: string[]; values: number[][] }
}

export class ReplayAnalyzer {
    installWidgets(basePath: string): void {
        const widgetsDir = path.join(basePath, 'LuaUI', 'Widgets')
        fs.mkdirSync(widgetsDir, { recursive: true })

        fs.writeFileSync(path.join(widgetsDir, 'replay_speed.lua'), REPLAY_SPEED_LUA)
        fs.writeFileSync(path.join(widgetsDir, 'replay_stats.lua'), REPLAY_STATS_LUA)
        fs.writeFileSync(path.join(widgetsDir, 'headless_autoquit.lua'), HEADLESS_AUTOQUIT_LUA)
        console.log('[ReplayAnalyzer] Widgets installed to', widgetsDir)
    }

    async analyzeReplay(replayPath: string, basePath: string, engineDir: string): Promise<AnalysisResult> {
        // Create output directory for events.log
        const outputDir = path.join(basePath, 'LuaUI', 'Logs', 'replay_stats', '__yylobby_analysis')
        fs.mkdirSync(outputDir, { recursive: true })
        const eventsLogPath = path.join(outputDir, 'events.log')
        try {
            fs.rmSync(eventsLogPath, { force: true })
        } catch {}

        // Spring's --config expects a file path, not a directory path.
        const tempConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yylobby_analysis_'))
        const tempConfigPath = path.join(tempConfigDir, 'springsettings.cfg')

        try {
            // Copy user's springsettings.cfg and append headless replay ID
            const userConfigPath = path.join(basePath, 'springsettings.cfg')
            let configContent = ''
            if (fs.existsSync(userConfigPath)) {
                configContent = fs.readFileSync(userConfigPath, 'utf-8')
            }
            fs.writeFileSync(tempConfigPath, configContent, 'utf-8')

            // Install widgets
            this.installWidgets(basePath)

            // Find spring-headless.exe
            const headlessExe = path.join(engineDir, 'spring-headless.exe')
            if (!fs.existsSync(headlessExe)) {
                return { success: false, error: `spring-headless.exe not found at ${headlessExe}`, players: [], events: [] }
            }

            console.log(`[ReplayAnalyzer] Running: ${headlessExe} --isolation --write-dir ${basePath} --config ${tempConfigPath} ${replayPath}`)

            // Spawn headless engine
            const result = await new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
                let stdout = ''
                let stderr = ''

                const child = spawn(headlessExe, [
                    '--isolation',
                    '--write-dir', basePath,
                    '--config', tempConfigPath,
                    replayPath
                ], { stdio: ['ignore', 'pipe', 'pipe'] })

                child.stdout.on('data', (data) => { stdout += data.toString() })
                child.stderr.on('data', (data) => { stderr += data.toString() })

                const timeout = setTimeout(() => {
                    console.log('[ReplayAnalyzer] Timeout reached, killing process')
                    child.kill()
                }, 10 * 60 * 1000) // 10 minute timeout

                child.on('close', (code) => {
                    clearTimeout(timeout)
                    resolve({ code, stdout, stderr })
                })

                child.on('error', (err) => {
                    clearTimeout(timeout)
                    resolve({ code: -1, stdout, stderr: stderr + '\n' + err.message })
                })
            })

            console.log(`[ReplayAnalyzer] Process exited with code ${result.code}`)
            if (result.stderr) {
                console.log(`[ReplayAnalyzer] stderr: ${result.stderr.slice(0, 500)}`)
            }

            // Read events.log
            if (!fs.existsSync(eventsLogPath)) {
                const stderrSnippet = result.stderr.trim().slice(0, 500)
                return {
                    success: false,
                    error: `events.log not created at ${eventsLogPath}. Process exited with code ${result.code}.${stderrSnippet ? ` stderr: ${stderrSnippet}` : ''}`,
                    players: [],
                    events: []
                }
            }

            const content = fs.readFileSync(eventsLogPath, 'utf-8')
            return this.parseEventsLog(content)
        } finally {
            // Clean up temp config dir
            try {
                fs.rmSync(tempConfigDir, { recursive: true, force: true })
            } catch {}
        }
    }

    parseEventsLog(content: string): AnalysisResult {
        const lines = content.split('\n').filter(l => l.trim())
        const players: AnalysisResult['players'] = []
        const events: AnalysisResult['events'] = []
        let winner: string | undefined
        let durationFrames: number | undefined
        let statsHeaders: string[] = []
        const statsValues: number[][] = []

        for (const line of lines) {
            // Parse frame number
            const frameMatch = line.match(/^\[(\d+)\]\s*(.*)$/)
            if (!frameMatch) continue
            const frame = parseInt(frameMatch[1])
            const rest = frameMatch[2]

            // Player info: "Name, team: 0, elo:1500, userid: 123"
            const playerMatch = rest.match(/^(.+?), team: (\d+), elo:(\d+)/)
            if (playerMatch && !rest.startsWith('Event')) {
                const isAI = rest.includes(', ai: ')
                players.push({
                    name: playerMatch[1],
                    teamId: parseInt(playerMatch[2]),
                    elo: parseInt(playerMatch[3]),
                    isAI: isAI || undefined
                })
                continue
            }

            // Winner: "Received game_message: Name wins!"
            const winnerMatch = rest.match(/^Received game_message: (.+) wins!$/)
            if (winnerMatch) {
                winner = winnerMatch[1]
                durationFrames = frame
                events.push({ frame, type: 'game_over', description: rest })
                continue
            }

            // Unit events: "Event [x,y,z]: team finished/lost unit Name"
            const eventMatch = rest.match(/^Event \[([^\]]*)\]: (.+)$/)
            if (eventMatch) {
                const desc = eventMatch[2]
                const unitEventMatch = desc.match(/^(\d+) (finished|lost) unit (.+)$/)
                if (unitEventMatch) {
                    events.push({
                        frame,
                        type: unitEventMatch[2] === 'finished' ? 'unit_finished' : 'unit_lost',
                        team: parseInt(unitEventMatch[1]),
                        unitName: unitEventMatch[3],
                        description: desc
                    })
                } else {
                    events.push({ frame, type: 'event', description: desc })
                }
                continue
            }

            // End-game stats header
            if (rest.startsWith('Game End Stats Header: ')) {
                statsHeaders = rest.replace('Game End Stats Header: ', '').split(',')
                continue
            }

            // End-game stats values
            if (rest.startsWith('Game End Stats Values: ')) {
                const vals = rest.replace('Game End Stats Values: ', '').split(',').map(v => {
                    const n = parseFloat(v.replace(/"/g, ''))
                    return isNaN(n) ? 0 : n
                })
                statsValues.push(vals)
                continue
            }

            // Other logged events (resigned, died, etc.)
            if (rest.startsWith('Event')) {
                events.push({ frame, type: 'event', description: rest })
            }
        }

        return {
            success: true,
            players,
            winner,
            durationFrames,
            events,
            endGameStats: statsHeaders.length > 0 ? { headers: statsHeaders, values: statsValues } : undefined
        }
    }
}
