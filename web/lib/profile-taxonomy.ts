import type { Locale } from "./i18n";

type ProfileTaxonomyItem = {
  id: string;
  title: string;
  rule: string;
  description: string;
  kind?: "supporting" | "structural";
};

type ProfileTaxonomy = {
  eyebrow: string;
  title: string;
  intro: string;
  primaryTitle: string;
  primaryDescription: string;
  traitTitle: string;
  traitDescription: string;
  selectionTitle: string;
  selectionSteps: readonly string[];
  evidenceTitle: string;
  evidenceDescription: string;
  primary: readonly ProfileTaxonomyItem[];
  traits: readonly ProfileTaxonomyItem[];
};

/**
 * User-facing summary of DR-001. Keep IDs here canonical and language-neutral;
 * titles and explanations are localized independently.
 */
export const profileTaxonomy: Record<Locale, ProfileTaxonomy> = {
  zh: {
    eyebrow: "Repository profile",
    title: "协作画像说明",
    intro:
      "协作画像描述仓库中最突出的 AI 协作资产形态。它不是新的成熟度等级，也不评价开发者能力、实际使用频率或代码质量。",
    primaryTitle: "Primary（主画像）",
    primaryDescription: "每份报告恰好有一个主画像；它是当前最强、最能代表仓库的协作形态。",
    traitTitle: "Traits（特征）",
    traitDescription:
      "特征补充主画像未涵盖的显著信号：最多一个 supporting trait，并保留所有 structural traits（最多两个）。",
    selectionTitle: "如何选择并解释画像",
    selectionSteps: [
      "仅复用报告已有的 raw metrics、normalized metrics 和三个维度；不会采集或推断新的行为数据。",
      "没有 AI instruction file 时，主画像固定为 unstarted；其余仓库先判断各 specialized primary 是否满足资格条件。",
      "合格候选按超出资格门槛后的 strength 比较，强度四舍五入到两位小数；相同强度才按固定顺序决胜。",
      "报告会保留匹配 rule ID、metric facts、候选的 headroom components、rounded strength 与 selected 状态，便于比较主画像和备选项。",
    ],
    evidenceTitle: "和 AMI、L0–L4 的关系",
    evidenceDescription:
      "AMI 与 L0–L4 继续回答“沉淀了多少 AI 协作基础设施”和“成熟度处于哪个门槛”。协作画像回答“最显著的协作形态是什么”。它是附加信息，不会改变 raw metrics、normalized metrics、三个维度、AMI 分数或 L0–L4 结果。",
    primary: [
      {
        id: "unstarted",
        title: "静待启程",
        rule: "ai_instruction_files = 0",
        description: "中性起点：尚未发现 AI 指令文件。",
      },
      {
        id: "early-collaboration",
        title: "协作萌芽",
        rule: "存在 AI 指令文件，但没有 specialized primary 合格",
        description: "已经出现基础协作信号，尚未形成更突出的资产形态。",
      },
      {
        id: "ai-operating-system",
        title: "AI 协作中枢",
        rule: "configuration_depth、context_richness、integration_breadth 均 ≥ 60，且四类能力中至少三类非零",
        description: "广度和均衡性都很强的协作系统。",
      },
      {
        id: "skill-workshop",
        title: "技能工坊",
        rule: "skill_score ≥ 50，且 skill_engineering_rate ≥ 0.15",
        description: "可复用且工程化的 skills 是最突出的可见资产。",
      },
      {
        id: "agent-troupe",
        title: "多代理剧团",
        rule: "agent_count ≥ 3，且 agent_type_distinct ≥ 3",
        description: "明确分工的多个 agent 角色构成了显著协作模式。",
      },
      {
        id: "command-center",
        title: "命令指挥台",
        rule: "command_score ≥ 40，且 command_count ≥ 3",
        description: "可复用命令是主要的交互入口。",
      },
      {
        id: "knowledge-library",
        title: "上下文图书馆",
        rule:
          "specs_file_count ≥ 20，context_richness ≥ 65，instruction_max_line_count ≥ 50，且 spec_library_score ≥ 50",
        description: "规格与实质性 AI 上下文共同构成最突出的协作资产。",
      },
    ],
    traits: [
      {
        id: "engineered-skills",
        title: "能力工程化",
        rule: "advanced_skill_count ≥ 2，且 skill_engineering_rate ≥ 0.15",
        description: "若主画像为 skill-workshop 则不重复显示。",
        kind: "supporting",
      },
      {
        id: "multi-agent",
        title: "多代理协作",
        rule: "agent_count ≥ 3，且 agent_type_distinct ≥ 3",
        description: "若主画像为 agent-troupe 则不重复显示。",
        kind: "supporting",
      },
      {
        id: "tool-connected",
        title: "工具深连",
        rule: "mcp_count ≥ 2",
        description: "Structural trait：MCP 信号始终作为特征，不会成为主画像。",
        kind: "structural",
      },
      {
        id: "structured-context",
        title: "上下文成册",
        rule: "instruction_max_line_count 为 50–400，且 specs_file_count ≥ 10",
        description: "若主画像为 knowledge-library 则不重复显示。",
        kind: "supporting",
      },
      {
        id: "cross-project",
        title: "跨项目覆盖",
        rule: "subproject_coverage ≥ 3",
        description: "Structural trait：跨子项目覆盖始终作为特征，不会成为主画像。",
        kind: "structural",
      },
    ],
  },
  en: {
    eyebrow: "Repository profile",
    title: "Repository profile guide",
    intro:
      "A repository profile describes the most visible shape of AI collaboration assets. It is not another maturity grade and makes no claim about developer proficiency, actual adoption, or code quality.",
    primaryTitle: "Primary profile",
    primaryDescription:
      "Every report has exactly one primary profile: the strongest collaboration pattern visible in the repository.",
    traitTitle: "Traits",
    traitDescription:
      "Traits add notable signals that the primary does not already express: at most one supporting trait, plus every structural trait (at most two).",
    selectionTitle: "How profiles are selected and explained",
    selectionSteps: [
      "The evaluator reuses only the report's existing raw metrics, normalized metrics, and three dimensions; it collects or infers no new behavioral data.",
      "With no AI instruction file, the primary is unstarted. Otherwise, each specialized primary is checked for eligibility.",
      "Eligible candidates are compared by strength beyond their eligibility floors, rounded to two decimals; a fixed order breaks only equal rounded strengths.",
      "The report retains the matched rule ID and metric facts, each candidate's headroom components and rounded strength, and its selected status so the winner can be compared with alternatives.",
    ],
    evidenceTitle: "Relationship to AMI and L0–L4",
    evidenceDescription:
      "AMI and L0–L4 continue to answer how much AI collaboration infrastructure is present and which maturity threshold it reaches. The profile answers which collaboration shape is most visible. It is additive: it does not change raw metrics, normalized metrics, dimensions, the AMI score, or the L0–L4 result.",
    primary: [
      {
        id: "unstarted",
        title: "Awaiting Start",
        rule: "ai_instruction_files = 0",
        description: "A neutral state: no AI instruction file was found.",
      },
      {
        id: "early-collaboration",
        title: "Collaboration Seedling",
        rule: "An AI instruction file exists, but no specialized primary is eligible",
        description: "Basic collaboration signals exist, without a more distinctive asset pattern yet.",
      },
      {
        id: "ai-operating-system",
        title: "AI Collaboration Hub",
        rule: "configuration_depth, context_richness, and integration_breadth are each ≥ 60, with at least three non-zero capability classes",
        description: "A broad and balanced collaboration system.",
      },
      {
        id: "skill-workshop",
        title: "Skill Workshop",
        rule: "skill_score ≥ 50 and skill_engineering_rate ≥ 0.15",
        description: "Reusable, engineered skills are the dominant visible asset.",
      },
      {
        id: "agent-troupe",
        title: "Agent Troupe",
        rule: "agent_count ≥ 3 and agent_type_distinct ≥ 3",
        description: "Distinct agent roles form a defining collaboration pattern.",
      },
      {
        id: "command-center",
        title: "Command Center",
        rule: "command_score ≥ 40 and command_count ≥ 3",
        description: "Reusable commands are the defining interaction surface.",
      },
      {
        id: "knowledge-library",
        title: "Knowledge Library",
        rule:
          "specs_file_count ≥ 20, context_richness ≥ 65, instruction_max_line_count ≥ 50, and spec_library_score ≥ 50",
        description: "Specifications and substantive written AI context are the dominant visible asset.",
      },
    ],
    traits: [
      {
        id: "engineered-skills",
        title: "Engineered Skills",
        rule: "advanced_skill_count ≥ 2 and skill_engineering_rate ≥ 0.15",
        description: "Suppressed when skill-workshop is already the primary.",
        kind: "supporting",
      },
      {
        id: "multi-agent",
        title: "Multi-Agent Collaboration",
        rule: "agent_count ≥ 3 and agent_type_distinct ≥ 3",
        description: "Suppressed when agent-troupe is already the primary.",
        kind: "supporting",
      },
      {
        id: "tool-connected",
        title: "Deep Tool Connectivity",
        rule: "mcp_count ≥ 2",
        description: "Structural trait: MCP remains a trait and never becomes a primary.",
        kind: "structural",
      },
      {
        id: "structured-context",
        title: "Structured Context",
        rule: "instruction_max_line_count is 50–400 and specs_file_count ≥ 10",
        description: "Suppressed when knowledge-library is already the primary.",
        kind: "supporting",
      },
      {
        id: "cross-project",
        title: "Cross-Project Coverage",
        rule: "subproject_coverage ≥ 3",
        description: "Structural trait: cross-project coverage remains a trait and never becomes a primary.",
        kind: "structural",
      },
    ],
  },
};
