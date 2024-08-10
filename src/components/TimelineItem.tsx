import Image from 'next/image'
import { formatInDisplayTimeZone } from '@/utils/date'
import { getDescription, getLocationLabel } from '../lib/media-item-enrichment'
import { MouseEventHandler, MutableRefObject, useEffect, useRef, useState } from 'react'
import FullscreenItem from './FullscreenItem'
import { resolveTailwindConfig } from '../utils/css'
import { CachedGooglePhotosMediaItem, GooglePhotosPhotoCache, GooglePhotosVideoCache } from '../lib/media-cache'
import { isPhoto, isVideo } from '../lib/google-photos-media'

const tailwindConfig = resolveTailwindConfig()

export default function TimelineItem({ item, isActive, activeItemRef, setActiveItemId, visibilityObserver }: { item: CachedGooglePhotosMediaItem, isActive: boolean, activeItemRef?: MutableRefObject<HTMLElement|null>, setActiveItemId: (activeItemId: string|undefined) => void, visibilityObserver?: IntersectionObserver }) {
  const description = getDescription(item)

  const elementRef = useRef<HTMLElement|null>(null)
  useEffect(() => {
    const currentElement = elementRef.current

    if (currentElement && visibilityObserver) {
      visibilityObserver.observe(currentElement)
    }

    return () => {
      if (currentElement && visibilityObserver) {
        visibilityObserver.unobserve(currentElement)
      }
    }
  }, [visibilityObserver])

  const setRefs = (element: HTMLElement): void => {
    elementRef.current = element
    if (activeItemRef && isActive) {
      activeItemRef.current = element
    }
  }

  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false)

  const handleItemClick = () => {
    if (!isActive) {
      setActiveItemId(item.id)
    }
  }

  const handleImageClick: MouseEventHandler<HTMLImageElement> = (event) => {
    if (isActive) {
      event.stopPropagation()

      const breakpoints = tailwindConfig?.theme?.screens as Record<string, string>
      if (breakpoints.md && window.matchMedia(`(min-width: ${breakpoints.md})`).matches) {
        setIsFullscreenOpen(true)
      }
    }
  }

  let mediaElement: JSX.Element|null = null
  if (isPhoto(item)) {
    const cache = item.cache as GooglePhotosPhotoCache

    mediaElement = (
      <Image
        src={cache.timeline.url}
        alt="A timeline photo. Click photo to open fullscreen when on a tablet or desktop device."
        width={cache.timeline.metadata.width}
        height={cache.timeline.metadata.height}
        className="rounded-2xl w-full"
        onClick={handleImageClick}
      />
    )
  } else if (isVideo(item)) {
    const cache = item.cache as GooglePhotosVideoCache

    mediaElement = (
      <video
        poster={cache.posterPhoto.timeline.url}
        width={cache.posterPhoto.timeline.metadata.width}
        height={cache.posterPhoto.timeline.metadata.height}
        controls
      >
        <source src={cache.video.url} />

        Unsupported video format
      </video>
    )
  }

  return mediaElement && (
    <>
      <figure
        ref={setRefs}
        data-id={item.id}
        className={`my-4 p-2 pt-4 bg-neutral-200 rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-opacity ${isActive ? ' opacity-100' : 'opacity-60'}`}
        onClick={handleItemClick}
      >
        {mediaElement}
        <figcaption className="p-4">
          {description && <p className="whitespace-pre-wrap">{description}</p>}
          <p className="my-2">&mdash;</p>
          <div className="flex text-sm">
            <p>
              <span className="sr-only">Photo taken at</span>
              <time dateTime={item.mediaMetadata.creationTime}>{formatInDisplayTimeZone(item.mediaMetadata.creationTime, 'HH:mm')}</time>
            </p>
            <p className="ml-4 text-neutral-500">
              <span className="sr-only">Photo taken in</span>
              <span>{getLocationLabel(item)}</span>
            </p>
          </div>
        </figcaption>
      </figure>
      {isPhoto(item) && <FullscreenItem item={item} isOpen={isFullscreenOpen} setIsOpen={setIsFullscreenOpen} />}
    </>
  )
}
