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
 
## Configuration

### Account Admin Users

The `.env` (environment) file must specify

 - the ID of the root account (`VITE_APP_ROOT_ACCOUNT_ID`) which is often `1`
 - an array containing a list of IDs whose corresponding role is considered to be a sub-account administrator (`VITE_APP_SUBACCOUNT_ADMIN_ROLES`)

### Enrolment Reports

This project can be configured to expose one or more enrolment report buttons in the UI. These are configured using environment variables. At build time Vite only exposes variables prefixed with `VITE_`; this tool supports `VITE_` variables and will also accept `VITE_APP_` or non-prefixed variables for development convenience, but using the `VITE_` prefix is recommended for production builds.

The variables are:

- `NUMBER_ENROL_REPORTS` (or `VITE_NUMBER_ENROL_REPORTS` / `VITE_APP_NUMBER_ENROL_REPORTS`)
	- The number of enrolment reports to configure (integer). If zero or absent, no enrolment report buttons will be created.
- `ENROL_REPORT_NAME_{i}` and `ENROL_REPORT_ID_{i}` (or `VITE_ENROL_REPORT_NAME_{i}` / `VITE_APP_ENROL_REPORT_NAME_{i}`, `VITE_ENROL_REPORT_ID_{i}` / `VITE_APP_ENROL_REPORT_ID_{i}`)
	- Provide one pair per report where `{i}` is 1..`NUMBER_ENROL_REPORTS`.
	- `ENROL_REPORT_NAME_{i}` is the display name for the button.
	- `ENROL_REPORT_ID_{i}` is the numeric role id the report should match (the job will search for this role id in the provisioning CSV).

Example `.env` entries (recommended with `VITE_` prefix):

```env
VITE_NUMBER_ENROL_REPORTS=2
VITE_ENROL_REPORT_NAME_1="Suspended students"
VITE_ENROL_REPORT_ID_1=129
VITE_ENROL_REPORT_NAME_2="Captioner"
VITE_ENROL_REPORT_ID_2=255
```

Notes
- The application will read `VITE_` prefixed variables first (as required by Vite). If you use `VITE_APP_` or unprefixed variables during local development, the app will also accept them as fallbacks, but those will not be available in a Vite production build unless you rename them to `VITE_`.
- The configured `ENROL_REPORT_ID` is passed into the job and must be a valid numeric role id.


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

These two environment variables also need setting (will be replaced v soon)

 - `CANVAS_HOST`
 - `TOOL_ID`

The test:

 - check the tool loads
 - checks there are buttons on the first page to run reports

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

