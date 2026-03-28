// ============================================================
// 사주팔자 엔진 - 메인 진입점
// ============================================================

import type { DivinationInput, DivinationResult, DivinationNode, DivinationEdge } from "@/types/divination";
import {
  STEMS,
  STEM_HANJA,
  STEM_ELEMENTS,
  STEM_YINYANG,
  BRANCHES,
  BRANCH_HANJA,
  BRANCH_ELEMENTS,
  BRANCH_ANIMALS,
  ELEMENT_NAMES,
  ELEMENT_COLORS,
  GENERATES,
  OVERCOMES,
  HIDDEN_STEMS,
  Element,
} from "./data";
import {
  parseHour,
  calculateFourPillars,
  calculateDaewun,
  calculateSewun,
  type Pillar,
  type DaewunPeriod,
} from "./calendar";
import {
  getTenGod,
  getTenGodInfo,
  getHiddenStems,
  analyzeTwelveStages,
  analyzeCombinations,
  analyzeSpiritKills,
  analyzeYongshin,
  type TenGodResult,
  type HiddenStemInfo,
  type CombinationResult,
  type SpiritKillResult,
  type TwelveStageResult,
  type YongshinResult,
} from "./analysis";

// ── 헬퍼 ──────────────────────────────────────────────────

function pillarLabel(p: Pillar): string {
  return `${STEMS[p.stem]}${BRANCHES[p.branch]}(${STEM_HANJA[p.stem]}${BRANCH_HANJA[p.branch]})`;
}

function formatElement(elem: Element): string {
  return ELEMENT_NAMES[elem];
}

// ── 메인 계산 ─────────────────────────────────────────────

export function calculate(input: DivinationInput): DivinationResult {
  // 1. 입력 파싱
  const [yearStr, monthStr, dayStr] = input.birthDate.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = parseHour(input.birthTime);

  // 2. 사주 명식 산출
  const pillars = calculateFourPillars(year, month, day, hour);
  const dayMaster = pillars.day.stem;
  const dmElement = STEM_ELEMENTS[dayMaster];

  // 3. 십신 분석
  const tenGods = {
    year: getTenGodInfo(dayMaster, pillars.year.stem),
    month: getTenGodInfo(dayMaster, pillars.month.stem),
    day: { stem: "일간(본인)", hanja: "", role: "자아", description: "" },
    hour: getTenGodInfo(dayMaster, pillars.hour.stem),
  };

  // 4. 지장간 분석
  const hiddenStems = {
    year: getHiddenStems(dayMaster, pillars.year.branch),
    month: getHiddenStems(dayMaster, pillars.month.branch),
    day: getHiddenStems(dayMaster, pillars.day.branch),
    hour: getHiddenStems(dayMaster, pillars.hour.branch),
  };

  // 5. 합충형파해
  const combinations = analyzeCombinations(pillars);

  // 6. 십이운성
  const twelveStages = analyzeTwelveStages(dayMaster, pillars);

  // 7. 신살
  const spiritKills = analyzeSpiritKills(dayMaster, pillars);

  // 8. 용신/기신
  const yongshin = analyzeYongshin(dayMaster, pillars, month);

  // 9. 대운/세운
  const daewun = calculateDaewun(pillars.month, pillars.year.stem, input.gender, year);
  const sewun = calculateSewun();

  // ── 요약 생성 ──
  const summary = buildSummary(dayMaster, pillars, yongshin, daewun, sewun);

  // ── elements 생성 ──
  const elements = buildElements(pillars, dayMaster, tenGods, yongshin, daewun, sewun);

  // ── 노드/엣지 생성 ──
  const nodes = buildNodes(pillars, dayMaster, tenGods, yongshin, spiritKills, daewun, sewun);
  const edges = buildEdges(pillars, dayMaster, combinations, yongshin);

  return {
    system: "사주팔자",
    summary,
    details: {
      pillars: {
        year: { ...pillars.year, label: pillarLabel(pillars.year) },
        month: { ...pillars.month, label: pillarLabel(pillars.month) },
        day: { ...pillars.day, label: pillarLabel(pillars.day) },
        hour: { ...pillars.hour, label: pillarLabel(pillars.hour) },
      },
      sajuYear: pillars.sajuYear,
      dayMaster: {
        stem: dayMaster,
        name: `${STEMS[dayMaster]}(${STEM_HANJA[dayMaster]})`,
        element: dmElement,
        elementName: formatElement(dmElement),
        yinYang: STEM_YINYANG[dayMaster],
      },
      tenGods,
      hiddenStems,
      combinations,
      twelveStages,
      spiritKills,
      yongshin,
      daewun,
      sewun,
    },
    elements,
    nodes,
    edges,
  };
}

