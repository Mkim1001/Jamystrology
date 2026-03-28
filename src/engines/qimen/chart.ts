// ============================================================
// 기문둔갑 포국(布局) - 국수 산출, 구궁 배치
// ============================================================

import {
  YANG_DUN_BUREAUS,
  YIN_DUN_BUREAUS,
  SOLAR_TERM_DATES,
  SOLAR_TERMS_24,
  SANQI_LIUYI,
  NINE_STARS,
  EIGHT_GATES,
  EIGHT_SPIRITS,
  STAR_HOME_PALACE,
  GATE_HOME_PALACE,
  LUOSHU_ORDER,
} from "./data";

// ── 타입 ───────────────────────────────────────────────────
export interface PalaceState {
  palaceIndex: number;    // 궁 번호 (0=1궁감~8=9궁리)
  tianpan: string;        // 천반 (삼기육의)
  dipan: string;          // 지반 (삼기육의)
  star: string;           // 구성
  gate: string;           // 팔문
  spirit: string;         // 팔신
  tianpanIdx: number;
  dipanIdx: number;
  starIdx: number;
  gateIdx: number;
  spiritIdx: number;
}

export interface QimenChart {
  palaces: PalaceState[];
  bureauNumber: number;     // 국수 (1-9)
  isYangDun: boolean;       // 양둔/음둔
  yuanQi: string;           // 상원/중원/하원
  solarTerm: string;        // 절기
  zhifu: number;            // 직부성 인덱스
  zhishi: number;           // 직사문 인덱스
  dunju: string;            // 둔갑 요약
}

// ── 절기 판정 ──────────────────────────────────────────
export function getSolarTermIndex(month: number, day: number): number {
  // 날짜에 해당하는 절기 인덱스 (0=동지 ~ 23=대설)
  const dateVal = month * 100 + day;

  // 역순으로 순회
  for (let i = SOLAR_TERM_DATES.length - 1; i >= 0; i--) {
    const [m, d] = SOLAR_TERM_DATES[i];
    if (dateVal >= m * 100 + d) {
      return i;
    }
  }
  // 1월 6일 이전 → 동지(12/22)
  return 0;
}

// ── 상원/중원/하원 판단 (간략화) ────────────────────────
// 실제로는 일진(日辰)의 간지로 정확히 판단해야 하지만,
// 여기서는 절기 내 일수 기반으로 근사 산출
export function getYuanQi(dayOfTerm: number): { yuan: number; yuanName: string } {
  // 각 절기는 약 15일. 5일씩 상원/중원/하원
  if (dayOfTerm <= 5) return { yuan: 0, yuanName: "상원" };
  if (dayOfTerm <= 10) return { yuan: 1, yuanName: "중원" };
  return { yuan: 2, yuanName: "하원" };
}

// ── 국수 산출 ──────────────────────────────────────────
export function calculateBureau(
  month: number, day: number
): { bureauNumber: number; isYangDun: boolean; solarTermIndex: number; yuanName: string; solarTerm: string } {
  const termIdx = getSolarTermIndex(month, day);
  const isYangDun = termIdx < 12; // 0~11: 양둔(동지~망종), 12~23: 음둔(하지~대설)

  // 절기 시작일로부터의 일수 계산 (근사)
  const [termMonth, termDay] = SOLAR_TERM_DATES[termIdx];
  let dayOfTerm: number;
  if (month === termMonth) {
    dayOfTerm = day - termDay + 1;
  } else {
    // 월이 다른 경우 근사
    dayOfTerm = day + (30 - termDay) + 1;
  }
  dayOfTerm = Math.max(1, Math.min(15, dayOfTerm));

  const { yuan, yuanName } = getYuanQi(dayOfTerm);

  // 양둔/음둔 테이블에서 국수 조회
  const localTermIdx = termIdx % 12; // 0-11로 정규화
  const bureaus = isYangDun
    ? YANG_DUN_BUREAUS[localTermIdx]
    : YIN_DUN_BUREAUS[localTermIdx];
  const bureauNumber = bureaus[yuan];

  return {
    bureauNumber,
    isYangDun,
    solarTermIndex: termIdx,
    yuanName,
    solarTerm: SOLAR_TERMS_24[termIdx],
  };
}

