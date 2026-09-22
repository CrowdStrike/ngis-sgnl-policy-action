import * as core from '@actions/core'
import * as main from '../src/main'
import { sgnl } from '../src/sgnl'

jest.spyOn(core, 'debug').mockImplementation()
jest.spyOn(core, 'info').mockImplementation()
const warning = jest.spyOn(core, 'warning').mockImplementation()
jest.spyOn(core, 'setSecret').mockImplementation()

const getInputMock = jest.spyOn(core, 'getInput').mockImplementation(() => '')
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

jest.spyOn(main, 'run')

jest.mock('../src/sgnl')
const sgnlMock = sgnl as jest.MockedFunction<typeof sgnl>

let inputs: Record<string, unknown>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    inputs = {
      token: 't',
      domain: 'abc.xyz',
      principalId: 'p',
      assetId: 'a',
      action: 'b',
      bypassMode: 'false'
    }

    getInputMock.mockImplementation(name => String(inputs[name] ?? ''))
  })

  it('does skip SGNL API if bypass mode is true', async () => {
    inputs.bypassMode = 'true'

    await main.run()
    expect(sgnlMock).not.toHaveBeenCalled()
  })

  test.each([
    { bypassMode: 'false' },
    { bypassMode: '' },
    { bypassMode: 'asdfafadfa' }
  ])(
    'does not skip SGNL API if bypass mode is `$bypassMode`',
    async ({ bypassMode }) => {
      inputs.bypassMode = bypassMode
      sgnlMock.mockResolvedValue({ decision: true, reason: '' })

      await main.run()
      expect(sgnlMock).toHaveBeenCalled()
    }
  )

  it('prints warnings if bypass mode is true', async () => {
    inputs.bypassMode = 'true'

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
    inputs.bypassMode = 'true'

    await main.run()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'reason',
      'Skipping SGNL call due to bypassMode=true'
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(2, 'decision', true)
  })

  it('fails job on a Deny response', async () => {
    sgnlMock.mockResolvedValue({
      decision: false,
      reason: "Sorry Dave, I can't do that"
    })

    await main.run()
    expect(sgnlMock).toHaveBeenCalled()
    expect(setFailedMock).toHaveBeenCalledWith("Sorry Dave, I can't do that")
  })

  it('fails job on a Deny response with empty reason', async () => {
    sgnlMock.mockResolvedValue({ decision: false, reason: '' })

    await main.run()
    expect(sgnlMock).toHaveBeenCalled()
    expect(setFailedMock).toHaveBeenCalled()
  })

  it('does not fail job on an Allow response', async () => {
    sgnlMock.mockResolvedValue({ decision: true, reason: 'affirmative!' })

    await main.run()
    expect(sgnlMock).toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
  })

  it('does not fail job on an Allow response with empty reason', async () => {
    sgnlMock.mockResolvedValue({ decision: true, reason: '' })

    await main.run()
    expect(sgnlMock).toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
  })

  it('passes domain parameter to Query constructor', async () => {
    inputs.domain = 'abc.sgnlapis.cloud'

    sgnlMock.mockImplementation(async query => {
      expect(query.domain).toBe('abc.sgnlapis.cloud')
      expect(query.endpoint()).toContain('https://abc.sgnlapis.cloud')
      return { decision: true, reason: '' }
    })

    await main.run()
    expect(sgnlMock).toHaveBeenCalled()
  })

  it('fails job on non-200 error', async () => {
    sgnlMock.mockImplementation(() => {
      const e = Object.assign(new Error(), {
        response: { data: {}, status: 401, headers: {} }
      })
      throw e
    })

    await main.run()
    expect(sgnlMock).toHaveBeenCalled()
    expect(setFailedMock).toHaveBeenCalledWith(
      'SGNL API request failed with status 401'
    )
  })

  it('fails job on a request error', async () => {
    sgnlMock.mockImplementation(() => {
      const e = Object.assign(new Error(), { request: 'request failed' })
      throw e
    })

    await main.run()
    expect(sgnlMock).toHaveBeenCalled()
    expect(setFailedMock).toHaveBeenCalledWith('SGNL API did not respond')
  })

  it('fails job on Query validation error', async () => {
    sgnlMock.mockImplementation(() => {
      throw new Error('Sorry!')
    })

    await main.run()
    expect(sgnlMock).toHaveBeenCalled()
    expect(setFailedMock).toHaveBeenCalledWith('Sorry!')
  })
})
