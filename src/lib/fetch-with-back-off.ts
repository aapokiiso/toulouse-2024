import fetchBuilder from 'fetch-retry'

const fetch = fetchBuilder(global.fetch)

export default function fetchWithBackOff(url: string): Promise<Response> {
  return fetch(url, {
    retryOn: function(attempt, error, response) {
      if (attempt >= 3) return false

      const statusCode = Number(response?.status)
      if (error !== null || statusCode === 429 || statusCode >= 500) {
        console.warn(`Retrying media cache request, attempt number ${attempt + 1}, URL ${url}`)

        return true
      }

      return false
    },
    retryDelay(attempt, error, response) {
      const statusCode = Number(response?.status)

      return statusCode === 429
        ? 30000 // Google requires min 30s delay for rate limit retries
        : Math.pow(2, attempt) * 1000 // Exponential back-off
    },
  })
}
