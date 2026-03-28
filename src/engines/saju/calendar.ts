// ============================================================
// 만세력 / 절기 / 사주 명식 산출
// ============================================================

import { STEM_YINYANG } from "./data";

// ── 절기 기준 월 경계 ─────────────────────────────────────
// 절(節) 시작일: [solar_month, approx_day, saju_month_index, branch_index]
// saju_month_index: 0=인월 ~ 11=축월
const SOLAR_TERM_BOUNDARIES: [number, number, number, number][] = [
  [2, 4, 0, 2],    // 입춘 → 인월 시작
  [3, 6, 1, 3],    // 경칩 → 묘월 시작
  [4, 5, 2, 4],    // 청명 → 진월 시작
  [5, 6, 3, 5],    // 입하 → 사월 시작
  [6, 6, 4, 6],    // 망종 → 오월 시작
  [7, 7, 5, 7],    // 소서 → 미월 시작
  [8, 7, 6, 8],    // 입추 → 신월 시작
  [9, 8, 7, 9],    // 백로 → 유월 시작
  [10, 8, 8, 10],  // 한로 → 술월 시작
  [11, 7, 9, 11],  // 입동 → 해월 시작
  [12, 7, 10, 0],  // 대설 → 자월 시작
  [1, 6, 11, 1],   // 소한 → 축월 시작
];

/** 절기 기준 사주 월과 사주 년도를 산출 */
export function getSajuMonthAndYear(
  solarYear: number,
  solarMonth: number,
  solarDay: number
): { sajuYear: number; monthIndex: number; monthBranch: number } {
  // 입춘 전이면 전년도 사주년
  const beforeIpchun =
    solarMonth < 2 || (solarMonth === 2 && solarDay < 4);
  const sajuYear = beforeIpchun ? solarYear - 1 : solarYear;

  // 절기 경계를 역순으로 순회하여 해당 월 찾기
  // 먼저 날짜를 일련번호로 변환 (1월=1, 12월=12 기준)
  const dateVal = solarMonth * 100 + solarDay;

  // 절기 경계를 날짜 순서로 정렬 (1월 → 12월)
  // 소한(1/6), 입춘(2/4), 경칩(3/6), ..., 대설(12/7)
  const sortedBounds = [
    { dateVal: 106, monthIndex: 11, branch: 1 },  // 소한 1/6
    { dateVal: 204, monthIndex: 0, branch: 2 },   // 입춘 2/4
    { dateVal: 306, monthIndex: 1, branch: 3 },   // 경칩 3/6
    { dateVal: 405, monthIndex: 2, branch: 4 },   // 청명 4/5
    { dateVal: 506, monthIndex: 3, branch: 5 },   // 입하 5/6
    { dateVal: 606, monthIndex: 4, branch: 6 },   // 망종 6/6
    { dateVal: 707, monthIndex: 5, branch: 7 },   // 소서 7/7
    { dateVal: 807, monthIndex: 6, branch: 8 },   // 입추 8/7
    { dateVal: 908, monthIndex: 7, branch: 9 },   // 백로 9/8
    { dateVal: 1008, monthIndex: 8, branch: 10 },  // 한로 10/8
    { dateVal: 1107, monthIndex: 9, branch: 11 },  // 입동 11/7
    { dateVal: 1207, monthIndex: 10, branch: 0 },  // 대설 12/7
  ];

  // 역순으로 찾기: 날짜값보다 작거나 같은 가장 마지막 경계
  for (let i = sortedBounds.length - 1; i >= 0; i--) {
    if (dateVal >= sortedBounds[i].dateVal) {
      return {
        sajuYear,
        monthIndex: sortedBounds[i].monthIndex,
        monthBranch: sortedBounds[i].branch,
      };
    }
  }

  // 1월 6일 이전 → 전년도 자월(대설 ~ 소한)
  return { sajuYear, monthIndex: 10, monthBranch: 0 };
}

/** Julian Day Number 계산 (그레고리력) */
export function getJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) +
    1721119
  );
}

/** 60갑자 순환 인덱스 (년도 기준) */
export function getSexagenaryCycle(year: number): { stem: number; branch: number } {
  return {
    stem: ((year - 4) % 10 + 10) % 10,
    branch: ((year - 4) % 12 + 12) % 12,
  };
}

/** Pillar (기둥) 타입 */
export interface Pillar {
  stem: number;
  branch: number;
}

