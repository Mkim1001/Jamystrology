// ============================================================
// 바빌로니아 점성술 분석
// 행성 위치 판별, MUL.APIN 경로, 징조 해석
// ============================================================

import {
  BAB_PLANETS,
  PLANETARY_DEITIES,
  MUL_APIN_CONSTELLATIONS,
  BABYLONIAN_MONTHS,
  LUNAR_OMENS,
  PLANETARY_OMENS,
  DAY_OMENS,
  PATH_INFO,
  type BabPlanet,
  type MulApinConstellation,
  type BabylonianMonth,
  type LunarOmen,
  type PlanetaryOmen,
  type PathType,
} from "./data";

// ── 바빌로니아 월 판별 ──────────────────────────────────

export function getBabylonianMonth(month: number): BabylonianMonth {
  // 양력 → 바빌로니아 월 근사 매핑
  // 니산누(1월)은 춘분 무렵 시작 → 양력 3~4월
  const monthMapping: Record<number, number> = {
    1: 11,  // 1월 → 샤바투(11)
    2: 12,  // 2월 → 아다루(12)
    3: 1,   // 3월 → 니산누(1)
    4: 2,   // 4월 → 아야루(2)
    5: 3,   // 5월 → 시마누(3)
    6: 4,   // 6월 → 두우주(4)
    7: 5,   // 7월 → 아부(5)
    8: 6,   // 8월 → 울룰루(6)
    9: 7,   // 9월 → 타슈리투(7)
    10: 8,  // 10월 → 아라흐삼나(8)
    11: 9,  // 11월 → 키슬리무(9)
    12: 10, // 12월 → 테베투(10)
  };
  const babMonth = monthMapping[month] || 1;
  return BABYLONIAN_MONTHS[babMonth - 1];
}

// ── 달의 위상 판별 ──────────────────────────────────────

export function getLunarPhase(day: number): LunarOmen {
  // 음력 일 기반 위상 근사 (양력 일자로 간이 추정)
  // 실제로는 음력 변환이 필요하지만, 간이 공식 사용
  const lunarDay = ((day - 1) % 30) + 1;

  if (lunarDay <= 2) return LUNAR_OMENS[0]; // 신월
  if (lunarDay <= 7) return LUNAR_OMENS[1]; // 초승
  if (lunarDay <= 9) return LUNAR_OMENS[2]; // 상현
  if (lunarDay <= 13) return LUNAR_OMENS[3]; // 차오름
  if (lunarDay <= 16) return LUNAR_OMENS[4]; // 보름
  if (lunarDay <= 20) return LUNAR_OMENS[5]; // 기울어짐
  if (lunarDay <= 23) return LUNAR_OMENS[6]; // 하현
  return LUNAR_OMENS[7]; // 그믐
}

// ── MUL.APIN 별자리 판별 ────────────────────────────────

export function getActiveConstellations(babMonth: number): MulApinConstellation[] {
  return MUL_APIN_CONSTELLATIONS.filter(c => c.months.includes(babMonth));
}

export function getDominantPath(babMonth: number): PathType {
  const active = getActiveConstellations(babMonth);
  const pathCount: Record<PathType, number> = { enlil: 0, anu: 0, ea: 0 };
  for (const c of active) pathCount[c.path]++;

  let maxPath: PathType = "anu";
  let maxCount = 0;
  for (const [path, count] of Object.entries(pathCount)) {
    if (count > maxCount) {
      maxCount = count;
      maxPath = path as PathType;
    }
  }
  return maxPath;
}

// ── 행성 위치별 징조 ────────────────────────────────────
// 간이: 생월/일 기반으로 행성 위치를 근사

export interface PlanetaryPosition {
  planet: BabPlanet;
  strength: "강" | "보통" | "약";
  zodiacArea: string;
  omen: string;
}

export function getPlanetaryPositions(month: number, day: number): PlanetaryPosition[] {
  const positions: PlanetaryPosition[] = [];

  for (const planet of BAB_PLANETS) {
    const deity = PLANETARY_DEITIES[planet];
    // 행성의 활성도를 월/일 기반으로 판별
    const hash = (month * 31 + day + planet.charCodeAt(0)) % 100;
    const strength = hash > 66 ? "강" as const : hash > 33 ? "보통" as const : "약" as const;

    // 황도대 영역 판별
    const signIndex = (month + Math.floor(day / 3) + planet.length) % 12;
    const ZODIAC_AREAS = [
      "양자리 영역", "황소자리 영역", "쌍둥이자리 영역", "게자리 영역",
      "사자자리 영역", "처녀자리 영역", "천칭자리 영역", "전갈자리 영역",
      "사수자리 영역", "염소자리 영역", "물병자리 영역", "물고기자리 영역",
    ];
    const zodiacArea = ZODIAC_AREAS[signIndex];

    // 징조 해석 생성
    let omen: string;
    if (strength === "강") {
      omen = `${deity.korean}의 힘이 강하니, ${deity.domain.split(",")[0]}에 관한 일이 활발하다.`;
    } else if (strength === "보통") {
      omen = `${deity.korean}이 보통의 영향력을 발휘하니, ${deity.domain.split(",")[0]}은 안정적이다.`;
    } else {
      omen = `${deity.korean}의 빛이 약하니, ${deity.domain.split(",")[0]}에 관한 일에 주의가 필요하다.`;
    }

    positions.push({ planet, strength, zodiacArea, omen });
  }

  return positions;
}

// ── 행성 조합 징조 확인 ─────────────────────────────────

