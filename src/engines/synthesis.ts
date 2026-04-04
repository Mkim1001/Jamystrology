// ============================================================
// 종합 분석(Synthesis) 메타 엔진
// 6개 점술 시스템의 DivinationResult를 교차 분석
// ============================================================

import type { DivinationResult, DivinationNode, DivinationEdge, DivinationElement } from "@/types/divination";

// ── 오행 타입 ────────────────────────────────────────────

type FiveElement = "wood" | "fire" | "earth" | "metal" | "water";
const FIVE_ELEMENTS: FiveElement[] = ["wood", "fire", "earth", "metal", "water"];
const ELEMENT_KOR: Record<FiveElement, string> = {
  wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)",
};
const ELEMENT_COLOR: Record<FiveElement, string> = {
  wood: "#a6e3a1", fire: "#f38ba8", earth: "#f9e2af", metal: "#cdd6f4", water: "#89b4fa",
};

const GENERATES: Record<FiveElement, FiveElement> = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
const OVERCOMES: Record<FiveElement, FiveElement> = { wood: "earth", fire: "metal", earth: "water", metal: "wood", water: "fire" };

// ── 시스템 이름 ──────────────────────────────────────────

const SYSTEM_NAMES = ["사주팔자", "자미두수", "기문둔갑", "주역", "호라리 점성술", "바빌로니아 점성술"] as const;
const SYSTEM_KEYS = ["saju", "ziwei", "qimen", "iching", "horary", "babylonian"] as const;
const SYSTEM_COLORS: Record<string, string> = {
  saju: "#f38ba8", ziwei: "#cba6f7", qimen: "#89b4fa",
  iching: "#a6e3a1", horary: "#f9e2af", babylonian: "#fab387",
};

// ── 입력 구조 ────────────────────────────────────────────

interface SystemResults {
  saju?: DivinationResult;
  ziwei?: DivinationResult;
  qimen?: DivinationResult;
  iching?: DivinationResult;
  horary?: DivinationResult;
  babylonian?: DivinationResult;
}

// ── 출력 구조 ────────────────────────────────────────────

interface TimelineEntry {
  period: string;
  systems: string[];
  energy: string;
  tendency: "상승" | "하강" | "전환" | "안정" | "혼란";
  confidence: number;
  description: string;
}

interface DomainAnalysis {
  domain: string;
  score: number;
  grade: "대길" | "길" | "보통" | "주의" | "흉";
  systemInputs: { system: string; factor: string; interpretation: string; sentiment: number }[];
  consensus: string;
  conflicts: string[];
  synthesis: string;
  advice: string;
}

interface ResonancePattern {
  theme: string;
  systems: string[];
  score: number;
  description: string;
}

interface ConflictEntry {
  domain: string;
  system1: { name: string; interpretation: string; sentiment: number };
  system2: { name: string; interpretation: string; sentiment: number };
  resolution: string;
}

interface LuckyFactors {
  colors: string[];
  directions: string[];
  numbers: number[];
  foods: string[];
  fields: string[];
  days: string[];
}

export interface SynthesisResult {
  fiveElementProfile: {
    scores: Record<FiveElement, number>;
    coreEnergy: FiveElement;
    weakEnergy: FiveElement;
    balance: number;
    generationChain: string;
    destructionTension: string;
  };
  timeline: TimelineEntry[];
  domains: DomainAnalysis[];
  resonances: ResonancePattern[];
  conflicts: ConflictEntry[];
  coreMessage: string;
  topThemes: string[];
  warnings: string[];
  luckyFactors: LuckyFactors;
}

// ── 메인 분석 함수 ──────────────────────────────────────

export function synthesize(results: SystemResults): DivinationResult {
  const available = getAvailableSystems(results);

  // 1. 오행 프로파일
  const fiveElementProfile = analyzeFiveElements(results, available);

  // 2. 시간축 분석
  const timeline = analyzeTimeline(results, available);

  // 3. 12대 영역 분석
  const domains = analyzeDomains(results, available);

  // 4. 공명 분석
  const resonances = analyzeResonance(results, available);

  // 5. 충돌 분석
  const conflicts = analyzeConflicts(results, available);

  // 6. 종합 메시지
  const coreMessage = buildCoreMessage(fiveElementProfile, domains, resonances);
  const topThemes = resonances.slice(0, 3).map(r => r.theme);
  const warnings = buildWarnings(conflicts, domains);

  // 7. 행운 요소
  const luckyFactors = buildLuckyFactors(fiveElementProfile.coreEnergy);

  const synthesis: SynthesisResult = {
    fiveElementProfile, timeline, domains,
    resonances, conflicts, coreMessage, topThemes, warnings, luckyFactors,
  };

  // DivinationResult 형태로 반환
  const summary = buildSummary(synthesis);
  const elements = buildElements(synthesis);
  const nodes = buildNodes(results, available);
  const edges = buildEdges(results, available, resonances, conflicts);

  return {
    system: "종합 분석(Synthesis)",
    summary,
    details: synthesis,
    elements,
    nodes,
    edges,
  };
}

