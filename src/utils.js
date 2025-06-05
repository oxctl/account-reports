
/*
 * Copyright (c) 2025, University of Oxford
 */
const settings = {
  'http://origin.test': {
    'sentryDsn': null,
    'sentryEnv': null
  },
  'https://localhost:3000': {
    'sentryDsn': import.meta.env.VITE_SENTRY_DSN,
    'sentryEnv': import.meta.env.VITE_SENTRY_ENV
  },
  'https://master.report-listings.pages.dev': {
    'sentryDsn': 'https://d94d964a9faa42ee11afa535075bfa2d@o419652.ingest.us.sentry.io/4509441351483392',
    'sentryEnv': 'beta'
  },
  'https://report-listings.canvas.ox.ac.uk': {
    'sentryDsn': 'https://d94d964a9faa42ee11afa535075bfa2d@o419652.ingest.us.sentry.io/4509441351483392',
    'sentryEnv': 'prod'
  }
}

export const getSettings = () => {
  const origin = (window && window.origin)? window.origin : 'http://origin.test'
  return settings[origin]
}