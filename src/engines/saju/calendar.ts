// ============================================================
// 만세력 / 절기 / 사주 명식 산출 (정밀 버전)
// ============================================================
// JDN 검증: 2024-01-01 = 갑자(甲子) ✓
// 절기 계산: 수시력(寿星万年历) 공식 기반 (±1일 정확도)
// 음력 변환: korean-lunar-calendar 패키지 사용
// ============================================================

import { STEM_YINYANG } from "./data";

// ── 절기 정밀 계산 (수시력 공식) ─────────────────────────
// 12절(節): 사주 월 경계를 결정하는 절기
// 순서: 소한(1월)→입춘(2월)→경칩(3월)→...→대설(12월)
// C 상수: [20세기(1900-1999), 21세기(2000-2099)]
const JIE_CONSTANTS: { month: number; c20: number; c21: number; useYMinus1ForLeap: boolean }[] = [
  { month: 1,  c20: 6.11,  c21: 5.4055, useYMinus1ForLeap: true },  // 소한
  { month: 2,  c20: 4.15,  c21: 3.87,   useYMinus1ForLeap: false }, // 입춘
  { month: 3,  c20: 6.11,  c21: 5.63,   useYMinus1ForLeap: false }, // 경칩
  { month: 4,  c20: 5.59,  c21: 4.81,   useYMinus1ForLeap: false }, // 청명
  { month: 5,  c20: 6.318, c21: 5.52,   useYMinus1ForLeap: false }, // 입하
  { month: 6,  c20: 6.5,   c21: 5.678,  useYMinus1ForLeap: false }, // 망종
  { month: 7,  c20: 7.928, c21: 7.108,  useYMinus1ForLeap: false }, // 소서
  { month: 8,  c20: 8.35,  c21: 7.45,   useYMinus1ForLeap: false }, // 입추
  { month: 9,  c20: 8.44,  c21: 7.646,  useYMinus1ForLeap: false }, // 백로
  { month: 10, c20: 9.098, c21: 8.318,  useYMinus1ForLeap: false }, // 한로
  { month: 11, c20: 8.218, c21: 7.438,  useYMinus1ForLeap: false }, // 입동
  { month: 12, c20: 7.9,   c21: 7.18,   useYMinus1ForLeap: false }, // 대설
];

// 사주 월 인덱스 매핑: 절기 순�� → (monthIndex, branch)
// 소한→축월(11,1), 입춘→인월(0,2), 경칩→묘월(1,3), ...
const JIE_TO_MONTH: { monthIndex: number; branch: number }[] = [
  { monthIndex: 11, branch: 1 },  // 소한 → 축월
  { monthIndex: 0,  branch: 2 },  // 입춘 → 인월
  { monthIndex: 1,  branch: 3 },  // 경칩 → 묘월
  { monthIndex: 2,  branch: 4 },  // 청명 → 진월
  { monthIndex: 3,  branch: 5 },  // 입하 → 사월
  { monthIndex: 4,  branch: 6 },  // 망종 → 오월
  { monthIndex: 5,  branch: 7 },  // 소서 → 미월
  { monthIndex: 6,  branch: 8 },  // 입추 → 신월
  { monthIndex: 7,  branch: 9 },  // 백로 → 유월
  { monthIndex: 8,  branch: 10 }, // 한로 → 술월
  { monthIndex: 9,  branch: 11 }, // 입동 → 해월
  { monthIndex: 10, branch: 0 },  // 대설 → 자월
];

/**
 * 특정 년도의 절기(節) 날짜를 계산 (수시력 공식)
 * @param year 양력 년도
 * @param jieIndex 절기 인덱스 (0=소한 ~ 11=대설)
 * @returns { month, day } 양력 월/일
 */
export function calculateJieDate(year: number, jieIndex: number): { month: number; day: number } {
  const jie = JIE_CONSTANTS[jieIndex];
  const y = year % 100;
  const century = Math.floor(year / 100);
  const C = century >= 20 ? jie.c21 : jie.c20;
  const leapBase = jie.useYMinus1ForLeap ? y - 1 : y;
  const L = Math.floor(leapBase / 4);
  const day = Math.floor(y * 0.2422 + C) - L;
  return { month: jie.month, day };
}

/**
 * 특정 년도의 입춘 날짜
 */
export function getIpchunDate(year: number): { month: number; day: number } {
  return calculateJieDate(year, 1); // index 1 = 입춘
}

