// ============================================================
// 주역 분석 - 매화역수 산출, 호괘, 착종괘, 체용 분석
// ============================================================

import {
  TRIGRAMS,
  TRIGRAM_INVERSE,
  TRIGRAM_REVERSE,
  GENERATES,
  OVERCOMES,
  ELEMENT_NAMES,
  getHexagram,
  type Element,
  type Hexagram,
  type Trigram,
} from "./data";

// ── 매화역수 산출 결과 ──────────────────────────────────

export interface MaeHwaResult {
  /** 상괘 인덱스 (0-7) */
  upperTrigram: number;
  /** 하괘 인덱스 (0-7) */
  lowerTrigram: number;
  /** 변효 위치 (1-6, 아래서부터) */
  changingLine: number;
  /** 산출에 사용된 수 */
  numbers: {
    yearNum: number;
    monthNum: number;
    dayNum: number;
    hourNum: number;
    upperSum: number;
    lowerSum: number;
    lineSum: number;
  };
}

export interface IChingAnalysis {
  /** 매화역수 산출 정보 */
  maeHwa: MaeHwaResult;
  /** 본괘 */
  original: Hexagram;
  /** 변괘 (변효 적용 후) */
  changed: Hexagram;
  /** 호괘 (2-5효로 구성) */
  mutual: Hexagram;
  /** 착괘 (모든 효 반전) */
  reversed: Hexagram;
  /** 종괘 (상하 뒤집기) */
  inverted: Hexagram;
  /** 본괘 6효 라인 배열 (하→상, 1=양 0=음) */
  originalLines: number[];
  /** 변괘 6효 라인 배열 */
  changedLines: number[];
  /** 체용 분석 */
  tiYong: TiYongAnalysis;
}

export interface TiYongAnalysis {
  /** 체괘 (움직이지 않는 쪽) */
  tiTrigram: number;
  tiPosition: "upper" | "lower";
  tiElement: Element;
  /** 용괘 (변효가 있는 쪽) */
  yongTrigram: number;
  yongPosition: "upper" | "lower";
  yongElement: Element;
  /** 오행 관계 */
  relation: string;
  /** 길흉 판단 */
  fortune: "대길" | "길" | "평" | "흉" | "대흉";
  /** 해석 */
  interpretation: string;
}

// ── 시진 파싱 ────────────────────────────────────────────

const SIJIN_MAP: Record<string, number> = {
  "자": 1, "축": 2, "인": 3, "묘": 4, "진": 5, "사": 6,
  "오": 7, "미": 8, "신": 9, "유": 10, "술": 11, "해": 12,
};

export function parseHour(timeStr: string): number {
  // 시진 이름으로 입력
  if (SIJIN_MAP[timeStr] !== undefined) return SIJIN_MAP[timeStr];

  // HH:mm 형식
  const parts = timeStr.split(":");
  if (parts.length === 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const totalMinutes = h * 60 + m;

    // 시진 배정 (23:00~00:59=자시=1, 01:00~02:59=축시=2, ...)
    if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) return 1;  // 자
    if (totalMinutes < 3 * 60) return 2;   // 축
    if (totalMinutes < 5 * 60) return 3;   // 인
    if (totalMinutes < 7 * 60) return 4;   // 묘
    if (totalMinutes < 9 * 60) return 5;   // 진
    if (totalMinutes < 11 * 60) return 6;  // 사
    if (totalMinutes < 13 * 60) return 7;  // 오
    if (totalMinutes < 15 * 60) return 8;  // 미
    if (totalMinutes < 17 * 60) return 9;  // 신
    if (totalMinutes < 19 * 60) return 10; // 유
    if (totalMinutes < 21 * 60) return 11; // 술
    return 12; // 해
  }

  return 7; // 기본값: 오시
}

// ── 지지 번호 산출 (연도 → 지지 순서 1-12) ─────────────

function yearToBranchNum(year: number): number {
  // 자(子)=1 기준: (year - 4) mod 12 → 0=자=1, 1=축=2, ...
  const mod = ((year - 4) % 12 + 12) % 12;
  return mod + 1;
}

