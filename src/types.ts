/** Shared types for the maturity scanner. */

export interface CollectedFile {
  path: string;
  size?: number | null;
  lineCount?: number | null;
  mcpServerNames?: string[] | null;
}

export interface Tag {
  kind: string;
  value: string;
}

export interface FileWithTags {
  path: string;
  tags: Tag[];
  size: number;
  lines: number;
  mcpServerNames?: string[];
}

export type TagKind =
  | "file_type"
  | "agent_type"
  | "file_extension"
  | "project_scope"
  | "skill_level";

export const TAG_KIND = {
  FILE_TYPE: "file_type",
  AGENT_TYPE: "agent_type",
  FILE_EXTENSION: "file_extension",
  PROJECT_SCOPE: "project_scope",
  SKILL_LEVEL: "skill_level",
} as const satisfies Record<string, TagKind>;
