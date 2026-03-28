// ============================================================
// 기문둔갑 분석 (격국, 용신, 궁별 해석)
// ============================================================

import {
  PALACE_NAMES,
  PALACE_DIRECTIONS,
  PALACE_ELEMENTS,
  SANQI_LIUYI,
  SANQI_LIUYI_SHORT,
  SANQI_LIUYI_DESCRIPTIONS,
  STAR_NATURES,
  GATE_NATURES,
  SPIRIT_NATURES,
  GEOKGUK_DEFS,
  type GeokgukDef,
} from "./data";
import type { QimenChart, PalaceState } from "./chart";

// ── 타입 ───────────────────────────────────────────────────
export interface GeokgukResult {
  name: string;
  type: "길" | "흉";
  palace: number;
  description: string;
}

export interface YongshinAnalysis {
  tianpan: string;
  dipan: string;
  combination: string;
  interpretation: string;
}

export interface PalaceInterpretation {
  palaceIndex: number;
  palaceName: string;
  direction: string;
  summary: string;
  tianpanDipan: string;
  starAnalysis: string;
  gateAnalysis: string;
  spiritAnalysis: string;
  overallQuality: "대길" | "길" | "중" | "흉" | "대흉";
}

// ── 격국 판단 ──────────────────────────────────────────

export function analyzeGeokguk(chart: QimenChart): GeokgukResult[] {
  const results: GeokgukResult[] = [];

  for (const palace of chart.palaces) {
    if (palace.palaceIndex === 4) continue; // 중궁 건너뜀

    const tp = palace.tianpanIdx;
    const dp = palace.dipanIdx;
    const gate = palace.gate;
    const spirit = palace.spirit;

    // 복음: 천반 = 지반
    if (tp === dp) {
      results.push({
        name: "복음(伏吟)",
        type: "흉",
        palace: palace.palaceIndex,
        description: findGeokgukDesc("복음(伏吟)"),
      });
    }

    // 반음: 천반과 지반이 대충궁 관계 (차이 4 또는 낙서상 반대)
    if (Math.abs(tp - dp) === 4 || Math.abs(tp - dp) === 5) {
      results.push({
        name: "반음(反吟)",
        type: "흉",
        palace: palace.palaceIndex,
        description: findGeokgukDesc("반음(反吟)"),
      });
    }

    // 대격: 천반 경(庚)=2 + 지반 경(庚)=2
    if (tp === 2 && dp === 2) {
      results.push({
        name: "대격(大格)",
        type: "흉",
        palace: palace.palaceIndex,
        description: findGeokgukDesc("대격(大格)"),
      });
    }

    // 형격: 천반 경(庚)=2 + 지반 을(乙)=6 또는 반대
    if ((tp === 2 && dp === 6) || (tp === 6 && dp === 2)) {
      results.push({
        name: "형격(刑格)",
        type: "흉",
        palace: palace.palaceIndex,
        description: findGeokgukDesc("형격(刑格)"),
      });
    }

    // 비궁쇄열: 천반 신(辛)=3 + 지반 임(壬)=4 또는 반대
    if ((tp === 3 && dp === 4) || (tp === 4 && dp === 3)) {
      results.push({
        name: "비궁쇄열(飛宮索烈)",
        type: "흉",
        palace: palace.palaceIndex,
        description: findGeokgukDesc("비궁쇄열(飛宮索烈)"),
      });
    }

    // 입묘: 삼기가 묘지에 들어가는 경우
    // 을(6)이 미궁(6궁→index 5는 건궁... 간략화: 을이 술궁(6))
    if (tp === 6 && (palace.palaceIndex === 5 || palace.palaceIndex === 1)) {
      results.push({
        name: "입묘(入墓)",
        type: "흉",
        palace: palace.palaceIndex,
        description: findGeokgukDesc("입묘(入墓)"),
      });
    }

    // 청룡반수: 천반 무(戊)=0 위에 지반 무(戊)=0 (이미 복음에 포함되지만 특수)
    // 또는 직부+직사 동궁일 때 별도 판단
    if (tp === 0 && dp === 0 && gate.includes("개문") || gate.includes("휴문")) {
      // 복음이지만 길문과 만나면 청룡반수로 격상
      results.push({
        name: "청룡반수(青龍返首)",
        type: "길",
        palace: palace.palaceIndex,
        description: findGeokgukDesc("청룡반수(青龍返首)"),
      });
    }

    // 비조기문: 천반 정(丁)=8 + 개문/생문
    if (tp === 8 && (gate.includes("개문") || gate.includes("생문"))) {
      results.push({
        name: "비조기문(飛鳥跌穴)",
        type: "길",
        palace: palace.palaceIndex,
        description: findGeokgukDesc("비조기문(飛鳥跌穴)"),
      });
    }

    // 옥녀수문: 천반 정(丁)=8 + 휴문 또는 천반 을(乙)=6 + 개문
    if ((tp === 8 && gate.includes("휴문")) || (tp === 6 && gate.includes("개문"))) {
      results.push({
        name: "옥녀수문(玉女守門)",
        type: "길",
        palace: palace.palaceIndex,
        description: findGeokgukDesc("옥녀수문(玉女守門)"),
      });
    }

    // 삼기득사: 삼기(을6/병7/정8) + 길문(생/개/휴)
    if ((tp === 6 || tp === 7 || tp === 8) &&
        (gate.includes("생문") || gate.includes("개문") || gate.includes("휴문"))) {
      results.push({
        name: "삼기득사(三奇得使)",
        type: "길",
        palace: palace.palaceIndex,
        description: findGeokgukDesc("삼기득사(三奇得使)"),
      });
    }

    // 구천구지: 구천+생문 또는 구지+휴문
    if ((spirit.includes("구천") && gate.includes("생문")) ||
        (spirit.includes("구지") && gate.includes("휴문"))) {
      results.push({
        name: "구천구지(九天九地)",
        type: "길",
        palace: palace.palaceIndex,
        description: findGeokgukDesc("구천구지(九天九地)"),
      });
    }
  }

  return results;
}