// ── 음력 변환 (간이) ────────────────────────────────────
// korean-lunar-calendar를 사용할 수 있지만, 매화역수에서는
// 양력 날짜를 그대로 사용하는 방법도 흔히 쓰임.
// 여기서는 양력 기반으로 산출 (현대 매화역수 실무 방식)

// ── 매화역수 산출 ────────────────────────────────────────

export function calculateMaeHwa(year: number, month: number, day: number, hourNum: number): MaeHwaResult {
  const yearNum = yearToBranchNum(year);

  // 상괘: (년 + 월 + 일) ÷ 8의 나머지 → 선천수
  const upperSum = yearNum + month + day;
  let upperRemainder = upperSum % 8;
  if (upperRemainder === 0) upperRemainder = 8;

  // 하괘: (년 + 월 + 일 + 시) ÷ 8의 나머지 → 선천수
  const lowerSum = yearNum + month + day + hourNum;
  let lowerRemainder = lowerSum % 8;
  if (lowerRemainder === 0) lowerRemainder = 8;

  // 변효: (년 + 월 + 일 + 시) ÷ 6의 나머지
  const lineSum = lowerSum;
  let lineRemainder = lineSum % 6;
  if (lineRemainder === 0) lineRemainder = 6;

  // 선천수 → 인덱스: 선천수 N → 인덱스 N-1
  const upperTrigram = upperRemainder - 1;
  const lowerTrigram = lowerRemainder - 1;

  return {
    upperTrigram,
    lowerTrigram,
    changingLine: lineRemainder,
    numbers: {
      yearNum,
      monthNum: month,
      dayNum: day,
      hourNum,
      upperSum,
      lowerSum,
      lineSum,
    },
  };
}

// ── 6효 라인 생성 ────────────────────────────────────────

export function getHexagramLines(upper: number, lower: number): number[] {
  const lowerLines = TRIGRAMS[lower].lines;
  const upperLines = TRIGRAMS[upper].lines;
  // 아래서 위: 하괘 3효 + 상괘 3효
  return [...lowerLines, ...upperLines];
}

// ── 변효 적용 → 변괘 ────────────────────────────────────

export function applyChangingLine(lines: number[], changingLine: number): { lines: number[]; upper: number; lower: number } {
  const newLines = [...lines];
  const idx = changingLine - 1; // 1-based → 0-based
  newLines[idx] = newLines[idx] === 1 ? 0 : 1;

  // 새 상하괘 인덱스 찾기
  const lower = findTrigramIndex(newLines[0], newLines[1], newLines[2]);
  const upper = findTrigramIndex(newLines[3], newLines[4], newLines[5]);

  return { lines: newLines, upper, lower };
}

function findTrigramIndex(l1: number, l2: number, l3: number): number {
  for (let i = 0; i < TRIGRAMS.length; i++) {
    const t = TRIGRAMS[i].lines;
    if (t[0] === l1 && t[1] === l2 && t[2] === l3) return i;
  }
  return 0;
}

// ── 호괘 산출 (2~5효) ───────────────────────────────────

export function getMutualHexagram(lines: number[]): { upper: number; lower: number } {
  // 호괘: 2-3-4효 → 하괘, 3-4-5효 → 상괘
  const lower = findTrigramIndex(lines[1], lines[2], lines[3]);
  const upper = findTrigramIndex(lines[2], lines[3], lines[4]);
  return { upper, lower };
}

// ── 착괘 (錯卦) ─────────────────────────────────────────

export function getReversedHexagram(upper: number, lower: number): { upper: number; lower: number } {
  return {
    upper: TRIGRAM_INVERSE[upper],
    lower: TRIGRAM_INVERSE[lower],
  };
}

// ── 종괘 (綜卦) ─────────────────────────────────────────

