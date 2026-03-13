import { useEffect, useState } from 'react'
import { trpc } from '../../utils/trpc'

interface MapThumbnailProps {
  mapName: string
  thumbnailPath?: string | null
  className?: string
  imageClassName?: string
  iconClassName?: string
  missingLabel?: string
  compactFallback?: boolean
}

export function MapThumbnail({
  mapName,
  thumbnailPath,
  className = '',
  imageClassName = '',
  iconClassName = 'w-8 h-8 text-neutral-700',
  missingLabel = "Thumbnail doesn't exist",
  compactFallback = false
}: MapThumbnailProps): JSX.Element {
  const [imageFailed, setImageFailed] = useState(false)
  const utils = trpc.useUtils()
  const downloadsQuery = trpc.getDownloadStatuses.useQuery(undefined, {
    refetchInterval: 1000,
    refetchIntervalInBackground: true
  })
  const queueMapThumbnailDownload = trpc.queueMapThumbnailDownload.useMutation({
    onSuccess: async (status) => {
      if (status.status === 'completed') {
        await utils.getReplays.invalidate()
        await utils.getAvailableMaps.invalidate()
      }
    },
    onSettled: async () => {
      await utils.getDownloadStatuses.invalidate()
    }
  })

  useEffect(() => {
    setImageFailed(false)
  }, [thumbnailPath])

  const imageSrc = thumbnailPath && !imageFailed ? toLocalFileUrl(thumbnailPath) : null
  const currentDownload = (downloadsQuery.data ?? []).find((download) => download.kind === 'map-thumbnail' && download.name === mapName)
  const downloadStatus = queueMapThumbnailDownload.isPending ? 'queued' : currentDownload?.status
  const canDownload = downloadStatus !== 'queued' && downloadStatus !== 'running' && downloadStatus !== 'completed'
  const buttonLabel = compactFallback
    ? downloadStatus === 'failed'
      ? 'Retry'
      : downloadStatus === 'completed'
        ? 'Done'
        : downloadStatus === 'running'
          ? '...'
          : downloadStatus === 'queued'
            ? '...'
            : 'Get'
    : downloadStatus === 'failed'
      ? 'Retry Download'
      : downloadStatus === 'completed'
        ? 'Downloaded'
        : downloadStatus === 'running'
          ? 'Downloading...'
          : downloadStatus === 'queued'
            ? 'Queued...'
            : 'Download'

  const handleDownload = (): void => {
    if (!canDownload) {
      return
    }

    queueMapThumbnailDownload.mutate({ mapName })
  }

  return (
    <div className={`bg-white/[0.03] flex items-center justify-center overflow-hidden ${className}`}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={`${mapName} minimap`}
          className={`w-full h-full object-cover ${imageClassName}`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center">
          <svg className={iconClassName} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className={`${compactFallback ? 'text-[8px]' : 'text-[10px]'} leading-tight text-neutral-500`}>
            {downloadStatus === 'completed' && !thumbnailPath ? 'Thumbnail downloaded' : missingLabel}
          </span>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!canDownload}
            className={`rounded border border-white/10 bg-white/[0.06] text-white/80 transition-all disabled:cursor-default disabled:opacity-50 ${
              compactFallback
                ? 'px-1.5 py-0.5 text-[8px]'
                : 'px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]'
            }`}
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  )
}

function toLocalFileUrl(filePath: string): string {
  return `local-file://thumbnail?path=${encodeURIComponent(filePath)}`
}
