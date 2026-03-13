import { GlassPanel } from '../components/GlassPanel'
import { trpc } from '../../utils/trpc'
import { useThemeStore, themeColors } from '../themeStore'

interface DownloadStatusData {
  id: string
  kind: 'map-thumbnail'
  name: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  queuedAt: number
  startedAt?: number
  completedAt?: number
  targetPath: string
  sourceUrl?: string
  error?: string
}

function StatusBadge({ status }: { status: DownloadStatusData['status'] }): JSX.Element {
  const styles = {
    queued: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
    running: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    completed: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
    failed: 'text-red-300 border-red-500/30 bg-red-500/10'
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide border ${styles[status]}`}>
      {status}
    </span>
  )
}

export default function DownloadsPage(): JSX.Element {
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]
  const downloadsQuery = trpc.getDownloadStatuses.useQuery(undefined, {
    refetchInterval: 1000,
    refetchIntervalInBackground: true
  })

  const downloads = (downloadsQuery.data ?? []) as DownloadStatusData[]
  const activeCount = downloads.filter((download) => download.status === 'queued' || download.status === 'running').length

  return (
    <div className="h-full overflow-auto pr-1">
      <div className="mx-auto max-w-5xl space-y-4">
        <GlassPanel className="p-6 rounded-2xl">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-normal tracking-wide text-white mb-1">Downloads</h1>
              <p className="text-sm text-neutral-400 tracking-wide">Queued and active asset downloads</p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[240px]">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.12em] text-neutral-500 mb-1">Active</div>
                <div className={`text-xl ${activeCount > 0 ? theme.text : 'text-white/85'}`}>{activeCount}</div>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.12em] text-neutral-500 mb-1">Tracked</div>
                <div className="text-xl text-white/85">{downloads.length}</div>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4">
          {downloads.length === 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-8 text-center text-neutral-500">
              No downloads queued.
            </div>
          ) : (
            <div className="space-y-3">
              {downloads.map((download) => (
                <div key={download.id} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="text-sm text-white/90 truncate">{download.name}</div>
                      <div className="text-[11px] text-neutral-500 uppercase tracking-[0.12em] mt-1">
                        {download.kind === 'map-thumbnail' ? 'Map Thumbnail' : download.kind}
                      </div>
                    </div>
                    <StatusBadge status={download.status} />
                  </div>

                  <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                        download.status === 'failed'
                          ? 'bg-gradient-to-r from-red-500/80 to-red-300/80'
                          : download.status === 'completed'
                            ? 'bg-gradient-to-r from-emerald-500/80 to-emerald-300/80'
                            : download.status === 'running'
                              ? 'bg-gradient-to-r from-amber-400/90 via-amber-300/80 to-amber-200/75'
                              : 'bg-gradient-to-r from-sky-400/90 via-sky-300/80 to-sky-200/75'
                      }`}
                      style={{ width: `${Math.max(download.progress, download.status === 'failed' ? 100 : 4)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4 text-xs text-neutral-500">
                    <span>{download.progress}%</span>
                    <span className="truncate text-right">{download.targetPath}</span>
                  </div>

                  {download.error && (
                    <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      {download.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  )
}
