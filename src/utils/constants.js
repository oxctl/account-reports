// reports variables
export const SUBACCOUNT_ADMIN_ROLES = JSON.parse(
  import.meta.env.VITE_APP_SUBACCOUNT_ADMIN_ROLES,
).map(String);

export const ROOT_ACCOUNT_ID = JSON.parse(
  import.meta.env.VITE_APP_ROOT_ACCOUNT_ID,
);
