// ============================================================
// 자미두수 명반(命盤) 구성 - 궁위, 성요 배치
// ============================================================

import type { Element } from "../saju/data";
import {
  PALACE_NAMES,
  BRANCHES,
  MAIN_STAR_NAMES,
  BRIGHTNESS,
  ZIWEI_SERIES_OFFSETS,
  TIANFU_SERIES_OFFSETS,
  LUCUN_BY_STEM,
  TIANKUI_BY_STEM,
  TIANYUE_BY_STEM,
  getTianmaPosition,
  HUOXING_BASE,
  LINGXING_BASE,
  NAYIN_ELEMENTS,
  ELEMENT_TO_BUREAU,
} from "./data";

// ── 타입 ───────────────────────────────────────────────────
export interface StarInfo {
  name: string;
  brightness: string; // 묘/왕/평/함
  series: "자미계" | "천부계" | "보성" | "잡성";
}

export interface PalaceInfo {
  index: number;           // 궁 인덱스 (0=명궁 ~ 11=부모궁)
  name: string;            // 궁 이름
  branch: number;          // 지지 위치 (0=子 ~ 11=亥)
  stem: number;            // 천간
  stars: StarInfo[];       // 배치된 성요
  transformations: string[]; // 사화 (화록/화권/화과/화기)
  isBodyPalace: boolean;   // 신궁 여부
}

export interface ChartInfo {
  palaces: PalaceInfo[];
  mingGongBranch: number;   // 명궁 지지
  shenGongBranch: number;   // 신궁 지지
  bureau: number;           // 오행국 (2-6)
  bureauName: string;
  ziweiPosition: number;    // 자미성 위치
  tianfuPosition: number;   // 천부성 위치
  yearStem: number;
  yearBranch: number;
  lunarMonth: number;
  lunarDay: number;
  birthHourIndex: number;
}

// ── 60갑자 위치 ──────────────────────────────────────────
function getSexagenaryPosition(stem: number, branch: number): number {
  for (let p = 0; p < 60; p++) {
    if (p % 10 === stem && p % 12 === branch) return p;
  }
  return 0;
}

// ── 궁 천간 산출 (년간 기준) ────────────────────────────
function getPalaceStem(yearStem: number, branchPosition: number): number {
  const stemBase = ((yearStem % 5) * 2 + 2) % 10;
  return (stemBase + ((branchPosition - 2 + 12) % 12)) % 10;
}

// ── 명궁/신궁 위치 산출 ────────────────────────────────
export function getMingGongPosition(lunarMonth: number, birthHourIndex: number): number {
  // 명궁 = 寅(2) + 월 - 1 - 시
  return ((2 + lunarMonth - 1 - birthHourIndex) % 12 + 12) % 12;
}

export function getShenGongPosition(lunarMonth: number, birthHourIndex: number): number {
  // 신궁 = 寅(2) + 월 - 1 + 시
  return (2 + lunarMonth - 1 + birthHourIndex) % 12;
}

// ── 오행국 산출 ─────────────────────────────────────────
export function getBureau(yearStem: number, mingGongBranch: number): number {
  const palaceStem = getPalaceStem(yearStem, mingGongBranch);
  const pos = getSexagenaryPosition(palaceStem, mingGongBranch);
  const nayinIndex = Math.floor(pos / 2);
  const element = NAYIN_ELEMENTS[nayinIndex];
  return ELEMENT_TO_BUREAU[element];
}

// ── 자미성 위치 산출 ────────────────────────────────────
export function getZiweiPosition(lunarDay: number, bureau: number): number {
  // 자미성 안성법: 일수를 오행국수로 나눠서 산출
  const q = Math.ceil(lunarDay / bureau);
  const r = lunarDay - (q - 1) * bureau; // 1 ~ bureau

  let pos: number;
  if (q % 2 === 1) {
    // 홀수 그룹: 순방향
    pos = Math.floor((q - 1) / 2) * 2 + r;
  } else {
    // 짝수 그룹: 역방향
    pos = Math.floor(q / 2) * 2 + 1 + (bureau - r);
  }

  // 丑(1) 기준으로 변환
  return pos % 12;
}

