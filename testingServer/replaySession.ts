/**
 * Zero-K Session Replay
 *
 * Reads a session log file and replays the commands to the server.
 * Can be used to reproduce bugs or test server behavior.
 *
 * Usage:
 *   npm run replay                    - Replay session.log
 *   npm run replay -- custom.log      - Replay custom log file
 *   npm run replay -- --dry-run       - Parse and display without connecting
 */

import * as net from 'net'
import * as fs from 'fs'
import * as readline from 'readline'
import * as path from 'path'
import 'dotenv/config'

// ============================================================================
// Configuration
// ============================================================================

const config = {
  host: process.env.ZK_SERVER_HOST || 'zero-k.info',
  port: parseInt(process.env.ZK_SERVER_PORT || '8200', 10),
  defaultLogFile: process.env.LOG_FILE || 'session.log'
}

// ============================================================================
// Types
// ============================================================================

interface LogEntry {
  timestamp: Date
  direction: 'SEND' | 'RECV' | 'EVENT'
  command: string
  data: unknown
  raw: string
}

// ============================================================================
// Log Parser
// ============================================================================

async function parseLogFile(filePath: string): Promise<LogEntry[]> {
  const entries: LogEntry[] = []

  const fileStream = fs.createReadStream(filePath)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    // Skip comments and empty lines
    if (line.startsWith('#') || !line.trim()) continue

    // Parse format: TIMESTAMP | DIRECTION | COMMAND | DATA
    const parts = line.split(' | ')
    if (parts.length < 4) continue

    const [timestamp, direction, command, ...dataParts] = parts
    const dataStr = dataParts.join(' | ') // Rejoin in case data contained |

    let data: unknown
    try {
      data = JSON.parse(dataStr)
    } catch {
      data = dataStr
    }

    entries.push({
      timestamp: new Date(timestamp),
      direction: direction as 'SEND' | 'RECV' | 'EVENT',
      command,
      data,
      raw: line
    })
  }

  return entries
}

// ============================================================================
// Replay Client
// ============================================================================

class ReplayClient {
  private socket: net.Socket | null = null
  private isConnected = false
  private dataBuffer = ''

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new net.Socket()

      this.socket
        .setEncoding('utf-8')
        .on('connect', () => {
          this.isConnected = true
          console.log(`\x1b[32m✓ Connected to ${config.host}:${config.port}\x1b[0m`)
          resolve()
        })
        .on('close', () => {
          this.isConnected = false
          console.log('\x1b[31m✗ Disconnected\x1b[0m')
        })
        .on('error', (err) => {
          console.error('\x1b[31mConnection error:\x1b[0m', err.message)
          reject(err)
        })
        .on('data', (data: string) => {
          this.handleData(data)
        })

      console.log(`Connecting to ${config.host}:${config.port}...`)
      this.socket.connect({ host: config.host, port: config.port })
    })
  }

  private handleData(rawData: string): void {
    this.dataBuffer += rawData

    const lines = this.dataBuffer.split('\n')
    this.dataBuffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const spaceIdx = trimmed.indexOf(' ')
      const command = spaceIdx > 0 ? trimmed.substring(0, spaceIdx) : trimmed
      const jsonStr = spaceIdx > 0 ? trimmed.substring(spaceIdx + 1) : '{}'

      try {
        const data = JSON.parse(jsonStr)
        console.log(`  \x1b[32m← RECV\x1b[0m ${command}:`, JSON.stringify(data).substring(0, 100))
      } catch {
        console.log(`  \x1b[32m← RECV\x1b[0m ${command}: ${jsonStr.substring(0, 100)}`)
      }
    }
  }

  send(command: string, data: unknown): void {
    if (!this.socket || !this.isConnected) {
      console.error('\x1b[31mNot connected\x1b[0m')
      return
    }

    console.log(`  \x1b[33m→ SEND\x1b[0m ${command}:`, JSON.stringify(data).substring(0, 100))
    this.socket.write(`${command} ${JSON.stringify(data)}\n`)
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.destroy()
      this.socket = null
    }
  }
}

// ============================================================================
// Replay Functions
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function replaySession(entries: LogEntry[], dryRun: boolean): Promise<void> {
  const sendEntries = entries.filter(e => e.direction === 'SEND')

  console.log(`\n\x1b[36mReplay Summary:\x1b[0m`)
  console.log(`  Total entries: ${entries.length}`)
  console.log(`  SEND commands: ${sendEntries.length}`)
  console.log(`  RECV commands: ${entries.filter(e => e.direction === 'RECV').length}`)
  console.log(`  Events: ${entries.filter(e => e.direction === 'EVENT').length}`)

  if (sendEntries.length === 0) {
    console.log('\x1b[33mNo SEND commands to replay\x1b[0m')
    return
  }

  console.log('\n\x1b[36mCommands to replay:\x1b[0m')
  sendEntries.forEach((entry, i) => {
    console.log(`  ${i + 1}. ${entry.command} - ${JSON.stringify(entry.data).substring(0, 60)}...`)
  })

  if (dryRun) {
    console.log('\n\x1b[33m[DRY RUN] Not connecting to server\x1b[0m')
    return
  }

  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const answer = await new Promise<string>(resolve => {
    rl.question('\n\x1b[36mProceed with replay? (y/n): \x1b[0m', resolve)
  })
  rl.close()

  if (answer.toLowerCase() !== 'y') {
    console.log('Replay cancelled')
    return
  }

  // Connect and replay
  const client = new ReplayClient()

  try {
    await client.connect()

    // Calculate delays between commands based on original timestamps
    let prevTimestamp: Date | null = null

    for (const entry of sendEntries) {
      // Calculate delay (cap at 5 seconds for practical replay)
      let delay = 500 // Default 500ms between commands
      if (prevTimestamp) {
        const originalDelay = entry.timestamp.getTime() - prevTimestamp.getTime()
        delay = Math.min(originalDelay, 5000)
        delay = Math.max(delay, 100) // Minimum 100ms
      }

      console.log(`\n\x1b[36m[${entry.timestamp.toISOString()}]\x1b[0m (waiting ${delay}ms)`)
      await sleep(delay)

      client.send(entry.command, entry.data)
      prevTimestamp = entry.timestamp

      // Give server time to respond
      await sleep(500)
    }

    console.log('\n\x1b[32m✓ Replay complete\x1b[0m')

    // Wait a bit to see final responses
    await sleep(2000)
    client.disconnect()

  } catch (error) {
    console.error('\x1b[31mReplay failed:\x1b[0m', error)
    client.disconnect()
  }
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  console.log('\x1b[36m')
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║           Zero-K Session Replay v1.0                         ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('\x1b[0m')

  // Parse arguments
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const logFile = args.find(arg => !arg.startsWith('--')) || config.defaultLogFile
  const logPath = path.join(__dirname, logFile)

  console.log(`Log file: \x1b[33m${logPath}\x1b[0m`)
  console.log(`Dry run:  \x1b[33m${dryRun}\x1b[0m`)

  // Check if file exists
  if (!fs.existsSync(logPath)) {
    console.error(`\x1b[31mLog file not found: ${logPath}\x1b[0m`)
    process.exit(1)
  }

  // Parse log file
  console.log('\nParsing log file...')
  const entries = await parseLogFile(logPath)

  if (entries.length === 0) {
    console.log('\x1b[33mNo entries found in log file\x1b[0m')
    process.exit(0)
  }

  // Replay
  await replaySession(entries, dryRun)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
