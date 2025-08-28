import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn: dsn,
    environment: import.meta.env.VITE_SENTRY_ENV,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,
  });
}

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
