// ============================================================
// 사주 분석 (십신, 합충형파해, 십이운성, 신살, 용신)
// ============================================================

import {
  Element,
  STEMS,
  STEM_HANJA,
  STEM_ELEMENTS,
  STEM_YINYANG,
  BRANCHES,
  BRANCH_HANJA,
  BRANCH_ELEMENTS,
  ELEMENT_NAMES,
  GENERATES,
  OVERCOMES,
  GENERATED_BY,
  OVERCOME_BY,
  HIDDEN_STEMS,
  TWELVE_STAGES,
  STAGE_START,
  TWELVE_STAGE_MEANINGS,
  STEM_COMBINATIONS,
  BRANCH_SIX_HARMONIES,
  BRANCH_THREE_HARMONIES,
  BRANCH_DIRECTIONAL,
  BRANCH_CLASHES,
  BRANCH_PUNISHMENTS,
  BRANCH_DESTRUCTIONS,
  BRANCH_HARMS,
  COMBINATION_INTERP,
  TEN_GOD_DETAILS,
  getTrigramGroup,
  YEOKMA,
  HWAGAE,
  DOHWA,
  GEOPSAL,
  JAESAL,
  CHEONSAL,
  JISAL,
  CHEON_EUL_GWIIN,
  MUNCHANG,
  YANGIN,
  GOEGANG,
  BAEKHO,
  WONJIN,
  BANAN,
  VOID_BRANCHES,
  GWIMUN,
  SPIRIT_KILL_INTERP,
} from "./data";
import type { Pillar } from "./calendar";

// ── 타입 ───────────────────────────────────────────────────
export interface TenGodResult {
  stem: string;        // 십신 이름
  hanja: string;
  role: string;
  description: string;
}

export interface HiddenStemInfo {
  label: string;       // 여기 / 중기 / 정기
  stemIndex: number;
  stemName: string;
  element: Element;
  tenGod: string;
}

export interface CombinationResult {
  type: string;        // 합 / 충 / 형 / 파 / 해
  name: string;
  positions: string[]; // 어느 주에 해당하는지
  interpretation: string;
}

export interface SpiritKillResult {
  name: string;
  korName: string;
  position: string;    // 어느 주에 해당하는지
  description: string;
}

export interface TwelveStageResult {
  pillarName: string;
  stage: string;
  meaning: string;
}

export interface YongshinResult {
  yongshin: Element;           // 용신 (필요한 오행)
  gishin: Element;             // 기신 (불리한 오행)
  heesin: Element;             // 희신 (용신을 돕는 오행)
  strength: string;            // 신강 / 중화 / 신약
  strengthScore: number;
  elementBalance: Record<Element, number>;
  explanation: string;
}

// ── 십신 판단 ─────────────────────────────────────────────

/** 일간(dayMaster) 기준으로 대상 천간의 십신을 구한다 */
export function getTenGod(dayMasterStem: number, targetStem: number): string {
  const dmElem = STEM_ELEMENTS[dayMasterStem];
  const tgElem = STEM_ELEMENTS[targetStem];
  const sameYY = STEM_YINYANG[dayMasterStem] === STEM_YINYANG[targetStem];

  if (tgElem === dmElem) return sameYY ? "비견" : "겁재";
  if (GENERATES[dmElem] === tgElem) return sameYY ? "식신" : "상관";
  if (OVERCOMES[dmElem] === tgElem) return sameYY ? "편재" : "정재";
  if (OVERCOMES[tgElem] === dmElem) return sameYY ? "편관" : "정관";
  if (GENERATES[tgElem] === dmElem) return sameYY ? "편인" : "정인";
  return "비견"; // fallback
}

/** 특정 천간에 대한 십신 상세 정보 */
export function getTenGodInfo(dayMasterStem: number, targetStem: number): TenGodResult {
  const name = getTenGod(dayMasterStem, targetStem);
  const detail = TEN_GOD_DETAILS[name];
  return {
    stem: name,
    hanja: detail.hanja,
    role: detail.role,
    description: detail.description,
  };
}

// ── 지장간 분석 ──────────────────────────────────────────

