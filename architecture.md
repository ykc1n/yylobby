# YYLobby Architecture

This document describes the architecture of YYLobby, an Electron-based lobby client for Zero-K (and potentially other RTS games).

## Overview

YYLobby uses a **single unified state stream** architecture that cleanly separates concerns between:

1. **Network Layer** - TCP socket communication with the game server
2. **State Layer** - Centralized state management
3. **API Layer** - tRPC for type-safe IPC between main and renderer processes
4. **UI Layer** - React components that consume state via hooks

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MAIN PROCESS                                    │
│                                                                              │
│  ┌──────────────────┐     ┌──────────────────────┐     ┌─────────────────┐  │
│  │  ZerokConnection │────▶│  ZerokLobbyInterface │────▶│  ZerokLobbyState │  │
│  │   (TCP Socket)   │     │     (Controller)     │     │ (Single Source   │  │
│  │                  │     │                      │     │   of Truth)      │  │
│  └──────────────────┘     └──────────────────────┘     └────────┬────────┘  │
│         │                                                        │          │
│         │ Raw TCP                                                │          │
│         │ Events                                         emits   │          │
│         ▼                                            'stateChange'          │
│  ┌──────────────────┐                                            │          │
│  │   Game Server    │                                            │          │
│  │  (zero-k.info)   │                                            │          │
│  └──────────────────┘                                            │          │
│                                                                  │          │
│                         ┌────────────────────────────────────────┘          │
│                         │                                                   │
│                         ▼                                                   │
│               ┌─────────────────┐                                           │
│               │    tRPC Router   │                                          │
│               │   (api.ts)       │                                          │
│               │                  │                                          │
│               │  - stateStream   │◀──── Single subscription                 │
│               │  - connect       │                                          │
│               │  - login         │                                          │
│               │  - joinChannel   │                                          │
│               └────────┬────────┘                                           │
│                        │                                                    │
└────────────────────────┼────────────────────────────────────────────────────┘
                         │ IPC (electron-trpc)
┌────────────────────────┼────────────────────────────────────────────────────┐
│                        │            RENDERER PROCESS                        │
│                        ▼                                                    │
│               ┌─────────────────┐                                           │
│               │  useStateSync() │◀──── Called once at App root              │
│               │     (hook)      │                                           │
│               └────────┬────────┘                                           │
│                        │                                                    │
│                        │ Updates store on each state change                 │
│                        ▼                                                    │
│               ┌─────────────────┐                                           │
│               │   useAppStore   │◀──── Single Zustand store                 │
│               │    (Zustand)    │                                           │
│               └────────┬────────┘                                           │
│                        │                                                    │
│           ┌────────────┼────────────┬─────────────┐                         │
│           │            │            │             │                         │
│           ▼            ▼            ▼             ▼                         │
│    ┌──────────┐ ┌───────────┐ ┌─────────┐ ┌───────────┐                    │
│    │useConnect│ │useLobbyInfo│ │useAuth │ │useBattles │  ...selectors      │
│    │ionStatus │ │           │ │        │ │           │                     │
│    └────┬─────┘ └─────┬─────┘ └───┬────┘ └─────┬─────┘                     │
│         │             │           │            │                            │
│         └─────────────┴───────────┴────────────┘                            │
│                        │                                                    │
│                        ▼                                                    │
│               ┌─────────────────┐                                           │
│               │ React Components │                                          │
│               │                  │                                          │
│               │ ConnectionIndicator, Login, BattleList, etc.               │
│               └─────────────────┘                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Main Process Components

### 1. ZerokConnection (`src/main/ZerokConnection.ts`)

**Purpose:** Handles raw TCP socket communication with the Zero-K lobby server.

**Responsibilities:**
- Establishes and manages TCP connection to the game server
- Parses incoming data stream into discrete commands
- Buffers incomplete messages until fully received
- Emits events for connection lifecycle and parsed commands

**Events Emitted:**
| Event | Payload | Description |
|-------|---------|-------------|
| `connecting` | none | Connection attempt started |
| `connected` | none | Successfully connected to server |
| `disconnected` | none | Connection closed |
| `error` | `Error` | Connection error occurred |
| `command` | `{ name: string, data: unknown }` | Parsed command from server |

**Key Design Decisions:**
- Creates a **new socket instance** on each connection attempt (avoids reusing destroyed sockets)
- Registers event handlers **before** calling `connect()` (prevents race conditions)
- Does **not** own any state - purely handles I/O

```typescript
// Example: Connecting to the server
const connection = new ZerokConnection()
connection.events.on('connected', () => console.log('Connected!'))
connection.events.on('command', ({ name, data }) => {
  console.log(`Received ${name}:`, data)
})
connection.connect('production') // 'production' | 'test' | 'local'
```

---

### 2. ZerokLobbyInterface (`src/main/ZerokLobbyInterface.ts`)

**Purpose:** Controller that bridges ZerokConnection events to ZerokLobbyState updates.

