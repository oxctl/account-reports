import { test, expect } from "@playwright/test";
import {
  goToTool,
  addNetworkThrottle,
  NETWORK_PRESETS,
  screenshot,
  getToolAnchor,
} from "./test-utils";
import { networkPreset } from "./constants";

test("Account tools deployment tests at subaccount", async ({
  context,
  page,
}, testInfo) => {
  let ltiToolFrame;

  await test.step("Load the tool", async () => {
    if (networkPreset) {
      await addNetworkThrottle(context, page, NETWORK_PRESETS[networkPreset]);
    }
    ltiToolFrame = await goToTool(page);
    if (page.url().includes("beta")) {
      // the warning banner on beta interferes with some click operations so dismiss it
      await page.getByRole("button", { name: "Close warning" }).click();
    }
  });

  await test.step("Tool loads", async () => {
    const title = await getToolAnchor(ltiToolFrame);
    await expect(title).toBeVisible();
  });

  await test.step("Report(s) are available to run", async () => {
    const buttons = await ltiToolFrame.getByRole("button");
    await expect(buttons).toHaveCount(1);

    const multipleLoginUsers = await ltiToolFrame.getByText(
      "Multiple Login Users",
      { exact: true },
    );
    await expect(multipleLoginUsers).toBeVisible();
  });
});
