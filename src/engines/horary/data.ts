// ============================================================
// 호라리 점성술 정적 데이터
// 행성, 사인, 하우스, 디그니티, 어스펙트 정의
// ============================================================

// ── 황도 12궁 (Zodiac Signs) ─────────────────────────────

export interface ZodiacSign {
  name: string;
  symbol: string;
  element: "fire" | "earth" | "air" | "water";
  quality: "cardinal" | "fixed" | "mutable";
  ruler: Planet;
  degree: number; // 시작 경도 (0=Aries 0°)
}

export type Planet = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn";

export const PLANETS: Planet[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];

export const PLANET_NAMES: Record<Planet, string> = {
  sun: "태양(Sun)", moon: "달(Moon)", mercury: "수성(Mercury)",
  venus: "금성(Venus)", mars: "화성(Mars)", jupiter: "목성(Jupiter)", saturn: "토성(Saturn)",
};

export const PLANET_SYMBOLS: Record<Planet, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂", jupiter: "♃", saturn: "♄",
};

// 행성 평균 일일 이동속도 (도)
export const PLANET_SPEED: Record<Planet, number> = {
  sun: 0.9856, moon: 13.176, mercury: 1.383, venus: 1.2,
  mars: 0.524, jupiter: 0.0831, saturn: 0.0335,
};

export const SIGN_NAMES: string[] = [
  "양자리(Aries)", "황소자리(Taurus)", "쌍둥이자리(Gemini)", "게자리(Cancer)",
  "사자자리(Leo)", "처녀자리(Virgo)", "천칭자리(Libra)", "전갈자리(Scorpio)",
  "사수자리(Sagittarius)", "염소자리(Capricorn)", "물병자리(Aquarius)", "물고기자리(Pisces)",
];

export const SIGN_SYMBOLS: string[] = [
  "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓",
];

export const SIGN_ELEMENTS: ("fire" | "earth" | "air" | "water")[] = [
  "fire", "earth", "air", "water",   // Ari Tau Gem Can
  "fire", "earth", "air", "water",   // Leo Vir Lib Sco
  "fire", "earth", "air", "water",   // Sag Cap Aqu Pis
];

export const SIGN_QUALITIES: ("cardinal" | "fixed" | "mutable")[] = [
  "cardinal", "fixed", "mutable", "cardinal",  // Ari Tau Gem Can
  "fixed", "mutable", "cardinal", "fixed",      // Leo Vir Lib Sco
  "mutable", "cardinal", "fixed", "mutable",    // Sag Cap Aqu Pis
];

// 각 사인의 룰러 (traditional rulers)
export const SIGN_RULERS: Planet[] = [
  "mars",    // Aries
  "venus",   // Taurus
  "mercury", // Gemini
  "moon",    // Cancer
  "sun",     // Leo
  "mercury", // Virgo
  "venus",   // Libra
  "mars",    // Scorpio
  "jupiter", // Sagittarius
  "saturn",  // Capricorn
  "saturn",  // Aquarius
  "jupiter", // Pisces
];

// ── Essential Dignities ──────────────────────────────────

// Domicile (본위): 위 SIGN_RULERS와 동일
// Detriment (손상): 반대 사인의 룰러
export const DETRIMENT: Record<Planet, number[]> = {
  sun: [10],          // Aquarius
  moon: [9],          // Capricorn
  mercury: [8, 11],   // Sagittarius, Pisces
  venus: [0, 7],      // Aries, Scorpio
  mars: [1, 6],       // Taurus, Libra
  jupiter: [2, 5],    // Gemini, Virgo
  saturn: [3, 4],     // Cancer, Leo
};

// Exaltation (승격)
export const EXALTATION: Record<Planet, { sign: number; degree: number }> = {
  sun: { sign: 0, degree: 19 },     // Aries 19°
  moon: { sign: 1, degree: 3 },     // Taurus 3°
  mercury: { sign: 5, degree: 15 }, // Virgo 15°
  venus: { sign: 11, degree: 27 },  // Pisces 27°
  mars: { sign: 9, degree: 28 },    // Capricorn 28°
  jupiter: { sign: 3, degree: 15 }, // Cancer 15°
  saturn: { sign: 6, degree: 21 },  // Libra 21°
};