// ── 사용 가능 시스템 확인 ────────────────────────────────

function getAvailableSystems(results: SystemResults): string[] {
  return SYSTEM_KEYS.filter(k => results[k] && results[k]!.summary !== "");
}

// ── 1. 오행 교차 분석 ───────────────────────────────────

function analyzeFiveElements(results: SystemResults, available: string[]) {
  const scores: Record<FiveElement, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const counts: Record<FiveElement, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  // 사주: 용신 오행
  if (results.saju?.details?.yongshin) {
    const yongshin = results.saju.details.yongshin.yongshin as FiveElement;
    if (FIVE_ELEMENTS.includes(yongshin)) { scores[yongshin] += 3; counts[yongshin]++; }
    // 일간 오행
    const dmElement = results.saju.details?.dayMaster?.element as FiveElement;
    if (dmElement && FIVE_ELEMENTS.includes(dmElement)) { scores[dmElement] += 2; counts[dmElement]++; }
  }

  // 주역: 체괘/용괘 오행
  if (results.iching?.details?.tiYong) {
    const tiElem = results.iching.details.tiYong.tiElement as FiveElement;
    const yongElem = results.iching.details.tiYong.yongElement as FiveElement;
    if (tiElem && FIVE_ELEMENTS.includes(tiElem)) { scores[tiElem] += 2; counts[tiElem]++; }
    if (yongElem && FIVE_ELEMENTS.includes(yongElem)) { scores[yongElem] += 1; counts[yongElem]++; }
  }

  // 기문둔갑: 궁 오행 (중궁)
  if (results.qimen?.details?.chart?.centerPalace) {
    const centerElem = results.qimen.details.chart.centerPalace.element as FiveElement;
    if (centerElem && FIVE_ELEMENTS.includes(centerElem)) { scores[centerElem] += 2; counts[centerElem]++; }
  }

  // 바빌로니아: 경로 오행
  if (results.babylonian?.details?.path?.element) {
    const pathElem = results.babylonian.details.path.element as FiveElement;
    if (FIVE_ELEMENTS.includes(pathElem)) { scores[pathElem] += 1; counts[pathElem]++; }
  }

  // 호라리: ASC 사인 오행
  if (results.horary?.details?.chart?.ascSign !== undefined) {
    const signElements: FiveElement[] = ["fire", "earth", "metal", "water", "fire", "earth", "metal", "water", "fire", "earth", "metal", "water"];
    const elem = signElements[results.horary.details.chart.ascSign as number];
    if (elem) { scores[elem] += 1; counts[elem]++; }
  }

  // 정규화 (0-100)
  const maxScore = Math.max(...Object.values(scores), 1);
  const normalized: Record<FiveElement, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const e of FIVE_ELEMENTS) {
    normalized[e] = Math.round((scores[e] / maxScore) * 100);
  }

  // 핵심/약한 에너지
  const coreEnergy = FIVE_ELEMENTS.reduce((a, b) => normalized[a] >= normalized[b] ? a : b);
  const weakEnergy = FIVE_ELEMENTS.reduce((a, b) => normalized[a] <= normalized[b] ? a : b);

  // 밸런스 점수 (표준편차 기반)
  const values = Object.values(normalized);
  const mean = values.reduce((a, b) => a + b) / 5;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / 5;
  const balance = Math.max(0, Math.round(100 - Math.sqrt(variance) * 2));

  // 상생 체인
  let strongestChain = "";
  let strongestChainScore = 0;
  for (const start of FIVE_ELEMENTS) {
    let current = start;
    let chainScore = normalized[current];
    let chain = ELEMENT_KOR[current];
    for (let i = 0; i < 2; i++) {
      current = GENERATES[current];
      chainScore += normalized[current];
      chain += `→${ELEMENT_KOR[current]}`;
    }
    if (chainScore > strongestChainScore) {
      strongestChainScore = chainScore;
      strongestChain = chain;
    }
  }

  // 상극 긴장점
  let tensionPoint = "";
  let maxTension = 0;
  for (const e of FIVE_ELEMENTS) {
    const target = OVERCOMES[e];
    const tension = Math.min(normalized[e], normalized[target]);
    if (tension > maxTension && normalized[e] > 30 && normalized[target] > 30) {
      maxTension = tension;
      tensionPoint = `${ELEMENT_KOR[e]}→${ELEMENT_KOR[target]} 상극 (${normalized[e]}% vs ${normalized[target]}%)`;
    }
  }
  if (!tensionPoint) tensionPoint = "특별한 상극 긴장 없음";

  return {
    scores: normalized,
    coreEnergy,
    weakEnergy,
    balance,
    generationChain: `${strongestChain} 흐름이 가장 강함`,
    destructionTension: tensionPoint,
  };
}

