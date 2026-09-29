import * as core from '@actions/core'
import * as main from './main'
import { sgnl } from './sgnl'
import { getAccessToken } from './auth'

jest.spyOn(core, 'debug').mockImplementation()
jest.spyOn(core, 'info').mockImplementation()
const warning = jest.spyOn(core, 'warning').mockImplementation()
const setSecretMock = jest.spyOn(core, 'setSecret').mockImplementation()

const getInputMock = jest.spyOn(core, 'getInput').mockImplementation(() => '')
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

jest.spyOn(main, 'run')

jest.mock('./sgnl')
const sgnlMock = sgnl as jest.MockedFunction<typeof sgnl>

jest.mock('./auth')
const getAccessTokenMock = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>

let inputs: Record<string, string>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    inputs = {
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      access_host: 'access.example.com',
      principal_id: 'p',
      asset_id: 'a',
      action: 'b',
      bypass_mode: 'false'
    }

    getInputMock.mockImplementation(name => inputs[name] ?? '')
    getAccessTokenMock.mockResolvedValue('mock-access-token')
  })

  it('skips SGNL API if bypass mode is true', async () => {
    inputs.bypass_mode = 'true'

    await main.run()
    expect(sgnlMock).not.toHaveBeenCalled()
    expect(getAccessTokenMock).not.toHaveBeenCalled()
  })

  it('prints warnings if bypass mode is true', async () => {
    inputs.bypass_mode = 'true'

    await main.run()
    expect(warning).toHaveBeenNthCalledWith(
      1,
      '*** WARNING: BYPASS MODE ENABLED ***'
    )
    expect(warning).toHaveBeenNthCalledWith(
      2,
      '*** Skipping SGNL Policy Checks ***'
    )
  })

  it('sets the output to true when bypass mode is enabled', async () => {
    inputs.bypass_mode = 'true'

    await main.run()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'reason',
      'Skipping SGNL call due to bypass_mode=true'
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(2, 'decision', true)
  })

  test.each([
    { bypass_mode: 'false' },
    { bypass_mode: '' },
    { bypass_mode: 'asdfafadfa' }
  ])(
    'does not skip SGNL API if bypass mode is `$bypass_mode`',
    async ({ bypass_mode }) => {
      inputs.bypass_mode = bypass_mode
      sgnlMock.mockResolvedValue({ decision: true, reason: '' })

      await main.run()
      expect(getAccessTokenMock).toHaveBeenCalled()
      expect(sgnlMock).toHaveBeenCalled()
    }
  )

  it('calls getAccessToken with correct inputs and derived tokenUrl', async () => {
    sgnlMock.mockResolvedValue({ decision: true, reason: '' })

    await main.run()
    expect(getAccessTokenMock).toHaveBeenCalledWith({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      tokenUrl: 'https://api.example.com/oauth2/token'
    })
  })

  it('fails if access_host does not start with access.', async () => {
    inputs.access_host = 'api.example.com'

    await main.run()
    expect(setFailedMock).toHaveBeenCalledWith(
      expect.stringContaining('Invalid access_host')
    )
    expect(getAccessTokenMock).not.toHaveBeenCalled()
  })

  it('calls setSecret with clientSecret and access token', async () => {
    sgnlMock.mockResolvedValue({ decision: true, reason: '' })

    await main.run()
    expect(setSecretMock).toHaveBeenCalledWith('test-client-secret')
    expect(setSecretMock).toHaveBeenCalledWith('mock-access-token')
  })

  it('fails with auth-specific message when getAccessToken throws', async () => {
    getAccessTokenMock.mockRejectedValue(
      new Error('token endpoint unreachable')
    )

    await main.run()
    expect(sgnlMock).not.toHaveBeenCalled()
    expect(setFailedMock).toHaveBeenCalledWith(
      'Failed to obtain OAuth2 access token: token endpoint unreachable'
    )
  })

  it('fails job on a Deny response', async () => {
    sgnlMock.mockResolvedValue({
      decision: false,
      reason: "Sorry Dave, I can't do that"
    })

    await main.run()
    expect(setFailedMock).toHaveBeenCalledWith("Sorry Dave, I can't do that")
  })

  it('does not fail job on an Allow response', async () => {
    sgnlMock.mockResolvedValue({ decision: true, reason: 'affirmative!' })

    await main.run()
    expect(setFailedMock).not.toHaveBeenCalled()
  })

  it('fails job on non-200 error', async () => {
    sgnlMock.mockImplementation(() => {
      throw Object.assign(new Error(), { response: { status: 401 } })
    })

    await main.run()
    expect(setFailedMock).toHaveBeenCalledWith(
      'SGNL API request failed with status 401'
    )
  })

  it('fails job on a request error', async () => {
    sgnlMock.mockImplementation(() => {
      throw Object.assign(new Error(), { request: 'request failed' })
    })

    await main.run()
    expect(setFailedMock).toHaveBeenCalledWith('SGNL API did not respond')
  })

  it('fails job on generic error', async () => {
    sgnlMock.mockImplementation(() => {
      throw new Error('Something went wrong')
    })

    await main.run()
    expect(setFailedMock).toHaveBeenCalledWith('Something went wrong')
  })
})