// Fall (실추): Exaltation의 반대 사인
export const FALL: Record<Planet, number> = {
  sun: 6,      // Libra
  moon: 7,     // Scorpio
  mercury: 11, // Pisces
  venus: 5,    // Virgo
  mars: 3,     // Cancer
  jupiter: 9,  // Capricorn
  saturn: 0,   // Aries
};

// Triplicity rulers (삼구 지배성) - Day rulers
export const TRIPLICITY_DAY: Record<string, Planet> = {
  fire: "sun", earth: "venus", air: "saturn", water: "mars",
};
export const TRIPLICITY_NIGHT: Record<string, Planet> = {
  fire: "jupiter", earth: "moon", air: "mercury", water: "mars",
};

// Term (Egyptian terms) - 각 사인 30도 내 구간별 지배 행성
// [행성, 시작도, 끝도] - 간소화된 이집트식 텀
export const TERMS: [Planet, number, number][][] = [
  // Aries
  [["jupiter", 0, 6], ["venus", 6, 12], ["mercury", 12, 20], ["mars", 20, 25], ["saturn", 25, 30]],
  // Taurus
  [["venus", 0, 8], ["mercury", 8, 14], ["jupiter", 14, 22], ["saturn", 22, 27], ["mars", 27, 30]],
  // Gemini
  [["mercury", 0, 6], ["jupiter", 6, 12], ["venus", 12, 17], ["mars", 17, 24], ["saturn", 24, 30]],
  // Cancer
  [["mars", 0, 7], ["venus", 7, 13], ["mercury", 13, 19], ["jupiter", 19, 26], ["saturn", 26, 30]],
  // Leo
  [["jupiter", 0, 6], ["venus", 6, 11], ["saturn", 11, 18], ["mercury", 18, 24], ["mars", 24, 30]],
  // Virgo
  [["mercury", 0, 7], ["venus", 7, 17], ["jupiter", 17, 21], ["mars", 21, 28], ["saturn", 28, 30]],
  // Libra
  [["saturn", 0, 6], ["mercury", 6, 14], ["jupiter", 14, 21], ["venus", 21, 28], ["mars", 28, 30]],
  // Scorpio
  [["mars", 0, 7], ["venus", 7, 11], ["mercury", 11, 19], ["jupiter", 19, 24], ["saturn", 24, 30]],
  // Sagittarius
  [["jupiter", 0, 12], ["venus", 12, 17], ["mercury", 17, 21], ["saturn", 21, 26], ["mars", 26, 30]],
  // Capricorn
  [["mercury", 0, 7], ["jupiter", 7, 14], ["venus", 14, 22], ["saturn", 22, 26], ["mars", 26, 30]],
  // Aquarius
  [["mercury", 0, 7], ["venus", 7, 13], ["jupiter", 13, 20], ["mars", 20, 25], ["saturn", 25, 30]],
  // Pisces
  [["venus", 0, 12], ["jupiter", 12, 16], ["mercury", 16, 19], ["mars", 19, 28], ["saturn", 28, 30]],
];

// Face (Decan) - 각 사인 10도 구간별 지배 행성 (칼데안 순서)
// 칼데안 순서: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon (반복)
const CHALDEAN_ORDER: Planet[] = ["mars", "sun", "venus", "mercury", "moon", "saturn", "jupiter"];
export function getFaceRuler(sign: number, degree: number): Planet {
  const decanIndex = Math.floor(degree / 10);
  const totalDecan = sign * 3 + decanIndex;
  return CHALDEAN_ORDER[totalDecan % 7];
}

// ── 디그니티 점수 ────────────────────────────────────────

export interface DignityScore {
  domicile: boolean;
  exaltation: boolean;
  triplicity: boolean;
  term: boolean;
  face: boolean;
  detriment: boolean;
  fall: boolean;
  score: number; // Lilly 점수: +5 dom, +4 exalt, +3 trip, +2 term, +1 face, -5 det, -4 fall
}

