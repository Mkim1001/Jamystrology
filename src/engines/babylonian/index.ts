// ============================================================
// 바빌로니아 점성술 엔진 - 메인 진입점
// MUL.APIN + Enuma Anu Enlil + 행성신 체계
// ============================================================

import type { DivinationInput, DivinationResult, DivinationNode, DivinationEdge, DivinationElement } from "@/types/divination";
import {
  PLANETARY_DEITIES,
  PATH_INFO,
  type BabPlanet,
  type PathType,
} from "./data";
import {
  performAnalysis,
  type BabylonianAnalysis,
} from "./analysis";

// ── 메인 계산 ─────────────────────────────────────────────

export function calculate(input: DivinationInput): DivinationResult {
  const [yearStr, monthStr, dayStr] = input.birthDate.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const analysis = performAnalysis(year, month, day);

  const summary = buildSummary(analysis);
  const elements = buildElements(analysis);
  const nodes = buildNodes(analysis);
  const edges = buildEdges(analysis);

  return {
    system: "바빌로니아 점성술",
    summary,
    details: {
      babMonth: {
        number: analysis.babMonth.number,
        name: analysis.babMonth.name,
        korean: analysis.babMonth.korean,
        patron: analysis.babMonth.patron ? PLANETARY_DEITIES[analysis.babMonth.patron].korean : null,
        nature: analysis.babMonth.nature,
        description: analysis.babMonth.description,
      },
      lunarPhase: {
        phase: analysis.lunarPhase.phase,
        korean: analysis.lunarPhase.korean,
        nature: analysis.lunarPhase.nature,
        meaning: analysis.lunarPhase.meaning,
      },
      path: {
        type: analysis.dominantPath,
        name: analysis.pathInfo.name,
        korean: analysis.pathInfo.korean,
        direction: analysis.pathInfo.direction,
        element: analysis.pathInfo.element,
        meaning: analysis.pathInfo.meaning,
      },
      constellations: analysis.activeConstellations.map(c => ({
        name: c.name,
        babylonian: c.babylonian,
        korean: c.korean,
        path: c.path,
        modernEquiv: c.modernEquiv,
        deity: c.deity ? PLANETARY_DEITIES[c.deity].korean : null,
        meaning: c.meaning,
      })),
      planets: analysis.planetaryPositions.map(p => ({
        planet: p.planet,
        name: PLANETARY_DEITIES[p.planet].korean,
        sumerian: PLANETARY_DEITIES[p.planet].sumerian,
        celestialBody: PLANETARY_DEITIES[p.planet].celestialBody,
        element: PLANETARY_DEITIES[p.planet].element,
        strength: p.strength,
        zodiacArea: p.zodiacArea,
        omen: p.omen,
        nature: PLANETARY_DEITIES[p.planet].nature,
      })),
      planetaryOmens: analysis.activePlanetaryOmens.map(o => ({
        planets: o.planets,
        korean: o.korean,
        relationship: o.relationship,
        omen: o.omen,
        nature: o.nature,
      })),
      dayOmen: analysis.dayOmen,
      overallFortune: analysis.overallFortune,
      overallDescription: analysis.overallDescription,
    },
    elements,
    nodes,
    edges,
  };
}

// ── 요약 텍스트 ──────────────────────────────────────────

function buildSummary(a: BabylonianAnalysis): string {
  return (
    `바빌로니아 월: ${a.babMonth.korean}(${a.babMonth.name}) [${a.babMonth.nature}]\n` +
    `달의 위상: ${a.lunarPhase.korean} [${a.lunarPhase.nature}]\n` +
    `우세 경로: ${a.pathInfo.korean}(${a.pathInfo.name})\n` +
    `일 길흉: ${a.dayOmen.nature} | 종합: ${a.overallFortune}`
  );
}

// ── DivinationElement 배열 ───────────────────────────────

function buildElements(a: BabylonianAnalysis): DivinationElement[] {
  const elements: DivinationElement[] = [];

  // 바빌로니아 월
  elements.push({
    label: "바빌로니아 월",
    value: `${a.babMonth.korean}(${a.babMonth.name}) [${a.babMonth.nature}]`,
    description: a.babMonth.description,
  });

  // 달의 위상
  elements.push({
    label: "달의 위상",
    value: `${a.lunarPhase.korean} [${a.lunarPhase.nature}]`,
    description: a.lunarPhase.meaning,
  });

  // MUL.APIN 경로
  elements.push({
    label: "MUL.APIN 경로",
    value: `${a.pathInfo.korean}(${a.pathInfo.name})`,
    description: `${a.pathInfo.direction} — ${a.pathInfo.meaning}`,
  });

  // 활성 별자리
  for (const c of a.activeConstellations.slice(0, 4)) {
    elements.push({
      label: `별자리: ${c.korean}`,
      value: `${c.name} (${c.babylonian})`,
      description: `${c.path} 경로 | ${c.modernEquiv} | ${c.meaning}`,
    });
  }

  // 행성신 위치
  for (const p of a.planetaryPositions) {
    const deity = PLANETARY_DEITIES[p.planet];
    elements.push({
      label: `${deity.korean}`,
      value: `${p.zodiacArea} | 힘: ${p.strength} [${deity.nature}]`,
      description: p.omen,
    });
  }

  // 행성 조합 징조
  for (const o of a.activePlanetaryOmens) {
    elements.push({
      label: `징조: ${o.korean}`,
      value: `[${o.nature}] ${o.relationship}`,
      description: o.omen,
    });
  }

  // 일 길흉
  elements.push({
    label: "일 길흉",
    value: a.dayOmen.nature,
    description: a.dayOmen.description,
  });

  // 종합
  elements.push({
    label: "종합 판단",
    value: a.overallFortune,
    description: a.overallDescription.split("\n").slice(-1)[0],
  });

  return elements;
}