**Responsibilities:**
- Listens to ZerokConnection events
- Translates server commands into state updates
- Handles request/response patterns (e.g., login with timeout)
- Provides public methods for user actions (connect, login, joinChannel)

**Server Commands Handled:**
| Command | Action |
|---------|--------|
| `Welcome` | Updates lobby info (engine, game, userCount) |
| `LoginResponse` | Updates auth state, resolves pending login promise |
| `JoinChannelResponse` | Adds channel to state |
| `RegisterResponse` | Logs response (placeholder) |

**Key Design Decisions:**
- Uses a `pendingRequests` Map for async request/response patterns with timeouts
- All state mutations go through `ZerokLobbyState` - never mutates state directly
- Decoupled from UI concerns - just translates protocol to state

```typescript
// Example: Login flow
const lobbyInterface = new ZerokLobbyInterface(connection, lobbyState)

// This sends the login command and waits for response (with 10s timeout)
const response = await lobbyInterface.login('username', 'password')
// State is automatically updated when LoginResponse arrives
```

---

### 3. ZerokLobbyState (`src/main/ZerokLobbyState.ts`)

**Purpose:** Single source of truth for all application state.

**Responsibilities:**
- Holds the complete application state
- Provides immutable update methods
- Emits `stateChange` event whenever state changes
- Extends EventEmitter for subscription support

**State Shape:**
```typescript
interface AppState {
  connection: {
    status: 'disconnected' | 'connecting' | 'connected'
    lastError: string | null
  }
  auth: {
    loggedIn: boolean
    username: string | null
    loginMessage: string
  }
  lobby: {
    engine: string
    game: string
    userCount: number
    welcomeMessage: string | null
  }
  channels: Record<string, ChannelData>
  battles: BattleData[]
  lastUpdated: number  // Timestamp for debugging
}
```

**Update Methods:**
| Method | Description |
|--------|-------------|
| `updateConnection(status, error?)` | Update connection status |
| `updateAuth(partial)` | Merge auth state changes |
| `updateLobby(partial)` | Merge lobby info changes |
| `setChannel(name, data)` | Add/update a channel |
| `removeChannel(name)` | Remove a channel |
| `addBattle(battle)` | Add a battle to the list |
| `updateBattle(id, partial)` | Update battle properties |
| `removeBattle(id)` | Remove a battle |
| `resetOnDisconnect()` | Reset to initial state on disconnect |

**Key Design Decisions:**
- All updates are **immutable** (creates new state objects)
- Every update increments `lastUpdated` timestamp
- Emits **full state** on every change (simple, debuggable)

---

### 4. tRPC Router (`src/main/router/api.ts`)

**Purpose:** Exposes main process functionality to renderer via type-safe IPC.

**Procedures:**

| Procedure | Type | Description |
|-----------|------|-------------|
| `getState` | Query | Returns current state snapshot |
| `stateStream` | Subscription | Streams state updates in real-time |
| `connect` | Mutation | Initiates server connection |
| `login` | Mutation | Authenticates with server |
| `joinChannel` | Mutation | Joins a chat channel |
| `getReplays` | Query | Lists local replay files |
| `openReplay` | Mutation | Launches a replay |

**Key Design Decisions:**
- **Single subscription** (`stateStream`) for all state - no multiple subscriptions to sync
- Event listener created **before** yielding initial state (prevents race conditions)
- Mutations trigger actions, subscriptions deliver results

```typescript
// The stateStream subscription pattern
stateStream: t.procedure.subscription(async function* (opts) {
  const { lobbyState } = opts.ctx

  // Start listening BEFORE yielding initial state
  const events = on(lobbyState, 'stateChange', { signal: opts.signal })

  // Yield initial state
  yield { type: 'full', state: lobbyState.getState(), timestamp: Date.now() }

  // Then yield updates as they arrive
  for await (const [update] of events) {
    yield update
  }
})
```

---

## Renderer Process Components

### 5. App Store (`src/renderer/src/store/appStore.ts`)

**Purpose:** Zustand store that mirrors main process state.

**Responsibilities:**
- Holds a copy of the AppState
- Provides selector hooks for efficient re-renders
- Single `setState` method for bulk updates from subscription

**Selector Hooks:**
```typescript
useConnectionStatus()  // Returns: ConnectionStatus
useConnectionError()   // Returns: string | null
useAuth()              // Returns: { loggedIn, username, loginMessage }
useLobbyInfo()         // Returns: { engine, game, userCount, welcomeMessage }
useChannels()          // Returns: Record<string, ChannelData>
useBattles()           // Returns: BattleData[]
```

**Key Design Decisions:**
- Zustand for minimal boilerplate and excellent React integration
- Selector hooks prevent unnecessary re-renders
- Store structure mirrors main process state exactly

---

### 6. useStateSync Hook (`src/renderer/src/hooks/useStateSync.ts`)

**Purpose:** Synchronizes main process state to renderer store.

**Usage:** Called **once** at the App root level.

```typescript
function App() {
  useStateSync()  // Sets up subscription, updates store on changes
  return <Router>...</Router>
}
```

