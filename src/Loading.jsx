import React from "react";
import { Spinner } from "@instructure/ui";

/**
 * Just a standard loading element that we display before the tool is functional.
 */
export function Loading() {
  return <Spinner size="large" margin="large" renderTitle="Loading data..." />;
}
