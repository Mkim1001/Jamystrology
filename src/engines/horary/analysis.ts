// ============================================================
// 호라리 분석 - 시그니피케이터, 판단 체계, 종합 해석
// ============================================================

import {
  Planet,
  PLANETS,
  PLANET_NAMES,
  SIGN_NAMES,
  SIGN_RULERS,
  SIGN_ELEMENTS,
  HOUSE_NAMES,
  ASPECT_NAMES,
  ASPECT_NATURES,
  VIA_COMBUSTA_START,
  VIA_COMBUSTA_END,
  calculateDignity,
  type DignityScore,
  type AspectInfo,
  type AspectType,
} from "./data";
import {
  type HoraryChart,
  type PlanetPosition,
  getPlanetHouse,
  isMoonVoidOfCourse,
} from "./chart";

// ── 시그니피케이터 ──────────────────────────────────────

export interface Significators {
  querent: Planet;       // 질문자 시그니피케이터 (1하우스 룰러)
  quesited: Planet;      // 질문 대상 시그니피케이터
  quesitedHouse: number; // 질문 대상 하우스
  moonCoSig: boolean;    // 달이 공동 시그니피케이터 역할
}

export function getSignificators(chart: HoraryChart, questionHouse?: number): Significators {
  const ascSign = chart.ascSign;
  const querent = SIGN_RULERS[ascSign];

  // 질문 대상 하우스 (기본: 7하우스 = 일반적 질문)
  const qHouse = questionHouse ?? 6;
  const quesitedCusp = chart.cusps[qHouse];
  const quesitedSign = Math.floor(quesitedCusp / 30);
  const quesited = SIGN_RULERS[quesitedSign];

  // 달이 질문자 또는 대상이 아니면 공동 시그니피케이터
  const moonCoSig = querent !== "moon" && quesited !== "moon";

  return { querent, quesited, quesitedHouse: qHouse, moonCoSig };
}

// ── 디그니티 분석 ────────────────────────────────────────

export interface PlanetDignityInfo {
  planet: Planet;
  sign: number;
  degree: number;
  dignity: DignityScore;
  house: number;
  retrograde: boolean;
  description: string;
}

export function analyzeDignities(chart: HoraryChart): PlanetDignityInfo[] {
  return chart.planets.map(pos => {
    const dignity = calculateDignity(pos.planet, pos.sign, pos.degree, chart.isDaytime);
    const house = getPlanetHouse(pos.longitude, chart.cusps);

    let description = "";
    if (dignity.domicile) description += "본위(Domicile): 매우 강함. ";
    if (dignity.exaltation) description += "승격(Exaltation): 강함. ";
    if (dignity.triplicity) description += "삼구(Triplicity): 보통 강함. ";
    if (dignity.term) description += "텀(Term): 약간 강함. ";
    if (dignity.face) description += "데칸(Face): 미약한 힘. ";
    if (dignity.detriment) description += "손상(Detriment): 약화됨. ";
    if (dignity.fall) description += "실추(Fall): 매우 약화됨. ";
    if (!description) description = "특별한 디그니티 없음.";

    return {
      planet: pos.planet,
      sign: pos.sign,
      degree: pos.degree,
      dignity,
      house,
      retrograde: pos.retrograde,
      description: description.trim(),
    };
  });
}

// ── 리셉션 분석 ─────────────────────────────────────────

export interface Reception {
  planet1: Planet;
  planet2: Planet;
  type: "mutual" | "mixed" | "one-way";
  description: string;
}

