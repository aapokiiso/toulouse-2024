import Head from 'next/head'
import { GooglePhotosMediaItem, listAlbumMedia } from '@/lib/google-photos-api'

import { getCoordinates, getLocationLabel } from '../lib/media-item-enrichment'
import { CachedGooglePhotosMediaItem, cacheItems } from '../lib/media-cache'
import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import Timeline from '../components/Timeline'
import { sortByTimeAscending, sortByTimeDescending } from '../utils/sort-media-items'
import MapControls from '../components/MapControls'
import { scrollIntoView } from '../utils/scroll-into-view'
import { parseToPx, resolveTailwindConfig } from '../utils/css'
import { isArchived, isSampleMetadata } from '../utils/config'

const tailwindConfig = resolveTailwindConfig()

const Map = lazy(() => import('../components/Map'))

export default function Home({ sortedMediaItems }: { sortedMediaItems: CachedGooglePhotosMediaItem[] }) {
  const [activeMediaItemId, setActiveMediaItemId] = useState<string|undefined>()

  const [isTimelineVisible, setIsTimelineVisible] = useState<boolean>(true)

  const activeItemRef = useRef<HTMLElement|null>(null)
  const [needScrollToActiveItem, setNeedScrollToActiveItem] = useState<boolean>(() => false)
  const [isScrollingUserControlled, setIsScrollingUserControlled] = useState<boolean>(() => true)

  const hideTimeline = () => {
    setIsScrollingUserControlled(false)
    setIsTimelineVisible(false)
  }

  const showTimeline = (scrollToActiveItem: boolean = true) => {
    setIsTimelineVisible(true)

    if (scrollToActiveItem) {
      // Wait for timeline's appear transition to finish before triggering
      // scroll to the active item.
      setTimeout(() => {
        setNeedScrollToActiveItem(true)
      }, 150)
    } else {
      setIsScrollingUserControlled(true)
    }
  }

  const activeMediaItemScrollToWaitTimeout = useRef<NodeJS.Timeout|null>(null)

  const setActiveMediaItemIdWithScrollTo = (activeMediaItemId: string|undefined) => {
    if (activeMediaItemScrollToWaitTimeout.current) {
      clearTimeout(activeMediaItemScrollToWaitTimeout.current)
      activeMediaItemScrollToWaitTimeout.current = null
    }

    setActiveMediaItemId(activeMediaItemId)

    if (activeMediaItemId) {
      setIsScrollingUserControlled(false)
      if (isTimelineVisible) {
        setNeedScrollToActiveItem(true)
      } else {
        showTimeline(true)
      }
    }
  }

  useEffect(() => {
    if (needScrollToActiveItem && activeItemRef.current) {
      scrollIntoView(activeItemRef.current, {
        offsetTop: -1 * (parseToPx(tailwindConfig.theme?.margin?.['20'] || '') ?? 0),
      })

      setNeedScrollToActiveItem(false)

      // Wait a bit for scrolling to finish before releasing control. Duration
      // is user agent specific, so this timeout is just a rough estimate.
      activeMediaItemScrollToWaitTimeout.current = setTimeout(() => {
        setIsScrollingUserControlled(true)
      }, 1000)
    }
  }, [needScrollToActiveItem])

  const handleToggleMapClick = (): void => {
    if (isTimelineVisible) {
      hideTimeline()
    } else {
      showTimeline(true)
    }
  }

  const [isMapVisibleAsBackground, setIsMapVisibleAsBackground] = useState<boolean>(() => false)
  useEffect(() => {
    const breakpoints = tailwindConfig?.theme?.screens as Record<string, string>

    const isScreenMd = breakpoints.md
      ? window.matchMedia(`(min-width: ${breakpoints.md})`).matches
      : false

    setIsMapVisibleAsBackground(isScreenMd)
  }, [])

  const canLoadMap = isMapVisibleAsBackground || !isTimelineVisible

  const isMapLoaded = useRef<boolean>(false)
  useEffect(() => {
    // Map already marked as loaded
    if (isMapLoaded.current) return

    if (canLoadMap) {
      isMapLoaded.current = true
    }
  }, [canLoadMap])

  const loadingMapElement = (
    <div className="fixed w-full h-full flex items-center justify-center text-neutral-200">
      <p>Loading map...</p>
    </div>
  )

  return (
    <>
      <Head>
        <title>Bike tour Frankfurt-Toulouse in 2024</title>
        <meta name="description" content="Photo timeline of a bike tour in central Europe in August 2024." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Suspense fallback={loadingMapElement}>
        {(isMapLoaded.current || canLoadMap) && <Map
          mediaItems={sortedMediaItems}
          activeMediaItemId={activeMediaItemId}
          setActiveMediaItemIdWithScrollTo={setActiveMediaItemIdWithScrollTo}
          isMapVisibleAsBackground={isMapVisibleAsBackground}
        />}
      </Suspense>
      <div className="xl:container mx-auto p-4 md:pt-8 grid pointer-events-none relative z-10">
        <main className="w-full max-w-lg justify-self-end pointer-events-auto">
          <Timeline
            sortedMediaItems={sortedMediaItems}
            isVisible={isTimelineVisible}
            activeMediaItemId={activeMediaItemId}
            setActiveMediaItemId={setActiveMediaItemId}
            activeItemRef={activeItemRef}
            isScrollingUserControlled={isScrollingUserControlled}
            setActiveMediaItemIdWithScrollTo={setActiveMediaItemIdWithScrollTo}
          />
        </main>
      </div>
      <div className="fixed bottom-4 left-4 lg:hidden z-10">
        <MapControls
          isTimelineVisible={isTimelineVisible}
          handleToggleMapClick={handleToggleMapClick}
        />
      </div>
    </>
  )
}

export async function getStaticProps() {
  const albumId = process.env.GOOGLE_PHOTOS_ALBUM_ID

  let sortedMediaItems: CachedGooglePhotosMediaItem[] = []
  if (albumId) {
    let allMediaItems: GooglePhotosMediaItem[] = []
    let pageToken: string|undefined

    do {
      const { mediaItems: pageMediaItems, nextPageToken } = await listAlbumMedia(albumId, { pageToken })
      allMediaItems = [...allMediaItems, ...pageMediaItems]
      pageToken = nextPageToken
    } while (pageToken)

    const validMediaItems = allMediaItems
      .map(mediaItem => isSampleMetadata()
        ? ({
          ...mediaItem,
          description: `--\nLocation: Somewhere\nCoordinates: (${Math.random() * 180 - 90},${Math.random() * 360 - 180})\n`,
        })
        : mediaItem
      )
      .filter(mediaItem => getLocationLabel(mediaItem) && getCoordinates(mediaItem))

    const cachedMediaItems = await cacheItems(validMediaItems)

    sortedMediaItems = isArchived()
      ? sortByTimeAscending(cachedMediaItems)
      : sortByTimeDescending(cachedMediaItems)
  }

  return {
    props: {
      sortedMediaItems,
    },
  }
}
