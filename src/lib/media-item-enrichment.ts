import { GooglePhotosMediaItem } from './google-photos-api'

export interface Coordinates {
  latitude: number
  longitude: number
}

const getMetadataStartIndexInDescription = (mediaItem: GooglePhotosMediaItem): number =>
  mediaItem.description?.lastIndexOf('--') ?? -1

export const getGeographyMetadata = (mediaItem: GooglePhotosMediaItem): Record<string, string> => {
  const startIndex = getMetadataStartIndexInDescription(mediaItem)

  const metadataStr = startIndex !== -1
    ? mediaItem.description.slice(startIndex)
    : null

  return metadataStr
    ? metadataStr
      .split('\n')
      .map(row => row.split(':', 2).map(item => item.trim()))
      .filter(keyValuePair => keyValuePair.length === 2)
      .reduce((acc: Record<string, string>, keyValuePair) => {
        acc[keyValuePair[0]] = keyValuePair[1]

        return acc
      }, {})
    : {}
}

export const getDescription = (mediaItem: GooglePhotosMediaItem): string|null => {
  const metadataStartIndex = getMetadataStartIndexInDescription(mediaItem)

  return metadataStartIndex !== -1
    ? mediaItem.description.slice(0, metadataStartIndex)
    : mediaItem.description
}

export const getLocationLabel = (mediaItem: GooglePhotosMediaItem): string|null => {
  return getGeographyMetadata(mediaItem)['Location'] || null
}

export const getCoordinates = (mediaItem: GooglePhotosMediaItem): Coordinates|null => {
  const coordsStr = getGeographyMetadata(mediaItem)['Coordinates'] || null

  const [lat, lon] = coordsStr?.match(/[+-]{0,1}[\d]+\.[\d]+/g) || []

  return lat !== undefined && lon !== undefined
    ? { latitude: Number(lat), longitude: Number(lon) }
    : null
}
