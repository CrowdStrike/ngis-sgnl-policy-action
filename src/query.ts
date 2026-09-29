export interface QueryPayload {
  principal: { id: string } | null
  queries: { assetId?: string; action?: string }[]
}

export class Query {
  token: string
  accessHost: string
  principalId: string
  assetId: string
  action: string
  endpointUrl: URL

  constructor(
    token: string,
    accessHost: string,
    principalId: string,
    assetId: string,
    action: string
  ) {
    this.token = token
    this.accessHost = accessHost
    this.principalId = principalId
    this.assetId = assetId
    this.action = action

    if (!this.assetId && !this.action) {
      throw new Error("At least one of 'assetId' or 'action' is required.")
    }

    if (!this.principalId) {
      throw new Error('A principalId is required.')
    }

    this.endpointUrl = new URL('/v1/evaluations', `https://${accessHost}`)

    if (this.endpointUrl.protocol !== 'https:') {
      throw new Error(
        `Invalid API endpoint from accessHost ${accessHost}. Endpoint must be https://`
      )
    }
  }

  headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`
    }
  }

  endpoint(): string {
    return this.endpointUrl.toString()
  }

  payload(): QueryPayload {
    const _payload: QueryPayload = {
      principal: null,
      queries: []
    }

    _payload.principal = { id: this.principalId }

    const q: { assetId?: string; action?: string } = {}
    if (this.assetId) {
      q.assetId = this.assetId
    }
    if (this.action) {
      q.action = this.action
    }

    _payload.queries.push(q)

    return _payload
  }
}
