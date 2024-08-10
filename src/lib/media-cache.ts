import { GooglePhotosMediaItem } from './google-photos-api'
import * as fs from 'fs/promises'
import getConfig from 'next/config'
import * as mime from 'mime-types'
import { getAspectRatio, isPhoto, isReadyVideo } from './google-photos-media'
import fetchWithBackOff from './fetch-with-back-off'

const publicDir = getConfig().serverRuntimeConfig.publicDir
const cacheDir = `${publicDir}/media`
const cacheUrlPath = '/media'

enum PhotoRole {
  MAP_THUMBNAIL = 'map-thumbnail',
  TIMELINE = 'timeline',
  FULLSCREEN = 'fullscreen',
}

const PHOTO_WIDTH = {
  [PhotoRole.MAP_THUMBNAIL]: 256,
  [PhotoRole.TIMELINE]: 1080,
  [PhotoRole.FULLSCREEN]: 2560,
}

export interface GooglePhotosCachedPhotoConfig {
  url: string,
  metadata: {
    width: number,
    height: number,
  },
}

export interface GooglePhotosPhotoCache {
  mapThumbnail: GooglePhotosCachedPhotoConfig,
  timeline: GooglePhotosCachedPhotoConfig,
  fullscreen: GooglePhotosCachedPhotoConfig,
}

export interface GooglePhotosCachedVideoConfig {
  url: string,
}

export interface GooglePhotosVideoCache {
  video: GooglePhotosCachedVideoConfig,
  posterPhoto: {
    mapThumbnail: GooglePhotosCachedPhotoConfig,
    timeline: GooglePhotosCachedPhotoConfig,
  },
}

export interface CachedGooglePhotosMediaItem extends GooglePhotosMediaItem {
  cache?: GooglePhotosPhotoCache|GooglePhotosVideoCache,
}

const initCacheDir = async (): Promise<void> => {
  await fs.mkdir(`${cacheDir}/photo/${PhotoRole.MAP_THUMBNAIL}`, { recursive: true })
  await fs.mkdir(`${cacheDir}/photo/${PhotoRole.TIMELINE}`, { recursive: true })
  await fs.mkdir(`${cacheDir}/photo/${PhotoRole.FULLSCREEN}`, { recursive: true })
  await fs.mkdir(`${cacheDir}/video`, { recursive: true })
}

const readConfigFromCache = async (): Promise<Record<string, GooglePhotosPhotoCache|GooglePhotosVideoCache>> => {
  try {
    const json = await fs.readFile(`${cacheDir}/config.json`, { encoding: 'utf8' })

    return JSON.parse(json)
  } catch (e) {
    console.error(e)

    return {}
  }
}

const writeConfigToCache = async (config: Record<string, GooglePhotosPhotoCache|GooglePhotosVideoCache>): Promise<void> => {
  try {
    await fs.writeFile(`${cacheDir}/config.json`, JSON.stringify(config))
  } catch (e) {
    console.error(e)
  }
}

const getPhotoUrl = (photo: GooglePhotosMediaItem, { width, height, isCrop = false }: { width?: number, height?: number, isCrop?: boolean }): string => {
  const params: string[] = []

  if (width) {
    params.push(`w${width}`)
  }

  if (height) {
    params.push(`h${height}`)
  }

  if(isCrop) {
    params.push('c')
  }

  // Removes video play button overlay from video poster photos
  params.push('no')

  return photo.baseUrl + (params.length ? `=${params.join('-')}` : '')
}

const writePhotoToCache = async (photo: GooglePhotosMediaItem, role: PhotoRole, buff: Buffer, fileExtension: string): Promise<void> => {
  await fs.writeFile(`${cacheDir}/photo/${role}/${photo.id}.${fileExtension}`, buff)
}

const cachePhoto = async (mediaItem: GooglePhotosMediaItem, role: PhotoRole): Promise<GooglePhotosCachedPhotoConfig> => {
  const photoConfig = role !== PhotoRole.MAP_THUMBNAIL
    ? {
      width: PHOTO_WIDTH[PhotoRole.TIMELINE],
    }
    : {
      width: PHOTO_WIDTH[PhotoRole.MAP_THUMBNAIL],
      height: PHOTO_WIDTH[PhotoRole.MAP_THUMBNAIL],
      isCrop: true,
    }

  const response = await fetchWithBackOff(getPhotoUrl(mediaItem, photoConfig))
  const buff = Buffer.from(await response.arrayBuffer())

  const mimeType = response.headers.get('Content-Type')
  const fileExtension = mimeType && mime.extension(mimeType)

  if (!buff.length || !fileExtension) {
    throw new Error('Invalid photo')
  }

  await writePhotoToCache(mediaItem, role, buff, fileExtension)

  const width = PHOTO_WIDTH[role]
  const aspectRatio = role !== PhotoRole.MAP_THUMBNAIL ? getAspectRatio(mediaItem) : 1

  return {
    url: `${cacheUrlPath}/photo/${role}/${mediaItem.id}.${fileExtension}`,
    metadata: {
      width: width,
      height: width * aspectRatio,
    },
  }
}

