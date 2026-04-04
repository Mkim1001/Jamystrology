// ============================================================
// 호라리 점성술 엔진 - 메인 진입점
// Traditional Horary Astrology with 7 planets
// ============================================================

import type { DivinationInput, DivinationResult, DivinationNode, DivinationEdge, DivinationElement } from "@/types/divination";
import {
  PLANET_NAMES,
  PLANET_SYMBOLS,
  SIGN_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
  SIGN_RULERS,
  HOUSE_NAMES,
  ASPECT_NAMES,
  ASPECT_NATURES,
  type Planet,
  type AspectInfo,
} from "./data";
import {
  buildChart,
  getPlanetHouse,
  type HoraryChart,
  type PlanetPosition,
} from "./chart";
import {
  interpret,
  type HoraryInterpretation,
  type PlanetDignityInfo,
} from "./analysis";

// ── 위치 파싱 ────────────────────────────────────────────

function parseLocation(place?: string): { lat: number; lon: number } {
  // 기본 서울
  if (!place) return { lat: 37.5665, lon: 126.978 };

  const lower = place.toLowerCase();
  const CITIES: Record<string, { lat: number; lon: number }> = {
    "서울": { lat: 37.5665, lon: 126.978 },
    "seoul": { lat: 37.5665, lon: 126.978 },
    "부산": { lat: 35.1796, lon: 129.0756 },
    "대구": { lat: 35.8714, lon: 128.6014 },
    "인천": { lat: 37.4563, lon: 126.7052 },
    "대전": { lat: 36.3504, lon: 127.3845 },
    "광주": { lat: 35.1595, lon: 126.8526 },
    "뉴욕": { lat: 40.7128, lon: -74.006 },
    "new york": { lat: 40.7128, lon: -74.006 },
    "도쿄": { lat: 35.6762, lon: 139.6503 },
    "tokyo": { lat: 35.6762, lon: 139.6503 },
    "런던": { lat: 51.5074, lon: -0.1278 },
    "london": { lat: 51.5074, lon: -0.1278 },
    "북경": { lat: 39.9042, lon: 116.4074 },
    "beijing": { lat: 39.9042, lon: 116.4074 },
  };

  for (const [key, coords] of Object.entries(CITIES)) {
    if (lower.includes(key)) return coords;
  }
  return { lat: 37.5665, lon: 126.978 };
}

// ── 시간 파싱 ────────────────────────────────────────────

const SIJIN_HOURS: Record<string, number> = {
  "자": 0, "축": 2, "인": 4, "묘": 6, "진": 8, "사": 10,
  "오": 12, "미": 14, "신": 16, "유": 18, "술": 20, "해": 22,
};

function parseTime(timeStr: string): { hour: number; minute: number } {
  if (SIJIN_HOURS[timeStr] !== undefined) {
    return { hour: SIJIN_HOURS[timeStr], minute: 0 };
  }
  const parts = timeStr.split(":");
  if (parts.length === 2) {
    return { hour: parseInt(parts[0], 10), minute: parseInt(parts[1], 10) };
  }
  return { hour: 12, minute: 0 };
}

// ── 메인 계산 ─────────────────────────────────────────────

export function calculate(input: DivinationInput): DivinationResult {
  // 호라리는 질문 시점을 사용하고, 없으면 생년월일 사용
  let year: number, month: number, day: number, hour: number, minute: number;
  let location: { lat: number; lon: number };

  if (input.horaryDatetime) {
    // 호라리 질문 시점 사용
    const dt = input.horaryDatetime;
    const datePart = dt.split("T")[0];
    const timePart = dt.split("T")[1] || "12:00";
    const [y, m, d] = datePart.split("-").map(Number);
    const [h, min] = timePart.split(":").map(Number);
    year = y; month = m; day = d; hour = h; minute = min;
    location = parseLocation(input.horaryLocation || input.birthPlace);
  } else {
    // 생년월일 사용
    const [y, m, d] = input.birthDate.split("-").map(Number);
    const time = parseTime(input.birthTime);
    year = y; month = m; day = d; hour = time.hour; minute = time.minute;
    location = parseLocation(input.birthPlace);
  }

  // 차트 생성
  const chart = buildChart(year, month, day, hour, minute, location.lat, location.lon);

  // 해석 수행
  const interp = interpret(chart);

  // 결과 조립
  const summary = buildSummary(chart, interp);
  const elements = buildElements(chart, interp);
  const nodes = buildNodes(chart, interp);
  const edges = buildEdges(chart, interp);

  return {
    system: "호라리 점성술",
    summary,
    details: {
      chart: {
        datetime: chart.datetime,
        latitude: chart.latitude,
        longitude: chart.longitude,
        asc: chart.asc,
        ascSign: chart.ascSign,
        ascSignName: SIGN_NAMES[chart.ascSign],
        mc: chart.mc,
        cusps: chart.cusps.map((c, i) => ({
          house: i + 1,
          degree: c,
          sign: Math.floor(c / 30),
          signName: SIGN_NAMES[Math.floor(c / 30)],
        })),
        isDaytime: chart.isDaytime,
        planetaryHour: chart.planetaryHour,
        planetaryHourName: PLANET_NAMES[chart.planetaryHour],
      },
      planets: chart.planets.map(p => ({
        ...p,
        name: PLANET_NAMES[p.planet],
        symbol: PLANET_SYMBOLS[p.planet],
        signName: SIGN_NAMES[p.sign],
        signSymbol: SIGN_SYMBOLS[p.sign],
        house: getPlanetHouse(p.longitude, chart.cusps) + 1,
      })),
      significators: {
        querent: PLANET_NAMES[interp.significators.querent],
        querentPlanet: interp.significators.querent,
        quesited: PLANET_NAMES[interp.significators.quesited],
        quesitedPlanet: interp.significators.quesited,
        quesitedHouse: interp.significators.quesitedHouse + 1,
        moonCoSig: interp.significators.moonCoSig,
      },
      dignities: interp.dignities.map(d => ({
        planet: d.planet,
        name: PLANET_NAMES[d.planet],
        sign: d.sign,
        signName: SIGN_NAMES[d.sign],
        degree: d.degree,
        house: d.house + 1,
        score: d.dignity.score,
        domicile: d.dignity.domicile,
        exaltation: d.dignity.exaltation,
        detriment: d.dignity.detriment,
        fall: d.dignity.fall,
        retrograde: d.retrograde,
        description: d.description,
      })),
      aspects: chart.aspects.map(a => ({
        ...a,
        planet1Name: PLANET_NAMES[a.planet1],
        planet2Name: PLANET_NAMES[a.planet2],
        typeName: ASPECT_NAMES[a.type],
        nature: ASPECT_NATURES[a.type],
      })),
      moon: interp.moonAnalysis,
      receptions: interp.receptions,
      judgment: interp.judgment,
      horaryQuestion: input.horaryQuestion || null,
    },
    elements,
    nodes,
    edges,
  };
}