// ── 천부성 위치 산출 ────────────────────────────────────
export function getTianfuPosition(ziweiPos: number): number {
  return (4 - ziweiPos + 12) % 12;
}

// ── 삼합 그룹 ──────────────────────────────────────────
function getTrigramGroup(branch: number): number {
  const groups: Record<number, number> = {
    2: 0, 6: 0, 10: 0,  // 인오술
    5: 1, 9: 1, 1: 1,   // 사유축
    8: 2, 0: 2, 4: 2,   // 신자진
    11: 3, 3: 3, 7: 3,  // 해묘미
  };
  return groups[branch];
}

// ── 시간 인덱스 ────────────────────────────────────────
export function parseHourIndex(timeStr: string): number {
  const siJin: Record<string, number> = {
    자: 0, 축: 1, 인: 2, 묘: 3, 진: 4, 사: 5,
    오: 6, 미: 7, 신: 8, 유: 9, 술: 10, 해: 11,
  };
  if (siJin[timeStr] !== undefined) return siJin[timeStr];
  const parts = timeStr.split(":");
  const hour = parseInt(parts[0], 10) || 0;
  return Math.floor(((hour + 1) % 24) / 2);
}

// ── 양력→음력 변환 (korean-lunar-calendar 사용) ─────────
export function solarToLunarApprox(
  year: number, month: number, day: number
): { lunarMonth: number; lunarDay: number; lunarYear: number } {
  // korean-lunar-calendar 패키지 사용 (정확한 변환)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const KoreanLunarCalendar = require("korean-lunar-calendar");
    const cal = new KoreanLunarCalendar();
    cal.setSolarDate(year, month, day);
    const lunar = cal.getLunarCalendar();
    return {
      lunarYear: lunar.year,
      lunarMonth: lunar.month,
      lunarDay: lunar.day,
    };
  } catch {
    // 패키지 없을 때 근사치 (절기 기반)
    const beforeIpchun = month < 2 || (month === 2 && day < 4);
    const lunarYear = beforeIpchun ? year - 1 : year;

    const solarTermMonth: [number, number, number][] = [
      [2, 4, 1], [3, 6, 2], [4, 5, 3], [5, 6, 4],
      [6, 6, 5], [7, 7, 6], [8, 7, 7], [9, 8, 8],
      [10, 8, 9], [11, 7, 10], [12, 7, 11], [1, 6, 12],
    ];

    let lunarMonth = 1;
    const dateVal = month * 100 + day;
    for (let i = solarTermMonth.length - 1; i >= 0; i--) {
      const [m, d, lm] = solarTermMonth[i];
      if (dateVal >= m * 100 + d) {
        lunarMonth = lm;
        break;
      }
    }
    if (dateVal < 106) lunarMonth = 11;
    const lunarDay = Math.min(day, 30);

    return { lunarMonth, lunarDay, lunarYear };
  }
}

// ── 년도 간지 ──────────────────────────────────────────
export function getYearStemBranch(year: number): { stem: number; branch: number } {
  return {
    stem: ((year - 4) % 10 + 10) % 10,
    branch: ((year - 4) % 12 + 12) % 12,
  };
}

