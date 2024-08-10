import { google } from 'googleapis'
import { IncomingMessage, ServerResponse } from 'http'

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH2_CLIENT_ID,
    process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH2_CLIENT_REDIRECT_URL,
  )

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/photoslibrary.readonly',
    ],
  })

  const body = `<a href="${url}">Authorize</a>`

  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': body.length,
  })

  res.end(body)
}
