import { Query } from '../src/query'

describe('query.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a Query object without failing', () => {
    expect(() => {
      new Query('token', 'access.sgnlapis.cloud', 'principalA', 'assetB', 'actionC')
    }).not.toThrow()
  })

  it('requires a token', () => {
    expect(() => {
      new Query('', 'access.sgnlapis.cloud', 'principalA', 'assetB', 'actionC')
    }).toThrow()
  })

  it('requires one of assetId or action', () => {
    const err = "At least one of 'assetId' or 'action' is required."

    expect(() => {
      new Query('token', 'access.sgnlapis.cloud', 'p', '', '')
    }).toThrow(err)

    expect(() => {
      new Query('token', 'access.sgnlapis.cloud', 'p', '', '')
    }).toThrow(err)
  })

  it('requires a principalId', () => {
    expect(() => {
      new Query('token', 'access.sgnlapis.cloud', '', 'assetB', 'actionC')
    }).toThrow()
  })

  it('returns a headers object', () => {
    expect(
      new Query('a_token', 'abc.com', 'p', 'a', '').headers()
    ).toStrictEqual({
      Authorization: 'Bearer a_token'
    })
  })

  it('returns a valid payload', () => {
    expect(new Query('t', 'abc.com', 'p', 'a1', 'a2').payload()).toStrictEqual({
      principal: { id: 'p' },
      queries: [{ assetId: 'a1', action: 'a2' }]
    })

    expect(new Query('t', 'abc.com', 'p', 'a1', '').payload()).toStrictEqual({
      principal: { id: 'p' },
      queries: [{ assetId: 'a1' }]
    })

    expect(new Query('t', 'abc.com', 'p', '', 'a2').payload()).toStrictEqual({
      principal: { id: 'p' },
      queries: [{ action: 'a2' }]
    })
  })

  it('generates an endpoint', () => {
    expect(
      new Query('t', 'access.sgnlapis.cloud', 'p', 'a', '').endpoint()
    ).toBe('https://access.sgnlapis.cloud/access/v2/evaluations')
  })

  it('requires a domain', () => {
    expect(() => {
      new Query('token', '', 'p', 'assetB', 'actionC')
    }).toThrow()
  })

  it('can handle custom ports', () => {
    expect(() => {
      new Query('token', 'domain.com:1234', 'p', 'assetB', 'actionC')
    }).not.toThrow()

    expect(new Query('t', 'domain.com:1234', 'a', 'b', 'c').endpoint()).toBe(
      'https://domain.com:1234/access/v2/evaluations'
    )
  })
})
