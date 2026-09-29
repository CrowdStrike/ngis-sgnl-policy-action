import axios from 'axios'
import * as core from '@actions/core'
import { Query } from './query'

export interface SgnlResult {
  decision: boolean
  reason: string
}

interface SgnlDecision {
  decision: string
  reasons?: string[]
}

interface SgnlResponseData {
  decisions: SgnlDecision[]
}

export async function sgnl(query: Query): Promise<SgnlResult> {
  const response = await axios.post<SgnlResponseData>(
    query.endpoint(),
    query.payload(),
    { headers: query.headers() }
  )

  core.debug(`SGNL API returned:\n${JSON.stringify(response.data, null, 2)}`)

  return parse(response.data)
}

function parse(data: SgnlResponseData): SgnlResult {
  const decisions = data.decisions
  if (decisions?.length !== 1) {
    throw new Error(
      `SGNL API returned ${decisions?.length ?? 0} decisions, expected exactly 1`
    )
  }
  return {
    decision: decisions[0].decision === 'Allow',
    reason: decisions[0].reasons ? decisions[0].reasons[0] : ''
  }
}
