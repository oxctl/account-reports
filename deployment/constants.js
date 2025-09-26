/* Tool specific config. */
import "dotenv/config.js";

export const token = process.env.OAUTH_TOKEN;
export const host = process.env.CANVAS_HOST;
export const toolId = process.env.TOOL_ID;
export const accountId = 11299;
export const networkPreset = process.env.NETWORK_PRESET;
export const toolAnchorMethod = "getByText";
export const toolAnchorText = "Account Reports";
export const toolAnchorOptions = { exact: true };
export const toolUrl = `${host}/accounts/${accountId}/external_tools/${toolId}`;
