import type { MaturityReport } from "./types.ts";

export function renderJson(report: MaturityReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
