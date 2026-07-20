import type { Lang } from "../i18n/index.ts";
import type { MaturityRawMetrics } from "../metrics/types.ts";
import type { FileWithTags } from "../types.ts";
import type { LocalizedRepositoryProfile } from "./profile.ts";

export type Level = "L0" | "L1" | "L2" | "L3" | "L4";

export interface MaturityReport {
  repo: {
    root: string;
    remoteUrl?: string;
    headSha: string;
    scannedAt: string;
  };
  meta: {
    algorithmVersion: string;
    profileRuleVersion: string;
    lang: Lang;
  };
  level: Level;
  levelTitle: string;
  ami: number;
  dimensions: {
    configuration_depth: number;
    context_richness: number;
    integration_breadth: number;
  };
  normalizedMetrics: Record<string, number>;
  rawMetrics: MaturityRawMetrics;
  profile: LocalizedRepositoryProfile;
  files: FileWithTags[];
}

export const LEVEL_COLORS: Record<Level, "red" | "yellow" | "green" | "cyan" | "blue"> = {
  L0: "red",
  L1: "yellow",
  L2: "cyan",
  L3: "green",
  L4: "blue",
};