export function analyzeReceptions(chart: HoraryChart): Reception[] {
  const receptions: Reception[] = [];
  const posMap = new Map<Planet, PlanetPosition>();
  chart.planets.forEach(p => posMap.set(p.planet, p));

  for (let i = 0; i < PLANETS.length; i++) {
    for (let j = i + 1; j < PLANETS.length; j++) {
      const p1 = PLANETS[i];
      const p2 = PLANETS[j];
      const pos1 = posMap.get(p1)!;
      const pos2 = posMap.get(p2)!;

      const p1InP2Domain = SIGN_RULERS[pos1.sign] === p2;
      const p2InP1Domain = SIGN_RULERS[pos2.sign] === p1;

      if (p1InP2Domain && p2InP1Domain) {
        receptions.push({
          planet1: p1, planet2: p2,
          type: "mutual",
          description: `${PLANET_NAMES[p1]}과 ${PLANET_NAMES[p2]}이 상호 리셉션. 서로의 사인에 위치하여 협력 관계가 강하다.`,
        });
      } else if (p1InP2Domain) {
        receptions.push({
          planet1: p1, planet2: p2,
          type: "one-way",
          description: `${PLANET_NAMES[p1]}이 ${PLANET_NAMES[p2]}의 사인에 위치. ${PLANET_NAMES[p2]}가 ${PLANET_NAMES[p1]}에 대한 지배력이 있다.`,
        });
      } else if (p2InP1Domain) {
        receptions.push({
          planet1: p2, planet2: p1,
          type: "one-way",
          description: `${PLANET_NAMES[p2]}이 ${PLANET_NAMES[p1]}의 사인에 위치. ${PLANET_NAMES[p1]}가 ${PLANET_NAMES[p2]}에 대한 지배력이 있다.`,
        });
      }
    }
  }
  return receptions;
}

// ── 달 분석 ─────────────────────────────────────────────

export interface MoonAnalysis {
  sign: number;
  degree: number;
  house: number;
  voidOfCourse: boolean;
  viaCombusta: boolean;
  lastAspect: { planet: Planet; type: AspectType } | null;
  nextAspect: { planet: Planet; type: AspectType } | null;
  description: string;
}

export function analyzeMoon(chart: HoraryChart): MoonAnalysis {
  const moonPos = chart.planets.find(p => p.planet === "moon")!;
  const house = getPlanetHouse(moonPos.longitude, chart.cusps);
  const vocResult = isMoonVoidOfCourse(moonPos, chart.aspects);

  const viaCombusta = moonPos.longitude >= VIA_COMBUSTA_START && moonPos.longitude <= VIA_COMBUSTA_END;

  const lastAspect = vocResult.lastAspect
    ? { planet: vocResult.lastAspect.planet1 === "moon" ? vocResult.lastAspect.planet2 : vocResult.lastAspect.planet1, type: vocResult.lastAspect.type }
    : null;

  const nextAspect = vocResult.nextAspect
    ? { planet: vocResult.nextAspect.planet1 === "moon" ? vocResult.nextAspect.planet2 : vocResult.nextAspect.planet1, type: vocResult.nextAspect.type }
    : null;

  let description = `달이 ${SIGN_NAMES[moonPos.sign]} ${moonPos.degree}°에 위치, ${HOUSE_NAMES[house]}에 해당.`;
  if (vocResult.voc) description += " 달이 보이드 오브 코스(Void of Course) 상태로, 현재 사인 내에서 더 이상 어스펙트를 형성하지 않아 결과가 불확실하다.";
  if (viaCombusta) description += " 달이 비아 콤부스타(Via Combusta) 구간에 있어 판단이 불안정하다.";
  if (lastAspect) description += ` 마지막 어스펙트: ${PLANET_NAMES[lastAspect.planet]}과 ${ASPECT_NAMES[lastAspect.type]}.`;
  if (nextAspect) description += ` 다음 어스펙트: ${PLANET_NAMES[nextAspect.planet]}과 ${ASPECT_NAMES[nextAspect.type]}.`;

  return {
    sign: moonPos.sign,
    degree: moonPos.degree,
    house,
    voidOfCourse: vocResult.voc,
    viaCombusta,
    lastAspect,
    nextAspect,
    description,
  };
}

// ── 판단 체계 ────────────────────────────────────────────

export interface Judgment {
  perfection: boolean;          // 성사 가능성
  perfectionType: string;       // 성사 유형
  prohibition: boolean;         // 금지 (제3 행성 방해)
  refranation: boolean;         // 회피 (역행으로 못 만남)
  overallAnswer: "긍정" | "부정" | "불확실" | "조건부";
  confidence: number;           // 확신도 (0-100)
  reasoning: string[];          // 판단 근거
}

