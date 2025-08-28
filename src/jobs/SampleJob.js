/**
 * Just a simple job that doesn't do anything, but is useful for testing the UI.
 */
class SampleJob {
    
    // How long to pretend the job takes
    delay = 1000
    // Should this job fail
    error = false
    // method to update on progress
    statusUpdate = () => {}

    constructor(host, token, options = {}) {
        this.host = host
        this.token = token
        const mergedOptions = { delay: 1000, statusUpdate: () => {}, error: false, ...options }
        this.delay = mergedOptions.delay
        this.error = mergedOptions.error
    }

    run = async () => {
        this.statusUpdate("Starting")
        return new Promise((resolve,reject) => {
            setTimeout(() => {
                if (this.error) {
                    reject("Failed")
                } else {
                    this.statusUpdate("Finishing")
                    resolve()
                }
            }, this.delay)
        })
    }
    
    output = () => {
        return 'hello,world'
    }
    
}

export default SampleJob