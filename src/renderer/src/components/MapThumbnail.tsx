import { useEffect, useState } from 'react'

interface MapThumbnailProps {
  mapName: string
  thumbnailPath?: string | null
  className?: string
  imageClassName?: string
  iconClassName?: string
  missingLabel?: string
}

export function MapThumbnail({
  mapName,
  thumbnailPath,
  className = '',
  imageClassName = '',
  iconClassName = 'w-8 h-8 text-neutral-700',
  missingLabel = "Thumbnail doesn't exist"
}: MapThumbnailProps): JSX.Element {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [thumbnailPath])

  const imageSrc = thumbnailPath && !imageFailed ? toFileUrl(thumbnailPath) : null

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
          <span className="text-[10px] leading-tight text-neutral-500">
            {missingLabel}
          </span>
        </div>
      )}
    </div>
  )
}

function toFileUrl(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, '/')
  const withLeadingSlash = /^[A-Za-z]:\//.test(normalizedPath) ? `/${normalizedPath}` : normalizedPath
  return encodeURI(`file://${withLeadingSlash}`).replace(/#/g, '%23')
}
