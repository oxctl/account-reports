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