// ── 요약 텍스트 ──────────────────────────────────────────

function buildSummary(chart: HoraryChart, interp: HoraryInterpretation): string {
  const j = interp.judgment;
  const ascName = SIGN_NAMES[chart.ascSign];
  const querent = PLANET_NAMES[interp.significators.querent];
  const quesited = PLANET_NAMES[interp.significators.quesited];
  const moon = interp.moonAnalysis;

  return (
    `ASC: ${ascName} ${SIGN_SYMBOLS[chart.ascSign]} | Planetary Hour: ${PLANET_NAMES[chart.planetaryHour]}\n` +
    `질문자(${querent}) → 대상(${quesited}) | ${HOUSE_NAMES[interp.significators.quesitedHouse]}\n` +
    `달: ${SIGN_NAMES[moon.sign]} ${moon.degree}° | ${moon.voidOfCourse ? "VOC(보이드)" : "활성"}\n` +
    `판단: ${j.overallAnswer} (확신도 ${j.confidence}%) | ${j.perfectionType}`
  );
}

// ── DivinationElement 배열 ───────────────────────────────

function buildElements(chart: HoraryChart, interp: HoraryInterpretation): DivinationElement[] {
  const elements: DivinationElement[] = [];

  // ASC
  elements.push({
    label: "ASC (상승점)",
    value: `${SIGN_NAMES[chart.ascSign]} ${SIGN_SYMBOLS[chart.ascSign]} ${Math.floor(chart.asc % 30)}°`,
    description: `질문 차트의 상승점. 1하우스 룰러: ${PLANET_NAMES[SIGN_RULERS[chart.ascSign]]}`,
  });

  // Planetary Hour
  elements.push({
    label: "Planetary Hour",
    value: `${PLANET_NAMES[chart.planetaryHour]} ${PLANET_SYMBOLS[chart.planetaryHour]}`,
    description: `질문 시점의 행성 시간. ${chart.isDaytime ? "주간(Daytime)" : "야간(Nighttime)"} 차트`,
  });

  // 시그니피케이터
  elements.push({
    label: "질문자 시그니피케이터",
    value: `${PLANET_NAMES[interp.significators.querent]} ${PLANET_SYMBOLS[interp.significators.querent]}`,
    description: `1하우스(${SIGN_NAMES[chart.ascSign]}) 룰러. 질문자의 상태와 의향을 나타냄`,
  });

  elements.push({
    label: "대상 시그니피케이터",
    value: `${PLANET_NAMES[interp.significators.quesited]} ${PLANET_SYMBOLS[interp.significators.quesited]}`,
    description: `${HOUSE_NAMES[interp.significators.quesitedHouse]} 룰러. 질문 대상의 상태를 나타냄`,
  });

  // 행성 위치
  for (const p of chart.planets) {
    const house = getPlanetHouse(p.longitude, chart.cusps);
    const dig = interp.dignities.find(d => d.planet === p.planet);
    elements.push({
      label: `${PLANET_NAMES[p.planet]} ${PLANET_SYMBOLS[p.planet]}`,
      value: `${SIGN_NAMES[p.sign]} ${p.degree}°${p.minute}' ${p.retrograde ? "(R)" : ""}`,
      description: `${HOUSE_NAMES[house]} | 디그니티: ${dig?.dignity.score ?? 0}점 | ${dig?.description ?? ""}`,
    });
  }

  // 달 분석
  elements.push({
    label: "달(Moon) 분석",
    value: `${interp.moonAnalysis.voidOfCourse ? "Void of Course ⚠" : "활성"} | ${interp.moonAnalysis.viaCombusta ? "Via Combusta ⚠" : "정상"}`,
    description: interp.moonAnalysis.description,
  });

  // 주요 어스펙트
  const importantAspects = chart.aspects.filter(a => a.applying).slice(0, 5);
  for (const asp of importantAspects) {
    elements.push({
      label: `${PLANET_SYMBOLS[asp.planet1]}-${PLANET_SYMBOLS[asp.planet2]} ${ASPECT_NAMES[asp.type]}`,
      value: `${asp.applying ? "접근(Applying)" : "분리(Separating)"} | orb ${asp.orb}°`,
      description: `${PLANET_NAMES[asp.planet1]}과 ${PLANET_NAMES[asp.planet2]}의 ${ASPECT_NAMES[asp.type]}. ${ASPECT_NATURES[asp.type] === "harmonious" ? "조화로운" : ASPECT_NATURES[asp.type] === "tense" ? "긴장" : "중립"} 관계`,
    });
  }

  // 최종 판단
  elements.push({
    label: "최종 판단",
    value: `${interp.judgment.overallAnswer} (확신도 ${interp.judgment.confidence}%)`,
    description: interp.judgment.reasoning.join(" | "),
  });

  return elements;
}