/** 절기 기준 사주 월과 사주 년도를 산출 (년도별 정밀 계산) */
export function getSajuMonthAndYear(
  solarYear: number,
  solarMonth: number,
  solarDay: number
): { sajuYear: number; monthIndex: number; monthBranch: number } {
  // 입춘 날��를 해당 ���도에 맞게 계산
  const ipchun = getIpchunDate(solarYear);
  const beforeIpchun =
    solarMonth < ipchun.month ||
    (solarMonth === ipchun.month && solarDay < ipchun.day);
  const sajuYear = beforeIpchun ? solarYear - 1 : solarYear;

  // 12절기 경계를 해당 년도에 맞게 계산
  const dateVal = solarMonth * 100 + solarDay;
  const bounds: { dateVal: number; monthIndex: number; branch: number }[] = [];

  for (let i = 0; i < 12; i++) {
    // 소한(1월)은 해당 년도, 나머지도 해당 년도
    const targetYear = solarYear;
    const jieDate = calculateJieDate(targetYear, i);
    bounds.push({
      dateVal: jieDate.month * 100 + jieDate.day,
      monthIndex: JIE_TO_MONTH[i].monthIndex,
      branch: JIE_TO_MONTH[i].branch,
    });
  }

  // 날짜순 정렬 (1월 → 12월)
  bounds.sort((a, b) => a.dateVal - b.dateVal);

  // 역순으로 순회하여 해당 월 찾기
  for (let i = bounds.length - 1; i >= 0; i--) {
    if (dateVal >= bounds[i].dateVal) {
      return { sajuYear, monthIndex: bounds[i].monthIndex, monthBranch: bounds[i].branch };
    }
  }

  // 1월 ����� 이전 → 전��도 자월(대설~소한)
  return { sajuYear, monthIndex: 10, monthBranch: 0 };
}

// ── JDN (Julian Day Number) ─────────────────────────────
/**
 * 그레고리력 → Julian Day Number
 * 검증: getJDN(2024,1,1) = 2460311, getDayPillar → 갑자(甲子) ✓
 */
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

/**
 * 일주 산출 (JDN 기반)
 * 공식 검증: 2024-01-01 → JDN 2460311 → stem=0(갑), branch=0(자) = 갑자(甲子) ✓
 */
export function getDayPillar(year: number, month: number, day: number): Pillar {
  const jdn = getJDN(year, month, day);
  return {
    stem: ((jdn - 1) % 10 + 10) % 10,
    branch: ((jdn + 1) % 12 + 12) % 12,
  };
}

/**
 * 시주 산출
 * 야자시(夜子時) 처리:
 * - 23:00~23:59 → 야자시: 시지(時支)는 자(子), 일간은 당일 유지
 * - 00:00~00:59 → 조자시(早子時): 시지는 자(子), 일간은 다음날
 * 현재 구현: 자정(00:00) 기준 일변경 (가장 보편적 방식)
 */
export function getHourPillar(dayStem: number, hour: number): Pillar {
  // 시진 결정: 23:00~00:59=자시(0), 01:00~02:59=축시(1), ...
  const branch = Math.floor(((hour + 1) % 24) / 2);
  // 일상기시법: 일간 기준 자시(子時)의 천간 결정
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

/**
 * 사주 전체 명식 산출
 * 야자시(23:00~23:59) 처리: 시지는 자시, 일주는 당일 유지
 */
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

// ── 음력 변환 (korean-lunar-calendar) ───────────────────
// eslint-disable-next-line @typescript-eslint/no-var-requires
let KoreanLunarCalendar: any = null;
try {
  KoreanLunarCalendar = require("korean-lunar-calendar");
} catch {
  // 패키지 ���으면 근사치 사용
}

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
}

/** 양력 → 음력 변환 (korean-lunar-calendar 사용) */
export function solarToLunar(solarYear: number, solarMonth: number, solarDay: number): LunarDate {
  if (KoreanLunarCalendar) {
    const cal = new KoreanLunarCalendar();
    cal.setSolarDate(solarYear, solarMonth, solarDay);
    const lunar = cal.getLunarCalendar();
    return {
      year: lunar.year,
      month: lunar.month,
      day: lunar.day,
      isLeapMonth: lunar.intercalation ?? false,
    };
  }
  // 패키지 없을 때 근사치 (사주에서는 사용하지 않으나 자미두수용)
  return {
    year: solarYear,
    month: Math.max(1, solarMonth - 1) || 12,
    day: solarDay,
    isLeapMonth: false,
  };
}
