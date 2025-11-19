import { test, expect } from '@playwright/test'
import { dismissBetaBanner, getLtiIFrame, waitForNoSpinners, TEST_URL } from '@oxctl/deployment-test-utils'

// TEST_URL is verified and provided by @oxctl/deployment-test-utils
test.describe('Test deployment', () => {
    test('The tool should load and the title "Account Reports" should be shown', async ({context, page}) => {
    await page.goto(TEST_URL)
    await dismissBetaBanner(page)
    const ltiIFrame = getLtiIFrame(page)
    await waitForNoSpinners(ltiIFrame)

    // Check there's a title Account Reports
    const title = ltiIFrame.getByText("Account Reports")
    await expect(title).toBeVisible();
  })
})