const getVideoUrl = (video: GooglePhotosMediaItem): string => {
  return video.baseUrl + '=dv'
}

const writeVideoToCache = async (video: GooglePhotosMediaItem, buff: Buffer, fileExtension: string): Promise<void> => {
  await fs.writeFile(`${cacheDir}/video/${video.id}.${fileExtension}`, buff)
}

const cacheVideo = async (mediaItem: GooglePhotosMediaItem): Promise<GooglePhotosCachedVideoConfig> => {
  const response = await fetchWithBackOff(getVideoUrl(mediaItem))
  const buff = Buffer.from(await response.arrayBuffer())

  const mimeType = response.headers.get('Content-Type')
  const fileExtension = mimeType && mime.extension(mimeType)

  if (!buff.length || !fileExtension) {
    throw new Error('Invalid video')
  }

  await writeVideoToCache(mediaItem, buff, fileExtension)

  return {
    url: `${cacheUrlPath}/video/${mediaItem.id}.${fileExtension}`,
  }
}

export const cacheItems = async (mediaItems: GooglePhotosMediaItem[]): Promise<CachedGooglePhotosMediaItem[]> => {
  await initCacheDir()

  const cacheConfig = await readConfigFromCache()

  const uncachedMediaItems = mediaItems.filter(mediaItem => !cacheConfig[mediaItem.id])

  console.info(`Start media caching: ${uncachedMediaItems.length} ouf of ${mediaItems.length} media items are uncached.`)

  let counter = 0
  // Cache media items sequentially to avoid rate limits.
  for (const mediaItem of uncachedMediaItems) {
    if (isPhoto(mediaItem)) {
      console.info(`Uncached media item ${mediaItem.id} is a photo, caching.`)

      try {
        const [
          thumbnailPhotoCacheConfig,
          timelinePhotoCacheConfig,
          fullscreenPhotoCacheConfig,
        ] = await Promise.all(
          [
            PhotoRole.MAP_THUMBNAIL,
            PhotoRole.TIMELINE,
            PhotoRole.FULLSCREEN,
          ].map(role => cachePhoto(mediaItem, role))
        )

        cacheConfig[mediaItem.id] = {
          mapThumbnail: thumbnailPhotoCacheConfig,
          timeline: timelinePhotoCacheConfig,
          fullscreen: fullscreenPhotoCacheConfig,
        }

        counter++
      } catch (e) {
        console.error(`Failed to cache photo media item ${mediaItem.id}`, e)
      }
    } else if (isReadyVideo(mediaItem)) {
      console.info(`Uncached media item ${mediaItem.id} is a video, caching.`)

      try {
        const videoCacheConfig = await cacheVideo(mediaItem)

        const [
          thumbnailPhotoCacheConfig,
          timelinePhotoCacheConfig,
        ] = await Promise.all(
          [
            PhotoRole.MAP_THUMBNAIL,
            PhotoRole.TIMELINE,
          ].map(role => cachePhoto(mediaItem, role))
        )

        cacheConfig[mediaItem.id] = {
          video: videoCacheConfig,
          posterPhoto: {
            mapThumbnail: thumbnailPhotoCacheConfig,
            timeline: timelinePhotoCacheConfig,
          },
        }

        counter++
      } catch (e) {
        console.error(`Failed to cache video media item ${mediaItem.id}`, e)
      }
    } else {
      console.error(`Media item ${mediaItem.id} is not a photo or a ready video, skipping.`)
    }
  }

  await writeConfigToCache(cacheConfig)

  console.info(`End media caching: ${counter} ouf of ${uncachedMediaItems.length} uncached media items were successfully cached.`)

  return mediaItems
    .filter(mediaItem => cacheConfig[mediaItem.id])
    .map(mediaItem => ({
      ...mediaItem,
      cache: cacheConfig[mediaItem.id],
    }))
}