/** 지지의 지장간을 분석하여 반환 */
export function getHiddenStems(dayMasterStem: number, branchIndex: number): HiddenStemInfo[] {
  const hidden = HIDDEN_STEMS[branchIndex];
  const labels = ["여기", "중기", "정기"];
  const result: HiddenStemInfo[] = [];

  for (let i = 0; i < 3; i++) {
    if (hidden[i] === -1) continue;
    const stemIdx = hidden[i];
    result.push({
      label: labels[i],
      stemIndex: stemIdx,
      stemName: `${STEMS[stemIdx]}(${STEM_HANJA[stemIdx]})`,
      element: STEM_ELEMENTS[stemIdx],
      tenGod: getTenGod(dayMasterStem, stemIdx),
    });
  }

  return result;
}

// ── 십이운성 ─────────────────────────────────────────────

/** 천간의 지지에서의 십이운성을 구한다 */
export function getTwelveStage(stemIndex: number, branchIndex: number): string {
  const start = STAGE_START[stemIndex];
  const isYang = STEM_YINYANG[stemIndex] === "양";

  let offset: number;
  if (isYang) {
    offset = ((branchIndex - start) % 12 + 12) % 12;
  } else {
    offset = ((start - branchIndex) % 12 + 12) % 12;
  }

  return TWELVE_STAGES[offset];
}

/** 사주 4주의 십이운성 분석 */
export function analyzeTwelveStages(
  dayMasterStem: number,
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar }
): TwelveStageResult[] {
  const names = ["년주", "월주", "일주", "시주"];
  const keys = ["year", "month", "day", "hour"] as const;

  return keys.map((key, i) => {
    const stage = getTwelveStage(dayMasterStem, pillars[key].branch);
    return {
      pillarName: names[i],
      stage,
      meaning: TWELVE_STAGE_MEANINGS[stage],
    };
  });
}

// ── 합충형파해 분석 ──────────────────────────────────────

export function analyzeCombinations(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar }
): CombinationResult[] {
  const results: CombinationResult[] = [];
  const pillarNames = ["년주", "월주", "일주", "시주"];
  const keys = ["year", "month", "day", "hour"] as const;

  // 사주에 있는 모든 천간과 지지 수집
  const stems = keys.map((k) => pillars[k].stem);
  const branches = keys.map((k) => pillars[k].branch);

  // ── 천간합 ──
  for (const [s1, s2, , name] of STEM_COMBINATIONS) {
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        if (
          (stems[i] === s1 && stems[j] === s2) ||
          (stems[i] === s2 && stems[j] === s1)
        ) {
          results.push({
            type: "천간합",
            name,
            positions: [pillarNames[i], pillarNames[j]],
            interpretation: COMBINATION_INTERP[name] || "",
          });
        }
      }
    }
  }

  // ── 지지 육합 ──
  for (const [b1, b2, , name] of BRANCH_SIX_HARMONIES) {
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        if (
          (branches[i] === b1 && branches[j] === b2) ||
          (branches[i] === b2 && branches[j] === b1)
        ) {
          results.push({
            type: "지지육합",
            name,
            positions: [pillarNames[i], pillarNames[j]],
            interpretation: COMBINATION_INTERP[name] || "",
          });
        }
      }
    }
  }

  // ── 지지 삼합 ──
  for (const [b1, b2, b3, , name] of BRANCH_THREE_HARMONIES) {
    const bSet = [b1, b2, b3];
    const found: string[] = [];
    for (let i = 0; i < 4; i++) {
      if (bSet.includes(branches[i])) {
        found.push(pillarNames[i]);
      }
    }
    if (found.length >= 3) {
      results.push({
        type: "지지삼합",
        name,
        positions: found,
        interpretation: `${name}: 세 지지가 모여 강력한 오행의 기운을 형성합니다. 해당 오행이 크게 강화되어 명식 전체에 영향을 미칩니다.`,
      });
    } else if (found.length === 2) {
      results.push({
        type: "지지반합",
        name: name.replace("합", "반합"),
        positions: found,
        interpretation: `${name}의 반합: 두 지지만 있어 완전한 삼합은 아니나, 해당 오행으로의 변화 경향이 있습니다.`,
      });
    }
  }

  // ── 지지 방합 ──
  for (const [b1, b2, b3, , name] of BRANCH_DIRECTIONAL) {
    const bSet = [b1, b2, b3];
    const found: string[] = [];
    for (let i = 0; i < 4; i++) {
      if (bSet.includes(branches[i])) {
        found.push(pillarNames[i]);
      }
    }
    if (found.length >= 3) {
      results.push({
        type: "지지방합",
        name,
        positions: found,
        interpretation: `${name}: 같은 방위의 세 지지가 모여 해당 오행이 극도로 강해집니다. 계절적 에너지가 집중됩니다.`,
      });
    }
  }

  // ── 지지 충 ──
  for (const [b1, b2, name] of BRANCH_CLASHES) {
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        if (
          (branches[i] === b1 && branches[j] === b2) ||
          (branches[i] === b2 && branches[j] === b1)
        ) {
          results.push({
            type: "지지충",
            name,
            positions: [pillarNames[i], pillarNames[j]],
            interpretation: COMBINATION_INTERP[name] || `${name}: 두 지지가 정면으로 충돌하여 변화와 갈등이 생깁니다.`,
          });
        }
      }
    }
  }

  // ── 지지 형 ──
  for (const [b1, b2, type, name] of BRANCH_PUNISHMENTS) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i === j && b1 !== b2) continue;
        if (i === j && b1 === b2 && branches[i] === b1) {
          results.push({
            type: "지지형",
            name,
            positions: [pillarNames[i]],
            interpretation: `${name}: 같은 지지가 자기 자신을 형하는 자형(自刑)입니다. 스스로를 해치는 자기 파괴적 경향에 주의하세요.`,
          });
        } else if (i !== j && branches[i] === b1 && branches[j] === b2) {
          results.push({
            type: "지지형",
            name,
            positions: [pillarNames[i], pillarNames[j]],
            interpretation: `${name} (${type}): 형벌의 관계로 법적 문제나 건강 이상에 주의가 필요합니다. 갈등이 깊고 예상치 못한 피해가 생길 수 있습니다.`,
          });
        }
      }
    }
  }

  // ── 지지 파 ──
  for (const [b1, b2, name] of BRANCH_DESTRUCTIONS) {
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        if (
          (branches[i] === b1 && branches[j] === b2) ||
          (branches[i] === b2 && branches[j] === b1)
        ) {
          results.push({
            type: "지지파",
            name,
            positions: [pillarNames[i], pillarNames[j]],
            interpretation: `${name}: 깨뜨리는 관계로, 계획이나 관계가 중도에 무산되기 쉽습니다. 일이 마무리되지 않는 경향이 있습니다.`,
          });
        }
      }
    }
  }

  // ── 지지 해 ──
  for (const [b1, b2, name] of BRANCH_HARMS) {
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        if (
          (branches[i] === b1 && branches[j] === b2) ||
          (branches[i] === b2 && branches[j] === b1)
        ) {
          results.push({
            type: "지지해",
            name,
            positions: [pillarNames[i], pillarNames[j]],
            interpretation: `${name}: 해치는 관계로, 은근한 갈등과 배신에 주의가 필요합니다. 겉으로는 드러나지 않는 내면의 상처가 생길 수 있습니다.`,
          });
        }
      }
    }
  }

  return results;
}