export function getActivePlanetaryOmens(positions: PlanetaryPosition[]): PlanetaryOmen[] {
  const active: PlanetaryOmen[] = [];

  for (const omen of PLANETARY_OMENS) {
    const p1 = positions.find(p => p.planet === omen.planets[0]);
    const p2 = positions.find(p => p.planet === omen.planets[1]);

    if (!p1 || !p2) continue;

    // 같은 영역이면 합, 180도 차이면 충, 나머지는 접근으로 간주
    if (omen.relationship === "conjunction" && p1.zodiacArea === p2.zodiacArea) {
      active.push(omen);
    } else if (omen.relationship === "approach" && (p1.strength === "강" || p2.strength === "강")) {
      active.push(omen);
    }
  }

  // 항상 최소 1-2개의 활성 징조가 있도록
  if (active.length === 0) {
    const strongPlanets = positions.filter(p => p.strength === "강");
    for (const sp of strongPlanets) {
      const relatedOmens = PLANETARY_OMENS.filter(o =>
        o.planets.includes(sp.planet) && o.relationship === "approach"
      );
      if (relatedOmens.length > 0) {
        active.push(relatedOmens[0]);
        break;
      }
    }
  }

  return active;
}

// ── 길일/흉일 판단 ──────────────────────────────────────

export function getDayOmen(day: number): { nature: "길" | "흉" | "중"; description: string } {
  for (const omen of DAY_OMENS) {
    if (omen.dayOfMonth.includes(day)) {
      return { nature: omen.nature, description: omen.description };
    }
  }
  return { nature: "중", description: "평범한 날. 특별한 길흉이 없다." };
}

// ── 종합 분석 구조 ──────────────────────────────────────

export interface BabylonianAnalysis {
  babMonth: BabylonianMonth;
  lunarPhase: LunarOmen;
  dominantPath: PathType;
  pathInfo: typeof PATH_INFO[PathType];
  activeConstellations: MulApinConstellation[];
  planetaryPositions: PlanetaryPosition[];
  activePlanetaryOmens: PlanetaryOmen[];
  dayOmen: { nature: "길" | "흉" | "중"; description: string };
  overallFortune: "대길" | "길" | "평" | "흉" | "대흉";
  overallDescription: string;
}

export function performAnalysis(year: number, month: number, day: number): BabylonianAnalysis {
  const babMonth = getBabylonianMonth(month);
  const lunarPhase = getLunarPhase(day);
  const dominantPath = getDominantPath(babMonth.number);
  const pathInfo = PATH_INFO[dominantPath];
  const activeConstellations = getActiveConstellations(babMonth.number);
  const planetaryPositions = getPlanetaryPositions(month, day);
  const activePlanetaryOmens = getActivePlanetaryOmens(planetaryPositions);
  const dayOmen = getDayOmen(day);

  // 종합 운세 판단
  let fortuneScore = 0;

  // 월 운
  if (babMonth.nature === "길") fortuneScore += 2;
  else if (babMonth.nature === "흉") fortuneScore -= 2;

  // 달 위상
  if (lunarPhase.nature === "길") fortuneScore += 2;
  else if (lunarPhase.nature === "흉") fortuneScore -= 2;

  // 일 길흉
  if (dayOmen.nature === "길") fortuneScore += 1;
  else if (dayOmen.nature === "흉") fortuneScore -= 1;

  // 행성 징조
  for (const omen of activePlanetaryOmens) {
    if (omen.nature === "길") fortuneScore += 1;
    else if (omen.nature === "흉") fortuneScore -= 1;
  }

  // 강한 행성 수
  const strongCount = planetaryPositions.filter(p => p.strength === "강").length;
  const weakCount = planetaryPositions.filter(p => p.strength === "약").length;
  fortuneScore += (strongCount - weakCount) * 0.5;

  let overallFortune: "대길" | "길" | "평" | "흉" | "대흉";
  if (fortuneScore >= 4) overallFortune = "대길";
  else if (fortuneScore >= 2) overallFortune = "길";
  else if (fortuneScore >= -1) overallFortune = "평";
  else if (fortuneScore >= -3) overallFortune = "흉";
  else overallFortune = "대흉";

  const overallDescription = buildOverallDescription(babMonth, lunarPhase, dominantPath, overallFortune, activePlanetaryOmens);

  return {
    babMonth, lunarPhase, dominantPath, pathInfo,
    activeConstellations, planetaryPositions,
    activePlanetaryOmens, dayOmen,
    overallFortune, overallDescription,
  };
}

function buildOverallDescription(
  babMonth: BabylonianMonth,
  lunarPhase: LunarOmen,
  dominantPath: PathType,
  fortune: string,
  omens: PlanetaryOmen[],
): string {
  const pathName = PATH_INFO[dominantPath].korean;
  const lines: string[] = [
    `바빌로니아 ${babMonth.korean}(${babMonth.name})의 때이다. ${babMonth.description}`,
    `달은 ${lunarPhase.korean} 상태이니, ${lunarPhase.meaning}`,
    `하늘의 별들은 ${pathName}이 우세하니, ${PATH_INFO[dominantPath].meaning.split(".")[0]}.`,
  ];

  if (omens.length > 0) {
    lines.push(`주요 천문 징조: ${omens.map(o => o.korean).join(", ")}.`);
    lines.push(omens[0].omen);
  }

  lines.push(`종합 판단: ${fortune}. 이 시기의 기운에 맞추어 행동하라.`);

  return lines.join("\n");
}