// ── 노드 생성 ────────────────────────────────────────────

function buildNodes(a: BabylonianAnalysis): DivinationNode[] {
  const nodes: DivinationNode[] = [];

  // 3대 경로 노드
  for (const [path, info] of Object.entries(PATH_INFO)) {
    nodes.push({
      id: `bab-path-${path}`,
      label: `${info.korean}(${info.name})`,
      category: "path",
    });
  }

  // 행성신 노드
  for (const p of a.planetaryPositions) {
    const deity = PLANETARY_DEITIES[p.planet];
    nodes.push({
      id: `bab-${p.planet}`,
      label: `${deity.korean} [${p.strength}]`,
      category: "planet",
    });
  }

  // 활성 별자리 노드
  for (const c of a.activeConstellations) {
    nodes.push({
      id: `bab-const-${c.name}`,
      label: `${c.korean}(${c.babylonian})`,
      category: "constellation",
    });
  }

  // 달의 위상 노드
  nodes.push({
    id: "bab-lunar",
    label: `${a.lunarPhase.korean} [${a.lunarPhase.nature}]`,
    category: "omen",
  });

  // 징조 노드
  for (let i = 0; i < a.activePlanetaryOmens.length; i++) {
    const o = a.activePlanetaryOmens[i];
    nodes.push({
      id: `bab-omen-${i}`,
      label: `${o.korean} [${o.nature}]`,
      category: "omen",
    });
  }

  // 바빌로니아 월 노드
  nodes.push({
    id: "bab-month",
    label: `${a.babMonth.korean}(${a.babMonth.name}) [${a.babMonth.nature}]`,
    category: "time",
  });

  return nodes;
}

// ── 엣지 생성 ────────────────────────────────────────────

function buildEdges(a: BabylonianAnalysis): DivinationEdge[] {
  const edges: DivinationEdge[] = [];

  // 별자리 → 경로 연결
  for (const c of a.activeConstellations) {
    edges.push({
      source: `bab-const-${c.name}`,
      target: `bab-path-${c.path}`,
      relation: "소속 경로",
    });

    // 별자리 → 관련 행성신
    if (c.deity) {
      edges.push({
        source: `bab-const-${c.name}`,
        target: `bab-${c.deity}`,
        relation: "수호 신격",
      });
    }
  }

  // 행성 징조 엣지
  for (let i = 0; i < a.activePlanetaryOmens.length; i++) {
    const o = a.activePlanetaryOmens[i];
    edges.push({
      source: `bab-${o.planets[0]}`,
      target: `bab-omen-${i}`,
      relation: o.relationship,
    });
    edges.push({
      source: `bab-${o.planets[1]}`,
      target: `bab-omen-${i}`,
      relation: o.relationship,
    });
  }

  // 달 → Sin 연결
  edges.push({
    source: "bab-lunar",
    target: "bab-sin",
    relation: "달의 신격",
  });

  // 월 → 수호 행성신 연결
  if (a.babMonth.patron) {
    edges.push({
      source: "bab-month",
      target: `bab-${a.babMonth.patron}`,
      relation: "월 수호",
    });
  }

  // 경로 간 연결
  edges.push({ source: "bab-path-enlil", target: "bab-path-anu", relation: "인접 경로" });
  edges.push({ source: "bab-path-anu", target: "bab-path-ea", relation: "인접 경로" });

  // 행성 간 관계 (주요 관계만)
  const relations: [BabPlanet, BabPlanet, string][] = [
    ["shamash", "sin", "태양-달(주야)"],
    ["marduk", "nabu", "부자(父子)"],
    ["ishtar", "nergal", "사랑-전쟁"],
    ["marduk", "ninurta", "확장-제한"],
  ];
  for (const [p1, p2, rel] of relations) {
    edges.push({
      source: `bab-${p1}`,
      target: `bab-${p2}`,
      relation: rel,
    });
  }

  return edges;
}
