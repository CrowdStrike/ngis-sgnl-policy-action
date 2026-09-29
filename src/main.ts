import * as core from '@actions/core'
import { sgnl } from './sgnl'
import { Query } from './query'
import { getAccessToken } from './auth'

export async function run(): Promise<void> {
  if (core.getInput('bypass_mode') === 'true') {
    core.warning('*** WARNING: BYPASS MODE ENABLED ***')
    core.warning('*** Skipping SGNL Policy Checks ***')
    core.setOutput('reason', 'Skipping SGNL call due to bypass_mode=true')
    core.setOutput('decision', true)
    return
  }

  const clientId = core.getInput('client_id')
  const clientSecret = core.getInput('client_secret')
  const accessHost = core.getInput('access_host')

  core.setSecret(clientSecret)

  const ACCESS_HOST_PREFIX = 'access.'

  if (!accessHost.startsWith(ACCESS_HOST_PREFIX)) {
    core.setFailed(
      `Invalid access_host "${accessHost}". Expected a hostname starting with "access." (e.g. access.crowdstrike.com)`
    )
    return
  }

  const tokenUrl = `https://api.${accessHost.replace(ACCESS_HOST_PREFIX, '')}/oauth2/token`

  let accessToken: string
  try {
    accessToken = await getAccessToken({ clientId, clientSecret, tokenUrl })
  } catch (error) {
    core.setFailed(
      `Failed to obtain OAuth2 access token: ${error instanceof Error ? error.message : String(error)}`
    )
    return
  }

  core.setSecret(accessToken)

  try {
    const query = new Query(
      accessToken,
      accessHost,
      core.getInput('principal_id'),
      core.getInput('asset_id'),
      core.getInput('action')
    )

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
      core.setFailed(
        `SGNL API request failed with status ${(error.response as { status: number }).status}`
      )
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
