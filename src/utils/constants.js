// reports variables
export const SUBACCOUNT_ADMIN_ROLES = JSON.parse(
  import.meta.env.VITE_APP_SUBACCOUNT_ADMIN_ROLES,
).map(String);

export const ROOT_ACCOUNT_ID = JSON.parse(
  import.meta.env.VITE_APP_ROOT_ACCOUNT_ID,
);

// Enrollment report config (support both VITE_ and VITE_APP_ prefixes)
export const ENROL_REPORT_NAME_1 =
  import.meta.env.VITE_ENROL_REPORT_NAME_1 || import.meta.env.VITE_APP_ENROL_REPORT_NAME_1 || import.meta.env.ENROL_REPORT_NAME_1 || "";

export const ENROL_REPORT_ID_1 =
  (import.meta.env.VITE_ENROL_REPORT_ID_1 || import.meta.env.VITE_APP_ENROL_REPORT_ID_1 || import.meta.env.ENROL_REPORT_ID_1 || "");

// Number of enrolment reports (support VITE_ and VITE_APP_ prefixes)
export const NUMBER_ENROL_REPORTS = Number(
  import.meta.env.VITE_NUMBER_ENROL_REPORTS || import.meta.env.VITE_APP_NUMBER_ENROL_REPORTS || import.meta.env.NUMBER_ENROL_REPORTS || 0,
);

// Build an array of enrolment report configs from env. Keys follow the
// pattern ENROL_REPORT_NAME_{i} and ENROL_REPORT_ID_{i} (or VITE_/VITE_APP_ prefixed).
export const ENROL_REPORTS = (() => {
  const n = Number(NUMBER_ENROL_REPORTS) || 0;
  const out = [];
  for (let i = 1; i <= n; i++) {
    const name =
      import.meta.env[`VITE_ENROL_REPORT_NAME_${i}`] ||
      import.meta.env[`VITE_APP_ENROL_REPORT_NAME_${i}`] ||
      import.meta.env[`ENROL_REPORT_NAME_${i}`] ||
      "";
    const idRaw =
      import.meta.env[`VITE_ENROL_REPORT_ID_${i}`] ||
      import.meta.env[`VITE_APP_ENROL_REPORT_ID_${i}`] ||
      import.meta.env[`ENROL_REPORT_ID_${i}`] ||
      "";
    const idMatch = String(idRaw).trim().match(/\d+/);
    const id = idMatch ? String(idMatch[0]) : "";
    if (name && id) out.push({ name: String(name).trim(), id });
  }
  return out;
})();