function findGeokgukDesc(name: string): string {
  const def = GEOKGUK_DEFS.find((g) => g.name === name);
  return def?.description ?? "";
}

// ── 용신 분석 (천반+지반 조합) ──────────────────────────

export function analyzeYongshin(chart: QimenChart): YongshinAnalysis[] {
  const results: YongshinAnalysis[] = [];

  for (const palace of chart.palaces) {
    if (palace.palaceIndex === 4) continue;

    const tpName = SANQI_LIUYI_SHORT[palace.tianpanIdx];
    const dpName = SANQI_LIUYI_SHORT[palace.dipanIdx];
    const combination = `${tpName}+${dpName}`;

    let interpretation = "";

    // 삼기 위에 삼기: 대길
    if (palace.tianpanIdx >= 6 && palace.dipanIdx >= 6) {
      interpretation = `삼기 쌍합: ${tpName}기와 ${dpName}기가 만나 학문, 예술, 귀인운이 크게 빛납니다.`;
    }
    // 삼기 위에 육의: 조합에 따라 다름
    else if (palace.tianpanIdx >= 6) {
      if (palace.dipanIdx === 2) { // 경(庚)
        interpretation = `${tpName}기가 경(庚) 위에 있어 장애를 극복할 수 있는 지혜가 있습니다. 그러나 쉽지 않은 과정입니다.`;
      } else if (palace.dipanIdx === 0) { // 무(戊)
        interpretation = `${tpName}기가 무(戊) 위에 있어 기본이 튼튼합니다. 귀인과 재물이 함께 들어옵니다.`;
      } else {
        interpretation = `${tpName}기가 ${dpName}의(儀) 위에 있어 ${tpName}기의 역량이 발휘됩니다.`;
      }
    }
    // 경(庚)이 천반: 장애와 문제
    else if (palace.tianpanIdx === 2) {
      interpretation = `경(庚)이 천반에 있어 장애물과 적이 나타납니다. ${dpName}의 기운과 충돌하여 어려움이 예상됩니다.`;
    }
    // 일반 조합
    else {
      const tpDesc = isSanqi(palace.tianpanIdx) ? "삼기" : "육의";
      const dpDesc = isSanqi(palace.dipanIdx) ? "삼기" : "육의";
      interpretation = `천반 ${tpName}(${tpDesc})과 지반 ${dpName}(${dpDesc})의 조합. ${getComboQuality(palace.tianpanIdx, palace.dipanIdx)}`;
    }

    results.push({
      tianpan: palace.tianpan,
      dipan: palace.dipan,
      combination,
      interpretation,
    });
  }

  return results;
}

function isSanqi(idx: number): boolean {
  return idx >= 6; // 을(6), 병(7), 정(8)
}

function getComboQuality(tp: number, dp: number): string {
  // 같은 부호: 복음
  if (tp === dp) return "복음의 상태로 정체됩니다. 변화를 시도하지 마세요.";
  // 경(2)이 포함: 장애
  if (tp === 2 || dp === 2) return "경금(庚金)의 장애가 있어 신중해야 합니다.";
  // 계(5): 어둠
  if (tp === 5 || dp === 5) return "계수(癸水)의 어둠이 있어 불확실합니다.";
  // 무(0): 안정
  if (tp === 0 || dp === 0) return "무토(戊土)의 안정된 기운으로 기본이 튼튼합니다.";
  return "보통의 조합으로 다른 요소와의 관계를 살펴야 합니다.";
}

