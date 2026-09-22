# Falcon Next-Gen Identity Security Policy Action

[![Lint Code Base](https://github.com/CrowdStrike/ngis-sgnl-policy-action/actions/workflows/linter.yml/badge.svg)](https://github.com/CrowdStrike/ngis-sgnl-policy-action/actions/workflows/linter.yml)
![CI](https://github.com/CrowdStrike/ngis-sgnl-policy-action/actions/workflows/ci.yml/badge.svg)
![Code Coverage](badges/coverage.svg)

## Calling Falcon NGIS from a GitHub Action

This action allows you to call the NGIS APIs from a GitHub Actions workflow. You
can use this policy check to determine if the GitHub user is allowed to execute
or trigger the workflow in question based on a policy definition in NGIS. To get
started you will need to define a protected system and policy in the Falcon
console. For more information on how to setup NGIS for GitHub, please see our
[setup guide](<<TBD>>)

### Example

This example is passing the GitHub username of the user who triggered the action
as the principal_id and the current repository as the asset_id.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: NGIS Policy Check
    id: ngis
    uses: <<TBD>>
    with:
      access_host: ${{ vars.crowdstrike_access_host }}
      client_id: ${{ vars.client_id }}
      client_secret: ${{ secrets.client_secret }}
      principal_id: ${{ github.actor }}
      action: 'my action'
      asset_id: ${{ github.repository }}

  - name: Print Output
    id: output
    run: >
      echo "Decision '${{ steps.ngis.outputs.decision }}',  Reason '${{
      steps.ngis.outputs.reason }}'"
```

### Reporting bugs

If you run into problems with this action, first please check
[docs.crowdstrike.com](https://docs.crowdstrike.com/). If that doesn't resolve
the problem, please open a ticket with CrowdStrike support.

## Building and Releasing

This section is for instructions on how to build and release the policy-action

### Setting up

1. This action is written in TypeScript. You'll need a version of Node.js >= v22
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

After a release is merged, the release has to be tagged so other projects can
use it correctly.

> [!NOTE] Example: You are releasing a backwards compatible feature to the v2
> major release. Let's assume the next release is v2.1.0 (i.e. not a patch, not
> a breaking change) then you would do the following to create the tags:

Updating the existing v2 tag so existing workflows can take advantage of your
new feature

`git tag -s -f -m "update v2 tag" v2`

Create a new tag to track your new feature more specifically

`git tag -s -m "update v2.1.0 tag" v2.1.0`

Or, if you are just patching a bug against v2.0, create a patch tag for a bugfix

`git tag -s -m "create v2.0.1 tag" v2.0.1`

Push the tags up to GitHub. The `-f` is required to update the v2 tag

`git push --tags --force`
