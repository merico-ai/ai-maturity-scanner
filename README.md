# ai-maturity-scanner

Scan a code repository and generate its **AI coding maturity** report — a
level from L0–L4 plus a 0–100 AMI score. Standalone Node.js CLI. No server, no
database, no auth.

```bash
npx @merico-ai/maturity-scanner ./my-repo
```

It walks the repo's tracked files (via `git ls-files`), classifies each one
into five maturity dimensions (`file_type`, `agent_type`, `file_extension`,
`project_scope`, `skill_level`), aggregates them into 15 raw metrics,
normalizes those into 3 weighted dimensions, and renders the result.

The classification rules, scoring caps, and level thresholds are maintained
in this package and covered by focused unit and end-to-end tests.

## Install

```bash
npm install -g @merico-ai/maturity-scanner
# or one-off:
npx @merico-ai/maturity-scanner ./my-repo
```

Installs the `ai-maturity-scanner` command. Requires Node 22+. Requires
`git` on `PATH`.

## Usage

```bash
# Default: scan CWD, write ./ai-maturity-report.png, print the generated path
ai-maturity-scanner

# Explicit path
ai-maturity-scanner ./my-repo

# Terminal report to stdout
ai-maturity-scanner --format terminal

# Markdown report to stdout
ai-maturity-scanner --format md

# JSON report for CI gates
ai-maturity-scanner --format json --out report.json

# PNG report at a custom path
ai-maturity-scanner --out report.png

# Read and validate the hidden PNG fingerprint metadata
ai-maturity-scanner verify-image report.png
```

### Flags

| Flag | Values | Default | Purpose |
| --- | --- | --- | --- |
| `[path]` | directory path | `.` | Repository to scan |
| `-f, --format` | `png` \| `terminal` \| `md` \| `json` | `png` | Output format |
| `-o, --out` | file path | `./ai-maturity-report.png` for `png`, stdout for text | Write report output |
| `--redacted` | boolean | `false` | Hide the repository path in PNG output |

### Subcommands

| Command | Purpose |
| --- | --- |
| `verify-image <file>` | Recompute the image pixel hash and validate hidden PNG metadata |

### Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | Bad CLI args or runtime error |
| `2` | Target is not a git repository |
| `3` | `git` binary not found on PATH |

## Levels

The cascade checks from L4 down to L0; the first satisfied tier wins. L0 is
reserved for repos with no AI instruction file at all.

| Level | Criteria |
| --- | --- |
| **L0** | `ai_instruction_files < 1` (no `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` / `.cursorrules` / etc.) |
| **L1** | Default once L0 fails. |
| **L2** | `ability_applied ≥ 8` AND `advanced_skill ≥ 1` |
| **L3** | `ability_applied ≥ 15` AND `advanced_skill ≥ 2` AND `skill_engineering_rate ≥ 0.15` AND `specs_files ≥ 10` |
| **L4** | `ability_applied ≥ 25` AND `skill_engineering_rate ≥ 0.40` AND `specs_files ≥ 20` |

Where:

- **ability_applied** = `skill + skill_resource + agent + command + mcp` file counts
- **advanced_skill** = skills whose directory bundles scripts/ or script files
- **skill_engineering_rate** = `advanced_skill / skill`
- **specs_files** = Markdown files that aren't themselves ability fixtures

## AMI (0–100)

Weighted average of three normalized dimensions:

| Dimension | Weight | What it measures |
| --- | --- | --- |
| **Configuration depth** | 0.6 | Skill / Agent / Command / MCP ability fixtures |
| **Context richness** | 0.3 | AI instruction files + spec docs |
| **Integration breadth** | 0.1 | Subproject-scoped instruction coverage |

## Example output (terminal)

```
  AI Maturity Report
  /Users/me/my-repo @ abc12345

  Level: L3    AMI: 67.5/100

  Configuration depth  ██████████████████░░░░░░  75.0
  Context richness     ███████████████░░░░░░░░░  60.0
  Integration breadth  ████████░░░░░░░░░░░░░░░░  40.0

  Skill class
  skill_count                         12  ████████░░░░░░░░░░░░░░░░  40.0
  ...
```

## What gets detected

A non-exhaustive list of path patterns the classifier looks for:

- **Instruction**: `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `copilot-instructions.md`,
  `.cursorrules`, `.windsurfrules`, `.clinerules`, `rules/*.mdc`, `.rules`
- **Skill / skill_resource**: `skills/<name>/SKILL.md` and anything else under `skills/`
- **Command**: `commands/*.md`, `.codex/prompts/*.md`
- **Agent**: `agents/*.md`, `.agent/*.md`
- **Spec**: `specs/*.md`
- **Hook**: `.codex/hooks.json`
- **Config**: `.claude/settings.json`, `opencode.json`, `.codex/config.toml`,
  `.gemini/settings.json`, `.continue/config.json`
- **MCP**: `.mcp.json`, `mcp.json`

Plus the matching `agent_type` dimension (claude, codex, cursor, gemini, etc.)
for files under each tool's directory.

## Development

```bash
npm install
npm test            # vitest
npm run build       # tsup → dist/cli.js
npm run lint        # biome
npm run demo:image  # writes preview PNG reports under demo-output/
```

The repo is a single ESM TypeScript package. Source layout:

- `src/rules/` — path classification (mirrored from `rules.py`)
- `src/metrics/` — aggregation + scoring (mirrored from `calculator.py`)
- `src/git/`, `src/scan/` — repo walking and line counting
- `src/report/` — `png` / `terminal` / `md` / `json` renderers
- `tests/` — golden fixture, unit, and end-to-end tests

### Image rendering

The PNG report uses `sharp` to rasterize a deterministic 1080x1920 SVG template
for mobile sharing.
The QR slot is reserved for the future web quick start link and shows a
placeholder until that URL is configured in the CLI. The PNG file includes a
hidden `AI-Maturity-Image-Hash` metadata field derived from decoded image
pixels, plus a report payload fingerprint. `verify-image` recomputes the pixel
hash and compares it with the hidden value; issuer authenticity will still
require a future signed web record.

```bash
nvm exec 22 npm run build
nvm exec 22 node dist/cli.js --out report.png
```

Each translated file cites the upstream Python source by commit SHA in a
header comment.

## License

MIT
