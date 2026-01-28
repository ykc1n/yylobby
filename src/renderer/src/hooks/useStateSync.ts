import { trpc } from '../../utils/trpc'
import { useAppStore, type AppState } from '../store/appStore'

interface StateUpdate {
  type: 'full' | 'partial'
  state: AppState
  timestamp: number
}

/**
 * Hook to sync main process state with renderer store.
 * Call this ONCE at the app root level (in App.tsx).
 */
export function useStateSync(): void {
  const setState = useAppStore((state) => state.setState)

  trpc.stateStream.useSubscription(undefined, {
    onData: (update: StateUpdate) => {
      console.log('[StateSync] Received update:', update.type, new Date(update.timestamp).toISOString())
      if (update.type === 'full' && update.state) {
        setState(update.state)
      }
    },
    onError: (err) => {
      console.error('[StateSync] Stream error:', err)
    }
  })
}