export function calculateDignity(planet: Planet, sign: number, degree: number, isDaytime: boolean): DignityScore {
  const domicile = SIGN_RULERS[sign] === planet;
  const exaltation = EXALTATION[planet].sign === sign;
  const element = SIGN_ELEMENTS[sign];
  const triplicity = isDaytime
    ? TRIPLICITY_DAY[element] === planet
    : TRIPLICITY_NIGHT[element] === planet;

  let term = false;
  for (const [p, start, end] of TERMS[sign]) {
    if (p === planet && degree >= start && degree < end) {
      term = true;
      break;
    }
  }

  const face = getFaceRuler(sign, degree) === planet;
  const detriment = DETRIMENT[planet].includes(sign);
  const fall = FALL[planet] === sign;

  let score = 0;
  if (domicile) score += 5;
  if (exaltation) score += 4;
  if (triplicity) score += 3;
  if (term) score += 2;
  if (face) score += 1;
  if (detriment) score -= 5;
  if (fall) score -= 4;

  return { domicile, exaltation, triplicity, term, face, detriment, fall, score };
}

// ── 어스펙트 ─────────────────────────────────────────────

export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180,
};

export const ASPECT_NAMES: Record<AspectType, string> = {
  conjunction: "합(Conjunction)", sextile: "육합(Sextile)",
  square: "사각(Square)", trine: "삼합(Trine)", opposition: "충(Opposition)",
};

export const ASPECT_NATURES: Record<AspectType, "harmonious" | "tense" | "neutral"> = {
  conjunction: "neutral", sextile: "harmonious",
  square: "tense", trine: "harmonious", opposition: "tense",
};

// 어스펙트 오브 (허용 범위) - Lilly 기준
export const PLANET_ORBS: Record<Planet, number> = {
  sun: 15, moon: 12, mercury: 7, venus: 7, mars: 7.5, jupiter: 9, saturn: 9,
};

export interface AspectInfo {
  planet1: Planet;
  planet2: Planet;
  type: AspectType;
  orb: number;        // 실제 오브 (도)
  applying: boolean;  // true=접근, false=분리
  exact: boolean;     // 오브 1도 이내
}

// ── 하우스 ───────────────────────────────────────────────

export const HOUSE_NAMES: string[] = [
  "1하우스(자아/질문자)", "2하우스(재물)", "3하우스(소통/형제)",
  "4하우스(가정/부동산)", "5하우스(연애/자녀/창작)", "6하우스(건강/봉사)",
  "7하우스(파트너/상대방)", "8하우스(변환/타인의 재물)", "9하우스(여행/학문/법)",
  "10하우스(직업/명예)", "11하우스(소망/사교)", "12하우스(숨겨진 것/영적)",
];

// 질문 주제 → 관련 하우스 매핑
export const QUESTION_HOUSES: Record<string, number[]> = {
  "자아": [0], "건강": [0, 5], "재물": [1], "직업": [9], "연애": [4, 6],
  "결혼": [6], "사업": [9, 1], "학업": [8], "여행": [8], "소송": [6],
  "부동산": [3], "가족": [3], "자녀": [4], "친구": [10], "숨겨진": [11],
};

// ── Planetary Hour ───────────────────────────────────────
// 칼데안 순서로 각 시간 지배 행성 결정
// Day 1 (Sunday) 첫 시간 = Sun, Day 2 (Monday) = Moon, ...
export const DAY_RULERS: Planet[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
export const HOUR_SEQUENCE: Planet[] = ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"];

// ── Via Combusta ─────────────────────────────────────────
// 전갈자리 15° ~ 전갈자리 끝 (고전적으로는 천칭 15° ~ 전갈 15°)
export const VIA_COMBUSTA_START = 195; // Libra 15° (= 6*30 + 15)
export const VIA_COMBUSTA_END = 225;   // Scorpio 15° (= 7*30 + 15)
