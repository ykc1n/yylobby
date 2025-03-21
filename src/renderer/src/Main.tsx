import { ipcLink } from 'electron-trpc/renderer'
import './assets/main.css'
import ReactDOM from 'react-dom/client'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import App from './App'
import { trpc } from '../utils/trpc'

export function Main(): JSX.Element {
  console.log('test')
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [ipcLink()]
    })
  )

  return (
    <>
      <React.StrictMode>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </trpc.Provider>
      </React.StrictMode>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Main />)
