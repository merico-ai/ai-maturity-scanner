// ── Saturation caps (design §4 v1.6) ──────────────────────────────────
export const CAP_SKILL_COUNT = 30;
export const CAP_SKILL_LINES = 15000;
export const CAP_ADVANCED_SKILL_COUNT = 10;
export const CAP_SKILL_RESOURCE_COUNT = 30;
export const CAP_ENGINEERING_RATE_PCT = 50;
export const CAP_AGENT_COUNT = 10;
export const CAP_AGENT_LINES = 2000;
export const CAP_COMMAND_COUNT = 10;
export const CAP_COMMAND_LINES = 2000;
export const CAP_MCP_COUNT = 3;
export const CAP_INSTRUCTION_FILES = 1;
export const CAP_SPECS_FILES = 50;
export const CAP_SPECS_LINES = 5000;
export const CAP_SUBPROJECT_COVERAGE = 5;

// ── Instruction-line piecewise breakpoints (unchanged from v1.5) ──────
const INSTR_FLOOR_LINES = 0;
const INSTR_FLOOR_SCORE = 10;
const INSTR_LOW_LINES = 20;
const INSTR_LOW_SCORE = 30;
const INSTR_MID_LINES = 50;
const INSTR_SWEET_HI = 400;
const INSTR_HIGH_LINES = 1000;
const INSTR_HIGH_SCORE = 30;
const INSTR_BOTTOM_SCORE = 10;

/** Linear saturation: min(raw, cap) / cap * 100. */
export function sat(raw: number, cap: number): number {
  if (raw <= 0 || cap <= 0) return 0;
  if (raw >= cap) return 100;
  return (raw / cap) * 100;
}

export function lerp(x0: number, y0: number, x1: number, y1: number, x: number): number {
  if (x1 === x0) return y0;
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/**
 * Piecewise score for max AI instruction line count.
 *
 * Zones (per design §4.3):
 *   raw < 0          → 10 (treated as floor)
 *   0 ≤ raw < 20     → lerp 10 → 30
 *   20 ≤ raw < 50    → lerp 30 → 100
 *   50 ≤ raw ≤ 400   → 100 (sweet spot)
 *   400 < raw ≤ 1000 → lerp 100 → 30
 *   raw > 1000       → 10 (info overload floor)
 */
export function scoreInstructionLines(raw: number): number {
  if (raw <= INSTR_FLOOR_LINES) return INSTR_FLOOR_SCORE;
  if (raw < INSTR_LOW_LINES) {
    return lerp(INSTR_FLOOR_LINES, INSTR_FLOOR_SCORE, INSTR_LOW_LINES, INSTR_LOW_SCORE, raw);
  }
  if (raw < INSTR_MID_LINES) {
    return lerp(INSTR_LOW_LINES, INSTR_LOW_SCORE, INSTR_MID_LINES, 100, raw);
  }
  if (raw <= INSTR_SWEET_HI) return 100;
  if (raw <= INSTR_HIGH_LINES) {
    return lerp(INSTR_SWEET_HI, 100, INSTR_HIGH_LINES, INSTR_HIGH_SCORE, raw);
  }
  return INSTR_BOTTOM_SCORE;
}

/** Rate expressed as a fraction (0–1). Cap at 50% → 100 points. */
export function scoreEngineeringRate(rate: number): number {
  if (rate <= 0) return 0;
  const pct = rate <= 1 ? rate * 100 : rate;
  return sat(pct, CAP_ENGINEERING_RATE_PCT);
}
