import { GooglePhotosMediaItem } from '@/lib/google-photos-api'
import { formatInDisplayTimeZone } from './date'

export function groupByDay(items: GooglePhotosMediaItem[]): Record<string, GooglePhotosMediaItem[]> {
  return items
    .reduce((acc: Record<string, GooglePhotosMediaItem[]>, item: GooglePhotosMediaItem) => {
      const day = formatInDisplayTimeZone(item.mediaMetadata.creationTime, 'yyyy-MM-dd')

      acc[day] = acc[day] ? [...acc[day], item] : [item]

      return acc
    }, {})
}

export const sortByTimeDescending = (items: GooglePhotosMediaItem[]): GooglePhotosMediaItem[] =>
  [...items].sort((a, b) => (new Date(b.mediaMetadata.creationTime)).getTime() - (new Date(a.mediaMetadata.creationTime)).getTime())

export const sortByTimeAscending = (items: GooglePhotosMediaItem[]): GooglePhotosMediaItem[] =>
  [...items].sort((a, b) => (new Date(a.mediaMetadata.creationTime)).getTime() - (new Date(b.mediaMetadata.creationTime)).getTime())