/** 년주 산출 (절기 기준 사주년 사용) */
export function getYearPillar(sajuYear: number): Pillar {
  const { stem, branch } = getSexagenaryCycle(sajuYear);
  return { stem, branch };
}

/** 월주 산출 */
export function getMonthPillar(yearStem: number, monthIndex: number): Pillar {
  // 년상기월법: 연간 기준 인월(첫째 달)의 천간 결정
  const stemBase = ((yearStem % 5) * 2 + 2) % 10;
  const stem = (stemBase + monthIndex) % 10;
  const branch = (2 + monthIndex) % 12; // 인(2)부터 시작
  return { stem, branch };
}

/** 일주 산출 (JDN 기반) */
export function getDayPillar(year: number, month: number, day: number): Pillar {
  const jdn = getJDN(year, month, day);
  return {
    stem: ((jdn - 1) % 10 + 10) % 10,
    branch: ((jdn + 1) % 12 + 12) % 12,
  };
}

/** 시주 산출 */
export function getHourPillar(dayStem: number, hour: number): Pillar {
  // 시진 결정: 23:00~00:59=자시(0), 01:00~02:59=축시(1), ...
  const branch = Math.floor(((hour + 1) % 24) / 2);
  // 일상기시법: 일간 기준 자시의 천간 결정
  const stemBase = (dayStem % 5) * 2;
  const stem = (stemBase + branch) % 10;
  return { stem, branch };
}

/** 시간 문자열 → 시간(0-23) 변환 */
export function parseHour(timeStr: string): number {
  // "HH:mm" 형식 또는 시진 이름
  const siJin: Record<string, number> = {
    자: 0, 축: 2, 인: 4, 묘: 6, 진: 8, 사: 10,
    오: 12, 미: 14, 신: 16, 유: 18, 술: 20, 해: 22,
  };
  if (siJin[timeStr] !== undefined) return siJin[timeStr];
  const parts = timeStr.split(":");
  return parseInt(parts[0], 10) || 0;
}

/** 사주 전체 명식 산출 */
export function calculateFourPillars(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number
): { year: Pillar; month: Pillar; day: Pillar; hour: Pillar; sajuYear: number } {
  const { sajuYear, monthIndex } = getSajuMonthAndYear(birthYear, birthMonth, birthDay);
  const yearPillar = getYearPillar(sajuYear);
  const monthPillar = getMonthPillar(yearPillar.stem, monthIndex);
  const dayPillar = getDayPillar(birthYear, birthMonth, birthDay);
  const hourPillar = getHourPillar(dayPillar.stem, birthHour);

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    sajuYear,
  };
}

/** 대운 순행/역행 판단 */
export function isDaewunForward(yearStem: number, gender: "male" | "female"): boolean {
  const isYang = STEM_YINYANG[yearStem] === "양";
  const isMale = gender === "male";
  // 양남음녀: 순행, 음남양녀: 역행
  return (isYang && isMale) || (!isYang && !isMale);
}

/** 대운 산출 (8개 대운) */
export function calculateDaewun(
  monthPillar: Pillar,
  yearStem: number,
  gender: "male" | "female",
  birthYear: number
): { forward: boolean; periods: DaewunPeriod[] } {
  const forward = isDaewunForward(yearStem, gender);
  const currentAge = new Date().getFullYear() - birthYear;
  const periods: DaewunPeriod[] = [];

  for (let i = 0; i < 8; i++) {
    const age = 3 + i * 10;
    const stem = forward
      ? (monthPillar.stem + i + 1) % 10
      : ((monthPillar.stem - i - 1) % 10 + 10) % 10;
    const branch = forward
      ? (monthPillar.branch + i + 1) % 12
      : ((monthPillar.branch - i - 1) % 12 + 12) % 12;
    periods.push({
      startAge: age,
      endAge: age + 9,
      stem,
      branch,
      isCurrent: currentAge >= age && currentAge < age + 10,
    });
  }

  return { forward, periods };
}

export interface DaewunPeriod {
  startAge: number;
  endAge: number;
  stem: number;
  branch: number;
  isCurrent: boolean;
}

/** 세운 (현재 년도의 간지) */
export function calculateSewun(year?: number): { year: number; stem: number; branch: number } {
  const y = year ?? new Date().getFullYear();
  const { stem, branch } = getSexagenaryCycle(y);
  return { year: y, stem, branch };
}