**Key Design Decisions:**
- Single subscription for entire app
- Updates Zustand store on each state change
- Logs updates for debugging

---

### 7. useActions Hook (`src/renderer/src/hooks/useActions.ts`)

**Purpose:** Provides action methods that trigger main process operations.

**Returns:**
```typescript
{
  connect: () => void
  isConnecting: boolean

  login: (username, password) => Promise<LoginResponse>
  isLoggingIn: boolean
  loginError: Error | null

  joinChannel: (name, password?) => void
  isJoiningChannel: boolean
}
```

**Key Design Decisions:**
- Wraps tRPC mutations with loading/error state
- Components don't need to know about tRPC directly

---

## Data Flow Examples

### Connection Flow

```
1. User clicks "Connect" button
   │
2. ConnectionIndicator calls connect() from useActions
   │
3. tRPC mutation calls lobbyInterface.connect()
   │
4. ZerokLobbyInterface calls connection.connect('production')
   │
5. ZerokConnection emits 'connecting'
   │
6. ZerokLobbyInterface receives 'connecting', calls lobbyState.updateConnection('connecting')
   │
7. ZerokLobbyState updates state, emits 'stateChange'
   │
8. tRPC stateStream yields new state
   │
9. useStateSync receives update, calls useAppStore.setState()
   │
10. useConnectionStatus() returns 'connecting', UI shows yellow indicator
    │
11. TCP connection succeeds, ZerokConnection emits 'connected'
    │
12. Flow repeats: lobbyState.updateConnection('connected') → UI shows green
```

### Login Flow

```
1. User enters credentials, clicks Login
   │
2. Login component calls login(username, password) from useActions
   │
3. tRPC mutation calls lobbyInterface.login(username, password)
   │
4. ZerokLobbyInterface:
   │  a. Creates pending request with 10s timeout
   │  b. Sends Login command via connection.send()
   │
5. Server processes login, sends LoginResponse
   │
6. ZerokConnection parses response, emits 'command' { name: 'LoginResponse', data: {...} }
   │
7. ZerokLobbyInterface.handleLoginResponse:
   │  a. Resolves pending promise
   │  b. Calls lobbyState.updateAuth({ loggedIn: true, username: '...' })
   │
8. State flows to renderer (same as connection flow)
   │
9. Login mutation resolves, UI shows "Logged in as username"
```

---

## File Structure

```
src/
├── main/                           # Main process (Node.js)
│   ├── index.ts                    # Entry point, creates singletons
│   ├── ZerokConnection.ts          # TCP socket handler
│   ├── ZerokLobbyInterface.ts      # Protocol controller
│   ├── ZerokLobbyState.ts          # State management
│   ├── types/
│   │   └── AppState.ts             # Shared type definitions
│   ├── router/
│   │   ├── api.ts                  # tRPC router
│   │   └── context.ts              # tRPC context
│   └── local/
│       ├── replays.ts              # Replay file management
│       └── zk_launcher.ts          # Game launcher
│
├── renderer/                       # Renderer process (React)
│   └── src/
│       ├── App.tsx                 # Root component
│       ├── store/
│       │   └── appStore.ts         # Zustand store + selectors
│       ├── hooks/
│       │   ├── useStateSync.ts     # State subscription hook
│       │   └── useActions.ts       # Action methods hook
│       ├── components/
│       │   └── login.tsx           # Login form
│       └── pages/
│           └── ...                 # Page components
│
└── preload/                        # Electron preload script
    └── index.ts                    # IPC bridge setup
```

---

## Key Architectural Principles

1. **Single Source of Truth**: All state lives in `ZerokLobbyState`. Renderer just mirrors it.

2. **Unidirectional Data Flow**: Actions → Main Process → State Change → Subscription → UI Update

3. **No Race Conditions**: Event listeners are always set up before any async operations.

4. **Type Safety**: tRPC provides end-to-end type safety between processes.

5. **Separation of Concerns**:
   - `ZerokConnection`: I/O only
   - `ZerokLobbyInterface`: Protocol logic
   - `ZerokLobbyState`: State management
   - React components: UI only

6. **Debuggability**: Console logs at key points, timestamps on state updates.

---

## Adding New Features

### Adding a new server command handler:

1. Add handler in `ZerokLobbyInterface.handleCommand()`:
```typescript
case 'NewCommand':
  this.handleNewCommand(data as NewCommandData)
  break
```

2. Create handler method that updates state:
```typescript
private handleNewCommand(data: NewCommandData): void {
  this.lobbyState.updateSomething(data)
}
```

3. Add update method to `ZerokLobbyState` if needed.

### Adding new state:

1. Update `AppState` interface in `types/AppState.ts`
2. Add initial value in `ZerokLobbyState.getInitialState()`
3. Add update method in `ZerokLobbyState`
4. Add selector hook in `store/appStore.ts`
5. Use the hook in components

### Adding a new action:

1. Add method to `ZerokLobbyInterface`
2. Add tRPC procedure in `api.ts`
3. Add to `useActions` hook
4. Use in components
