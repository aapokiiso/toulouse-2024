import { google } from 'googleapis'

export interface GooglePhotosPhotoMetadata {
  creationTime: string,
  width: string,
  height: string,
  photo: {
    cameraMake: string,
    cameraModel: string,
    focalLength: number,
    apertureFNumber: number,
    isoEquivalent: number,
    exposureTime: string,
  },
}

export interface GooglePhotosVideoMetadata {
  creationTime: string,
  width: string,
  height: string,
  video: {
    cameraMake: string,
    cameraModel: string,
    fps: number,
    status: 'UNSPECIFIED'|'PROCESSING'|'READY'|'FAILED',
  },
}

export interface GooglePhotosMediaItem {
  id: string,
  description: string,
  productUrl: string,
  baseUrl: string,
  mimeType: string,
  mediaMetadata: GooglePhotosPhotoMetadata|GooglePhotosVideoMetadata,
  contributorInfo: {
    profilePictureBaseUrl: string,
    displayName: string,
  },
  filename: string,
}

export interface GooglePhotosListMediaOptions {
  pageToken?: string,
}

export interface GooglePhotosListMediaResponse {
  mediaItems: GooglePhotosMediaItem[],
  nextPageToken?: string,
}

const client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH2_CLIENT_ID,
  process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH2_CLIENT_REDIRECT_URL,
)

client.setCredentials({
  refresh_token: process.env.GOOGLE_OAUTH2_CLIENT_REFRESH_TOKEN,
})

export const listAlbumMedia = async (albumId: string, options?: GooglePhotosListMediaOptions): Promise<GooglePhotosListMediaResponse> => {
  const { token } = await client.getAccessToken()

  const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      pageSize: 100,
      albumId,
      pageToken: options?.pageToken,
    }),
  })

  const { mediaItems = [], nextPageToken } = await response.json()

  return {
    mediaItems,
    nextPageToken,
  }
}
