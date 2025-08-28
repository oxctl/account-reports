import ReportApi from './ReportApi'
import { stringify } from 'csv-stringify/sync'
import { parse } from 'csv-parse/sync'

/**
 * This looks for user who have more than one login on the account.
 * It currently reads the entire dataset into memory.
 */
class DuplicateLoginsJob {
    
    // The account ID to run the report against.
    accountId = null
    // Function to call with status updates.
    statusUpdate = () => {}
    // The CSV contents when built.
    csv = null
    
    static defaultOpts = {
        accountId: 'self',
        statusUpdate: () => {}
    }

    constructor(host, token, options = {}) {
        this.host = host
        this.token = token
        const mergedOptions = {...DuplicateLoginsJob.defaultOpts, ...options}
        this.accountId = mergedOptions.accountId
        this.statusUpdate = mergedOptions.statusUpdate
    }
    
    run = async () => {
        const reportApi = new ReportApi(this.host, this.token)
        this.statusUpdate("Running report")
        const report = await reportApi.runReport('provisioning_csv', { 'users': 'true' },{'account': this.accountId})
        this.statusUpdate("Downloading report")
        const attachment = await reportApi.fetchReport(report)
        this.statusUpdate("Building CSV")
        const reportCsv = await attachment.text()

        const rows = parse(reportCsv, {delimiter: ',', columns: header => header.map(column => column.replace(/ /g, '_'))})
        // Better performance because of cached locale.
        const collator = new Intl.Collator()
        // We don't care about predicable order, just that the same IDs are next to each other.
        rows.sort((a, b) => collator.compare(a.canvas_user_id, b.canvas_user_id))
        let previous = {}
        const duplicates = []
        let matching = false
        for (const row of Object.values(rows)) {
            if (row.canvas_user_id === previous.canvas_user_id) {
                matching = true
                duplicates.push(previous)
            } else {
                if (matching) {
                    duplicates.push(previous)
                    matching = false
                }
            }
            previous = row
        }
        // Check for last row match
        if (matching) {
            duplicates.push(previous)
        }
        this.csv = stringify(duplicates, {header: true})
        this.statusUpdate("Written CSV")
    }
    
    output = () => {
        return this.csv
    }
    
}

export default DuplicateLoginsJob