export const locales = ["zh", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";

export const vibeinsightUrl = "https://merico.cn/vibeinsight";

export const githubUrl = "https://github.com/merico-ai/ai-maturity-scanner";

export function normalizePathname(pathname: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const pathnameWithoutBase =
    basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
      ? pathname.slice(basePath.length) || "/"
      : pathname;

  return pathnameWithoutBase === "/"
    ? pathnameWithoutBase
    : pathnameWithoutBase.replace(/\/+$/, "") || "/";
}

export function localeFromPathname(pathname: string): Locale {
  const normalizedPathname = normalizePathname(pathname);

  return normalizedPathname === "/en" || normalizedPathname.startsWith("/en/")
    ? "en"
    : defaultLocale;
}

export function localizePath(path: string, locale: Locale) {
  if (locale === defaultLocale) {
    return path;
  }

  return path === "/" ? "/en" : `/en${path}`;
}

export function alternateLocalePath(pathname: string, locale: Locale) {
  const normalizedPathname = normalizePathname(pathname);
  const currentLocale = localeFromPathname(normalizedPathname);
  const normalizedPath =
    currentLocale === "en"
      ? normalizedPathname.replace(/^\/en(?=\/|$)/, "") || "/"
      : normalizedPathname;

  return localizePath(normalizedPath, locale);
}

export const messages = {
  zh: {
    nav: {
      home: "首页介绍",
      quickStart: "快速开始",
      docs: "使用文档",
      metrics: "指标说明",
      about: "关于我们",
      languageLabel: "语言",
      menuLabel: "菜单",
      zh: "中文",
      en: "EN",
    },
    header: {
      subtitle: "AI 编程成熟度本地 CLI",
    },
    home: {
      eyebrow: "AI coding maturity",
      title: "让每个仓库的 AI 编程成熟度可见、可比较、可改进。",
      description:
        "AI Maturity Scanner 是一个独立 Node.js CLI，扫描 git-tracked files，给出 L0-L4 等级和 0-100 AMI 分数，帮助团队理解 AI 工程资产是否真正沉淀到了仓库里。",
      primaryCta: "开始扫描",
      secondaryCta: "查看评分模型",
      features: [
        "识别 CLAUDE.md、AGENTS.md、GEMINI.md、Cursor rules 等 AI instruction files",
        "统计 skills、agents、commands、MCP、specs 等能力资产",
        "输出 terminal、Markdown、JSON 三种报告格式",
        "本地执行，不上传代码，不依赖服务端",
      ],
      metricEyebrow: "Metric overview",
      metricTitle: "AMI 的三个核心维度",
      metricLink: "完整指标说明 ->",
    },
    cta: {
      eyebrow: "Run locally",
      title: "一分钟看清仓库的 AI 编程成熟度",
      description:
        "不需要服务器、账号或数据库。CLI 只读取 git-tracked files，输出 L0-L4 与 AMI 评分。",
      quickStart: "查看 Quick start",
      github: "在 GitHub 上查看",
    },
    metrics: {
      eyebrow: "Metrics",
      title: "AMI 不是感觉分，是仓库资产分。",
      description:
        "扫描器先统计 15 个 raw metrics，再归一化为三个加权维度，最终形成 0-100 的 AMI 分数和 L0-L4 成熟度等级。",
      overview: [
        {
          title: "配置深度",
          weight: "60%",
          description: "skill、skill_resource、agent、command、MCP 等能力配置的数量和结构。",
        },
        {
          title: "上下文丰富度",
          weight: "30%",
          description: "AI instruction files 和 specs 文件为模型提供的稳定上下文。",
        },
        {
          title: "集成广度",
          weight: "10%",
          description: "子项目范围 instruction 的覆盖情况，反映复杂仓库的整合能力。",
        },
      ],
      homeOverview: [
        {
          title: "配置深度",
          weight: "60%",
          description: "衡量 skills、agents、commands、MCP 等配置化 AI 能力是否成体系。",
        },
        {
          title: "上下文丰富度",
          weight: "30%",
          description: "衡量 instruction files 与 specs 是否为 AI 协作提供足够上下文。",
        },
        {
          title: "集成广度",
          weight: "10%",
          description: "衡量 AI instruction 是否覆盖子项目，反映多模块仓库的集成广度。",
        },
      ],
      levelTitle: "L0-L4 level",
      imageTitle: "图片报告里的分数怎么看",
      imageDescription:
        "图片报告展示的是 normalized score：每个指标先按规则换算为 0-100 分，进度条表示当前分数。AI 文件和能力应用是原始数量，不参与这一组进度条。",
      imageScoreLabel: "图片分数",
      formulaTitle: "完整计算流程",
      formulaSteps: [
        "先从 git-tracked files 聚合 raw metrics。",
        "再把 raw metrics 归一化成 0-100 分数。",
        "Configuration depth、Context richness、Integration breadth 分别汇总子指标。",
        "AMI = Configuration depth × 60% + Context richness × 30% + Integration breadth × 10%。",
      ],
      metricFormulaTitle: "15 个 normalized metrics",
      levels: [
        ["L0", "没有 AI instruction file。"],
        ["L1", "默认起点，仓库已经出现基础 AI 协作信号。"],
        ["L2", "具备一定能力资产，并开始出现 advanced skill。"],
        ["L3", "能力资产、advanced skill、specs 和工程化比例都达到较高水平。"],
        ["L4", "成熟仓库，AI 能力资产和 specs 已形成规模化沉淀。"],
      ],
    },
    quickStart: {
      eyebrow: "Quick start",
      title: "从一个命令开始扫描。",
      description:
        "目标仓库需要是 git repository，并且本机 PATH 中可以访问 git。工具默认扫描当前目录，也可以传入明确路径。",
      requirementsTitle: "环境要求",
      requirements: [
        ["Node.js 22+", "用于运行 npx、全局安装和本地 CLI。"],
        ["git", "需要在 PATH 中可访问；扫描器通过 git ls-files 读取 tracked files。"],
      ],
      usageModes: [
        {
          label: "方式一",
          title: "一次性扫描",
          description: "不安装到全局环境，直接扫描指定仓库。",
          steps: ["npx @merico-ai/maturity-scanner ./my-repo"],
        },
        {
          label: "方式二",
          title: "安装后扫描",
          description: "先全局安装 CLI，再在目标仓库中使用默认参数生成图片报告。",
          steps: ["npm install -g @merico-ai/maturity-scanner", "ai-maturity-scanner ./my-repo"],
        },
      ],
      resultTitle: "读懂结果",
      resultDescription:
        "L0 表示仓库缺少 AI instruction file；L1-L4 逐级代表更成熟的 AI 工程沉淀。AMI 分数用于横向比较和观察改进趋势。",
      docsCta: "查看完整用法",
      metricsCta: "查看指标解释",
    },
    about: {
      eyebrow: "About",
      title: "帮团队把 AI 编程从个人技巧变成工程能力。",
      description:
        "AI Maturity Scanner 关注的是仓库中可复用、可审查、可持续演进的 AI 协作资产：instructions、skills、agents、commands、MCP 配置和 specs。",
      cards: [
        ["本地优先", "扫描在本机完成，不上传代码，不需要服务端、数据库或登录。"],
        ["工程视角", "评分不是评价个人使用 AI 的熟练度，而是评价仓库里沉淀的协作能力。"],
        ["持续改进", "团队可以用 JSON 或 Markdown 报告追踪多仓库、多阶段的 AMI 变化。"],
      ],
      vibeTitle: "了解更多 vibe coding 指标",
      vibeDescription:
        "想进一步查看 vibe coding 相关指标、团队洞察和改进趋势，可以前往 vibeinsight 了解完整能力。",
      vibeCta: "前往 vibeinsight",
    },
    docs: {
      eyebrow: "Docs",
      title: "安装、运行、导出报告。",
      description:
        "AI Maturity Scanner 是独立 Node.js CLI。需要 Node 22+，并且本机可以访问 git。",
      install: "Install",
      usage: "Usage",
      tocLabel: "本页目录",
      mcpSupport: {
        title: "MCP 支持边界",
        description:
          "MCP 配置在不同代码助手之间没有统一的仓库级格式，因此当前识别能力仍不完善。现阶段只把 Claude Code 的项目级 .mcp.json / mcp.json 和 Codex 的项目级 .codex/config.toml 作为明确支持的 MCP 配置来源。",
        note:
          "其他工具也可能支持 MCP，但配置路径、字段和优先级差异较大，公开文档完整度也不一致。为避免误报，扫描器不会把这些格式当作稳定支持项。",
        supported: ["Claude Code: .mcp.json / mcp.json", "Codex: .codex/config.toml"],
      },
      usageExamples: [
        {
          title: "默认生成图片报告",
          code: "# 扫描当前目录，并生成 ./ai-maturity-report.png\nai-maturity-scanner",
        },
        {
          title: "扫描指定仓库",
          code: "# 扫描 ./my-repo，并生成默认 PNG 图片报告\nai-maturity-scanner ./my-repo",
        },
        {
          title: "导出 Markdown 报告",
          code: "# 适合复制到文档、Issue 或 PR 评论\nai-maturity-scanner ./my-repo --format md --out report.md",
        },
        {
          title: "导出 JSON 给自动化流程",
          code: "# 适合 CI、看板或阈值检查\nai-maturity-scanner ./my-repo --format json --out report.json",
        },
        {
          title: "生成英文报告",
          code: "# 报告内容使用英文\nai-maturity-scanner ./my-repo --lang en",
        },
      ],
      config: {
        title: "Spec 文件配置",
        description:
          "扫描器默认把仓库内 specs/ 目录下的 Markdown 文件识别为 spec 文档。如果你的 spec 放在别的位置（如 docs/specs/、design/），可以用仓库根目录的配置文件或 --spec-glob 参数自定义匹配规则。优先级：--spec-glob 参数 > 配置文件 > 默认值。",
        configFile: "在仓库根目录放置 .ai-maturity-scanner.json，用 specGlobs 指定一个或多个 glob：",
        configFileCode:
          '{\n  "specGlobs": [\n    "docs/specs/**/*.md",\n    "design/**/*.md"\n  ]\n}',
        flag: "或用 --spec-glob 参数临时指定（可重复，会覆盖配置文件）：",
        flagCode:
          "# 只把 docs/specs 下的 Markdown 当作 spec\nai-maturity-scanner ./my-repo --spec-glob 'docs/specs/**/*.md'",
        default:
          "未提供任何配置时使用默认 glob **/specs/**/*.md（任意深度的 specs/ 目录，仅 Markdown：.md/.mdx/.mdc）。",
        notes: [
          "glob 使用正斜杠 / 作为路径分隔符（与 .gitignore、tsconfig 等一致），Windows 上也请用 /。",
          "配置文件解析失败或字段类型不符时，扫描器会打印警告并回退到默认值，不会中断扫描。",
          "spec 配置只影响报告里的文件分组归类，不影响 AMI 分数与等级。",
        ],
      },
      table: {
        title: "命令行参数",
        flag: "Flag",
        values: "Values",
        default: "Default",
      },
    },
  },
  en: {
    nav: {
      home: "Overview",
      quickStart: "Quick start",
      docs: "Docs",
      metrics: "Metrics",
      about: "About",
      languageLabel: "Language",
      menuLabel: "Menu",
      zh: "中文",
      en: "EN",
    },
    header: {
      subtitle: "Local CLI for AI coding maturity",
    },
    home: {
      eyebrow: "AI coding maturity",
      title: "Make AI coding maturity visible, comparable, and actionable.",
      description:
        "AI Maturity Scanner is a standalone Node.js CLI. It scans git-tracked files and reports an L0-L4 level plus a 0-100 AMI score, helping teams see whether AI engineering practices are actually captured in the repository.",
      primaryCta: "Start scanning",
      secondaryCta: "View scoring model",
      features: [
        "Detects CLAUDE.md, AGENTS.md, GEMINI.md, Cursor rules, and other AI instruction files",
        "Counts skills, agents, commands, MCP files, specs, and related capability assets",
        "Renders terminal, Markdown, and JSON reports",
        "Runs locally without uploading code or requiring a server",
      ],
      metricEyebrow: "Metric overview",
      metricTitle: "The three AMI dimensions",
      metricLink: "Full metric guide ->",
    },
    cta: {
      eyebrow: "Run locally",
      title: "See a repository's AI coding maturity in one minute",
      description:
        "No server, account, or database required. The CLI reads git-tracked files and reports L0-L4 plus an AMI score.",
      quickStart: "Open Quick start",
      github: "View on GitHub",
    },
    metrics: {
      eyebrow: "Metrics",
      title: "AMI is based on repository assets, not guesswork.",
      description:
        "The scanner aggregates 15 raw metrics, normalizes them into three weighted dimensions, then produces a 0-100 AMI score and an L0-L4 maturity level.",
      overview: [
        {
          title: "Configuration depth",
          weight: "60%",
          description: "The count and structure of skills, skill resources, agents, commands, and MCP files.",
        },
        {
          title: "Context richness",
          weight: "30%",
          description: "Stable model context from AI instruction files and specs.",
        },
        {
          title: "Integration breadth",
          weight: "10%",
          description: "Subproject-scoped instruction coverage across larger repositories.",
        },
      ],
      homeOverview: [
        {
          title: "Configuration depth",
          weight: "60%",
          description: "Whether skills, agents, commands, MCP files, and related fixtures form a real system.",
        },
        {
          title: "Context richness",
          weight: "30%",
          description: "Whether instructions and specs give AI collaborators enough durable context.",
        },
        {
          title: "Integration breadth",
          weight: "10%",
          description: "Whether AI instructions cover subprojects in multi-module repositories.",
        },
      ],
      levelTitle: "L0-L4 level",
      imageTitle: "How to read the image report scores",
      imageDescription:
        "The image report shows normalized scores. Each metric is converted to a 0-100 score, and the progress bar visualizes that score. AI files and ability applied are raw counts, not progress-bar scores.",
      imageScoreLabel: "Image score",
      formulaTitle: "Full scoring flow",
      formulaSteps: [
        "Aggregate raw metrics from git-tracked files.",
        "Normalize raw metrics into 0-100 scores.",
        "Roll metrics into Configuration depth, Context richness, and Integration breadth.",
        "AMI = Configuration depth × 60% + Context richness × 30% + Integration breadth × 10%.",
      ],
      metricFormulaTitle: "15 normalized metrics",
      levels: [
        ["L0", "No AI instruction file is present."],
        ["L1", "The baseline once the repository has basic AI collaboration signals."],
        ["L2", "A repository with meaningful capability assets and at least one advanced skill."],
        ["L3", "A stronger repository with capability assets, advanced skills, specs, and engineering depth."],
        ["L4", "A mature repository where AI capability assets and specs are present at scale."],
      ],
    },
    quickStart: {
      eyebrow: "Quick start",
      title: "Scan with one command.",
      description:
        "The target must be a git repository, and git must be available on PATH. By default, the CLI scans the current directory; you can also pass an explicit path.",
      requirementsTitle: "Requirements",
      requirements: [
        ["Node.js 22+", "Required for npx, global installs, and the local CLI runtime."],
        ["git", "Must be available on PATH; the scanner reads tracked files through git ls-files."],
      ],
      usageModes: [
        {
          label: "Option 1",
          title: "One-off scan",
          description: "Run the scanner against a target repository without installing it globally.",
          steps: ["npx @merico-ai/maturity-scanner ./my-repo"],
        },
        {
          label: "Option 2",
          title: "Install, then scan",
          description: "Install the CLI globally, then run the default command in the target repository to generate the image report.",
          steps: ["npm install -g @merico-ai/maturity-scanner", "ai-maturity-scanner ./my-repo"],
        },
      ],
      resultTitle: "Understand the result",
      resultDescription:
        "L0 means the repository has no AI instruction file. L1-L4 represent progressively more mature AI engineering practices. AMI is useful for comparison and trend tracking.",
      docsCta: "Read full docs",
      metricsCta: "View metrics",
    },
    about: {
      eyebrow: "About",
      title: "Turn AI coding from individual habit into engineering capability.",
      description:
        "AI Maturity Scanner focuses on reusable, reviewable, and maintainable AI collaboration assets in a repository: instructions, skills, agents, commands, MCP configuration, and specs.",
      cards: [
        ["Local first", "Scanning happens on your machine. No code upload, server, database, or login required."],
        ["Engineering lens", "The score measures repository-level collaboration assets, not personal AI proficiency."],
        ["Continuous improvement", "Teams can use JSON or Markdown reports to track AMI across repositories and phases."],
      ],
      vibeTitle: "Explore more vibe coding metrics",
      vibeDescription:
        "For more vibe coding metrics, team insights, and improvement trends, continue to vibeinsight.",
      vibeCta: "Go to vibeinsight",
    },
    docs: {
      eyebrow: "Docs",
      title: "Install, run, and export reports.",
      description:
        "AI Maturity Scanner is a standalone Node.js CLI. It requires Node 22+ and git on PATH.",
      install: "Install",
      usage: "Usage",
      tocLabel: "On this page",
      mcpSupport: {
        title: "MCP support boundary",
        description:
          "MCP configuration does not have one repository-level format across coding assistants, so current detection is intentionally incomplete. For now, only Claude Code project .mcp.json / mcp.json files and Codex project .codex/config.toml are treated as explicitly supported MCP configuration sources.",
        note:
          "Other tools may also support MCP, but their paths, fields, precedence rules, and public documentation vary. To avoid false positives, the scanner does not treat those formats as stable supported inputs.",
        supported: ["Claude Code: .mcp.json / mcp.json", "Codex: .codex/config.toml"],
      },
      usageExamples: [
        {
          title: "Generate the default image report",
          code: "# Scan the current directory and write ./ai-maturity-report.png\nai-maturity-scanner",
        },
        {
          title: "Scan a target repository",
          code: "# Scan ./my-repo and write the default PNG image report\nai-maturity-scanner ./my-repo",
        },
        {
          title: "Export a Markdown report",
          code: "# Useful for docs, issues, or PR comments\nai-maturity-scanner ./my-repo --format md --out report.md",
        },
        {
          title: "Export JSON for automation",
          code: "# Useful for CI, dashboards, or threshold checks\nai-maturity-scanner ./my-repo --format json --out report.json",
        },
        {
          title: "Generate an English report",
          code: "# Render report text in English\nai-maturity-scanner ./my-repo --lang en",
        },
      ],
      config: {
        title: "Spec file configuration",
        description:
          "By default the scanner treats Markdown files under the repo's specs/ directory as spec documents. If your specs live elsewhere (e.g. docs/specs/, design/), customize the match with a config file at the repo root or the --spec-glob flag. Precedence: --spec-glob flag > config file > default.",
        configFile: "Place .ai-maturity-scanner.json at the repository root with a specGlobs array:",
        configFileCode:
          '{\n  "specGlobs": [\n    "docs/specs/**/*.md",\n    "design/**/*.md"\n  ]\n}',
        flag: "Or pass --spec-glob on the command line (repeatable; overrides the config file):",
        flagCode:
          "# Treat only Markdown under docs/specs as specs\nai-maturity-scanner ./my-repo --spec-glob 'docs/specs/**/*.md'",
        default:
          "With no configuration the default glob **/specs/**/*.md is used (specs/ at any depth, Markdown only: .md/.mdx/.mdc).",
        notes: [
          "Globs use forward slashes as path separators (same as .gitignore, tsconfig, etc.) — use / on Windows too.",
          "If the config file is malformed or has the wrong shape, the scanner logs a warning and falls back to the default; it never aborts the scan.",
          "Spec configuration only affects file grouping in the report; it does not change the AMI score or level.",
        ],
      },
      table: {
        title: "CLI flags",
        flag: "Flag",
        values: "Values",
        default: "Default",
      },
    },
  },
} as const;
