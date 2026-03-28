// ============================================================
// 자미두수 엔진 - 메인 진입점
// ============================================================

import type { DivinationInput, DivinationResult, DivinationNode, DivinationEdge } from "@/types/divination";
import {
  PALACE_NAMES,
  BRANCHES,
  BRANCH_HANJA,
  MAIN_STAR_HANJA,
  BUREAU_NAMES,
  FOUR_TRANSFORMATIONS,
  TRANSFORMATION_NAMES,
} from "./data";
import {
  buildChart,
  solarToLunarApprox,
  getYearStemBranch,
  parseHourIndex,
  type ChartInfo,
  type PalaceInfo,
} from "./chart";
import {
  applyFourTransformations,
  analyzeSanfang,
  calculateDahan,
  interpretPalaces,
  analyzeStarCombinations,
  type TransformationResult,
  type SanfangResult,
  type DahanPeriod,
  type PalaceInterpretation,
} from "./analysis";

// ── 메인 계산 ─────────────────────────────────────────────

export function calculate(input: DivinationInput): DivinationResult {
  // 1. 입력 파싱
  const [yearStr, monthStr, dayStr] = input.birthDate.split("-");
  const solarYear = parseInt(yearStr, 10);
  const solarMonth = parseInt(monthStr, 10);
  const solarDay = parseInt(dayStr, 10);
  const hourIndex = parseHourIndex(input.birthTime);

  // 2. 양력→음력 근사 변환
  const { lunarYear, lunarMonth, lunarDay } = solarToLunarApprox(solarYear, solarMonth, solarDay);

  // 3. 명반 구성
  const chart = buildChart(lunarYear, lunarMonth, lunarDay, hourIndex, input.gender);

  // 4. 사화 적용
  const transformations = applyFourTransformations(chart);

  // 5. 삼방사정 분석
  const sanfang = analyzeSanfang(chart);

  // 6. 궁별 해석
  const palaceInterps = interpretPalaces(chart);

  // 7. 성요 조합 해석
  const combinations: Record<string, string[]> = {};
  for (const palace of chart.palaces) {
    const combos = analyzeStarCombinations(palace);
    if (combos.length > 0) {
      combinations[palace.name] = combos;
    }
  }

  // 8. 대한
  const dahan = calculateDahan(chart, input.gender, solarYear);
  const currentDahan = dahan.find((d) => {
    const age = new Date().getFullYear() - solarYear;
    return age >= d.startAge && age <= d.endAge;
  });

  // ── 요약 ──
  const summary = buildSummary(chart, transformations, currentDahan);

  // ── elements ──
  const elements = buildElements(chart, transformations, currentDahan);

  // ── 노드/엣지 ──
  const nodes = buildNodes(chart, transformations);
  const edges = buildEdges(chart, sanfang, transformations);

  return {
    system: "자미두수",
    summary,
    details: {
      chart: {
        mingGong: `${BRANCHES[chart.mingGongBranch]}(${BRANCH_HANJA[chart.mingGongBranch]})`,
        shenGong: `${BRANCHES[chart.shenGongBranch]}(${BRANCH_HANJA[chart.shenGongBranch]})`,
        bureau: chart.bureau,
        bureauName: chart.bureauName,
        ziweiPosition: chart.ziweiPosition,
        tianfuPosition: chart.tianfuPosition,
      },
      palaces: chart.palaces.map((p) => ({
        name: p.name,
        branch: `${BRANCHES[p.branch]}(${BRANCH_HANJA[p.branch]})`,
        stars: p.stars.map((s) => ({
          name: s.name,
          hanja: MAIN_STAR_HANJA[s.name] ?? "",
          brightness: s.brightness,
          series: s.series,
        })),
        transformations: p.transformations,
        isBodyPalace: p.isBodyPalace,
      })),
      transformations,
      sanfang: sanfang.map((sf) => ({
        palace: sf.palace,
        interpretation: sf.interpretation,
      })),
      palaceInterpretations: palaceInterps,
      combinations,
      dahan,
      currentDahan: currentDahan
        ? {
            period: `${currentDahan.startAge}~${currentDahan.endAge}세`,
            palace: currentDahan.palaceName,
            stars: currentDahan.stars.map((s) => s.name),
          }
        : null,
      lunarInfo: { lunarYear, lunarMonth, lunarDay },
    },
    elements,
    nodes,
    edges,
  };
}

// ── 요약 ─────────────────────────────────────────────────

function buildSummary(
  chart: ChartInfo,
  transformations: TransformationResult[],
  currentDahan?: DahanPeriod
): string {
  const mingStars = chart.palaces[0].stars
    .filter((s) => s.series === "자미계" || s.series === "천부계")
    .map((s) => `${s.name}[${s.brightness}]`)
    .join(" ");

  const transStr = transformations
    .map((t) => `${t.type}→${t.star}(${t.palace})`)
    .join(", ");

  const dahanStr = currentDahan
    ? `${currentDahan.startAge}~${currentDahan.endAge}세 ${currentDahan.palaceName}`
    : "미정";

  return (
    `명궁: ${BRANCHES[chart.mingGongBranch]}(${BRANCH_HANJA[chart.mingGongBranch]}) | ${chart.bureauName}\n` +
    `명궁 성요: ${mingStars || "없음"}\n` +
    `생년사화: ${transStr}\n` +
    `현재 대한: ${dahanStr}`
  );
}

