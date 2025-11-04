import { test, expect } from '@playwright/test'
import { dismissBetaBanner, getLtiIFrame, waitForNoSpinners } from '@oxctl/deployment-test-utils'

const host = process.env.CANVAS_HOST
const url = process.env.URL

test.describe('Test deployment', async () => {
  await test('The tool should load and the title "Account Reports" should be shown', async ({context, page}) => {
    await page.goto(`${host}/${url}`)
    await dismissBetaBanner(page)
    const ltiIFrame = getLtiIFrame(page)
    await waitForNoSpinners(ltiIFrame)
    
    // Check there's a title Account Reports
    const title = ltiIFrame.getByText("Account Reports")
    await expect(title).toBeVisible();
  })
})