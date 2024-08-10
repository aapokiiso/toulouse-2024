import { google } from 'googleapis'
import { IncomingMessage, ServerResponse } from 'http'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const code = req.url
    ? new URL(req.url, `https://${req.headers.host}`).searchParams.get('code')
    : null

  if (code) {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH2_CLIENT_ID,
      process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH2_CLIENT_REDIRECT_URL,
    )

    try {
      const { tokens } = await client.getToken(String(code))

      const body = JSON.stringify(tokens)

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
      })

      res.end(body)
    } catch (e) {
      console.error(e)

      const body = 'No access token received for authorization code.'

      res.writeHead(403, {
        'Content-Type': 'text/plain',
        'Content-Length': body.length,
      })

      res.end(body)
    }
  } else {
    const body = 'No authorization code received.'

    res.writeHead(403, {
      'Content-Type': 'text/plain',
      'Content-Length': body.length,
    })

    res.end(body)
  }
}
