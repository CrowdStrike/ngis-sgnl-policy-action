import { sgnl } from '../src/sgnl'
import { Query } from '../src/query'
import * as core from '@actions/core'
import axios from 'axios'

jest.mock('axios')
const axiosMock = axios as jest.Mocked<typeof axios>

jest.spyOn(core, 'debug').mockImplementation()
jest.spyOn(core, 'info').mockImplementation()
jest.spyOn(core, 'warning').mockImplementation()

let allowData: { decisions: { action: string; assetId: string; decision: string; reasons?: string[] }[] }
let denyData: { decisions: { action: string; assetId: string; decision: string; reasons?: string[] }[] }

const basicQuery = new Query('t', 'a.com', 'p', 'a1', 'a2')

beforeEach(() => {
  jest.clearAllMocks()

  allowData = {
    decisions: [{ action: 'c', assetId: 'b', decision: 'Allow', reasons: ['allowed!!'] }]
  }

  denyData = {
    decisions: [{ action: 'c', assetId: 'b', decision: 'Deny', reasons: ['denied!!'] }]
  }
})

it('returns an allow response', async () => {
  axiosMock.post.mockResolvedValue({ data: allowData })

  const response = await sgnl(basicQuery)
  expect(response).toStrictEqual({ decision: true, reason: 'allowed!!' })
  expect(axiosMock.post).toHaveBeenCalled()
})

it('returns an allow response without a reason', async () => {
  delete allowData.decisions[0].reasons
  axiosMock.post.mockResolvedValue({ data: allowData })

  const response = await sgnl(basicQuery)
  expect(response).toStrictEqual({ decision: true, reason: '' })
  expect(axiosMock.post).toHaveBeenCalled()
})

it('returns a deny response', async () => {
  axiosMock.post.mockResolvedValue({ data: denyData })

  const response = await sgnl(basicQuery)
  expect(response).toStrictEqual({ decision: false, reason: 'denied!!' })
  expect(axiosMock.post).toHaveBeenCalled()
})

it('returns a deny response without a reason', async () => {
  delete denyData.decisions[0].reasons
  axiosMock.post.mockResolvedValue({ data: denyData })

  const response = await sgnl(basicQuery)
  expect(response).toStrictEqual({ decision: false, reason: '' })
  expect(axiosMock.post).toHaveBeenCalled()
})

it('throws if decisions array is empty', async () => {
  axiosMock.post.mockResolvedValue({ data: { decisions: [] } })
  await expect(sgnl(basicQuery)).rejects.toThrow(
    'SGNL API returned 0 decisions, expected exactly 1'
  )
})

it('throws if decisions array has more than one entry', async () => {
  axiosMock.post.mockResolvedValue({
    data: {
      decisions: [
        { decision: 'Allow', reasons: ['r1'] },
        { decision: 'Deny', reasons: ['r2'] }
      ]
    }
  })
  await expect(sgnl(basicQuery)).rejects.toThrow(
    'SGNL API returned 2 decisions, expected exactly 1'
  )
})
