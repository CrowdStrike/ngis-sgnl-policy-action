import axios from 'axios'

export async function getAccessToken({
  clientId,
  clientSecret,
  tokenUrl
}: {
  clientId: string
  clientSecret: string
  tokenUrl: string
}): Promise<string> {
  if (!clientId) throw new Error('clientId is required')
  if (!clientSecret) throw new Error('clientSecret is required')
  if (!tokenUrl) throw new Error('tokenUrl is required')

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  })

  const response = await axios.post<{ access_token?: string }>(tokenUrl, params)

  if (!response.data.access_token) {
    throw new Error('OAuth2 token response missing access_token')
  }

  return response.data.access_token
}