// ── 전체 명반 구성 ──────────────────────────────────────
export function buildChart(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  birthHourIndex: number,
  gender: "male" | "female"
): ChartInfo {
  const { stem: yearStem, branch: yearBranch } = getYearStemBranch(lunarYear);

  // 1. 명궁/신궁 위치
  const mingGongBranch = getMingGongPosition(lunarMonth, birthHourIndex);
  const shenGongBranch = getShenGongPosition(lunarMonth, birthHourIndex);

  // 2. 오행국
  const bureau = getBureau(yearStem, mingGongBranch);

  // 3. 자미성/천부성 위치
  const ziweiPos = getZiweiPosition(lunarDay, bureau);
  const tianfuPos = getTianfuPosition(ziweiPos);

  // 4. 12궁 초기화 (명궁에서 반시계 방향으로 배치)
  const palaces: PalaceInfo[] = [];
  for (let i = 0; i < 12; i++) {
    const branch = ((mingGongBranch - i) % 12 + 12) % 12;
    palaces.push({
      index: i,
      name: PALACE_NAMES[i],
      branch,
      stem: getPalaceStem(yearStem, branch),
      stars: [],
      transformations: [],
      isBodyPalace: branch === shenGongBranch,
    });
  }

  // 궁 위치 → 궁 인덱스 매핑
  const branchToPalace: Record<number, number> = {};
  for (const p of palaces) {
    branchToPalace[p.branch] = p.index;
  }

  // 5. 자미계 주성 배치
  const ziweiSeriesNames = ["자미", "천기", "태양", "무곡", "천동", "염정"];
  for (let s = 0; s < 6; s++) {
    const branch = ((ziweiPos + ZIWEI_SERIES_OFFSETS[s]) % 12 + 12) % 12;
    const pIdx = branchToPalace[branch];
    if (pIdx !== undefined) {
      palaces[pIdx].stars.push({
        name: ziweiSeriesNames[s],
        brightness: BRIGHTNESS[s][branch],
        series: "자미계",
      });
    }
  }

  // 6. 천부계 주성 배치
  const tianfuSeriesNames = ["천부", "태음", "탐랑", "거문", "천상", "천량", "칠살", "파군"];
  for (let s = 0; s < 8; s++) {
    const branch = (tianfuPos + TIANFU_SERIES_OFFSETS[s]) % 12;
    const pIdx = branchToPalace[branch];
    if (pIdx !== undefined) {
      palaces[pIdx].stars.push({
        name: tianfuSeriesNames[s],
        brightness: BRIGHTNESS[s + 6][branch],
        series: "천부계",
      });
    }
  }

  // 7. 보성/잡성 배치
  placeAuxiliaryStars(palaces, branchToPalace, yearStem, yearBranch, lunarMonth, birthHourIndex);

  return {
    palaces,
    mingGongBranch,
    shenGongBranch,
    bureau,
    bureauName: `${["", "", "수이국", "목삼국", "금사국", "토오국", "화육국"][bureau]}`,
    ziweiPosition: ziweiPos,
    tianfuPosition: tianfuPos,
    yearStem,
    yearBranch,
    lunarMonth,
    lunarDay,
    birthHourIndex,
  };
}

// ── 보성/잡성 배치 ──────────────────────────────────────
function placeAuxiliaryStars(
  palaces: PalaceInfo[],
  branchToPalace: Record<number, number>,
  yearStem: number,
  yearBranch: number,
  lunarMonth: number,
  birthHourIndex: number
) {
  function addStar(branch: number, name: string) {
    const pIdx = branchToPalace[branch];
    if (pIdx !== undefined) {
      palaces[pIdx].stars.push({ name, brightness: "평", series: "보성" });
    }
  }

  // 좌보: 辰(4) + 月 - 1
  addStar((3 + lunarMonth) % 12, "좌보");

  // 우필: 戌(10) - 月 + 1
  addStar((11 - lunarMonth + 12) % 12, "우필");

  // 문창: 戌(10) - 時
  addStar((10 - birthHourIndex + 12) % 12, "문창");

  // 문곡: 辰(4) + 時
  addStar((4 + birthHourIndex) % 12, "문곡");

  // 천괴(천귀): 년간 기준
  addStar(TIANKUI_BY_STEM[yearStem], "천괴");

  // 천월: 년간 기준
  addStar(TIANYUE_BY_STEM[yearStem], "천월");

  // 녹존: 년간 기준
  addStar(LUCUN_BY_STEM[yearStem], "녹존");

  // 경양: 녹존 + 1
  addStar((LUCUN_BY_STEM[yearStem] + 1) % 12, "경양");

  // 타라: 녹존 - 1
  addStar((LUCUN_BY_STEM[yearStem] - 1 + 12) % 12, "타라");

  // 천마: 년지 기준
  addStar(getTianmaPosition(yearBranch), "천마");

  // 화성: 년지 삼합그룹 기준 + 시
  const yearGroup = getTrigramGroup(yearBranch);
  addStar((HUOXING_BASE[yearGroup] + birthHourIndex) % 12, "화성");

  // 영성: 년지 삼합그룹 기준 + 시
  addStar((LINGXING_BASE[yearGroup] + birthHourIndex) % 12, "영성");
}
