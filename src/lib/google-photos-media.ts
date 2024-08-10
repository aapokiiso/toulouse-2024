import { GooglePhotosMediaItem, GooglePhotosVideoMetadata } from './google-photos-api'

export const isPhoto = (mediaItem: GooglePhotosMediaItem): boolean => {
  return mediaItem.mediaMetadata.hasOwnProperty('photo')
}

export const isVideo = (mediaItem: GooglePhotosMediaItem): boolean => {
  return mediaItem.mediaMetadata.hasOwnProperty('video')
}

export const getAspectRatio = (item: GooglePhotosMediaItem): number =>
  Number(item.mediaMetadata.height) / Number(item.mediaMetadata.width)

export const isReadyVideo = (mediaItem: GooglePhotosMediaItem): boolean => {
  if (isVideo(mediaItem)) {
    const metadata = mediaItem.mediaMetadata as GooglePhotosVideoMetadata

    return metadata.video.status === 'READY'
  }

  return false
}
