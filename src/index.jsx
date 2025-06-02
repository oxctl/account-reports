/*
 * Copyright (c) 2020, University of Oxford
 */

import React from 'react'
import { createRoot } from 'react-dom/client';
import App from './App'
import { getSettings } from './utils'
import * as Sentry from '@sentry/react'

{
  // Load sentry setup if defined.
  // This is done early in the application to catch as much as possible.
  const dsn = getSettings()?.sentryDsn
  if (dsn) {
    Sentry.init({
      dsn,
      integrations: [Sentry.browserTracingIntegration()],
      environment: getSettings()?.sentryEnv,


      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    })
  }
}

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);