// ── 2. 시간축 분석 ──────────────────────────────────────

function analyzeTimeline(results: SystemResults, available: string[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  // 즉시 (기문+호라리)
  const immediateSystems: string[] = [];
  let immediateTendency: TimelineEntry["tendency"] = "안정";
  if (available.includes("qimen")) {
    immediateSystems.push("기문둔갑");
    const qimenDetails = results.qimen?.details;
    if (qimenDetails?.geokguks?.length > 0) {
      const firstGeokguk = qimenDetails!.geokguks[0];
      if (firstGeokguk?.type === "길") immediateTendency = "상승";
      else if (firstGeokguk?.type === "흉") immediateTendency = "하강";
    }
  }
  if (available.includes("horary")) {
    immediateSystems.push("호라리");
    const judgment = results.horary?.details?.judgment;
    if (judgment?.overallAnswer === "긍정") immediateTendency = "상승";
    else if (judgment?.overallAnswer === "부정") immediateTendency = "하강";
  }
  entries.push({
    period: "즉시 (1주 내)", systems: immediateSystems,
    energy: "다양", tendency: immediateTendency,
    confidence: immediateSystems.length / 2,
    description: `${immediateSystems.length}개 시스템 기반 단기 판단`,
  });

  // 단기 (주역+세운)
  const shortSystems: string[] = [];
  let shortTendency: TimelineEntry["tendency"] = "안정";
  if (available.includes("iching")) {
    shortSystems.push("주역");
    const ichingJudg = results.iching?.details?.original?.judgment;
    if (ichingJudg === "대길" || ichingJudg === "길") shortTendency = "상승";
    else if (ichingJudg === "흉" || ichingJudg === "대흉") shortTendency = "하강";
  }
  if (available.includes("saju")) { shortSystems.push("사주(세운)"); }
  entries.push({
    period: "단기 (3개월)", systems: shortSystems,
    energy: "다양", tendency: shortTendency,
    confidence: shortSystems.length / 2,
    description: `${shortSystems.length}개 시스템 기반 단기 운세`,
  });

  // 중기 (세운+자미소한)
  const midSystems: string[] = [];
  if (available.includes("saju")) midSystems.push("사주(세운)");
  if (available.includes("ziwei")) midSystems.push("자미두수(소한)");
  entries.push({
    period: "중기 (올해)", systems: midSystems,
    energy: "다양", tendency: "안정",
    confidence: midSystems.length / 2,
    description: `${midSystems.length}개 시스템 기반 연간 운세`,
  });

  // 장기 (대운+대한)
  const longSystems: string[] = [];
  if (available.includes("saju")) longSystems.push("사주(대운)");
  if (available.includes("ziwei")) longSystems.push("자미두수(대한)");
  entries.push({
    period: "장기 (1~10년)", systems: longSystems,
    energy: "다양", tendency: "안정",
    confidence: longSystems.length / 2,
    description: `${longSystems.length}개 시스템 기반 장기 운세`,
  });

  return entries;
}

// ── 3. 12대 영역 분석 ───────────────────────────────────

const DOMAIN_NAMES = [
  "총운/자아", "재물/수입", "사업/직업", "건강",
  "연애/결혼", "가족/부모", "자녀/후손", "학업/시험",
  "이동/해외", "인간관계", "부동산/주거", "영적/내면",
];

function analyzeDomains(results: SystemResults, available: string[]): DomainAnalysis[] {
  return DOMAIN_NAMES.map((domain, idx) => {
    const inputs = getDomainInputs(domain, idx, results, available);
    const avgSentiment = inputs.length > 0
      ? inputs.reduce((sum, i) => sum + i.sentiment, 0) / inputs.length
      : 0;
    const score = Math.round(Math.max(0, Math.min(100, 50 + avgSentiment * 50)));
    const grade = score >= 80 ? "대길" as const
      : score >= 65 ? "길" as const
      : score >= 45 ? "보통" as const
      : score >= 30 ? "주의" as const
      : "흉" as const;

    const positives = inputs.filter(i => i.sentiment > 0.2);
    const negatives = inputs.filter(i => i.sentiment < -0.2);
    const consensus = positives.length > negatives.length
      ? `${domain} 영역은 대체로 긍정적. ${positives.length}개 시스템이 호의적 판단.`
      : negatives.length > positives.length
      ? `${domain} 영역에 주의 필요. ${negatives.length}개 시스템이 경고.`
      : `${domain} 영역은 혼재. 시스템 간 의견이 나뉨.`;

    const conflicts = findDomainConflicts(inputs);
    const synthesis = buildDomainSynthesis(domain, inputs, score, grade);
    const advice = buildDomainAdvice(domain, grade, avgSentiment);

    return { domain, score, grade, systemInputs: inputs, consensus, conflicts, synthesis, advice };
  });
}

function getDomainInputs(
  domain: string, idx: number, results: SystemResults, available: string[],
): DomainAnalysis["systemInputs"] {
  const inputs: DomainAnalysis["systemInputs"] = [];

  // 사주
  if (available.includes("saju") && results.saju) {
    const sajuInput = extractSajuDomainInput(domain, results.saju);
    if (sajuInput) inputs.push(sajuInput);
  }

  // 자미두수
  if (available.includes("ziwei") && results.ziwei) {
    const ziweiInput = extractZiweiDomainInput(domain, results.ziwei);
    if (ziweiInput) inputs.push(ziweiInput);
  }

  // 기문둔갑
  if (available.includes("qimen") && results.qimen) {
    inputs.push({
      system: "기문둔갑",
      factor: "격국 분석",
      interpretation: results.qimen.summary.split("\n")[0] || "분석 중",
      sentiment: getSummaryBasedSentiment(results.qimen.summary),
    });
  }

  // 주역
  if (available.includes("iching") && results.iching) {
    const ichingJudgment = results.iching.details?.original?.judgment;
    const sentiment = ichingJudgment === "대길" ? 0.9 : ichingJudgment === "길" ? 0.5
      : ichingJudgment === "흉" ? -0.5 : ichingJudgment === "대흉" ? -0.9 : 0;
    inputs.push({
      system: "주역",
      factor: `본괘: ${results.iching.details?.original?.name || ""}`,
      interpretation: results.iching.details?.original?.keyword || "",
      sentiment,
    });
  }

  // 호라리
  if (available.includes("horary") && results.horary) {
    const judgment = results.horary.details?.judgment;
    const sentiment = judgment?.overallAnswer === "긍정" ? 0.6
      : judgment?.overallAnswer === "부정" ? -0.6 : 0;
    inputs.push({
      system: "호라리",
      factor: `판단: ${judgment?.overallAnswer || ""}`,
      interpretation: judgment?.reasoning?.[0] || "",
      sentiment,
    });
  }

  // 바빌로니아
  if (available.includes("babylonian") && results.babylonian) {
    const fortune = results.babylonian.details?.overallFortune;
    const sentiment = fortune === "대길" ? 0.8 : fortune === "길" ? 0.4
      : fortune === "흉" ? -0.4 : fortune === "대흉" ? -0.8 : 0;
    inputs.push({
      system: "바빌로니아",
      factor: `${results.babylonian.details?.babMonth?.korean || ""} ${results.babylonian.details?.lunarPhase?.korean || ""}`,
      interpretation: results.babylonian.details?.dayOmen?.description || "",
      sentiment,
    });
  }

  return inputs;
}

function extractSajuDomainInput(domain: string, saju: DivinationResult) {
  const yongshinElem = saju.details?.yongshin?.yongshin;
  const strength = saju.details?.yongshin?.strength;
  return {
    system: "사주팔자",
    factor: `용신: ${yongshinElem || "?"} | ${strength || ""}`,
    interpretation: saju.details?.yongshin?.explanation || saju.summary.split("\n")[0] || "",
    sentiment: strength === "신강" ? 0.3 : strength === "신약" ? -0.1 : 0.1,
  };
}

function extractZiweiDomainInput(domain: string, ziwei: DivinationResult) {
  return {
    system: "자미두수",
    factor: "명궁 분석",
    interpretation: ziwei.summary.split("\n")[0] || "",
    sentiment: getSummaryBasedSentiment(ziwei.summary),
  };
}

function getSummaryBasedSentiment(summary: string): number {
  const positive = ["길", "좋", "유리", "성취", "번영", "길격"].filter(w => summary.includes(w)).length;
  const negative = ["흉", "주의", "불리", "곤란", "위험", "흉격"].filter(w => summary.includes(w)).length;
  return Math.max(-1, Math.min(1, (positive - negative) * 0.3));
}

function findDomainConflicts(inputs: DomainAnalysis["systemInputs"]): string[] {
  const conflicts: string[] = [];
  for (let i = 0; i < inputs.length; i++) {
    for (let j = i + 1; j < inputs.length; j++) {
      if ((inputs[i].sentiment > 0.3 && inputs[j].sentiment < -0.3) ||
          (inputs[i].sentiment < -0.3 && inputs[j].sentiment > 0.3)) {
        conflicts.push(`${inputs[i].system}(${inputs[i].sentiment > 0 ? "+" : "-"}) vs ${inputs[j].system}(${inputs[j].sentiment > 0 ? "+" : "-"})`);
      }
    }
  }
  return conflicts;
}

function buildDomainSynthesis(domain: string, inputs: DomainAnalysis["systemInputs"], score: number, grade: string): string {
  if (inputs.length === 0) return `${domain} 영역에 대한 분석 데이터가 부족합니다.`;
  const positive = inputs.filter(i => i.sentiment > 0).length;
  const negative = inputs.filter(i => i.sentiment < 0).length;
  return `${domain}: ${inputs.length}개 시스템 중 ${positive}개 긍정, ${negative}개 부정. 종합 ${score}점(${grade}).`;
}

function buildDomainAdvice(domain: string, grade: string, sentiment: number): string {
  if (sentiment > 0.4) return `${domain} 영역이 호조. 적극적으로 기회를 활용하세요.`;
  if (sentiment > 0) return `${domain} 영역이 대체로 양호. 현재 방향을 유지하세요.`;
  if (sentiment > -0.3) return `${domain} 영역은 보통. 특별한 변화 없이 안정을 추구하세요.`;
  return `${domain} 영역에 주의. 무리하지 말고 신중하게 행동하세요.`;
}

// ── 4. 공명 분석 ────────────────────────────────────────

function analyzeResonance(results: SystemResults, available: string[]): ResonancePattern[] {
  const patterns: ResonancePattern[] = [];

  // 변동/이동 패턴
  const mobilitySignals: string[] = [];
  if (results.saju?.details?.spiritKills) {
    const spirits = results.saju.details.spiritKills;
    if (Array.isArray(spirits) && spirits.some((s: any) => s.name === "역마")) mobilitySignals.push("사주(역마)");
  }
  if (results.iching?.details?.original?.keyword?.includes("변")) mobilitySignals.push("주역(변화괘)");
  if (results.horary?.details?.judgment?.overallAnswer === "긍정") mobilitySignals.push("호라리(긍정)");
  if (mobilitySignals.length >= 2) {
    patterns.push({
      theme: "변동/이동의 시기",
      systems: mobilitySignals,
      score: mobilitySignals.length / available.length,
      description: "여러 시스템이 변화와 이동을 암시합니다. 이사, 이직, 또는 생활 패턴의 변화가 예상됩니다.",
    });
  }

  // 번영 패턴
  const prosperitySignals: string[] = [];
  if (results.saju?.details?.yongshin?.strength === "신강") prosperitySignals.push("사주(신강)");
  if (results.iching?.details?.original?.judgment === "대길" || results.iching?.details?.original?.judgment === "길") prosperitySignals.push("주역(길괘)");
  if (results.babylonian?.details?.overallFortune === "길" || results.babylonian?.details?.overallFortune === "대길") prosperitySignals.push("바빌로니아(길운)");
  if (results.horary?.details?.judgment?.overallAnswer === "긍정") prosperitySignals.push("호라리(긍정)");
  if (prosperitySignals.length >= 2) {
    patterns.push({
      theme: "번영과 성장의 기운",
      systems: prosperitySignals,
      score: prosperitySignals.length / available.length,
      description: "다수 시스템이 긍정적 에너지를 감지합니다. 성장과 발전의 기회를 적극 활용하세요.",
    });
  }

  // 시련 패턴
  const challengeSignals: string[] = [];
  if (results.iching?.details?.original?.judgment === "흉" || results.iching?.details?.original?.judgment === "대흉") challengeSignals.push("주역(흉괘)");
  if (results.horary?.details?.moon?.voidOfCourse) challengeSignals.push("호라리(VOC)");
  if (results.babylonian?.details?.overallFortune === "흉" || results.babylonian?.details?.overallFortune === "대흉") challengeSignals.push("바빌로니아(흉운)");
  if (challengeSignals.length >= 2) {
    patterns.push({
      theme: "시련과 인내의 시기",
      systems: challengeSignals,
      score: challengeSignals.length / available.length,
      description: "여러 시스템이 어려움을 예고합니다. 무리하지 말고 내실을 다지는 시기로 삼으세요.",
    });
  }

  // 귀인 패턴
  const nobleSignals: string[] = [];
  if (results.saju?.details?.spiritKills) {
    const spirits = results.saju.details.spiritKills;
    if (Array.isArray(spirits) && spirits.some((s: any) => s.name === "천을귀인" || s.name === "월덕귀인")) nobleSignals.push("사주(귀인)");
  }
  if (results.iching?.details?.tiYong?.fortune === "대길") nobleSignals.push("주역(대길)");
  if (nobleSignals.length >= 1) {
    patterns.push({
      theme: "귀인/조력자 출현",
      systems: nobleSignals,
      score: nobleSignals.length / available.length,
      description: "조력자나 귀인의 도움이 예상됩니다. 사람과의 인연을 소중히 여기세요.",
    });
  }

  // 점수 높은 순 정렬
  patterns.sort((a, b) => b.score - a.score);
  return patterns;
}

// ── 5. 충돌 분석 ────────────────────────────────────────

function analyzeConflicts(results: SystemResults, available: string[]): ConflictEntry[] {
  const conflicts: ConflictEntry[] = [];

  // 주역 vs 사주 충돌 체크
  if (results.iching && results.saju) {
    const ichingFortune = results.iching.details?.tiYong?.fortune;
    const sajuStrength = results.saju.details?.yongshin?.strength;

    if ((ichingFortune === "대흉" || ichingFortune === "흉") && sajuStrength === "신강") {
      conflicts.push({
        domain: "총운",
        system1: { name: "사주", interpretation: "신강(身强) - 기본 체력 양호", sentiment: 0.5 },
        system2: { name: "주역", interpretation: `체용 ${ichingFortune} - 에너지 소모/장애`, sentiment: -0.5 },
        resolution: "기본 역량은 충분하나 현재 시점의 행동에 주의 필요. 사주(장기)와 주역(현재) 시간대 차이로 인한 불일치.",
      });
    }
  }

  // 호라리 vs 바빌로니아 충돌
  if (results.horary && results.babylonian) {
    const horaryAnswer = results.horary.details?.judgment?.overallAnswer;
    const babFortune = results.babylonian.details?.overallFortune;

    if ((horaryAnswer === "긍정" && (babFortune === "흉" || babFortune === "대흉")) ||
        (horaryAnswer === "부정" && (babFortune === "길" || babFortune === "대길"))) {
      conflicts.push({
        domain: "시기 판단",
        system1: { name: "호라리", interpretation: `판단: ${horaryAnswer}`, sentiment: horaryAnswer === "긍정" ? 0.5 : -0.5 },
        system2: { name: "바빌로니아", interpretation: `운세: ${babFortune}`, sentiment: babFortune === "길" || babFortune === "대길" ? 0.5 : -0.5 },
        resolution: "호라리는 특정 질문에 대한 답이고, 바빌로니아는 전반적 시기운. 맥락에 따라 해석이 다를 수 있음.",
      });
    }
  }

  return conflicts;
}

// ── 6. 종합 메시지 ──────────────────────────────────────

function buildCoreMessage(
  elements: SynthesisResult["fiveElementProfile"],
  domains: DomainAnalysis[],
  resonances: ResonancePattern[],
): string {
  const goodDomains = domains.filter(d => d.score >= 65).length;
  const badDomains = domains.filter(d => d.score < 40).length;

  if (resonances.length > 0 && resonances[0].score >= 0.5) {
    return `${resonances[0].theme}: ${resonances[0].description} 핵심 에너지는 ${ELEMENT_KOR[elements.coreEnergy]}이며, ${ELEMENT_KOR[elements.weakEnergy]}의 보완이 필요합니다.`;
  }

  if (goodDomains > badDomains) {
    return `전반적으로 긍정적인 기운이 감지됩니다. 12영역 중 ${goodDomains}개가 양호하며, 핵심 에너지인 ${ELEMENT_KOR[elements.coreEnergy]}를 활용하여 기회를 잡으세요.`;
  }

  return `현재 시기는 신중함이 필요합니다. ${ELEMENT_KOR[elements.weakEnergy]}의 에너지를 보완하고, ${ELEMENT_KOR[elements.coreEnergy]}의 강점을 활용하세요. 오행 밸런스: ${elements.balance}점.`;
}

function buildWarnings(conflicts: ConflictEntry[], domains: DomainAnalysis[]): string[] {
  const warnings: string[] = [];

  for (const c of conflicts) {
    warnings.push(`${c.domain}: ${c.system1.name}과 ${c.system2.name} 판단 불일치 — ${c.resolution}`);
  }

  const badDomains = domains.filter(d => d.score < 35);
  for (const d of badDomains) {
    warnings.push(`${d.domain} 영역 주의 (${d.score}점/${d.grade}) — ${d.advice}`);
  }

  return warnings.slice(0, 5);
}

// ── 7. 행운 요소 ────────────────────────────────────────

function buildLuckyFactors(coreEnergy: FiveElement): LuckyFactors {
  const factors: Record<FiveElement, LuckyFactors> = {
    wood: { colors: ["초록", "파랑"], directions: ["동쪽"], numbers: [3, 8], foods: ["채소", "신 음식"], fields: ["교육, 출판, 환경"], days: ["목요일"] },
    fire: { colors: ["빨강", "보라"], directions: ["남쪽"], numbers: [2, 7], foods: ["구운 음식", "쓴 음식"], fields: ["IT, 예술, 엔터테인먼트"], days: ["화요일"] },
    earth: { colors: ["노랑", "갈색"], directions: ["중앙"], numbers: [5, 10], foods: ["곡물, 단 음식"], fields: ["부동산, 농업, 건설"], days: ["토요일"] },
    metal: { colors: ["흰색", "은색"], directions: ["서쪽"], numbers: [4, 9], foods: ["매운 음식, 고기"], fields: ["금융, 법률, 기계"], days: ["금요일"] },
    water: { colors: ["검정", "파랑"], directions: ["북쪽"], numbers: [1, 6], foods: ["해산물, 짠 음식"], fields: ["IT, 물류, 유통"], days: ["수요일"] },
  };
  return factors[coreEnergy];
}

// ── 요약/Elements/Nodes/Edges 생성 ─────────────────────

function buildSummary(s: SynthesisResult): string {
  return (
    `${s.coreMessage}\n` +
    `핵심 에너지: ${ELEMENT_KOR[s.fiveElementProfile.coreEnergy]} | 보완: ${ELEMENT_KOR[s.fiveElementProfile.weakEnergy]} | 밸런스: ${s.fiveElementProfile.balance}점\n` +
    `상위 테마: ${s.topThemes.join(", ") || "특별한 공명 없음"}\n` +
    `12영역 평균: ${Math.round(s.domains.reduce((sum, d) => sum + d.score, 0) / s.domains.length)}점`
  );
}

function buildElements(s: SynthesisResult): DivinationElement[] {
  const elements: DivinationElement[] = [];

  elements.push({
    label: "핵심 메시지",
    value: s.coreMessage,
    description: "6개 점술 시스템이 합의하는 가장 중요한 메시지",
  });

  elements.push({
    label: "오행 프로파일",
    value: `핵심: ${ELEMENT_KOR[s.fiveElementProfile.coreEnergy]} | 보완: ${ELEMENT_KOR[s.fiveElementProfile.weakEnergy]}`,
    description: `밸런스: ${s.fiveElementProfile.balance}점 | ${s.fiveElementProfile.generationChain} | ${s.fiveElementProfile.destructionTension}`,
  });

  for (const e of FIVE_ELEMENTS) {
    elements.push({
      label: ELEMENT_KOR[e],
      value: `${s.fiveElementProfile.scores[e]}%`,
      description: `${e === s.fiveElementProfile.coreEnergy ? "★핵심 에너지" : e === s.fiveElementProfile.weakEnergy ? "△보완 필요" : "보통"}`,
    });
  }

  for (const r of s.resonances.slice(0, 3)) {
    elements.push({
      label: `공명: ${r.theme}`,
      value: `${Math.round(r.score * 100)}% (${r.systems.length}개 시스템)`,
      description: r.description,
    });
  }

  for (const d of s.domains) {
    elements.push({
      label: d.domain,
      value: `${d.score}점 [${d.grade}]`,
      description: d.synthesis,
    });
  }

  if (s.luckyFactors) {
    elements.push({
      label: "행운의 요소",
      value: `색상: ${s.luckyFactors.colors.join("/")} | 방위: ${s.luckyFactors.directions.join("/")}`,
      description: `숫자: ${s.luckyFactors.numbers.join(",")} | 음식: ${s.luckyFactors.foods.join("/")} | 분야: ${s.luckyFactors.fields.join("/")}`,
    });
  }

  return elements;
}

function buildNodes(results: SystemResults, available: string[]): DivinationNode[] {
  const nodes: DivinationNode[] = [];

  // 중앙 종합 노드
  nodes.push({ id: "syn-core", label: "종합 분석", category: "synthesis" });

  // 6개 시스템 루트 노드
  for (let i = 0; i < SYSTEM_KEYS.length; i++) {
    const key = SYSTEM_KEYS[i];
    if (!available.includes(key)) continue;
    nodes.push({
      id: `syn-${key}`,
      label: SYSTEM_NAMES[i],
      category: "system",
    });

    // 각 시스템의 핵심 노드 전달
    const result = results[key as keyof SystemResults];
    if (result) {
      for (const node of result.nodes.slice(0, 5)) {
        nodes.push({
          id: `syn-${key}-${node.id}`,
          label: node.label,
          category: node.category,
        });
      }
    }
  }

  // 오행 노드
  for (const e of FIVE_ELEMENTS) {
    nodes.push({
      id: `syn-element-${e}`,
      label: ELEMENT_KOR[e],
      category: "element",
    });
  }

  return nodes;
}

function buildEdges(
  results: SystemResults, available: string[],
  resonances: ResonancePattern[], conflicts: ConflictEntry[],
): DivinationEdge[] {
  const edges: DivinationEdge[] = [];

  // 시스템 → 중앙
  for (const key of available) {
    edges.push({
      source: `syn-${key}`,
      target: "syn-core",
      relation: "시스템 입력",
    });

    // 시스템 내부 핵심 노드 연결
    const result = results[key as keyof SystemResults];
    if (result) {
      for (const node of result.nodes.slice(0, 5)) {
        edges.push({
          source: `syn-${key}`,
          target: `syn-${key}-${node.id}`,
          relation: "구성 요소",
        });
      }
    }
  }

  // 오행 상생 엣지
  for (const e of FIVE_ELEMENTS) {
    const target = GENERATES[e];
    edges.push({
      source: `syn-element-${e}`,
      target: `syn-element-${target}`,
      relation: `생(生)`,
    });
  }

  // 공명 엣지
  for (const r of resonances) {
    for (let i = 0; i < r.systems.length - 1; i++) {
      const sysKey1 = findSystemKey(r.systems[i]);
      const sysKey2 = findSystemKey(r.systems[i + 1]);
      if (sysKey1 && sysKey2) {
        edges.push({
          source: `syn-${sysKey1}`,
          target: `syn-${sysKey2}`,
          relation: `공명: ${r.theme}`,
        });
      }
    }
  }

  // 충돌 엣지
  for (const c of conflicts) {
    const key1 = findSystemKey(c.system1.name);
    const key2 = findSystemKey(c.system2.name);
    if (key1 && key2) {
      edges.push({
        source: `syn-${key1}`,
        target: `syn-${key2}`,
        relation: `충돌: ${c.domain}`,
      });
    }
  }

  return edges;
}

function findSystemKey(name: string): string | null {
  const map: Record<string, string> = {
    "사주": "saju", "사주팔자": "saju", "자미": "ziwei", "자미두수": "ziwei",
    "기문": "qimen", "기문둔갑": "qimen", "주역": "iching",
    "호라리": "horary", "바빌로니아": "babylonian",
  };
  for (const [key, val] of Object.entries(map)) {
    if (name.includes(key)) return val;
  }
  return null;
}
