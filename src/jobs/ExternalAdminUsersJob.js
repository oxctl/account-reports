import ReportApi from "./ReportApi"

import {JobsMixin} from './JobsMixin'

/**
 * Produces a list of all the external users that have admin access through sub-accounts
 */
class ExternalAdminUsersJob {

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
        const mergedOptions = {...ExternalAdminUsersJob.defaultOpts, ...options}
        this.accountId = mergedOptions.accountId
        this.statusUpdate = mergedOptions.statusUpdate
        this.rootAccountId = mergedOptions.rootAccountId
    }

    run = async () => {
        try {
            const reportApi = new ReportApi(this.host, this.token)

            this.statusUpdate("Running reports")
            const [adminsReport, usersReport, accountsReport] = await Promise.all([
                reportApi.runReport('provisioning_csv', { 'admins': 'true' },{'account': this.accountId}),
                reportApi.runReport('provisioning_csv', { 'users': 'true' },{'account': this.accountId}),
                reportApi.runReport('provisioning_csv', { 'accounts': 'true' },{'account': this.accountId})
            ]);

            this.statusUpdate("Downloading reports")
            const [adminsAttachment, usersAttachment, accountsAttachment] = await Promise.all([
                reportApi.fetchReport(adminsReport),
                reportApi.fetchReport(usersReport),
                reportApi.fetchReport(accountsReport)
            ]);

            this.statusUpdate("Building CSV")
            const [adminsReportCsv, usersReportCsv, accountsReportCsv] = await Promise.all([
                adminsAttachment.text(),
                usersAttachment.text(),
                accountsAttachment.text()
            ]);

            [this.adminsRows, this.usersRows, this.accountsRows] = await Promise.all([
                this.parseCsv(adminsReportCsv), this.parseCsv(usersReportCsv), this.parseCsv(accountsReportCsv)
            ]);

            const output = []
            for (const row of Object.values(this.adminsRows)) {
                const userRow = this.getUserRow(row.canvas_user_id)
                if(this.isExternalUser(userRow)) {
                    const fullName = userRow.full_name
                    const email = userRow.email
                    const sso = userRow.user_id

                    const canvasAccountId = row.canvas_account_id
                    const subaccount = this.getAccountRow(canvasAccountId)
                    const subaccountPath = this.getSubaccountPath(subaccount)
                    const subaccountName = subaccount ? subaccount.name : ''
                    const {lccsOrUnitAdmins, lccsFromParentRecord} = this.getLccsOrUnitAdmins(canvasAccountId)

                    output.push({
                        "Name of User": fullName,
                        "Email Address": email,
                        "SSO": sso,
                        "Account Role": row.role,
                        "Subaccount Name": subaccountName,
                        "Subaccount Path": subaccountPath,
                        "LCC/Unit Admin for Subaccount": lccsOrUnitAdmins,
                        "LCCs/Unit Admins from parent account?": lccsFromParentRecord ? "Yes" : "No"
                    })
                }
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

Object.assign(ExternalAdminUsersJob.prototype, JobsMixin)
export default ExternalAdminUsersJob