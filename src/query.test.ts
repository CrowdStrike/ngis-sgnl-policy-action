import { Query } from './query'

describe('query.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a Query object without failing', () => {
    expect(() => {
      new Query('token', 'api.example.com', 'principalA', 'assetB', 'actionC')
    }).not.toThrow()
  })

  it('requires one of assetId or action', () => {
    const err = "At least one of 'assetId' or 'action' is required."

    expect(() => {
      new Query('token', 'api.example.com', 'p', '', '')
    }).toThrow(err)
  })

  it('requires a principalId', () => {
    expect(() => {
      new Query('token', 'api.example.com', '', 'assetB', 'actionC')
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

  it('generates an endpoint with the correct path', () => {
    expect(new Query('t', 'access.example.com', 'p', 'a', '').endpoint()).toBe(
      'https://access.example.com/v1/evaluations'
    )
  })

  it('can handle custom ports', () => {
    expect(() => {
      new Query('token', 'access.example.com:1234', 'p', 'assetB', 'actionC')
    }).not.toThrow()

    expect(
      new Query('t', 'access.example.com:1234', 'p', 'b', 'c').endpoint()
    ).toBe('https://access.example.com:1234/v1/evaluations')
  })
})
