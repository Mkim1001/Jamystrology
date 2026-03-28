// ============================================================
// 기문둔갑 엔진 - 메인 진입점
// ============================================================

import type { DivinationInput, DivinationResult, DivinationNode, DivinationEdge } from "@/types/divination";
import {
  PALACE_NAMES,
  PALACE_DIRECTIONS,
  PALACE_ELEMENTS,
  SANQI_LIUYI,
  NINE_STARS,
  EIGHT_GATES,
  EIGHT_SPIRITS,
  STAR_NATURES,
  GATE_NATURES,
  SPIRIT_NATURES,
} from "./data";
import { buildQimenChart, type QimenChart, type PalaceState } from "./chart";
import {
  analyzeGeokguk,
  analyzeYongshin,
  interpretPalaces,
  type GeokgukResult,
  type YongshinAnalysis,
  type PalaceInterpretation,
} from "./analysis";

// ── 메인 계산 ─────────────────────────────────────────────

export function calculate(input: DivinationInput): DivinationResult {
  // 1. 입력 파싱
  const [yearStr, monthStr, dayStr] = input.birthDate.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = parseHour(input.birthTime);

  // 2. 포국
  const chart = buildQimenChart(month, day, hour);

  // 3. 격국 판단
  const geokguks = analyzeGeokguk(chart);

  // 4. 용신 분석
  const yongshin = analyzeYongshin(chart);

  // 5. 궁별 해석
  const palaceInterps = interpretPalaces(chart);

  // ── 요약 ──
  const summary = buildSummary(chart, geokguks);

  // ── elements ──
  const elements = buildElements(chart, geokguks);

  // ── 노드/엣지 ──
  const nodes = buildNodes(chart, geokguks);
  const edges = buildEdges(chart, geokguks);

  return {
    system: "기문둔갑",
    summary,
    details: {
      chart: {
        bureauNumber: chart.bureauNumber,
        isYangDun: chart.isYangDun,
        yuanQi: chart.yuanQi,
        solarTerm: chart.solarTerm,
        dunju: chart.dunju,
      },
      palaces: chart.palaces.map((p) => ({
        index: p.palaceIndex,
        name: PALACE_NAMES[p.palaceIndex],
        direction: PALACE_DIRECTIONS[p.palaceIndex],
        tianpan: p.tianpan,
        dipan: p.dipan,
        star: p.star,
        gate: p.gate,
        spirit: p.spirit,
      })),
      geokguks,
      yongshin,
      palaceInterpretations: palaceInterps,
    },
    elements,
    nodes,
    edges,
  };
}

// ── 헬퍼 ──────────────────────────────────────────────────

function parseHour(timeStr: string): number {
  const siJin: Record<string, number> = {
    자: 0, 축: 2, 인: 4, 묘: 6, 진: 8, 사: 10,
    오: 12, 미: 14, 신: 16, 유: 18, 술: 20, 해: 22,
  };
  if (siJin[timeStr] !== undefined) return siJin[timeStr];
  const parts = timeStr.split(":");
  return parseInt(parts[0], 10) || 0;
}

// ── 요약 ──────────────────────────────────────────────────

function buildSummary(chart: QimenChart, geokguks: GeokgukResult[]): string {
  const gilGeoks = geokguks.filter((g) => g.type === "길");
  const hyungGeoks = geokguks.filter((g) => g.type === "흉");

  let geokStr = "";
  if (gilGeoks.length > 0) {
    geokStr += `길격: ${gilGeoks.map((g) => g.name).join(", ")}`;
  }
  if (hyungGeoks.length > 0) {
    geokStr += `${gilGeoks.length > 0 ? " | " : ""}흉격: ${hyungGeoks.map((g) => g.name).join(", ")}`;
  }
  if (!geokStr) geokStr = "특별한 격국 없음";

  // 구궁 요약 (3x3 배치)
  const p = chart.palaces;
  const grid =
    `[${shortPalace(p[3])}] [${shortPalace(p[8])}] [${shortPalace(p[1])}]\n` +
    `[${shortPalace(p[2])}] [${shortPalace(p[4])}] [${shortPalace(p[6])}]\n` +
    `[${shortPalace(p[7])}] [${shortPalace(p[0])}] [${shortPalace(p[5])}]`;

  return `${chart.dunju}\n${geokStr}\n${grid}`;
}

function shortPalace(p: PalaceState): string {
  const tp = p.tianpan.charAt(0);
  const dp = p.dipan.charAt(0);
  const star = p.star.split("(")[0].replace("천", "");
  const gate = p.gate.split("(")[0].replace("문", "");
  if (p.palaceIndex === 4) return `${tp}/${dp}`;
  return `${tp}/${dp} ${star} ${gate}`;
}

// ── DivinationElement 배열 ───────────────────────────────