// ── 궁별 종합 해석 ──────────────────────────────────────

export function interpretPalaces(chart: QimenChart): PalaceInterpretation[] {
  return chart.palaces
    .filter((p) => p.palaceIndex !== 4) // 중궁 제외
    .map((palace) => {
      const starNature = STAR_NATURES[palace.star];
      const gateNature = GATE_NATURES[palace.gate];
      const spiritNature = SPIRIT_NATURES[palace.spirit];

      // 천반+지반 분석
      const tpDesc = SANQI_LIUYI_DESCRIPTIONS[palace.tianpan] ?? "";
      const dpDesc = SANQI_LIUYI_DESCRIPTIONS[palace.dipan] ?? "";
      const tianpanDipan = `천반 ${palace.tianpan}: ${tpDesc}\n지반 ${palace.dipan}: ${dpDesc}`;

      // 구성 분석
      const starAnalysis = starNature
        ? `${palace.star} [${starNature.nature}]: ${starNature.description}`
        : `${palace.star}`;

      // 팔문 분석
      const gateAnalysis = gateNature
        ? `${palace.gate} [${gateNature.nature}]: ${gateNature.description}`
        : `${palace.gate}`;

      // 팔신 분석
      const spiritAnalysis = spiritNature
        ? `${palace.spirit} [${spiritNature.nature}]: ${spiritNature.description}`
        : `${palace.spirit}`;

      // 종합 판단
      const quality = assessOverallQuality(starNature?.nature, gateNature?.nature, spiritNature?.nature);

      const summary = buildPalaceSummary(palace, quality, starNature, gateNature, spiritNature);

      return {
        palaceIndex: palace.palaceIndex,
        palaceName: PALACE_NAMES[palace.palaceIndex],
        direction: PALACE_DIRECTIONS[palace.palaceIndex],
        summary,
        tianpanDipan,
        starAnalysis,
        gateAnalysis,
        spiritAnalysis,
        overallQuality: quality,
      };
    });
}

function assessOverallQuality(
  starNature?: string, gateNature?: string, spiritNature?: string
): "대길" | "길" | "중" | "흉" | "대흉" {
  let score = 0;
  const addScore = (n?: string) => {
    if (n === "대길") score += 2;
    else if (n === "길") score += 1;
    else if (n === "흉") score -= 1;
    else if (n === "대흉") score -= 2;
  };
  addScore(starNature);
  addScore(gateNature);
  addScore(spiritNature);

  if (score >= 4) return "대길";
  if (score >= 2) return "길";
  if (score >= 0) return "중";
  if (score >= -2) return "흉";
  return "대흉";
}

function buildPalaceSummary(
  palace: PalaceState,
  quality: string,
  starNature?: { nature: string; description: string },
  gateNature?: { nature: string; description: string },
  spiritNature?: { nature: string; description: string }
): string {
  const dir = PALACE_DIRECTIONS[palace.palaceIndex];
  const elem = PALACE_ELEMENTS[palace.palaceIndex];
  const elemNames: Record<string, string> = {
    wood: "목", fire: "화", earth: "토", metal: "금", water: "수",
  };

  let summary = `${PALACE_NAMES[palace.palaceIndex]} (${dir}방, ${elemNames[elem]}): 종합 ${quality}. `;

  // 길흉 요약
  const parts: string[] = [];
  if (starNature) {
    parts.push(`${palace.star.split("(")[0]}이(가) ${starNature.nature === "길" ? "길하게" : starNature.nature === "흉" ? "흉하게" : "중립적으로"} 작용`);
  }
  if (gateNature) {
    parts.push(`${palace.gate.split("(")[0]}이(가) ${gateNature.nature === "대길" || gateNature.nature === "길" ? "유리하게" : gateNature.nature === "대흉" || gateNature.nature === "흉" ? "불리하게" : "중립적으로"} 영향`);
  }
  if (spiritNature) {
    parts.push(`${palace.spirit.split("(")[0]}이(가) ${spiritNature.nature === "길" || spiritNature.nature === "대길" ? "도움을 줌" : spiritNature.nature === "흉" ? "주의 필요" : "중립"}`);
  }

  summary += parts.join(", ") + ".";

  // 천반+지반 요약
  const tpShort = SANQI_LIUYI_SHORT[palace.tianpanIdx];
  const dpShort = SANQI_LIUYI_SHORT[palace.dipanIdx];
  if (palace.tianpanIdx >= 6 && palace.dipanIdx >= 6) {
    summary += ` 천반 ${tpShort}기+지반 ${dpShort}기의 삼기 조합으로 매우 유리합니다.`;
  } else if (palace.tianpanIdx === 2 || palace.dipanIdx === 2) {
    summary += ` 경(庚)이 포함되어 장애에 주의해야 합니다.`;
  }

  return summary;
}