// ── DivinationElement 배열 ───────────────────────────────

function buildElements(
  chart: ChartInfo,
  transformations: TransformationResult[],
  currentDahan?: DahanPeriod
) {
  const elements = [];

  // 명궁 정보
  elements.push({
    label: "명궁",
    value: `${BRANCHES[chart.mingGongBranch]}(${BRANCH_HANJA[chart.mingGongBranch]})`,
    description: `오행국: ${chart.bureauName}`,
  });

  // 신궁
  elements.push({
    label: "신궁",
    value: `${BRANCHES[chart.shenGongBranch]}(${BRANCH_HANJA[chart.shenGongBranch]})`,
    description: "후천적으로 발전하는 방향을 나타냅니다",
  });

  // 명궁 주성
  const mingMainStars = chart.palaces[0].stars
    .filter((s) => s.series === "자미계" || s.series === "천부계");
  for (const star of mingMainStars) {
    elements.push({
      label: `명궁 주성`,
      value: `${star.name}(${MAIN_STAR_HANJA[star.name] ?? ""})`,
      description: `밝기: ${star.brightness} | ${star.series}`,
    });
  }

  // 사화
  for (const t of transformations) {
    elements.push({
      label: t.type,
      value: `${t.star} → ${t.palace}`,
      description: `생년 ${t.type}가 ${t.palace}에 있는 ${t.star}에 적용`,
    });
  }

  // 대한
  if (currentDahan) {
    elements.push({
      label: "현재 대한",
      value: `${currentDahan.palaceName} (${currentDahan.startAge}~${currentDahan.endAge}세)`,
      description: `성요: ${currentDahan.stars.map((s) => s.name).join(", ") || "없음"}`,
    });
  }

  return elements;
}

// ── 노드 생성 ────────────────────────────────────────────

function buildNodes(
  chart: ChartInfo,
  transformations: TransformationResult[]
): DivinationNode[] {
  const nodes: DivinationNode[] = [];

  // 12궁 노드
  for (const palace of chart.palaces) {
    const starStr = palace.stars
      .filter((s) => s.series === "자미계" || s.series === "천부계")
      .map((s) => s.name)
      .join(",");
    nodes.push({
      id: `ziwei-palace-${palace.index}`,
      label: `${palace.name}: ${starStr || "공궁"}`,
      category: "palace",
    });
  }

  // 주성 노드
  const seenStars = new Set<string>();
  for (const palace of chart.palaces) {
    for (const star of palace.stars) {
      if ((star.series === "자미계" || star.series === "천부계") && !seenStars.has(star.name)) {
        seenStars.add(star.name);
        nodes.push({
          id: `ziwei-star-${star.name}`,
          label: `${star.name}(${MAIN_STAR_HANJA[star.name] ?? ""}) [${star.brightness}]`,
          category: star.series === "자미계" ? "ziwei-series" : "tianfu-series",
        });
      }
    }
  }

  // 사화 노드
  for (const t of transformations) {
    nodes.push({
      id: `ziwei-transform-${t.type}`,
      label: `${t.type} → ${t.star}`,
      category: "transformation",
    });
  }

  return nodes;
}

// ── 엣지 생성 ────────────────────────────────────────────

function buildEdges(
  chart: ChartInfo,
  sanfang: SanfangResult[],
  transformations: TransformationResult[]
): DivinationEdge[] {
  const edges: DivinationEdge[] = [];

  // 궁 내 성요 연결
  for (const palace of chart.palaces) {
    for (const star of palace.stars) {
      if (star.series === "자미계" || star.series === "천부계") {
        edges.push({
          source: `ziwei-palace-${palace.index}`,
          target: `ziwei-star-${star.name}`,
          relation: `입묘: ${star.brightness}`,
        });
      }
    }
  }

  // 삼방사정 연결 (명궁 기준)
  const mingPalace = chart.palaces[0];
  const mB = mingPalace.branch;
  const relatedBranches = [(mB + 4) % 12, (mB + 6) % 12, (mB + 8) % 12];
  for (const rb of relatedBranches) {
    const rp = chart.palaces.find((p) => p.branch === rb);
    if (rp) {
      edges.push({
        source: `ziwei-palace-0`,
        target: `ziwei-palace-${rp.index}`,
        relation: rb === (mB + 6) % 12 ? "대궁" : "삼방",
      });
    }
  }

  // 사화 연결
  for (const t of transformations) {
    const palace = chart.palaces.find((p) => p.name === t.palace);
    if (palace) {
      edges.push({
        source: `ziwei-transform-${t.type}`,
        target: `ziwei-palace-${palace.index}`,
        relation: t.type,
      });
    }
  }

  // 인접 궁 순서 연결
  for (let i = 0; i < 12; i++) {
    edges.push({
      source: `ziwei-palace-${i}`,
      target: `ziwei-palace-${(i + 1) % 12}`,
      relation: "인접",
    });
  }

  return edges;
}
