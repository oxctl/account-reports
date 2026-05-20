import { beforeEach, describe, expect, it, vi } from "vitest";
import UserAccessTokensCSVJob from "./UserAccessTokensCSVJob";
import ReportApi from "./ReportApi";

vi.mock("./ReportApi");

describe("UserAccessTokensCSVJob", () => {
  const rootAccountId = "1";

  const createJob = () => {
    const job = new UserAccessTokensCSVJob("https://example.com", "token", {
      rootAccountId,
      statusUpdate: vi.fn(),
    });

    job.parseCsv = vi.fn();
    job.toCsv = vi.fn((rows) => rows);
    return job;
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("includes a token that never expires", async () => {
    const job = createJob();
    const reportApi = {
      runReport: vi.fn(),
      fetchReport: vi.fn(),
    };

    ReportApi.mockImplementation(function () {
      return reportApi;
    });

    reportApi.runReport
      .mockResolvedValueOnce("admins-report")
      .mockResolvedValueOnce("tokens-report");

    reportApi.fetchReport.mockImplementation((reportId) => {
      if (reportId === "admins-report") {
        return Promise.resolve({
          text: () =>
            Promise.resolve(
              "canvas_user_id,canvas_account_id,admin_user_name\n123,1,Admin User\n",
            ),
        });
      }

      return Promise.resolve({
        text: () =>
          Promise.resolve(
            [
              "id,user_id,status,dev_key_name,creation,expiration,last_used",
              "999,123,active,User-Generated,2020-01-01T00:00:00+00:00,never,2024-01-01T00:00:00+00:00",
              "",
            ].join("\n"),
          ),
      });
    });

    job.parseCsv
      .mockResolvedValueOnce({
        0: { canvas_user_id: "123", canvas_account_id: "1", admin_user_name: "Admin User" },
      })
      .mockResolvedValueOnce({
        0: {
          id: "999",
          user_id: "123",
          status: "active",
          dev_key_name: "User-Generated",
          creation: "2020-01-01T00:00:00+00:00",
          expiration: "never",
          last_used: "2024-01-01T00:00:00+00:00",
        },
      });

    await job.run();

    expect(job.toCsv).toHaveBeenCalledWith([
      expect.objectContaining({
        "Admin User ID": "123",
        "Token ID": "999",
        "Reason Included": "Never expires",
      }),
    ]);
  });

  it("includes a token when expiry is more than a year after creation", async () => {
    const job = createJob();
    const reportApi = {
      runReport: vi.fn(),
      fetchReport: vi.fn(),
    };

    ReportApi.mockImplementation(function () {
      return reportApi;
    });

    reportApi.runReport
      .mockResolvedValueOnce("admins-report")
      .mockResolvedValueOnce("tokens-report");

    reportApi.fetchReport.mockImplementation((reportId) => {
      if (reportId === "admins-report") {
        return Promise.resolve({
          text: () =>
            Promise.resolve(
              "canvas_user_id,canvas_account_id,admin_user_name\n123,1,Admin User\n",
            ),
        });
      }

      return Promise.resolve({
        text: () =>
          Promise.resolve(
            [
              "id,user_id,status,dev_key_name,creation,expiration,last_used",
              "888,123,active,User-Generated,2020-01-01T00:00:00+00:00,2022-02-01T00:00:00+00:00,2024-01-01T00:00:00+00:00",
              "",
            ].join("\n"),
          ),
      });
    });

    job.parseCsv
      .mockResolvedValueOnce({
        0: { canvas_user_id: "123", canvas_account_id: "1", admin_user_name: "Admin User" },
      })
      .mockResolvedValueOnce({
        0: {
          id: "888",
          user_id: "123",
          status: "active",
          dev_key_name: "User-Generated",
          creation: "2020-01-01T00:00:00+00:00",
          expiration: "2022-02-01T00:00:00+00:00",
          last_used: "2024-01-01T00:00:00+00:00",
        },
      });

    await job.run();

    expect(job.toCsv).toHaveBeenCalledWith([
      expect.objectContaining({
        "Token ID": "888",
        "Reason Included": "Expires more than a year after creation",
      }),
    ]);
  });

  it("excludes tokens that do not meet the lifetime rule", async () => {
    const job = createJob();
    const reportApi = {
      runReport: vi.fn(),
      fetchReport: vi.fn(),
    };

    ReportApi.mockImplementation(function () {
      return reportApi;
    });

    reportApi.runReport
      .mockResolvedValueOnce("admins-report")
      .mockResolvedValueOnce("tokens-report");

    reportApi.fetchReport.mockImplementation((reportId) => {
      if (reportId === "admins-report") {
        return Promise.resolve({
          text: () =>
            Promise.resolve(
              "canvas_user_id,canvas_account_id,admin_user_name\n123,1,Admin User\n",
            ),
        });
      }

      return Promise.resolve({
        text: () =>
          Promise.resolve(
            [
              "id,user_id,status,dev_key_name,creation,expiration,last_used",
              "777,123,active,User-Generated,2024-01-01T00:00:00+00:00,2024-06-01T00:00:00+00:00,2024-01-01T00:00:00+00:00",
              "",
            ].join("\n"),
          ),
      });
    });

    job.parseCsv
      .mockResolvedValueOnce({
        0: { canvas_user_id: "123", canvas_account_id: "1", admin_user_name: "Admin User" },
      })
      .mockResolvedValueOnce({
        0: {
          id: "777",
          user_id: "123",
          status: "active",
          dev_key_name: "User-Generated",
          creation: "2024-01-01T00:00:00+00:00",
          expiration: "2024-06-01T00:00:00+00:00",
          last_used: "2024-01-01T00:00:00+00:00",
        },
      });

    await job.run();

    expect(job.toCsv).toHaveBeenCalledWith([]);
  });
});