// ── 구궁 배치 (포국) ───────────────────────────────────
export function buildQimenChart(
  month: number, day: number, hour: number
): QimenChart {
  const { bureauNumber, isYangDun, solarTermIndex, yuanName, solarTerm } = calculateBureau(month, day);

  // 1. 지반 배치: 국수를 시���점으로 삼기육의를 궁에 배치
  const dipan = placeDipan(bureauNumber, isYangDun);

  // 2. 직부성(直符星)과 직사문(直使門) 결정
  // 직부 = 시간에 해당하는 부두(符頭)의 성
  // 간략화: 국수의 궁에 해당하는 성을 직부로 사용
  const zhifuPalace = bureauNumber - 1; // 0-indexed
  const zhifuStarIdx = findStarAtHomePalace(zhifuPalace);
  const zhishiGateIdx = findGateAtHomePalace(zhifuPalace);

  // 3. 천반 배치: 직부성이 시간(시두)의 천간으로 이동
  // 간략화: hour 기반으로 이동
  const hourShift = getHourShift(hour, isYangDun);
  const tianpan = placeTianpan(dipan, zhifuStarIdx, hourShift, isYangDun);

  // 4. 구성 배치 (직부성이 시간궁으로 이동, 나머지 따라감)
  const stars = placeStars(zhifuStarIdx, hourShift, isYangDun);

  // 5. 팔문 배치 (직사문이 시간궁으로 이동, 나머지 따라감)
  const gates = placeGates(zhishiGateIdx, hourShift, isYangDun);

  // 6. 팔신 배치 (직부 기반)
  const spirits = placeSpirits(zhifuStarIdx, hourShift, isYangDun);

  // 7. 궁 상태 조합
  const palaces: PalaceState[] = [];
  for (let i = 0; i < 9; i++) {
    palaces.push({
      palaceIndex: i,
      tianpan: SANQI_LIUYI[tianpan[i]],
      dipan: SANQI_LIUYI[dipan[i]],
      star: NINE_STARS[stars[i]],
      gate: EIGHT_GATES[gates[i]] ?? "—",
      spirit: EIGHT_SPIRITS[spirits[i]] ?? "—",
      tianpanIdx: tianpan[i],
      dipanIdx: dipan[i],
      starIdx: stars[i],
      gateIdx: gates[i],
      spiritIdx: spirits[i],
    });
  }

  return {
    palaces,
    bureauNumber,
    isYangDun,
    yuanQi: yuanName,
    solarTerm,
    zhifu: zhifuStarIdx,
    zhishi: zhishiGateIdx,
    dunju: `${isYangDun ? "양둔" : "음둔"} ${yuanName} ${bureauNumber}국`,
  };
}

// ── 지반 배치 ──────────────────────────────────────────
function placeDipan(bureau: number, isYangDun: boolean): number[] {
  // 삼기육의를 궁에 배치. 국수가 무(戊)=0의 시작 위치
  const result = new Array(9).fill(0);
  const startPalace = bureau - 1; // 0-indexed

  if (isYangDun) {
    // 양둔: 순행 (낙서 순서)
    for (let i = 0; i < 9; i++) {
      const palace = LUOSHU_ORDER[(LUOSHU_ORDER.indexOf(startPalace) + i) % 9];
      result[palace] = i; // i번째 삼기육의
    }
  } else {
    // 음둔: 역행
    for (let i = 0; i < 9; i++) {
      const idx = (LUOSHU_ORDER.indexOf(startPalace) - i + 9) % 9;
      const palace = LUOSHU_ORDER[idx];
      result[palace] = i;
    }
  }

  return result;
}

// ── 시간 이동량 ────────────────────────────────────────
function getHourShift(hour: number, isYangDun: boolean): number {
  // 시진 인덱스(0-11)를 이동량으로 변환
  const hourIdx = Math.floor(((hour + 1) % 24) / 2);
  return hourIdx % 9; // 9궁 기준
}

