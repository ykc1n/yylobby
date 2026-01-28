# Zero-K Terminal Client

A standalone terminal-based client for connecting to the Zero-K lobby server. Records all sent and received commands to a log file that can be replayed.

## Setup

```bash
cd testingServer
npm install
```

## Configuration

Edit `.env` to configure:

```env
# Credentials
ZK_USERNAME=testbot12345
ZK_PASSWORD=123

# Server (production)
ZK_SERVER_HOST=zero-k.info
ZK_SERVER_PORT=8200

# Output file
LOG_FILE=session.log
```

## Usage

### Start the Client

```bash
npm start
```

This will:
1. Connect to the Zero-K server
2. Automatically log in with the configured credentials
3. Start interactive mode where you can send commands
4. Log everything to `session.log`

### Interactive Commands

| Command | Description |
|---------|-------------|
| `/login` | Log in (happens automatically on start) |
| `/join <channel>` | Join a chat channel |
| `/say <message>` | Send a message |
| `/ping` | Send a ping to keep connection alive |
| `/raw <cmd> <json>` | Send raw command with JSON data |
| `/quit` | Disconnect and exit |

Any text without `/` prefix is sent as a chat message.

### Replay a Session

```bash
npm run replay                    # Replay session.log
npm run replay -- custom.log      # Replay specific file
npm run replay -- --dry-run       # Parse only, don't connect
```

## Log File Format

The log file uses a simple pipe-delimited format:

```
TIMESTAMP | DIRECTION | COMMAND | JSON_DATA
```

Example:
```
2024-01-26T20:30:15.123Z | SEND | Login | {"Name":"testbot12345","PasswordHash":"..."}
2024-01-26T20:30:15.456Z | RECV | Welcome | {"Engine":"105.1","Game":"Zero-K","UserCount":42}
2024-01-26T20:30:15.789Z | RECV | LoginResponse | {"ResultCode":0}
```

### Entry Types

- `SEND` - Command sent from client to server
- `RECV` - Command received from server
- `EVENT` - Client event (connect, disconnect, error)

## Example Session

```
╔═══════════════════════════════════════════════════════════════╗
║           Zero-K Terminal Client v1.0                        ║
╚═══════════════════════════════════════════════════════════════╝

Server: zero-k.info:8200
User:   testbot12345
Log:    session.log

◆ CONNECTING Connecting to zero-k.info:8200...
◆ CONNECTED Connected to zero-k.info:8200

Auto-logging in...
→ SEND Login {
  "Name": "testbot12345",
  "PasswordHash": "ICy5YqxZB1uWSwcVLSNLcA==",
  ...
}
← RECV Welcome {
  "Engine": "105.1.1-2511-g747f18b",
  "Game": "Zero-K",
  "UserCount": 156
}
★ Welcome message received
← RECV LoginResponse {
  "ResultCode": 0
}
✓ Login successful!

═══════════════════════════════════════════════════════════════
  Interactive Mode - Type commands or use shortcuts:
═══════════════════════════════════════════════════════════════
  /login           - Login with configured credentials
  /join <channel>  - Join a channel
  /say <msg>       - Say in current channel
  /raw <cmd> <json>- Send raw command
  /ping            - Send ping
  /quit            - Disconnect and exit
═══════════════════════════════════════════════════════════════

zk> /join zk
→ SEND JoinChannel {"ChannelName":"zk","Password":""}
← RECV JoinChannelResponse {"ChannelName":"zk","Channel":{...}}

zk> /quit
◆ CLOSING Client shutting down

Session log saved to: C:\Users\Nick\Projects\yylobby\testingServer\session.log
```

## Troubleshooting

**Connection refused**: Check that the server address and port are correct in `.env`

**Login failed**: Verify credentials. Common error codes:
- `1` - Invalid name
- `2` - Invalid password
- `4` - Banned

**Replay not working**: Make sure the log file exists and has valid entries
