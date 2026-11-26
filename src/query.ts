export interface QueryPayload {
  principal: { id: string }
  queries: { assetId?: string; action?: string }[]
  context: { appId: string }
}

export class Query {
  token: string
  accessHost: string
  principalId: string
  assetId: string
  action: string
  appId: string
  endpointUrl: URL

  constructor(
    token: string,
    accessHost: string,
    principalId: string,
    assetId: string,
    action: string,
    appId: string
  ) {
    this.token = token
    this.accessHost = accessHost
    this.principalId = principalId
    this.assetId = assetId
    this.action = action
    this.appId = appId

    if (!this.assetId && !this.action) {
      throw new Error("At least one of 'assetId' or 'action' is required.")
    }

    if (!this.principalId) {
      throw new Error('A principalId is required.')
    }

    if (!this.appId) {
      throw new Error('An appId is required.')
    }

    this.endpointUrl = new URL('/v1/providers', `https://${accessHost}`)

    if (this.endpointUrl.protocol !== 'https:') {
      throw new Error(
        `Invalid API endpoint from accessHost ${accessHost}. Endpoint must be https://`
      )
    }
  }

  headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }

  endpoint(): string {
    return this.endpointUrl.toString()
  }

  payload(): QueryPayload {
    const q: { assetId?: string; action?: string } = {}
    if (this.assetId) {
      q.assetId = this.assetId
    }
    if (this.action) {
      q.action = this.action
    }

    // /v1/providers routes on the provider hook's applicationIdPath, {$.context.appId}.
    return {
      principal: { id: this.principalId },
      queries: [q],
      context: { appId: this.appId }
    }
  }
}
