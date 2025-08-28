import ReportApi from "./ReportApi"

import {JobsMixin} from './JobsMixin'

/**
 * Produces a list of all the admin users and the sub-accounts they have access to
 */
class AccountAdminUsersJob {

    // The account ID to run the report against.
    accountId = null
    // Function to call with status updates.
    statusUpdate = () => {}
    // The CSV contents when built.
    csv = null

    /* reports read into memory as array of objects */
    // provisioning (admins) report
    adminsRows = null
    // provisioning (users) report
    usersRows = null
    // provisioning (accounts) report
    accountsRows = null
    // provisioning (courses) report
    coursesRows = null
    // last_user_access report
    lastAccessRows = null

    static defaultOpts = {
        accountId: 'self',
        statusUpdate: () => {}
    }

    constructor(host, token, options = {}) {
        this.host = host
        this.token = token
        const mergedOptions = {...AccountAdminUsersJob.defaultOpts, ...options}
        this.accountId = mergedOptions.accountId
        this.statusUpdate = mergedOptions.statusUpdate
        this.baseUrl = mergedOptions.baseUrl
        this.rootAccountId = mergedOptions.rootAccountId
    }

    run = async () => {
        try {
            const reportApi = new ReportApi(this.host, this.token)

            this.statusUpdate("Running reports")
            const [adminsReport, usersReport, accountsReport, coursesReport, lastAccessReport] = await Promise.all([
                reportApi.runReport('provisioning_csv', { 'admins': 'true' },{'account': this.accountId}),
                reportApi.runReport('provisioning_csv', { 'users': 'true' },{'account': this.accountId}),
                reportApi.runReport('provisioning_csv', { 'accounts': 'true' },{'account': this.accountId}),
                reportApi.runReport('provisioning_csv', { 'courses': 'true' },{'account': this.accountId}),
                reportApi.runReport('last_user_access_csv', {'account': this.accountId})
            ]);

            this.statusUpdate("Downloading reports")
            const [adminsAttachment, usersAttachment, accountsAttachment, coursesAttachment, lastAccessAttachment] = await Promise.all([
                reportApi.fetchReport(adminsReport),
                reportApi.fetchReport(usersReport),
                reportApi.fetchReport(accountsReport),
                reportApi.fetchReport(coursesReport),
                reportApi.fetchReport(lastAccessReport)
            ]);

            this.statusUpdate("Building CSV")
            const [adminsReportCsv, usersReportCsv, accountsReportCsv, coursesReportCsv, lastAccessReportCsv] = await Promise.all([
                adminsAttachment.text(),
                usersAttachment.text(),
                accountsAttachment.text(),
                coursesAttachment.text(),
                lastAccessAttachment.text()
            ]);

            [this.adminsRows, this.usersRows, this.accountsRows, this.coursesRows, this.lastAccessRows] = await Promise.all([
                this.parseCsv(adminsReportCsv),
                this.parseCsv(usersReportCsv),
                this.parseCsv(accountsReportCsv),
                this.parseCsv(coursesReportCsv),
                this.parseCsv(lastAccessReportCsv)
            ]);

            const output = []
            for (const row of Object.values(this.adminsRows)) {
                const userRow = this.getUserRow(row.canvas_user_id)
                const fullName = userRow.full_name
                const email = userRow.email
                const sso = userRow.user_id
                const externalUser = this.isExternalUser(userRow)

                const canvasAccountId = row.canvas_account_id
                const subaccount = this.getAccountRow(canvasAccountId)
                const subaccountPath = this.getSubaccountPath(subaccount)
                const subaccountName = subaccount ? subaccount.name : ''
                const subaccountUrl = `${this.baseUrl}/accounts/${canvasAccountId}`
                const coursesOnSubaccount = this.countCoursesOnSubaccount(canvasAccountId)
                const {lccsOrUnitAdmins, lccsFromParentRecord} = this.getLccsOrUnitAdmins(canvasAccountId)

                const lastLogin = this.getLastLogin(row.canvas_user_id)

                output.push({
                    "Name of User": fullName,
                    "Email Address": email,
                    "SSO": sso,
                    "Account Role": row.role,
                    "Subaccount Name": subaccountName,
                    "Subaccount Path": subaccountPath,
                    "Date of Last Login": lastLogin,
                    "LCC/Unit Admin for Subaccount": lccsOrUnitAdmins,
                    "LCCs/Unit Admins from parent account?": lccsFromParentRecord ? "Yes" : "No",
                    "External User": externalUser ? "Yes" : "No",
                    "Courses on Subaccount": coursesOnSubaccount,
                    "Subaccount URL": subaccountUrl
                })
            }

            this.csv = this.toCsv(output)
        }catch(e){
            console.log(e);
            throw e
        }
        this.statusUpdate("Written CSV")
    }

    output = () => {
        return this.csv
    }

}

Object.assign(AccountAdminUsersJob.prototype, JobsMixin)

export default AccountAdminUsersJob