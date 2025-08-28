import ReportApi from "./ReportApi"

import {JobsMixin} from './JobsMixin'

/**
 * Produces a list of all the sub-accounts and the LCCs/Unit Admins managing them.
 */
class SubaccountAdminsJob {

    // The account ID to run the report against.
    accountId = null
    // Function to call with status updates.
    statusUpdate = () => {}
    // The CSV contents when built.
    csv = null

    /* reports read into memory as array of objects */
    // provisioning (admins) report
    adminsRows = null
    // provisioning (accounts) report
    accountsRows = null
    // provisioning (courses) report
    coursesRows = null

    static defaultOpts = {
        accountId: 'self',
        statusUpdate: () => {}
    }

    constructor(host, token, options = {}) {
        this.host = host
        this.token = token
        const mergedOptions = {...SubaccountAdminsJob.defaultOpts, ...options}
        this.accountId = mergedOptions.accountId
        this.statusUpdate = mergedOptions.statusUpdate
        this.baseUrl = mergedOptions.baseUrl
        this.rootAccountId = mergedOptions.rootAccountId
    }

    run = async () => {
        try {
            const reportApi = new ReportApi(this.host, this.token)

            this.statusUpdate("Running report")
            const [adminsReport, usersReport, accountsReport, coursesReport] = await Promise.all([
                reportApi.runReport('provisioning_csv', { 'admins': 'true' },{'account': this.accountId}),
                reportApi.runReport('provisioning_csv', { 'users': 'true' },{'account': this.accountId}),
                reportApi.runReport('provisioning_csv', { 'accounts': 'true' },{'account': this.accountId}),
                reportApi.runReport('provisioning_csv', { 'courses': 'true' },{'account': this.accountId})
            ]);

            this.statusUpdate("Downloading reports")
            const [adminsAttachment, usersAttachment, accountsAttachment, coursesAttachment] = await Promise.all([
                reportApi.fetchReport(adminsReport),
                reportApi.fetchReport(usersReport),
                reportApi.fetchReport(accountsReport),
                reportApi.fetchReport(coursesReport)
            ]);

            this.statusUpdate("Building CSV")
            const [adminsReportCsv, usersReportCsv, accountsReportCsv, coursesReportCsv] = await Promise.all([
                adminsAttachment.text(),
                usersAttachment.text(),
                accountsAttachment.text(),
                coursesAttachment.text()
            ]);


            [this.adminsRows, this.usersRows, this.accountsRows, this.coursesRows] = await Promise.all([
                this.parseCsv(adminsReportCsv),
                this.parseCsv(usersReportCsv),
                this.parseCsv(accountsReportCsv),
                this.parseCsv(coursesReportCsv)
            ]);

            const output = []
            for (const row of Object.values(this.accountsRows)) {
                const canvasAccountId = row.canvas_account_id

                const subaccount = this.getAccountRow(canvasAccountId)
                const subaccountPath = this.getSubaccountPath(subaccount)
                const subaccountName = subaccount ? subaccount.name : ''
                const subaccountUrl = `${this.baseUrl}/accounts/${canvasAccountId}`
                const coursesOnSubaccount = this.countCoursesOnSubaccount(canvasAccountId)
                const {lccsOrUnitAdmins, lccsFromParentRecord} = this.getLccsOrUnitAdmins(canvasAccountId)

                const countAdminsForSubaccount = this.countAdminsForSubaccount(canvasAccountId)

                output.push({
                    "Subaccount Name": subaccountName,
                    "Subaccount Path": subaccountPath,
                    "LCC/Unit Admin for Subaccount": lccsOrUnitAdmins,
                    "LCCs/Unit Admins from parent account?": lccsFromParentRecord ? "Yes" : "No",
                    "Courses on Subaccount": coursesOnSubaccount,
                    "Subaccount URL": subaccountUrl,
                    "Number of users with account roles for the subaccount": countAdminsForSubaccount
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

Object.assign(SubaccountAdminsJob.prototype, JobsMixin)
export default SubaccountAdminsJob