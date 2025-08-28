// environments
export const TEST = "http://localhost:3000";
export const LOCAL = "https://localhost:3000";
export const DEV = "https://master.account-tools.pages.dev";
export const PROD = "https://account-tools.canvas.ox.ac.uk";

// reports variables
export const SUBACCOUNT_ADMIN_ROLES = JSON.parse(
  import.meta.env.VITE_APP_SUBACCOUNT_ADMIN_ROLES,
).map(String);