// ── 신살 분석 ────────────────────────────────────────────

export function analyzeSpiritKills(
  dayMasterStem: number,
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar }
): SpiritKillResult[] {
  const results: SpiritKillResult[] = [];
  const pillarNames = ["년주", "월주", "일주", "시주"];
  const keys = ["year", "month", "day", "hour"] as const;
  const branches = keys.map((k) => pillars[k].branch);
  const dayBranch = pillars.day.branch;
  const yearBranch = pillars.year.branch;

  // 기준: 일지의 삼합 그룹
  const dayGroup = getTrigramGroup(dayBranch);
  const yearGroup = getTrigramGroup(yearBranch);

  // 역마살 (일지 기준)
  const yeokmaTarget = YEOKMA[dayGroup];
  for (let i = 0; i < 4; i++) {
    if (branches[i] === yeokmaTarget) {
      results.push({
        name: "역마",
        korName: SPIRIT_KILL_INTERP["역마"].name,
        position: pillarNames[i],
        description: SPIRIT_KILL_INTERP["역마"].description,
      });
    }
  }

  // 화개살 (일지 기준)
  const hwagaeTarget = HWAGAE[dayGroup];
  for (let i = 0; i < 4; i++) {
    if (branches[i] === hwagaeTarget) {
      results.push({
        name: "화개",
        korName: SPIRIT_KILL_INTERP["화개"].name,
        position: pillarNames[i],
        description: SPIRIT_KILL_INTERP["화개"].description,
      });
    }
  }

  // 도화살 (일지 기준)
  const dohwaTarget = DOHWA[dayGroup];
  for (let i = 0; i < 4; i++) {
    if (branches[i] === dohwaTarget) {
      results.push({
        name: "도화",
        korName: SPIRIT_KILL_INTERP["도화"].name,
        position: pillarNames[i],
        description: SPIRIT_KILL_INTERP["도화"].description,
      });
    }
  }

  // 천을귀인 (일간 기준)
  const gwiinTargets = CHEON_EUL_GWIIN[dayMasterStem];
  for (let i = 0; i < 4; i++) {
    if (gwiinTargets.includes(branches[i])) {
      results.push({
        name: "천을귀인",
        korName: SPIRIT_KILL_INTERP["천을귀인"].name,
        position: pillarNames[i],
        description: SPIRIT_KILL_INTERP["천을귀인"].description,
      });
    }
  }

  // 문창귀인 (일간 기준)
  const munchangTarget = MUNCHANG[dayMasterStem];
  for (let i = 0; i < 4; i++) {
    if (branches[i] === munchangTarget) {
      results.push({
        name: "문창귀인",
        korName: SPIRIT_KILL_INTERP["문창귀인"].name,
        position: pillarNames[i],
        description: SPIRIT_KILL_INTERP["문창귀인"].description,
      });
    }
  }

  // 양인살 (일간 기준)
  const yanginTarget = YANGIN[dayMasterStem];
  for (let i = 0; i < 4; i++) {
    if (branches[i] === yanginTarget) {
      results.push({
        name: "양인",
        korName: SPIRIT_KILL_INTERP["양인"].name,
        position: pillarNames[i],
        description: SPIRIT_KILL_INTERP["양인"].description,
      });
    }
  }

  // 괴강살 (일주 기준)
  for (const [s, b] of GOEGANG) {
    if (pillars.day.stem === s && pillars.day.branch === b) {
      results.push({
        name: "괴강",
        korName: SPIRIT_KILL_INTERP["괴강"].name,
        position: "일주",
        description: SPIRIT_KILL_INTERP["괴강"].description,
      });
    }
  }

  // 백호대살 (일지 기준)
  if (BAEKHO.includes(dayBranch)) {
    results.push({
      name: "백호",
      korName: SPIRIT_KILL_INTERP["백호"].name,
      position: "일주",
      description: SPIRIT_KILL_INTERP["백호"].description,
    });
  }

  // 원진살 (일지 기준으로 타 지지 검사)
  for (const [w1, w2] of WONJIN) {
    if (dayBranch === w1) {
      for (let i = 0; i < 4; i++) {
        if (i === 2) continue; // 일주 자신 제외
        if (branches[i] === w2) {
          results.push({
            name: "원진",
            korName: SPIRIT_KILL_INTERP["원진"].name,
            position: `일주-${pillarNames[i]}`,
            description: SPIRIT_KILL_INTERP["원진"].description,
          });
        }
      }
    }
    if (dayBranch === w2) {
      for (let i = 0; i < 4; i++) {
        if (i === 2) continue;
        if (branches[i] === w1) {
          results.push({
            name: "원진",
            korName: SPIRIT_KILL_INTERP["원진"].name,
            position: `일주-${pillarNames[i]}`,
            description: SPIRIT_KILL_INTERP["원진"].description,
          });
        }
      }
    }
  }

  // 공망 (일주 기준)
  const dayPosition = getSexagenaryPosition(pillars.day.stem, pillars.day.branch);
  const xunIndex = Math.floor(dayPosition / 10);
  const voidBranches = VOID_BRANCHES[xunIndex];
  for (let i = 0; i < 4; i++) {
    if (i === 2) continue; // 일주 자신 제외
    if (branches[i] === voidBranches[0] || branches[i] === voidBranches[1]) {
      results.push({
        name: "공망",
        korName: SPIRIT_KILL_INTERP["공망"].name,
        position: pillarNames[i],
        description: SPIRIT_KILL_INTERP["공망"].description,
      });
    }
  }

  // 겁살 (일지 기준)
  const geopsalTarget = GEOPSAL[dayGroup];
  for (let i = 0; i < 4; i++) {
    if (branches[i] === geopsalTarget) {
      results.push({
        name: "겁살",
        korName: SPIRIT_KILL_INTERP["겁살"].name,
        position: pillarNames[i],
        description: SPIRIT_KILL_INTERP["겁살"].description,
      });
    }
  }

  // 재살 (일지 기준)
  const jaesalTarget = JAESAL[dayGroup];
  for (let i = 0; i < 4; i++) {
    if (branches[i] === jaesalTarget) {
      results.push({
        name: "재살",
        korName: SPIRIT_KILL_INTERP["재살"].name,
        position: pillarNames[i],
        description: SPIRIT_KILL_INTERP["재살"].description,
      });
    }
  }

  // 천살 (일지 기준)
  const cheonsalTarget = CHEONSAL[dayGroup];
  for (let i = 0; i < 4; i++) {
    if (branches[i] === cheonsalTarget) {
      results.push({
        name: "천살",
        korName: SPIRIT_KILL_INTERP["천살"].name,
        position: pillarNames[i],
        description: SPIRIT_KILL_INTERP["천살"].description,
      });
    }
  }

  // 지살 (일지 기준)
  const jisalTarget = JISAL[dayGroup];
  for (let i = 0; i < 4; i++) {
    if (branches[i] === jisalTarget) {
      results.push({
        name: "지살",
        korName: SPIRIT_KILL_INTERP["지살"].name,
        position: pillarNames[i],
        description: SPIRIT_KILL_INTERP["지살"].description,
      });
    }
  }

  // 반안살 (일간 기준)
  const bananTarget = BANAN[dayMasterStem];
  for (let i = 0; i < 4; i++) {
    if (branches[i] === bananTarget) {
      results.push({
        name: "반안",
        korName: SPIRIT_KILL_INTERP["반안"].name,
        position: pillarNames[i],
        description: SPIRIT_KILL_INTERP["반안"].description,
      });
    }
  }

  // 귀문관살 (일지 기준)
  if (GWIMUN[dayBranch] !== undefined) {
    const gwimunTarget = GWIMUN[dayBranch];
    for (let i = 0; i < 4; i++) {
      if (i === 2) continue;
      if (branches[i] === gwimunTarget) {
        results.push({
          name: "귀문관",
          korName: SPIRIT_KILL_INTERP["귀문관"].name,
          position: `일주-${pillarNames[i]}`,
          description: SPIRIT_KILL_INTERP["귀문관"].description,
        });
      }
    }
  }

  return results;
}

