/**
 * Zero-K Terminal Client
 *
 * A standalone terminal-based client that connects to the Zero-K lobby server,
 * logs in, and records all sent/received commands to a log file.
 *
 * The log file format is designed to be replayable - each line contains:
 * - Timestamp (ISO format)
 * - Direction (SEND or RECV)
 * - Command name
 * - JSON data
 *
 * Usage:
 *   npm start         - Run the client
 *   npm run replay    - Replay a session from the log file
 */

import * as net from 'net'
import * as fs from 'fs'
import * as crypto from 'crypto'
import * as readline from 'readline'
import * as path from 'path'
import 'dotenv/config'

// ============================================================================
// Configuration
// ============================================================================

const config = {
  username: process.env.ZK_USERNAME || 'testbot12345',
  password: process.env.ZK_PASSWORD || '123',
  host: process.env.ZK_SERVER_HOST || 'zero-k.info',
  port: parseInt(process.env.ZK_SERVER_PORT || '8200', 10),
  logFile: process.env.LOG_FILE || 'session.log'
}

// ============================================================================
// Logger
// ============================================================================

class SessionLogger {
  private logStream: fs.WriteStream
  private logPath: string

  constructor(filename: string) {
    this.logPath = path.join(__dirname, filename)

    // Create/overwrite log file with session header
    this.logStream = fs.createWriteStream(this.logPath, { flags: 'w' })
    this.writeHeader()
  }

  private writeHeader(): void {
    const header = [
      '# Zero-K Session Log',
      `# Started: ${new Date().toISOString()}`,
      `# Server: ${config.host}:${config.port}`,
      `# Username: ${config.username}`,
      '#',
      '# Format: TIMESTAMP | DIRECTION | COMMAND | DATA',
      '# DIRECTION: SEND = client to server, RECV = server to client',
      '#',
      ''
    ].join('\n')

    this.logStream.write(header)
  }

  logSend(command: string, data: unknown): void {
    const entry = this.formatEntry('SEND', command, data)
    this.logStream.write(entry + '\n')
    console.log(`\x1b[33m→ SEND\x1b[0m ${command}`, JSON.stringify(data, null, 2))
  }

  logRecv(command: string, data: unknown): void {
    const entry = this.formatEntry('RECV', command, data)
    this.logStream.write(entry + '\n')
    console.log(`\x1b[32m← RECV\x1b[0m ${command}`, JSON.stringify(data, null, 2))
  }

  logEvent(event: string, message: string): void {
    const timestamp = new Date().toISOString()
    const entry = `${timestamp} | EVENT | ${event} | ${message}`
    this.logStream.write(entry + '\n')
    console.log(`\x1b[36m◆ ${event}\x1b[0m ${message}`)
  }

  private formatEntry(direction: 'SEND' | 'RECV', command: string, data: unknown): string {
    const timestamp = new Date().toISOString()
    const jsonData = JSON.stringify(data)
    return `${timestamp} | ${direction} | ${command} | ${jsonData}`
  }

  close(): void {
    this.logStream.end()
  }

  getLogPath(): string {
    return this.logPath
  }
}

// ============================================================================
// Zero-K Client
// ============================================================================

class ZkTerminalClient {
  private socket: net.Socket | null = null
  private dataBuffer = ''
  private logger: SessionLogger
  private isConnected = false
  private rl: readline.Interface

