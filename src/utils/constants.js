// reports variables
// Only VITE_ prefixed environment variables are supported for production
// builds with Vite. Legacy fallbacks (VITE_APP_ / unprefixed) are NOT used.
export const SUBACCOUNT_ADMIN_ROLES = JSON.parse(
  import.meta.env.VITE_SUBACCOUNT_ADMIN_ROLES || "[]",
).map(String);

export const ROOT_ACCOUNT_ID = Number(import.meta.env.VITE_ROOT_ACCOUNT_ID || 1);


// Number of enrolment reports (only VITE_ prefix supported)
export const NUMBER_ENROL_REPORTS = Number(import.meta.env.VITE_NUMBER_ENROL_REPORTS || 0);

// Build an array of enrolment report configs from env. Keys follow the
// pattern VITE_ENROL_REPORT_NAME_{i} and VITE_ENROL_REPORT_ID_{i}.
export const ENROL_REPORTS = (() => {
  const n = NUMBER_ENROL_REPORTS;
  const out = [];
  for (let i = 1; i <= n; i++) {
    const name =
      import.meta.env[`VITE_ENROL_REPORT_NAME_${i}`] || "";
    const idRaw = import.meta.env[`VITE_ENROL_REPORT_ID_${i}`] || "";
    const idStr = String(idRaw).trim();
    const id = /^\d+$/.test(idStr) ? idStr : "";
    if (name && id) out.push({ name: String(name).trim(), id });
  }
  return out;
})();
