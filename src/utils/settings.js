import {DEV, LOCAL, PROD, TEST} from "./constants";

// Defines the 
const environments = {
    [TEST]: {
        'ltiServer': 'https://ltiserver',
        'proxyServer': 'https://proxyserver'
    },
    [LOCAL]: {
        'ltiServer': import.meta.env.VITE_APP_SERVER_LTI,
        'proxyServer': import.meta.env.VITE_APP_SERVER_PROXY,
    },
    [DEV]: {
        'ltiServer': 'https://lti-dev.canvas.ox.ac.uk',
        'proxyServer': 'https://proxy-dev.canvas.ox.ac.uk',
        'sentryDsn': 'https://16ad4b2333b44861868bbb373566db16@o419652.ingest.sentry.io/6051385',
        'sentryEnv': 'beta'
    },
    [PROD]: {
        'ltiServer': 'https://lti.canvas.ox.ac.uk',
        'proxyServer': 'https://proxy.canvas.ox.ac.uk',
        'sentryDsn':'https://16ad4b2333b44861868bbb373566db16@o419652.ingest.sentry.io/6051385',
        'sentryEnv': 'prod'
    }
}

export const settings = environments[window.location.origin]