  constructor() {
    this.logger = new SessionLogger(config.logFile)
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new net.Socket()

      this.socket
        .setEncoding('utf-8')
        .on('connect', () => {
          this.isConnected = true
          this.logger.logEvent('CONNECTED', `Connected to ${config.host}:${config.port}`)
          resolve()
        })
        .on('close', () => {
          this.isConnected = false
          this.logger.logEvent('DISCONNECTED', 'Connection closed')
          console.log('\n\x1b[31mDisconnected from server\x1b[0m')
        })
        .on('error', (err) => {
          this.logger.logEvent('ERROR', err.message)
          console.error('\x1b[31mConnection error:\x1b[0m', err.message)
          reject(err)
        })
        .on('data', (data: string) => {
          this.handleData(data)
        })

      this.logger.logEvent('CONNECTING', `Connecting to ${config.host}:${config.port}...`)
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
        this.logger.logRecv(command, data)
        this.handleCommand(command, data)
      } catch {
        // If JSON parse fails, log raw data
        this.logger.logRecv(command, jsonStr)
      }
    }
  }

  private handleCommand(command: string, data: unknown): void {
    switch (command) {
      case 'Welcome':
        console.log('\x1b[35m★ Welcome message received\x1b[0m')
        break
      case 'LoginResponse':
        const response = data as { ResultCode: number; Reason?: string }
        if (response.ResultCode === 0) {
          console.log('\x1b[32m✓ Login successful!\x1b[0m')
        } else {
          console.log(`\x1b[31m✗ Login failed: ${response.Reason || 'Unknown error'} (code: ${response.ResultCode})\x1b[0m`)
        }
        break
      case 'Ping':
        // Auto-respond to pings to keep connection alive
        this.send('Ping', {})
        break
    }
  }

  send(command: string, data: unknown): void {
    if (!this.socket || !this.isConnected) {
      console.error('\x1b[31mNot connected to server\x1b[0m')
      return
    }

    this.logger.logSend(command, data)
    this.socket.write(`${command} ${JSON.stringify(data)}\n`)
  }

  login(): void {
    const passwordHash = crypto
      .createHash('md5')
      .update(config.password)
      .digest('base64')

    this.send('Login', {
      Name: config.username,
      PasswordHash: passwordHash,
      UserID: 0,
      InstallID: 0,
      LobbyVersion: 0,
      SteamAuthToken: '',
      Dlc: ''
    })
  }

  startInteractiveMode(): void {
    console.log('\n\x1b[36m═══════════════════════════════════════════════════════════════\x1b[0m')
    console.log('\x1b[36m  Interactive Mode - Type commands or use shortcuts:\x1b[0m')
    console.log('\x1b[36m═══════════════════════════════════════════════════════════════\x1b[0m')
    console.log('  \x1b[33m/login\x1b[0m           - Login with configured credentials')
    console.log('  \x1b[33m/join <channel>\x1b[0m  - Join a channel')
    console.log('  \x1b[33m/say <msg>\x1b[0m       - Say in current channel')
    console.log('  \x1b[33m/raw <cmd> <json>\x1b[0m- Send raw command')
    console.log('  \x1b[33m/ping\x1b[0m            - Send ping')
    console.log('  \x1b[33m/quit\x1b[0m            - Disconnect and exit')
    console.log('\x1b[36m═══════════════════════════════════════════════════════════════\x1b[0m\n')

    this.rl.setPrompt('\x1b[34mzk>\x1b[0m ')
    this.rl.prompt()

    this.rl.on('line', (line) => {
      this.handleInput(line.trim())
      if (this.isConnected) {
        this.rl.prompt()
      }
    })

    this.rl.on('close', () => {
      this.disconnect()
    })
  }

  private handleInput(input: string): void {
    if (!input) return

    if (input.startsWith('/')) {
      const parts = input.slice(1).split(' ')
      const cmd = parts[0].toLowerCase()
      const args = parts.slice(1).join(' ')

      switch (cmd) {
        case 'login':
          this.login()
          break

        case 'join':
          if (args) {
            this.send('JoinChannel', { ChannelName: args, Password: '' })
          } else {
            console.log('\x1b[33mUsage: /join <channel>\x1b[0m')
          }
          break

        case 'say':
          if (args) {
            this.send('Say', { Place: 0, Target: '', Text: args, IsEmote: false })
          } else {
            console.log('\x1b[33mUsage: /say <message>\x1b[0m')
          }
          break

        case 'ping':
          this.send('Ping', {})
          break

        case 'raw':
          const spaceIdx = args.indexOf(' ')
          if (spaceIdx > 0) {
            const rawCmd = args.substring(0, spaceIdx)
            const rawData = args.substring(spaceIdx + 1)
            try {
              this.send(rawCmd, JSON.parse(rawData))
            } catch {
              console.log('\x1b[31mInvalid JSON data\x1b[0m')
            }
          } else {
            console.log('\x1b[33mUsage: /raw <command> <json>\x1b[0m')
          }
          break

        case 'quit':
        case 'exit':
          this.disconnect()
          break

        default:
          console.log(`\x1b[33mUnknown command: ${cmd}\x1b[0m`)
      }
    } else {
      // Treat as chat message
      this.send('Say', { Place: 0, Target: '', Text: input, IsEmote: false })
    }
  }

  disconnect(): void {
    this.logger.logEvent('CLOSING', 'Client shutting down')
    console.log(`\n\x1b[36mSession log saved to: ${this.logger.getLogPath()}\x1b[0m`)

    if (this.socket) {
      this.socket.destroy()
      this.socket = null
    }

    this.logger.close()
    this.rl.close()
    process.exit(0)
  }
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  console.log('\x1b[36m')
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║           Zero-K Terminal Client v1.0                        ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log('\x1b[0m')

  console.log(`Server: \x1b[33m${config.host}:${config.port}\x1b[0m`)
  console.log(`User:   \x1b[33m${config.username}\x1b[0m`)
  console.log(`Log:    \x1b[33m${config.logFile}\x1b[0m`)
  console.log('')

  const client = new ZkTerminalClient()

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n\x1b[33mInterrupted, closing...\x1b[0m')
    client.disconnect()
  })

  try {
    await client.connect()

    // Auto-login after connection
    console.log('\n\x1b[36mAuto-logging in...\x1b[0m')
    client.login()

    // Start interactive mode
    client.startInteractiveMode()
  } catch (error) {
    console.error('\x1b[31mFailed to connect:\x1b[0m', error)
    process.exit(1)
  }
}

main()
