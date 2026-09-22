import * as core from '@actions/core'
import { sgnl } from './sgnl'
import { Query } from './query'

export async function run(): Promise<void> {
  if (core.getInput('bypassMode') === 'true') {
    core.warning('*** WARNING: BYPASS MODE ENABLED ***')
    core.warning('*** Skipping SGNL Policy Checks ***')
    core.setOutput('reason', 'Skipping SGNL call due to bypassMode=true')
    core.setOutput('decision', true)
    return
  }

  try {
    const query = new Query(
      core.getInput('token'),
      core.getInput('domain'),
      core.getInput('principalId'),
      core.getInput('assetId'),
      core.getInput('action')
    )

    core.setSecret(query.token)

    core.debug(
      `Querying SGNL accessEvaluation API. Query is:\n${JSON.stringify(
        query.payload(),
        null,
        2
      )}`
    )

    const result = await sgnl(query)

    core.setOutput('reason', result.reason)
    core.setOutput('decision', result.decision)

    if (!result.decision) {
      core.setFailed(result.reason)
    }
  } catch (error) {
    core.warning('SGNL API request failed')

    if (
      error != null &&
      typeof error === 'object' &&
      'response' in error &&
      error.response != null &&
      typeof error.response === 'object' &&
      'status' in error.response
    ) {
      core.setFailed(`SGNL API request failed with status ${(error.response as { status: number }).status}`)
    } else if (
      error != null &&
      typeof error === 'object' &&
      'request' in error
    ) {
      core.setFailed('SGNL API did not respond')
    } else if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('Unknown error')
    }
  }
}