export function makeJudgment(
  chart: HoraryChart,
  sigs: Significators,
  dignities: PlanetDignityInfo[],
  moonInfo: MoonAnalysis,
  receptions: Reception[],
): Judgment {
  const reasoning: string[] = [];
  let perfection = false;
  let perfectionType = "없음";
  let prohibition = false;
  let refranation = false;
  let positiveScore = 0;
  let negativeScore = 0;

  const querentPos = chart.planets.find(p => p.planet === sigs.querent)!;
  const quesitedPos = chart.planets.find(p => p.planet === sigs.quesited)!;

  // 1. 시그니피케이터 간 어스펙트 확인
  const sigAspects = chart.aspects.filter(a =>
    (a.planet1 === sigs.querent && a.planet2 === sigs.quesited) ||
    (a.planet1 === sigs.quesited && a.planet2 === sigs.querent)
  );

  if (sigAspects.length > 0) {
    const asp = sigAspects[0];
    if (asp.applying) {
      perfection = true;
      const nature = ASPECT_NATURES[asp.type];
      if (nature === "harmonious") {
        perfectionType = `적용 ${ASPECT_NAMES[asp.type]} - 순조로운 성사`;
        positiveScore += 30;
        reasoning.push(`질문자(${PLANET_NAMES[sigs.querent]})와 대상(${PLANET_NAMES[sigs.quesited]})이 ${ASPECT_NAMES[asp.type]}으로 접근 중 → 성사 가능성 높음`);
      } else if (nature === "tense") {
        perfectionType = `적용 ${ASPECT_NAMES[asp.type]} - 어려움 속 성사`;
        positiveScore += 10;
        reasoning.push(`질문자와 대상이 ${ASPECT_NAMES[asp.type]}으로 접근 중 → 어려움이 있으나 성사 가능`);
      } else {
        perfectionType = `적용 ${ASPECT_NAMES[asp.type]} - 합`;
        positiveScore += 20;
        reasoning.push(`질문자와 대상이 합(conjunction)으로 접근 중 → 직접적 만남/성사`);
      }

      // 역행으로 인한 회피 (Refranation)
      if (querentPos.retrograde || quesitedPos.retrograde) {
        refranation = true;
        negativeScore += 20;
        reasoning.push("시그니피케이터가 역행 중 → 회피(Refranation) 가능성, 일이 무산될 수 있음");
      }
    } else {
      reasoning.push(`질문자와 대상이 ${ASPECT_NAMES[asp.type]}이나 분리 중 → 이미 기회가 지나감`);
      negativeScore += 15;
    }
  } else {
    reasoning.push("질문자와 대상 사이에 직접 어스펙트 없음 → 직접적 성사 어려움");
    negativeScore += 20;
  }

  // 2. 달의 중재 (Translation of Light) 확인
  if (!perfection && moonInfo.nextAspect) {
    const moonToQuerent = chart.aspects.find(a =>
      a.applying && ((a.planet1 === "moon" && a.planet2 === sigs.querent) || (a.planet1 === sigs.querent && a.planet2 === "moon"))
    );
    const moonToQuesited = chart.aspects.find(a =>
      a.applying && ((a.planet1 === "moon" && a.planet2 === sigs.quesited) || (a.planet1 === sigs.quesited && a.planet2 === "moon"))
    );

    if (moonToQuerent && moonToQuesited) {
      perfection = true;
      perfectionType = "달의 빛 전달(Translation of Light) - 중개자를 통한 성사";
      positiveScore += 15;
      reasoning.push("달이 질문자와 대상 모두에게 어스펙트를 형성 → 제3자를 통한 성사 가능");
    }
  }

  // 3. 달 보이드 오브 코스
  if (moonInfo.voidOfCourse) {
    negativeScore += 25;
    reasoning.push("달이 보이드 오브 코스 → '아무 일도 일어나지 않을 것이다' (주요 부정 지표)");
  }

  // 4. 비아 콤부스타
  if (moonInfo.viaCombusta) {
    negativeScore += 10;
    reasoning.push("달이 비아 콤부스타 구간 → 판단 불안정, 상황이 혼란스러움");
  }

  // 5. 디그니티 평가
  const querentDig = dignities.find(d => d.planet === sigs.querent);
  const quesitedDig = dignities.find(d => d.planet === sigs.quesited);

  if (querentDig) {
    if (querentDig.dignity.score >= 4) {
      positiveScore += 10;
      reasoning.push(`질문자 시그니피케이터(${PLANET_NAMES[sigs.querent]}) 디그니티 강함(${querentDig.dignity.score}점) → 질문자의 입장이 유리`);
    } else if (querentDig.dignity.score <= -4) {
      negativeScore += 10;
      reasoning.push(`질문자 시그니피케이터 디그니티 약함(${querentDig.dignity.score}점) → 질문자의 입장이 불리`);
    }
  }

  if (quesitedDig) {
    if (quesitedDig.dignity.score >= 4) {
      positiveScore += 5;
      reasoning.push(`대상 시그니피케이터(${PLANET_NAMES[sigs.quesited]}) 디그니티 강함 → 대상의 상태가 좋음`);
    } else if (quesitedDig.dignity.score <= -4) {
      negativeScore += 5;
      reasoning.push(`대상 시그니피케이터 디그니티 약함 → 대상의 상태가 좋지 않음`);
    }
  }

  // 6. 리셉션
  const mutualReception = receptions.find(r =>
    r.type === "mutual" &&
    ((r.planet1 === sigs.querent && r.planet2 === sigs.quesited) ||
     (r.planet1 === sigs.quesited && r.planet2 === sigs.querent))
  );
  if (mutualReception) {
    positiveScore += 15;
    reasoning.push("질문자와 대상이 상호 리셉션 → 양측 모두 원하는 관계, 매우 긍정적");
  }

  // 7. Prohibition 체크
  if (perfection) {
    for (const asp of chart.aspects) {
      if (asp.applying && asp.planet1 !== sigs.querent && asp.planet1 !== sigs.quesited
        && asp.planet2 !== sigs.querent && asp.planet2 !== sigs.quesited) continue;

      // 제3 행성이 끼어드는지 확인
      const third = chart.aspects.find(a =>
        a.applying &&
        a.planet1 !== sigs.querent && a.planet1 !== sigs.quesited &&
        a.planet2 !== sigs.querent && a.planet2 !== sigs.quesited &&
        (a.planet1 === "saturn" || a.planet2 === "saturn" || a.planet1 === "mars" || a.planet2 === "mars")
      );
      if (third) {
        const malefic = third.planet1 === "saturn" || third.planet1 === "mars" ? third.planet1 : third.planet2;
        prohibition = true;
        negativeScore += 10;
        reasoning.push(`${PLANET_NAMES[malefic]}(흉성)이 개입 → 방해(Prohibition) 가능성`);
        break;
      }
    }
  }

  // 종합 판단
  const totalScore = positiveScore - negativeScore;
  let overallAnswer: "긍정" | "부정" | "불확실" | "조건부";
  let confidence: number;

  if (totalScore >= 20) {
    overallAnswer = "긍정";
    confidence = Math.min(90, 50 + totalScore);
  } else if (totalScore >= 5) {
    overallAnswer = "조건부";
    confidence = 40 + totalScore;
  } else if (totalScore >= -10) {
    overallAnswer = "불확실";
    confidence = 30;
  } else {
    overallAnswer = "부정";
    confidence = Math.min(90, 50 + Math.abs(totalScore));
  }

  return {
    perfection,
    perfectionType,
    prohibition,
    refranation,
    overallAnswer,
    confidence,
    reasoning,
  };
}

// ── 종합 해석 ────────────────────────────────────────────

export interface HoraryInterpretation {
  significators: Significators;
  dignities: PlanetDignityInfo[];
  moonAnalysis: MoonAnalysis;
  receptions: Reception[];
  judgment: Judgment;
}

export function interpret(chart: HoraryChart, questionHouse?: number): HoraryInterpretation {
  const sigs = getSignificators(chart, questionHouse);
  const dignities = analyzeDignities(chart);
  const moonInfo = analyzeMoon(chart);
  const receptions = analyzeReceptions(chart);
  const judgment = makeJudgment(chart, sigs, dignities, moonInfo, receptions);

  return { significators: sigs, dignities, moonAnalysis: moonInfo, receptions, judgment };
}
