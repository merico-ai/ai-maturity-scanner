import { describe, expect, it } from "vitest";
import { extractClaudeCodeMcpServerNames, extractCodexMcpServerNames } from "../src/scan/mcp.ts";

describe("extractClaudeCodeMcpServerNames", () => {
  it("returns top-level mcpServers keys from supported JSON", () => {
    const source = JSON.stringify({
      mcpServers: {
        github: { command: "npx" },
        " docs ": { command: "uvx" },
        "   ": { command: "ignore" },
      },
    });

    expect(extractClaudeCodeMcpServerNames(source)).toEqual(["github", "docs"]);
  });

  it("returns an empty list on parse failure or unsupported shapes", () => {
    expect(extractClaudeCodeMcpServerNames("{")).toEqual([]);
    expect(extractClaudeCodeMcpServerNames(JSON.stringify({ mcpServers: [] }))).toEqual([]);
    expect(extractClaudeCodeMcpServerNames(JSON.stringify({ servers: { github: {} } }))).toEqual(
      [],
    );
  });
});

describe("extractCodexMcpServerNames", () => {
  it("extracts unique names from Codex table headers and nested tables", () => {
    const source = `
[mcp_servers.github]
command = "npx"

[mcp_servers.docs.env]
TOKEN = "x"

[mcp_servers." spaced "]
command = "uvx"
`;

    expect(extractCodexMcpServerNames(source)).toEqual(["github", "docs", "spaced"]);
  });

  it("extracts names from a top-level mcp_servers table body", () => {
    const source = `
[mcp_servers]
github = { command = "npx" }
" docs " = { command = "uvx" }
`;

    expect(extractCodexMcpServerNames(source)).toEqual(["github", "docs"]);
  });

  it("extracts names from root dotted assignments", () => {
    const source = `
mcp_servers.github.command = "npx"
`;

    expect(extractCodexMcpServerNames(source)).toEqual(["github"]);
  });

  it("extracts names from root inline tables", () => {
    const source = `
mcp_servers = { docs = { command = "uvx" }, " spaced " = { command = "node" } }
`;

    expect(extractCodexMcpServerNames(source)).toEqual(["docs", "spaced"]);
  });

  it("returns an empty list on malformed TOML", () => {
    expect(extractCodexMcpServerNames("[mcp_servers")).toEqual([]);
    expect(extractCodexMcpServerNames("not even toml")).toEqual([]);
  });
});
