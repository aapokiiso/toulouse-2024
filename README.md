Image feed for a cycling trip in Korea in 2023.

## Development

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Prerequisites

- Node.js 18 or above
- Google Photos album with compatible images

  Images need to have a description with required metadata.
  Metadata must be separated from the actual description with a double-dash (`--`).
  Metadata must contain a location descriptor as `Location: Some place` and coordinates as `Coordinates: (latitude, longitude)`, separated with newlines.
  A valid example description would be

  ```
  This is a description of what is happening in the image.
  --
  Location: Helsinki
  Coordinates: (60.1583574,24.9600955)
  ```

- Google Photos API OAuth2 client

  See [this guide](https://developers.google.com/photos/library/guides/authorization#OAuth2Authorizing) for details.

### Environment variables

Below is a list of environment variables used in this project.

| Variable | Description |
| -- | -- |
| `GOOGLE_OAUTH2_CLIENT_ID` | Google Photos API OAuth2 client ID |
| `GOOGLE_OAUTH2_CLIENT_SECRET` | Google Photos API OAuth2 client secret |
| `GOOGLE_OAUTH2_CLIENT_REDIRECT_URL` | Google Photos API OAuth2 client redirect URL, use `http://localhost:3000/api/google-oauth2-callback` for local development |
| `GOOGLE_OAUTH2_CLIENT_REFRESH_TOKEN` | Google Photos API OAuth2 client refresh token, used for getting an access token for Google Photos |
| `GOOGLE_PHOTOS_ALBUM_ID` | ID of the Google Photos album used for the image feed |
| `NEXT_PUBLIC_DISPLAY_TIMEZONE` | Timezone the image feed is displayed in |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox access token |
| `NEXT_PUBLIC_ARCHIVED` | If archived, the image feed is shown in ascending order (oldest first) |
| `NEXT_PUBLIC_SAMPLE_METADATA` | Uses random sample metadata for album images, useful for trying this project out with an existing album |

### Running locally

Install dependencies with

```bash
$ npm install
```

Initialize the environment by copying `.env.local.example` as `.env.local`, and fill in the OAuth2 environment variables based on the OAuth2 client you've created.

- `GOOGLE_OAUTH2_CLIENT_ID`
- `GOOGLE_OAUTH2_CLIENT_SECRET`
- `GOOGLE_OAUTH2_CLIENT_REDIRECT_URL`

Note that `GOOGLE_OAUTH2_CLIENT_REFRESH_TOKEN` will be obtained in the next step.

Then, run the development server with

```bash
$ npm run dev
```

Open [http://localhost:3000/api/google-oauth2](http://localhost:3000/api/google-oauth2) with your browser and go through the OAuth2 flow with your Google account.

You should be redirected to `/api/google-oauth2-callback` and see the resulting access & refresh token as JSON.
Make sure to take note of the refresh token, as that will be used by the project to access Google Photos (the accompanied access token is valid only for a short time).

Now fill in the rest of the environment variables.

- `GOOGLE_OAUTH2_CLIENT_REFRESH_TOKEN` (obtained in the previous step)
- `GOOGLE_PHOTOS_ALBUM_ID`
- `NEXT_PUBLIC_DISPLAY_TIMEZONE`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_ARCHIVED`
- `NEXT_PUBLIC_SAMPLE_METADATA`

Wait for Next.js to rebuild, then open [http://localhost:3000/](http://localhost:3000/) to see the resulting image feed.