/** 60갑자 순환 위치 (0~59) */
function getSexagenaryPosition(stem: number, branch: number): number {
  // CRT: position ≡ stem (mod 10), position ≡ branch (mod 12), 0 ≤ position < 60
  for (let p = 0; p < 60; p++) {
    if (p % 10 === stem && p % 12 === branch) return p;
  }
  return 0;
}

// ── 오행 강약 / 용신 분석 ────────────────────────────────

export function analyzeYongshin(
  dayMasterStem: number,
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  birthMonth: number
): YongshinResult {
  const dmElement = STEM_ELEMENTS[dayMasterStem];
  const balance: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  const keys = ["year", "month", "day", "hour"] as const;

  // 천간 오행 가중치 (1.0)
  for (const k of keys) {
    balance[STEM_ELEMENTS[pillars[k].stem]] += 1.0;
  }

  // 지지 오행 가중치 (1.2 - 지지가 천간보다 힘이 강함)
  for (const k of keys) {
    balance[BRANCH_ELEMENTS[pillars[k].branch]] += 1.2;
  }

  // 지장간 정기 가중치 (0.5)
  for (const k of keys) {
    const hidden = HIDDEN_STEMS[pillars[k].branch];
    const junggi = hidden[2]; // 정기
    if (junggi >= 0) {
      balance[STEM_ELEMENTS[junggi]] += 0.5;
    }
  }

  // 월지 계절 보너스 (2.0) - 월지의 기운이 가장 강함
  const monthBranchElem = BRANCH_ELEMENTS[pillars.month.branch];
  balance[monthBranchElem] += 2.0;

  // 일간 강약 판단
  const selfStrength = balance[dmElement] + balance[GENERATED_BY[dmElement]];
  const otherStrength =
    balance[OVERCOMES[dmElement]] +
    balance[GENERATES[dmElement]] +
    balance[OVERCOME_BY[dmElement]];
  const totalStrength = selfStrength + otherStrength;

  const ratio = selfStrength / totalStrength;
  let strength: string;
  let strengthScore: number;

  if (ratio >= 0.55) {
    strength = "신강(身强)";
    strengthScore = Math.round(ratio * 100);
  } else if (ratio >= 0.42) {
    strength = "중화(中和)";
    strengthScore = Math.round(ratio * 100);
  } else {
    strength = "신약(身弱)";
    strengthScore = Math.round(ratio * 100);
  }

  // 용신/기신 결정
  let yongshin: Element;
  let gishin: Element;
  let heesin: Element;
  let explanation: string;

  if (ratio >= 0.55) {
    // 신강: 설기(泄氣)하거나 극하는 오행이 용신
    yongshin = GENERATES[dmElement];     // 식상 (설기)
    gishin = dmElement;                  // 비겁 (동류)
    heesin = OVERCOMES[dmElement];       // 재성 (극출)
    explanation = `일간 ${STEMS[dayMasterStem]}${STEM_HANJA[dayMasterStem]}이(가) 신강(身强)합니다. ` +
      `일간의 기운이 과다하므로 ${ELEMENT_NAMES[yongshin]}(식상)으로 설기하거나 ` +
      `${ELEMENT_NAMES[heesin]}(재성)으로 극하여 균형을 맞추는 것이 좋습니다. ` +
      `${ELEMENT_NAMES[gishin]}(비겁)은 일간을 더 강하게 하므로 기신이 됩니다.`;
  } else if (ratio < 0.42) {
    // 신약: 같은 오행이나 생해주는 오행이 용신
    yongshin = GENERATED_BY[dmElement];  // 인성 (생조)
    gishin = OVERCOMES[dmElement];       // 재성 (극출)
    heesin = dmElement;                  // 비겁 (동류)
    explanation = `일간 ${STEMS[dayMasterStem]}${STEM_HANJA[dayMasterStem]}이(가) 신약(身弱)합니다. ` +
      `일간의 기운이 부족하므로 ${ELEMENT_NAMES[yongshin]}(인성)이 생해주거나 ` +
      `${ELEMENT_NAMES[heesin]}(비겁)이 도와주는 것이 좋습니다. ` +
      `${ELEMENT_NAMES[gishin]}(재성)은 일간의 기운을 빼앗으므로 기신이 됩니다.`;
  } else {
    // 중화: 조후(調候) 용신 - 계절에 따라 결정
    const seasonalElement = getSeasonalYongshin(dmElement, pillars.month.branch);
    yongshin = seasonalElement.yongshin;
    gishin = seasonalElement.gishin;
    heesin = GENERATED_BY[yongshin];
    explanation = `일간 ${STEMS[dayMasterStem]}${STEM_HANJA[dayMasterStem]}이(가) 중화(中和)에 가깝습니다. ` +
      `조후(調候)를 기준으로 ${ELEMENT_NAMES[yongshin]}이(가) 용신입니다. ` +
      `${seasonalElement.reason}`;
  }

  return {
    yongshin,
    gishin,
    heesin,
    strength,
    strengthScore,
    elementBalance: balance,
    explanation,
  };
}

