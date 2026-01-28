import net from 'net'
import { EventEmitter } from 'events'

type ServerType = 'production' | 'test' | 'local'

interface ServerConfig {
  host: string
  port: number
}

/**
 * ZerokConnection handles TCP communication with the Zero-K lobby server.
 * It ONLY handles parsing and emitting - no state ownership.
 *
 * Events emitted:
 * - 'connecting' - Connection attempt started
 * - 'connected' - Successfully connected
 * - 'disconnected' - Connection closed
 * - 'error' - Connection error (with Error object)
 * - 'command' - Parsed command from server (with { name, data })
 */
export default class ZerokConnection {
  private socket: net.Socket | null = null
  private dataBuffer = ''

  readonly events = new EventEmitter()

  private readonly servers: Record<ServerType, ServerConfig> = {
    production: { host: 'zero-k.info', port: 8200 },
    test: { host: 'test.zero-k.info', port: 8202 },
    local: { host: '127.0.0.1', port: 8888 }
  }

  connect(server: ServerType = 'production'): void {
    // Clean up existing socket if any
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.destroy()
      this.socket = null
    }

    // Create fresh socket
    this.socket = new net.Socket()
    this.dataBuffer = ''

    // Register handlers BEFORE connecting
    this.socket
      .setEncoding('utf-8')
      .on('connect', () => {
        console.log('[ZerokConnection] Connected')
        this.events.emit('connected')
      })
      .on('close', () => {
        console.log('[ZerokConnection] Disconnected')
        this.events.emit('disconnected')
      })
      .on('error', (err: Error) => {
        console.error('[ZerokConnection] Error:', err.message)
        this.events.emit('error', err)
      })
      .on('data', (data: string) => {
        this.handleData(data)
      })

    // Emit connecting event, then connect
    this.events.emit('connecting')
    this.socket.connect(this.servers[server])
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.destroy()
      this.socket = null
    }
  }

  send(commandName: string, data: unknown): void {
    if (this.socket && !this.socket.destroyed) {
      this.socket.write(`${commandName} ${JSON.stringify(data)}\n`)
    }
  }

  private handleData(rawData: string): void {
    this.dataBuffer += rawData

    // Split by newlines
    const lines = this.dataBuffer.split('\n')

    // Keep incomplete last line in buffer
    this.dataBuffer = lines.pop() ?? ''

    // Process complete lines
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const spaceIdx = trimmed.indexOf(' ')
      const commandName = spaceIdx > 0 ? trimmed.substring(0, spaceIdx) : trimmed
      const jsonData = spaceIdx > 0 ? trimmed.substring(spaceIdx + 1) : '{}'

      try {
        const parsed = JSON.parse(jsonData)
        console.log(`[ZerokConnection] Command: ${commandName}`)
        this.events.emit('command', { name: commandName, data: parsed })
      } catch {
        // If JSON parse fails, emit raw string as data
        console.log(`[ZerokConnection] Command (raw): ${commandName}`)
        this.events.emit('command', { name: commandName, data: jsonData })
      }
    }
  }
}