// ── 천반 배치 ──────────────────────────────────────────
function placeTianpan(
  dipan: number[], zhifuStarIdx: number, shift: number, isYangDun: boolean
): number[] {
  const result = new Array(9).fill(0);

  // 직부성의 본궁에 있는 지반 부호가 시간궁으로 이동
  // 나머지 부호도 같은 방향으로 이동
  for (let i = 0; i < 9; i++) {
    if (isYangDun) {
      const fromPalace = LUOSHU_ORDER[(LUOSHU_ORDER.indexOf(i) - shift + 9) % 9];
      result[i] = dipan[fromPalace];
    } else {
      const fromPalace = LUOSHU_ORDER[(LUOSHU_ORDER.indexOf(i) + shift) % 9];
      result[i] = dipan[fromPalace];
    }
  }

  return result;
}

// ── 구성 배치 ──────────────────────────────────────────
function placeStars(zhifuIdx: number, shift: number, isYangDun: boolean): number[] {
  const result = new Array(9).fill(0);

  for (let i = 0; i < 9; i++) {
    const homePalace = STAR_HOME_PALACE[i];
    let targetPalace: number;
    if (isYangDun) {
      targetPalace = LUOSHU_ORDER[(LUOSHU_ORDER.indexOf(homePalace) + shift) % 9];
    } else {
      targetPalace = LUOSHU_ORDER[(LUOSHU_ORDER.indexOf(homePalace) - shift + 9) % 9];
    }
    result[targetPalace] = i;
  }

  return result;
}

// ── 팔문 배치 ──────────────────────────────────────────
function placeGates(zhishiIdx: number, shift: number, isYangDun: boolean): number[] {
  const result = new Array(9).fill(4); // 4 = 중궁 (문 없음)
  const gateIndices = [0, 1, 2, 3, 5, 6, 7, 8]; // 중궁 제외

  for (const gi of gateIndices) {
    const homePalace = GATE_HOME_PALACE[gi];
    if (homePalace < 0) continue;

    let targetPalace: number;
    if (isYangDun) {
      targetPalace = LUOSHU_ORDER[(LUOSHU_ORDER.indexOf(homePalace) + shift) % 9];
    } else {
      targetPalace = LUOSHU_ORDER[(LUOSHU_ORDER.indexOf(homePalace) - shift + 9) % 9];
    }
    // 중궁에 떨어지면 곤궁(2궁, index 1)으로 기생
    if (targetPalace === 4) targetPalace = 1;
    result[targetPalace] = gi;
  }

  return result;
}

// ── 팔신 배치 ──────────────────────────────────────────
function placeSpirits(zhifuIdx: number, shift: number, isYangDun: boolean): number[] {
  const result = new Array(9).fill(4); // 4 = 중궁
  // 팔신 순서: 직부→등사→태음→육합→(중)→백호→현무→구지→구천
  const spiritOrder = [0, 1, 2, 3, 5, 6, 7, 8]; // 중궁 제외

  const zhifuHomePalace = STAR_HOME_PALACE[zhifuIdx];

  for (let i = 0; i < spiritOrder.length; i++) {
    const si = spiritOrder[i];
    let targetPalace: number;
    if (isYangDun) {
      targetPalace = LUOSHU_ORDER[(LUOSHU_ORDER.indexOf(zhifuHomePalace) + shift + i) % 9];
    } else {
      targetPalace = LUOSHU_ORDER[(LUOSHU_ORDER.indexOf(zhifuHomePalace) - shift - i + 90) % 9];
    }
    if (targetPalace === 4) targetPalace = 1; // 중궁 기생
    result[targetPalace] = si;
  }

  return result;
}

// ── 헬퍼 ──────────────────────────────────────────────
function findStarAtHomePalace(palace: number): number {
  for (let i = 0; i < STAR_HOME_PALACE.length; i++) {
    if (STAR_HOME_PALACE[i] === palace) return i;
  }
  return 0;
}

function findGateAtHomePalace(palace: number): number {
  for (let i = 0; i < GATE_HOME_PALACE.length; i++) {
    if (GATE_HOME_PALACE[i] === palace) return i;
  }
  return 0;
}
