# Account Reports
Presents links to useful Canvas reports

## Development Setup

TLS is enabled by the mkcert vite plugin which can be disabled through `vite.config.js`

## Hosting

The tool does not have a back-end, it is a JavaScript Vite application. The easiest way to host is to use Cloudflare Pages & link to  Github repository on the Cloudflare Pages 'Settings' pages. The following build options also need setting

 - Build command: `npm run build`
 - Build output: `build`
 - Root directory:
 - Build comments: `Enabled`
 
## Configure

The `.env` (environment) file must specify

 - the ID of the root account (`VITE_APP_ROOT_ACCOUNT_ID`) which is often `1`
 - an array containing a list of IDs whose corresponding role is considered to be a sub-account administrator (`VITE_APP_SUBACCOUNT_ADMIN_ROLES`)

## Installing the tool

Configuring the tool can be done with `@oxctl/lti-auto-configuration`.

### Enter configuration

First set the required values.

```shell
npx @oxctl/lti-auto-configuration setup
```
### Create the tool

```shell
npx @oxctl/lti-auto-configuration create
```


### Development 

The deploy to development is done automatically when a new commit is made to master.

### Deployment Tests

There is a simple deployment test that is run when the tool is deployed to Beta or Production. This test relies on the repository having access to the organisational 
Github Actions Secret `DEPLOYMENT_TESTS_OAUTH_TOKEN`. Access must be granted on a repository by repository basis.

The test:

 - check the tool loads
 - checks there are buttons on the fist page to run reports

### Releasing

To release the latest code merge the master branch into the release branch Cloudflare will then deploy this to production.
The best way to do this is to create a PR from `master` to `release`, this allows you to check what's going to be released.
There is a GitHub action that can be manually run to do this.

Alternatively to do this locally run checkout the release branch, fetch the latest code from the origin and run:
```shell
git merge origin/master
```

To see what is about to go into a release you can preview the changes between [master and release](https://github.com/oxctl/account-reports/compare/release...master), 
then to double check a PR can be created to merge the changes, reviewed and merged (at which point the release branch is built and deployed).

## Sentry

Application errors are reported using https://sentry.io for this application. There is DSN to be used for development and  production and 
should be set up by hand as a Cloudflare (or equivalent) environment Secret 'VITE_SENTRY_DSN'.
 
There's no DSN for local development. 

Sentry is setup as early as possible in the application to capture as many errors as possible.