function buildElements(chart: QimenChart, geokguks: GeokgukResult[]) {
  const elements = [];

  elements.push({
    label: "둔갑국",
    value: chart.dunju,
    description: `절기: ${chart.solarTerm}, ${chart.isYangDun ? "양둔" : "음둔"} ${chart.yuanQi} ${chart.bureauNumber}국`,
  });

  // 각 궁의 핵심 정보
  for (const palace of chart.palaces) {
    if (palace.palaceIndex === 4) continue;
    elements.push({
      label: PALACE_NAMES[palace.palaceIndex],
      value: `${palace.tianpan}/${palace.dipan}`,
      description: `${palace.star} | ${palace.gate} | ${palace.spirit}`,
    });
  }

  // 격국
  for (const g of geokguks) {
    elements.push({
      label: g.type === "길" ? "길격" : "흉격",
      value: g.name,
      description: `${PALACE_NAMES[g.palace]} - ${g.description.slice(0, 50)}...`,
    });
  }

  return elements;
}

// ── 노드 생성 ────────────────────────────────────────────

function buildNodes(chart: QimenChart, geokguks: GeokgukResult[]): DivinationNode[] {
  const nodes: DivinationNode[] = [];

  // 구궁 노드
  for (const palace of chart.palaces) {
    nodes.push({
      id: `qimen-palace-${palace.palaceIndex}`,
      label: `${PALACE_NAMES[palace.palaceIndex]} (${PALACE_DIRECTIONS[palace.palaceIndex]})`,
      category: "palace",
    });
  }

  // 구성 노드 (중복 제거)
  const seenStars = new Set<string>();
  for (const palace of chart.palaces) {
    if (!seenStars.has(palace.star) && palace.star !== "—") {
      seenStars.add(palace.star);
      const nature = STAR_NATURES[palace.star];
      nodes.push({
        id: `qimen-star-${palace.starIdx}`,
        label: `${palace.star} [${nature?.nature ?? "중"}]`,
        category: "star",
      });
    }
  }

  // 팔문 노드
  const seenGates = new Set<string>();
  for (const palace of chart.palaces) {
    if (!seenGates.has(palace.gate) && palace.gate !== "—") {
      seenGates.add(palace.gate);
      const nature = GATE_NATURES[palace.gate];
      nodes.push({
        id: `qimen-gate-${palace.gateIdx}`,
        label: `${palace.gate} [${nature?.nature ?? "중"}]`,
        category: "gate",
      });
    }
  }

  // 팔신 노드
  const seenSpirits = new Set<string>();
  for (const palace of chart.palaces) {
    if (!seenSpirits.has(palace.spirit) && palace.spirit !== "—") {
      seenSpirits.add(palace.spirit);
      const nature = SPIRIT_NATURES[palace.spirit];
      nodes.push({
        id: `qimen-spirit-${palace.spiritIdx}`,
        label: `${palace.spirit} [${nature?.nature ?? "중"}]`,
        category: "spirit",
      });
    }
  }

  // 격국 노드
  for (let i = 0; i < geokguks.length; i++) {
    nodes.push({
      id: `qimen-geokguk-${i}`,
      label: `${geokguks[i].type === "길" ? "★" : "✕"} ${geokguks[i].name}`,
      category: "geokguk",
    });
  }

  return nodes;
}

// ── 엣지 생성 ────────────────────────────────────────────

function buildEdges(chart: QimenChart, geokguks: GeokgukResult[]): DivinationEdge[] {
  const edges: DivinationEdge[] = [];

  // 궁 내 구성/팔문/팔신 연결
  for (const palace of chart.palaces) {
    if (palace.palaceIndex === 4) continue;

    if (palace.star !== "—") {
      edges.push({
        source: `qimen-palace-${palace.palaceIndex}`,
        target: `qimen-star-${palace.starIdx}`,
        relation: "구성",
      });
    }
    if (palace.gate !== "—") {
      edges.push({
        source: `qimen-palace-${palace.palaceIndex}`,
        target: `qimen-gate-${palace.gateIdx}`,
        relation: "팔문",
      });
    }
    if (palace.spirit !== "—") {
      edges.push({
        source: `qimen-palace-${palace.palaceIndex}`,
        target: `qimen-spirit-${palace.spiritIdx}`,
        relation: "팔신",
      });
    }
  }

  // 격국 → 궁 연결
  for (let i = 0; i < geokguks.length; i++) {
    edges.push({
      source: `qimen-geokguk-${i}`,
      target: `qimen-palace-${geokguks[i].palace}`,
      relation: geokguks[i].type === "길" ? "길격" : "흉격",
    });
  }

  // 낙서 대각선 관계 (충궁)
  const opposites: [number, number][] = [[0, 8], [1, 7], [2, 6], [3, 5]];
  for (const [a, b] of opposites) {
    edges.push({
      source: `qimen-palace-${a}`,
      target: `qimen-palace-${b}`,
      relation: "충궁",
    });
  }

  // 인접궁 관계
  const adjacents: [number, number][] = [
    [0, 7], [0, 1], [7, 2], [2, 3], [3, 8], [8, 5], [5, 6], [6, 1],
  ];
  for (const [a, b] of adjacents) {
    edges.push({
      source: `qimen-palace-${a}`,
      target: `qimen-palace-${b}`,
      relation: "인접",
    });
  }

  return edges;
}
