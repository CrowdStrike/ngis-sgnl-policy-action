import { run } from './main'

jest.mock('./main', () => ({
  run: jest.fn()
}))

describe('index', () => {
  it('calls run when imported', async () => {
    await import('./index')
    expect(run).toHaveBeenCalled()
  })
})
