import { ipcLink } from 'electron-trpc-experimental/renderer'
import './assets/main.css'
import ReactDOM from 'react-dom/client'
import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '../utils/trpc'
import type { AppState } from '../../main/types/AppState'

function StateViewer(): JSX.Element {
  const [state, setState] = useState<AppState | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    connection: true,
    auth: true,
    lobby: true,
    channels: false,
    battles: false
  })

  trpc.stateStream.useSubscription(undefined, {
    onData: (update) => {
      if (update.type === 'full' && update.state) {
        setState(update.state)
      }
    }
  })

  const toggleSection = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!state) {
    return (
      <div className="p-4 text-muted-foreground">
        Waiting for state...
      </div>
    )
  }

  const Section = ({ title, data, keyName }: { title: string; data: unknown; keyName: string }) => (
    <div className="mb-2 border border-border rounded">
      <button
        onClick={() => toggleSection(keyName)}
        className="w-full px-3 py-2 text-left font-mono text-sm bg-secondary hover:bg-accent flex justify-between items-center"
      >
        <span className="font-semibold">{title}</span>
        <span className="text-muted-foreground">{expanded[keyName] ? '[-]' : '[+]'}</span>
      </button>
      {expanded[keyName] && (
        <pre className="p-3 text-xs overflow-auto max-h-64 bg-card">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )

  return (
    <div className="p-4 space-y-2">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Lobby State Debug</h1>
        <span className="text-xs text-muted-foreground font-mono">
          Updated: {new Date(state.lastUpdated).toLocaleTimeString()}
        </span>
      </div>

      <Section title="connection" data={state.connection} keyName="connection" />
      <Section title="auth" data={state.auth} keyName="auth" />
      <Section title="lobby" data={state.lobby} keyName="lobby" />
      <Section
        title={`channels (${Object.keys(state.channels).length})`}
        data={state.channels}
        keyName="channels"
      />
      <Section
        title={`battles (${state.battles.length})`}
        data={state.battles}
        keyName="battles"
      />
      <div className="text-xs text-muted-foreground mt-4">
        activeChannel: <span className="font-mono">{state.activeChannel ?? 'null'}</span>
      </div>
    </div>
  )
}

function DebugApp(): JSX.Element {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [ipcLink()]
    })
  )

  return (
    <React.StrictMode>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <div className="dark min-h-screen bg-background text-foreground">
            <StateViewer />
          </div>
        </QueryClientProvider>
      </trpc.Provider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<DebugApp />)