// ── 요약 텍스트 ──────────────────────────────────────────

function buildSummary(
  dayMaster: number,
  pillars: ReturnType<typeof calculateFourPillars>,
  yongshin: YongshinResult,
  daewun: ReturnType<typeof calculateDaewun>,
  sewun: ReturnType<typeof calculateSewun>
): string {
  const dmName = `${STEMS[dayMaster]}(${STEM_HANJA[dayMaster]})`;
  const dmElem = formatElement(STEM_ELEMENTS[dayMaster]);
  const currentDaewun = daewun.periods.find((p) => p.isCurrent);
  const currentDaewunStr = currentDaewun
    ? `${STEMS[currentDaewun.stem]}${BRANCHES[currentDaewun.branch]}`
    : "미정";

  return (
    `일간 ${dmName} | ${dmElem} | ${yongshin.strength}\n` +
    `명식: ${pillarLabel(pillars.year)} ${pillarLabel(pillars.month)} ${pillarLabel(pillars.day)} ${pillarLabel(pillars.hour)}\n` +
    `용신: ${formatElement(yongshin.yongshin)} | 기신: ${formatElement(yongshin.gishin)}\n` +
    `현재 대운: ${currentDaewunStr} | 세운: ${STEMS[sewun.stem]}${BRANCHES[sewun.branch]}(${sewun.year}년)`
  );
}

// ── DivinationElement 배열 ───────────────────────────────

function buildElements(
  pillars: ReturnType<typeof calculateFourPillars>,
  dayMaster: number,
  tenGods: Record<string, any>,
  yongshin: YongshinResult,
  daewun: ReturnType<typeof calculateDaewun>,
  sewun: ReturnType<typeof calculateSewun>
) {
  const pillarKeys = ["year", "month", "day", "hour"] as const;
  const pillarLabels = ["년주", "월주", "일주", "시주"];

  const elements = pillarKeys.map((k, i) => ({
    label: pillarLabels[i],
    value: pillarLabel(pillars[k]),
    description: i === 2
      ? `일간(본인) - ${formatElement(STEM_ELEMENTS[dayMaster])} ${STEM_YINYANG[dayMaster]}`
      : `${tenGods[k].stem} - ${tenGods[k].role}`,
  }));

  elements.push({
    label: "용신",
    value: formatElement(yongshin.yongshin),
    description: yongshin.explanation,
  });

  elements.push({
    label: "일간 강약",
    value: yongshin.strength,
    description: `강약 지수: ${yongshin.strengthScore}%`,
  });

  const currentDaewun = daewun.periods.find((p) => p.isCurrent);
  if (currentDaewun) {
    elements.push({
      label: "현재 대운",
      value: `${STEMS[currentDaewun.stem]}${BRANCHES[currentDaewun.branch]}`,
      description: `${currentDaewun.startAge}~${currentDaewun.endAge}세 (${daewun.forward ? "순행" : "역행"})`,
    });
  }

  elements.push({
    label: "세운",
    value: `${STEMS[sewun.stem]}${BRANCHES[sewun.branch]} (${sewun.year}년)`,
    description: `${BRANCH_ANIMALS[sewun.branch]}띠 해 - ${formatElement(STEM_ELEMENTS[sewun.stem])}`,
  });

  return elements;
}

// ── 노드 생성 ────────────────────────────────────────────