export function getInvertedHexagram(upper: number, lower: number): { upper: number; lower: number } {
  // 괘를 뒤집으면: 원래 하괘의 뒤집기 → 새 상괘, 원래 상괘의 뒤집기 → 새 하괘
  return {
    upper: TRIGRAM_REVERSE[lower],
    lower: TRIGRAM_REVERSE[upper],
  };
}

// ── 체용 분석 ────────────────────────────────────────────
// 변효가 있는 쪽이 용(用)괘, 없는 쪽이 체(體)괘
// 변효 1-3: 하괘가 용, 상괘가 체
// 변효 4-6: 상괘가 용, 하괘가 체

export function analyzeTiYong(upper: number, lower: number, changingLine: number): TiYongAnalysis {
  const isLowerChanging = changingLine <= 3;

  const tiTrigram = isLowerChanging ? upper : lower;
  const yongTrigram = isLowerChanging ? lower : upper;
  const tiPosition = isLowerChanging ? "upper" as const : "lower" as const;
  const yongPosition = isLowerChanging ? "lower" as const : "upper" as const;

  const tiElement = TRIGRAMS[tiTrigram].element;
  const yongElement = TRIGRAMS[yongTrigram].element;

  // 오행 관계 분석 (체괘 관점)
  const { relation, fortune, interpretation } = analyzeElementRelation(tiElement, yongElement, tiTrigram, yongTrigram);

  return {
    tiTrigram,
    tiPosition,
    tiElement,
    yongTrigram,
    yongPosition,
    yongElement,
    relation,
    fortune,
    interpretation,
  };
}

function analyzeElementRelation(
  tiElement: Element,
  yongElement: Element,
  tiIdx: number,
  yongIdx: number,
): { relation: string; fortune: "대길" | "길" | "평" | "흉" | "대흉"; interpretation: string } {
  const tiName = `${TRIGRAMS[tiIdx].name}(${ELEMENT_NAMES[tiElement]})`;
  const yongName = `${TRIGRAMS[yongIdx].name}(${ELEMENT_NAMES[yongElement]})`;

  // 체용 동일 오행
  if (tiElement === yongElement) {
    return {
      relation: "비화(比和)",
      fortune: "길",
      interpretation: `체괘 ${tiName}과 용괘 ${yongName}이 같은 오행으로 비화하니, 일이 순탄하게 진행된다. 서로 도우니 무난하다.`,
    };
  }

  // 용이 체를 생함 → 길
  if (GENERATES[yongElement] === tiElement) {
    return {
      relation: "용생체(用生體)",
      fortune: "대길",
      interpretation: `용괘 ${yongName}이 체괘 ${tiName}을 생하니 대길하다. 외부의 도움으로 일이 크게 성취되고, 귀인의 조력이 있다.`,
    };
  }

  // 체가 용을 생함 → 설기(洩氣), 흉
  if (GENERATES[tiElement] === yongElement) {
    return {
      relation: "체생용(體生用)",
      fortune: "흉",
      interpretation: `체괘 ${tiName}이 용괘 ${yongName}을 생하니 기운이 빠져나간다. 소모가 크고 노력에 비해 결과가 적으며, 재물 손실에 주의해야 한다.`,
    };
  }

  // 체가 용을 극함 → 길
  if (OVERCOMES[tiElement] === yongElement) {
    return {
      relation: "체극용(體克用)",
      fortune: "길",
      interpretation: `체괘 ${tiName}이 용괘 ${yongName}을 극하니 길하다. 상황을 주도할 수 있으며, 목표를 달성하고 원하는 것을 얻을 수 있다.`,
    };
  }

  // 용이 체를 극함 → 대흉
  if (OVERCOMES[yongElement] === tiElement) {
    return {
      relation: "용극체(用克體)",
      fortune: "대흉",
      interpretation: `용괘 ${yongName}이 체괘 ${tiName}을 극하니 대흉하다. 외부의 방해와 압박이 심하고, 큰 손실이나 실패에 주의해야 한다. 행동을 자제하고 때를 기다려야 한다.`,
    };
  }

  return {
    relation: "무관",
    fortune: "평",
    interpretation: `체괘와 용괘의 관계가 특별하지 않으니 평범하다.`,
  };
}