// ── 노드 생성 ────────────────────────────────────────────

function buildNodes(chart: HoraryChart, interp: HoraryInterpretation): DivinationNode[] {
  const nodes: DivinationNode[] = [];

  // ASC 노드
  nodes.push({
    id: "horary-asc",
    label: `ASC: ${SIGN_NAMES[chart.ascSign]} ${SIGN_SYMBOLS[chart.ascSign]}`,
    category: "house",
  });

  // 12하우스 노드
  for (let i = 0; i < 12; i++) {
    const cuspSign = Math.floor(chart.cusps[i] / 30);
    nodes.push({
      id: `horary-house-${i + 1}`,
      label: `${i + 1}H: ${SIGN_NAMES[cuspSign]} ${SIGN_SYMBOLS[cuspSign]}`,
      category: "house",
    });
  }

  // 행성 노드
  for (const p of chart.planets) {
    const dig = interp.dignities.find(d => d.planet === p.planet);
    nodes.push({
      id: `horary-${p.planet}`,
      label: `${PLANET_SYMBOLS[p.planet]} ${PLANET_NAMES[p.planet]} ${SIGN_SYMBOLS[p.sign]}${p.degree}°${p.retrograde ? "R" : ""}`,
      category: "planet",
    });
  }

  // 판단 노드
  nodes.push({
    id: "horary-judgment",
    label: `판단: ${interp.judgment.overallAnswer} (${interp.judgment.confidence}%)`,
    category: "judgment",
  });

  return nodes;
}

// ── 엣지 생성 ────────────────────────────────────────────

function buildEdges(chart: HoraryChart, interp: HoraryInterpretation): DivinationEdge[] {
  const edges: DivinationEdge[] = [];

  // 행성 → 하우스 (rulership)
  for (const p of chart.planets) {
    const house = getPlanetHouse(p.longitude, chart.cusps);
    edges.push({
      source: `horary-${p.planet}`,
      target: `horary-house-${house + 1}`,
      relation: "위치",
    });
  }

  // ASC → 1하우스
  edges.push({ source: "horary-asc", target: "horary-house-1", relation: "상승점" });

  // 사인 룰러십
  for (let i = 0; i < 12; i++) {
    const cuspSign = Math.floor(chart.cusps[i] / 30);
    const ruler = SIGN_RULERS[cuspSign];
    edges.push({
      source: `horary-${ruler}`,
      target: `horary-house-${i + 1}`,
      relation: "지배(Rulership)",
    });
  }

  // 어스펙트 엣지
  for (const asp of chart.aspects) {
    const nature = ASPECT_NATURES[asp.type];
    const label = `${ASPECT_NAMES[asp.type]} ${asp.applying ? "접근" : "분리"} (${asp.orb}°)`;
    edges.push({
      source: `horary-${asp.planet1}`,
      target: `horary-${asp.planet2}`,
      relation: label,
    });
  }

  // 시그니피케이터 → 판단
  edges.push({
    source: `horary-${interp.significators.querent}`,
    target: "horary-judgment",
    relation: "질문자",
  });
  edges.push({
    source: `horary-${interp.significators.quesited}`,
    target: "horary-judgment",
    relation: "대상",
  });

  // 리셉션 엣지
  for (const rec of interp.receptions) {
    if (rec.type === "mutual") {
      edges.push({
        source: `horary-${rec.planet1}`,
        target: `horary-${rec.planet2}`,
        relation: "상호리셉션(Mutual Reception)",
      });
    }
  }

  return edges;
}
