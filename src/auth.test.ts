import axios from 'axios'
import { getAccessToken } from './auth'

jest.mock('axios')
const axiosMock = axios as jest.Mocked<typeof axios>

beforeEach(() => {
  jest.clearAllMocks()
})

it('returns access_token on success', async () => {
  axiosMock.post.mockResolvedValue({
    data: { access_token: 'tok123', token_type: 'bearer', expires_in: 3600 }
  })

  const token = await getAccessToken({
    clientId: 'id',
    clientSecret: 'secret',
    tokenUrl: 'https://api.example.com/oauth2/token'
  })

  expect(token).toBe('tok123')
  expect(axiosMock.post).toHaveBeenCalledWith(
    'https://api.example.com/oauth2/token',
    expect.any(URLSearchParams)
  )
})

it('sends correct URLSearchParams body', async () => {
  axiosMock.post.mockResolvedValue({ data: { access_token: 'tok' } })

  await getAccessToken({
    clientId: 'myid',
    clientSecret: 'mysecret',
    tokenUrl: 'https://example.com/token'
  })

  const body = axiosMock.post.mock.calls[0][1] as URLSearchParams
  expect(body.get('grant_type')).toBe('client_credentials')
  expect(body.get('client_id')).toBe('myid')
  expect(body.get('client_secret')).toBe('mysecret')
})

it('throws if clientId is missing', async () => {
  await expect(
    getAccessToken({
      clientId: '',
      clientSecret: 'secret',
      tokenUrl: 'https://example.com/token'
    })
  ).rejects.toThrow('clientId is required')
})

it('throws if clientSecret is missing', async () => {
  await expect(
    getAccessToken({
      clientId: 'id',
      clientSecret: '',
      tokenUrl: 'https://example.com/token'
    })
  ).rejects.toThrow('clientSecret is required')
})

it('throws if tokenUrl is missing', async () => {
  await expect(
    getAccessToken({ clientId: 'id', clientSecret: 'secret', tokenUrl: '' })
  ).rejects.toThrow('tokenUrl is required')
})

it('throws if response has no access_token', async () => {
  axiosMock.post.mockResolvedValue({ data: {} })

  await expect(
    getAccessToken({
      clientId: 'id',
      clientSecret: 'secret',
      tokenUrl: 'https://example.com/token'
    })
  ).rejects.toThrow('OAuth2 token response missing access_token')
})

it('propagates axios errors', async () => {
  axiosMock.post.mockRejectedValue(new Error('network failure'))

  await expect(
    getAccessToken({
      clientId: 'id',
      clientSecret: 'secret',
      tokenUrl: 'https://example.com/token'
    })
  ).rejects.toThrow('network failure')
})
