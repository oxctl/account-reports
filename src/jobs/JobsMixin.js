import Papa from "papaparse";
import { parse } from "csv-parse/sync";
import moment from "moment-timezone";
import "moment/locale/en-gb";
import { SUBACCOUNT_ADMIN_ROLES } from "../utils/constants";

const JobsMixin = {
  getUserRow(canvas_user_id) {
    const userRows = this.usersRows.filter(
      (thisRow) => thisRow.canvas_user_id === canvas_user_id,
    );
    const nonExternalUserRows = userRows.filter(
      (thisRow) => !this.isExternalUser(thisRow),
    );
    return nonExternalUserRows.length ? nonExternalUserRows[0] : userRows[0];
  },

  isExternalUser(userRow) {
    return !userRow.login_id.endsWith("@ox.ac.uk");
  },

  getAccountRow(canvasAccountId) {
    return this.accountsRows.find(
      (thisRow) => thisRow.canvas_account_id === canvasAccountId,
    );
  },

  getSubaccountPath(subaccount) {
    if (!subaccount) return "";
    if (!this.canTraverseUpTree(subaccount)) return subaccount.name;

    const subaccountPath = [];
    subaccountPath.unshift(subaccount.name);
    const subaccountParent1 = this.getAccountRow(subaccount.canvas_parent_id);
    subaccountPath.unshift(subaccountParent1.name);
    if (!this.canTraverseUpTree(subaccountParent1))
      return subaccountPath.join(", ");

    const subaccountParent2 = this.getAccountRow(
      subaccountParent1.canvas_parent_id,
    );
    subaccountPath.unshift(subaccountParent2.name);
    return subaccountPath.join(", ");
  },

  getChildAccountIds(canvasAccountId) {
    return this.accountsRows.filter(
      (thisRow) => thisRow.canvas_parent_id === canvasAccountId,
    );
  },

  countCoursesOnSubaccount(canvasAccountId) {
    let count = 0;
    if (this.getChildAccountIds(canvasAccountId)) {
      this.getChildAccountIds(canvasAccountId).forEach((id) => {
        count += this.countCoursesOnSubaccount(id);
      });
    }
    return (
      count +
      this.coursesRows.filter(
        (thisRow) => thisRow.canvas_account_id === canvasAccountId,
      ).length
    );
  },

  getLccsOrUnitAdminsRows(accountRow) {
    return this.adminsRows.filter(
      (thisRow) =>
        thisRow.canvas_account_id === accountRow.canvas_account_id &&
        SUBACCOUNT_ADMIN_ROLES.includes(thisRow.role_id),
    );
  },

  canTraverseUpTree(accountRow) {
    return ![this.rootAccountId, this.accountId].includes(
      accountRow.canvas_parent_id,
    );
  },

  /* gets the LCCs/Unit Admins/Super LCCs from the account or nearest parent account.
     returns LCCs and whether they were found in a parent count as an object */
  getLccsOrUnitAdmins(canvasAccountId) {
    let accountRow = this.getAccountRow(canvasAccountId);
    if (!accountRow) return "";
    let lccsUnitAdminsRows = this.getLccsOrUnitAdminsRows(accountRow);
    while (
      lccsUnitAdminsRows.length === 0 &&
      accountRow &&
      this.canTraverseUpTree(accountRow)
    ) {
      accountRow = this.getAccountRow(accountRow.canvas_parent_id);
      lccsUnitAdminsRows = this.getLccsOrUnitAdminsRows(accountRow);
    }

    const lccsUnitAdminsIds = lccsUnitAdminsRows.map(
      (thisRow) => thisRow.canvas_user_id,
    );
    const lccsUnitAdminsNames = [];
    lccsUnitAdminsIds.forEach((lccsUnitAdminsId) => {
      const lccsUnitAdminsName = this.getUserRow(lccsUnitAdminsId).full_name;
      lccsUnitAdminsNames.push(lccsUnitAdminsName);
    });
    const fromParentRecord =
      accountRow &&
      accountRow.canvas_account_id !== canvasAccountId &&
      lccsUnitAdminsRows.length > 0;
    return {
      lccsOrUnitAdmins: lccsUnitAdminsNames.join(", "),
      lccsFromParentRecord: fromParentRecord,
    };
  },

  getLastLogin(canvas_user_id) {
    const lastLogin = this.lastAccessRows.find(
      (thisRow) => thisRow.user_id === canvas_user_id,
    ).last_access_at;
    if (!lastLogin) return "";
    const lastLoginDate = new Date(lastLogin);
    return moment(lastLoginDate).format("DD/MM/YY");
  },

  // used for reading local files in development
  async fetchCsv(file) {
    const response = await fetch(file);
    const csv = await response.text();
    return csv;
  },

  async parseCsv(csv) {
    return parse(csv, {
      delimiter: ",",
      columns: (header) => header.map((column) => column.replace(/ /g, "_")),
      relax_column_count: true,
    });
  },

  toCsv(output) {
    // Papaparse's unparse expects an array of objects or array of arrays.
    // Use columns from object keys by passing header: true behaviour via header option.
    return Papa.unparse(output, { header: true });
  },

  countAdminsForSubaccount(canvasAccountId) {
    return this.adminsRows.filter(
      (thisRow) => thisRow.canvas_account_id === canvasAccountId,
    ).length;
  },
};

export { JobsMixin };
