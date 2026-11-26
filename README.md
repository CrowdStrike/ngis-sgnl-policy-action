# Falcon Next-Gen Identity Security Policy Action

[![Lint Code Base](https://github.com/CrowdStrike/ngis-sgnl-policy-action/actions/workflows/linter.yml/badge.svg)](https://github.com/CrowdStrike/ngis-sgnl-policy-action/actions/workflows/linter.yml)
![CI](https://github.com/CrowdStrike/ngis-sgnl-policy-action/actions/workflows/ci.yml/badge.svg)
![Code Coverage](badges/coverage.svg)

## Calling Falcon NGIS from a GitHub Action

This action calls Falcon Next-Gen Identity Security (NGIS) from a GitHub Actions
workflow. Use it to check whether the GitHub user is allowed to run or trigger
the workflow, based on a policy that you define in NGIS.

### Prerequisites

Set these up in the Falcon console before you use the action:

- A Falcon API client (client ID and secret) with the `sgnl-access:read` scope.
- That API client mapped to your NGIS provider.
- A protected system for GitHub. Its ID is the `app_id` input.
- An NGIS provider hook whose application ID path is `{$.context.appId}`, with
  an integration assignment for the GitHub protected system. The assignment's
  application ID must equal your `app_id`, and it must route to access
  evaluation.
- A policy for the action and asset that your workflow checks.

### Repository configuration

Add these to the repository (or organization) that runs the workflow:

| Name            | Kind     | Value                                          |
| --------------- | -------- | ---------------------------------------------- |
| `access_host`   | Variable | The NGIS access host for your Falcon cloud     |
| `client_id`     | Variable | The Falcon API client ID                       |
| `app_id`        | Variable | The ID of the GitHub protected system          |
| `client_secret` | Secret   | The Falcon API client secret                   |

| Falcon cloud | `access_host`                 |
| ------------ | ----------------------------- |
| US-1         | `access.crowdstrike.com`      |
| US-2         | `access.us-2.crowdstrike.com` |
| EU-1         | `access.eu-1.crowdstrike.com` |

### Example

This example passes the GitHub username of the user who triggered the workflow
as the `principal_id` and the current repository as the `asset_id`.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: NGIS Policy Check
    id: ngis
    uses: CrowdStrike/ngis-sgnl-policy-action@v1
    with:
      access_host: ${{ vars.access_host }}
      client_id: ${{ vars.client_id }}
      client_secret: ${{ secrets.client_secret }}
      app_id: ${{ vars.app_id }}
      principal_id: ${{ github.actor }}
      action: 'my action'
      asset_id: ${{ github.repository }}

  - name: Print Output
    id: output
    run: >
      echo "Decision '${{ steps.ngis.outputs.decision }}',  Reason '${{
      steps.ngis.outputs.reason }}'"
```

When the decision is Deny, the step fails, and that stops the job.

### Inputs

| Input           | Required | Description                                                                                  |
| --------------- | -------- | -------------------------------------------------------------------------------------------- |
| `access_host`   | Yes      | NGIS access host, without scheme or path (see the cloud table above).                        |
| `client_id`     | Yes      | Falcon API client ID.                                                                        |
| `client_secret` | Yes      | Falcon API client secret.                                                                    |
| `app_id`        | Yes      | ID of the GitHub protected system.                                                           |
| `principal_id`  | Yes      | Identity of the principal running the workflow. Typically `github.actor`.                    |
| `asset_id`      | No       | Asset for the policy check. Typically `github.repository`. Set `asset_id`, `action`, or both. |
| `action`        | No       | Action for the policy check. Set `asset_id`, `action`, or both.                               |
| `bypass_mode`   | Yes      | Defaults to `false`. When `true`, skips NGIS and always returns Allow. Use for testing or break glass only. |

### Outputs

| Output     | Description                                         |
| ---------- | --------------------------------------------------- |
| `decision` | `true` for Allow, `false` for Deny.                 |
| `reason`   | The decision reason from the policy evaluation, if any. |

### Reporting bugs

If you run into problems with this action, first check
[docs.crowdstrike.com](https://docs.crowdstrike.com/). If that doesn't resolve
the problem, open a ticket with CrowdStrike support.

## Building and Releasing

This section is for instructions on how to build and release the policy-action

### Setting up

1. This action is written in TypeScript. You'll need a version of Node.js >= v24
   (`node --version`)
1. clone the repository
1. run `npm install` to install the dependencies

### Build loop

1. create a feature branch
1. add tests & make changes
1. `npm run test` should be green
1. `npm run all` to package the release (this creates the bundled action in
   /dist)
1. push your branch
1. create a PR

### Testing

Tests are using [Jest](https://jestjs.io/)

### Releasing

When a change to `dist/index.js` merges to `main`, the
[Release Tagger](.github/workflows/release-tagger.yml) workflow tags the next
patch version (for example `v1.0.3` to `v1.0.4`, or `v1.1.0` to `v1.1.1`), moves
the `v1` tag to it, and creates a GitHub release.

Minor and major versions are tagged by hand. After the PR merges, tag the merged
commit on `main` and move the major tag:

```sh
git tag -s -m "v1.1.0" v1.1.0 <merged-sha>
git tag -s -f -m "v1" v1 <merged-sha>
git push origin v1.1.0
git push -f origin v1
```