/** 조후 용신: 계절(월지)에 따른 용신 결정 */
function getSeasonalYongshin(
  dmElement: Element,
  monthBranch: number
): { yongshin: Element; gishin: Element; reason: string } {
  // 월지의 계절: 인묘진=봄(목), 사오미=여름(화), 신유술=가을(금), 해자축=겨울(수)
  const season = BRANCH_ELEMENTS[monthBranch];

  // 기본 조후 원칙: 덥거나 추운 것을 조절
  if (season === "fire" || monthBranch === 5 || monthBranch === 6 || monthBranch === 7) {
    return {
      yongshin: "water",
      gishin: "fire",
      reason: "여름에 태어나 화기가 강하므로, 수(水)로 조후하여 열기를 식히는 것이 필요합니다.",
    };
  }
  if (season === "water" || monthBranch === 11 || monthBranch === 0 || monthBranch === 1) {
    return {
      yongshin: "fire",
      gishin: "water",
      reason: "겨울에 태어나 수기가 강하므로, 화(火)로 조후하여 한기를 따뜻하게 하는 것이 필요합니다.",
    };
  }
  if (season === "wood" || monthBranch === 2 || monthBranch === 3 || monthBranch === 4) {
    return {
      yongshin: "fire",
      gishin: "metal",
      reason: "봄에 태어나 목기가 왕성하므로, 화(火)로 설기하여 에너지를 활용하는 것이 좋습니다.",
    };
  }
  // 가을
  return {
    yongshin: "fire",
    gishin: "metal",
    reason: "가을에 태어나 금기가 강하므로, 화(火)로 금을 제련하여 재능을 연마하는 것이 좋습니다.",
  };
}