// ── 전체 분석 수행 ───────────────────────────────────────

export function performAnalysis(year: number, month: number, day: number, hourNum: number): IChingAnalysis {
  // 1. 매화역수 산출
  const maeHwa = calculateMaeHwa(year, month, day, hourNum);

  // 2. 본괘
  const original = getHexagram(maeHwa.upperTrigram, maeHwa.lowerTrigram);
  const originalLines = getHexagramLines(maeHwa.upperTrigram, maeHwa.lowerTrigram);

  // 3. 변괘
  const changedResult = applyChangingLine(originalLines, maeHwa.changingLine);
  const changed = getHexagram(changedResult.upper, changedResult.lower);

  // 4. 호괘
  const mutualResult = getMutualHexagram(originalLines);
  const mutual = getHexagram(mutualResult.upper, mutualResult.lower);

  // 5. 착괘 (錯卦)
  const reversedResult = getReversedHexagram(maeHwa.upperTrigram, maeHwa.lowerTrigram);
  const reversed = getHexagram(reversedResult.upper, reversedResult.lower);

  // 6. 종괘 (綜卦)
  const invertedResult = getInvertedHexagram(maeHwa.upperTrigram, maeHwa.lowerTrigram);
  const inverted = getHexagram(invertedResult.upper, invertedResult.lower);

  // 7. 체용 분석
  const tiYong = analyzeTiYong(maeHwa.upperTrigram, maeHwa.lowerTrigram, maeHwa.changingLine);

  return {
    maeHwa,
    original,
    changed,
    mutual,
    reversed,
    inverted,
    originalLines,
    changedLines: changedResult.lines,
    tiYong,
  };
}

// ── 변효 해석 ────────────────────────────────────────────

export function getChangingLineInterpretation(changingLine: number): string {
  const positions = [
    "초효(初爻) - 일의 시작 단계. 아직 드러나지 않은 상태로 조심스럽게 관망해야 한다.",
    "이효(二爻) - 내면의 중심. 안정된 위치에서 내실을 다지는 때이다.",
    "삼효(三爻) - 내괘와 외괘의 경계. 변화의 기로에 서 있으니 신중히 결단해야 한다.",
    "사효(四爻) - 외부로 나아가는 시작. 새로운 환경에 적응하며 조심스럽게 행동해야 한다.",
    "오효(五爻) - 외괘의 중심. 가장 높은 위치로 큰 일을 도모할 수 있다.",
    "상효(上爻) - 일의 마무리 단계. 극에 달했으니 물러남을 알아야 한다.",
  ];
  return positions[changingLine - 1];
}

// ── 괘 관계 요약 ─────────────────────────────────────────

export function getHexagramRelationSummary(analysis: IChingAnalysis): string {
  const { original, changed, mutual, tiYong } = analysis;

  const lines: string[] = [
    `【본괘】 ${original.name}(${original.hanja}) - ${original.keyword}`,
    `  현재 상황: ${original.guasa}`,
    "",
    `【변괘】 ${changed.name}(${changed.hanja}) - ${changed.keyword}`,
    `  미래 전개: ${changed.guasa}`,
    "",
    `【호괘】 ${mutual.name}(${mutual.hanja}) - ${mutual.keyword}`,
    `  내면/숨은 상황: ${mutual.guasa}`,
    "",
    `【체용】 ${tiYong.relation}`,
    `  체괘: ${TRIGRAMS[tiYong.tiTrigram].name}(${TRIGRAMS[tiYong.tiTrigram].hanja}) ${ELEMENT_NAMES[tiYong.tiElement]}`,
    `  용괘: ${TRIGRAMS[tiYong.yongTrigram].name}(${TRIGRAMS[tiYong.yongTrigram].hanja}) ${ELEMENT_NAMES[tiYong.yongElement]}`,
    `  판단: ${tiYong.fortune} - ${tiYong.interpretation}`,
  ];

  return lines.join("\n");
}
