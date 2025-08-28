import SampleJob from "./SampleJob";

test('the jobs completes', () => {
    const sampleJob = new SampleJob('host', 'token', {delay: 1})
    return sampleJob.run()
});