function buildNodes(
  pillars: ReturnType<typeof calculateFourPillars>,
  dayMaster: number,
  tenGods: Record<string, any>,
  yongshin: YongshinResult,
  spiritKills: SpiritKillResult[],
  daewun: ReturnType<typeof calculateDaewun>,
  sewun: ReturnType<typeof calculateSewun>
): DivinationNode[] {
  const nodes: DivinationNode[] = [];
  const pillarKeys = ["year", "month", "day", "hour"] as const;
  const pillarLabels = ["년주", "월주", "일주", "시주"];

  // 사주 4주 노드
  for (let i = 0; i < 4; i++) {
    const k = pillarKeys[i];
    const p = pillars[k];
    nodes.push({
      id: `saju-${k}`,
      label: `${pillarLabels[i]}: ${pillarLabel(p)}`,
      category: "pillar",
    });
  }

  // 십신 노드
  for (const k of ["year", "month", "hour"] as const) {
    const tg = tenGods[k];
    if (tg.stem) {
      nodes.push({
        id: `saju-tengod-${k}`,
        label: `${tg.stem}(${tg.hanja})`,
        category: "tengod",
      });
    }
  }

  // 용신 노드
  nodes.push({
    id: "saju-yongshin",
    label: `용신: ${formatElement(yongshin.yongshin)}`,
    category: "yongshin",
  });

  nodes.push({
    id: "saju-gishin",
    label: `기신: ${formatElement(yongshin.gishin)}`,
    category: "yongshin",
  });

  // 신살 노드 (중복 제거)
  const seenKills = new Set<string>();
  for (const sk of spiritKills) {
    if (!seenKills.has(sk.name)) {
      seenKills.add(sk.name);
      nodes.push({
        id: `saju-spirit-${sk.name}`,
        label: sk.korName,
        category: "spirit",
      });
    }
  }

  // 현재 대운 노드
  const currentDaewun = daewun.periods.find((p) => p.isCurrent);
  if (currentDaewun) {
    nodes.push({
      id: "saju-daewun",
      label: `대운: ${STEMS[currentDaewun.stem]}${BRANCHES[currentDaewun.branch]}`,
      category: "luck",
    });
  }

  // 세운 노드
  nodes.push({
    id: "saju-sewun",
    label: `세운: ${STEMS[sewun.stem]}${BRANCHES[sewun.branch]}(${sewun.year})`,
    category: "luck",
  });

  return nodes;
}

// ── 엣지 생성 ────────────────────────────────────────────

function buildEdges(
  pillars: ReturnType<typeof calculateFourPillars>,
  dayMaster: number,
  combinations: CombinationResult[],
  yongshin: YongshinResult
): DivinationEdge[] {
  const edges: DivinationEdge[] = [];
  const pillarKeys = ["year", "month", "day", "hour"] as const;

  // 주간 연결 (인접한 주)
  edges.push({ source: "saju-year", target: "saju-month", relation: "인접" });
  edges.push({ source: "saju-month", target: "saju-day", relation: "인접" });
  edges.push({ source: "saju-day", target: "saju-hour", relation: "인접" });

  // 십신 관계 엣지
  for (const k of ["year", "month", "hour"] as const) {
    edges.push({
      source: `saju-${k}`,
      target: `saju-tengod-${k}`,
      relation: "십신",
    });
  }

  // 합충형파해 엣지
  for (const combo of combinations) {
    if (combo.positions.length >= 2) {
      const posToKey: Record<string, string> = {
        "년주": "saju-year",
        "월주": "saju-month",
        "일주": "saju-day",
        "시주": "saju-hour",
      };
      const source = posToKey[combo.positions[0]];
      const target = posToKey[combo.positions[1]];
      if (source && target) {
        edges.push({
          source,
          target,
          relation: `${combo.type}: ${combo.name}`,
        });
      }
    }
  }

  // 오행 생극 엣지 (사주 내 주요 오행 관계)
  const dmElement = STEM_ELEMENTS[dayMaster];
  for (const k of pillarKeys) {
    const stemElem = STEM_ELEMENTS[pillars[k].stem];
    if (GENERATES[dmElement] === stemElem) {
      edges.push({ source: "saju-day", target: `saju-${k}`, relation: `생(生): ${formatElement(dmElement)}→${formatElement(stemElem)}` });
    }
    if (OVERCOMES[dmElement] === stemElem) {
      edges.push({ source: "saju-day", target: `saju-${k}`, relation: `극(克): ${formatElement(dmElement)}→${formatElement(stemElem)}` });
    }
  }

  // 용신 연결
  edges.push({
    source: "saju-day",
    target: "saju-yongshin",
    relation: "필요",
  });
  edges.push({
    source: "saju-day",
    target: "saju-gishin",
    relation: "경계",
  });

  return edges;
}
