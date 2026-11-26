import { Query } from './query'

describe('query.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a Query object without failing', () => {
    expect(() => {
      new Query(
        'token',
        'api.example.com',
        'principalA',
        'assetB',
        'actionC',
        'app-1'
      )
    }).not.toThrow()
  })

  it('requires one of assetId or action', () => {
    const err = "At least one of 'assetId' or 'action' is required."

    expect(() => {
      new Query('token', 'api.example.com', 'p', '', '', 'app-1')
    }).toThrow(err)
  })

  it('requires a principalId', () => {
    expect(() => {
      new Query('token', 'api.example.com', '', 'assetB', 'actionC', 'app-1')
    }).toThrow('A principalId is required.')
  })

  it('requires an appId', () => {
    expect(() => {
      new Query('token', 'api.example.com', 'p', 'assetB', 'actionC', '')
    }).toThrow('An appId is required.')
  })

  it('returns a headers object', () => {
    expect(
      new Query('a_token', 'abc.com', 'p', 'a', '', 'app-1').headers()
    ).toStrictEqual({
      Authorization: 'Bearer a_token',
      'Content-Type': 'application/json',
      Accept: 'application/json'
    })
  })

  it('returns a valid payload with context.appId', () => {
    expect(
      new Query('t', 'abc.com', 'p', 'a1', 'a2', 'app-1').payload()
    ).toStrictEqual({
      principal: { id: 'p' },
      queries: [{ assetId: 'a1', action: 'a2' }],
      context: { appId: 'app-1' }
    })

    expect(
      new Query('t', 'abc.com', 'p', 'a1', '', 'app-1').payload()
    ).toStrictEqual({
      principal: { id: 'p' },
      queries: [{ assetId: 'a1' }],
      context: { appId: 'app-1' }
    })

    expect(
      new Query('t', 'abc.com', 'p', '', 'a2', 'app-1').payload()
    ).toStrictEqual({
      principal: { id: 'p' },
      queries: [{ action: 'a2' }],
      context: { appId: 'app-1' }
    })
  })

  it('generates an endpoint with the providers path', () => {
    expect(
      new Query('t', 'access.example.com', 'p', 'a', '', 'app-1').endpoint()
    ).toBe('https://access.example.com/v1/providers')
  })

  it('can handle custom ports', () => {
    expect(() => {
      new Query(
        'token',
        'access.example.com:1234',
        'p',
        'assetB',
        'actionC',
        'app-1'
      )
    }).not.toThrow()

    expect(
      new Query(
        't',
        'access.example.com:1234',
        'p',
        'b',
        'c',
        'app-1'
      ).endpoint()
    ).toBe('https://access.example.com:1234/v1/providers')
  })
})
