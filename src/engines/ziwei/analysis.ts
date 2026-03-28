// ============================================================
// 자미두수 분석 (사화, 삼방사정, 대한, 궁별 해석)
// ============================================================

import {
  FOUR_TRANSFORMATIONS,
  TRANSFORMATION_NAMES,
  PALACE_NAMES,
  PALACE_DESCRIPTIONS,
  MAIN_STAR_HANJA,
  MAIN_STAR_DESCRIPTIONS,
  BRANCHES,
  BRANCH_HANJA,
} from "./data";
import type { ChartInfo, PalaceInfo, StarInfo } from "./chart";

// ── 타입 ───────────────────────────────────────────────────
export interface TransformationResult {
  type: string;     // 화록/화권/화과/화기
  star: string;     // 성요 이름
  palace: string;   // 해당 궁
  branch: number;   // 궁 위치
}

export interface SanfangResult {
  palace: string;           // 기준 궁
  directBranch: number;     // 본궁
  oppositeBranch: number;   // 대궁
  trines: [number, number]; // 삼방 (120도)
  allStars: StarInfo[];     // 삼방사정 내 모든 성요
  interpretation: string;
}

export interface DahanPeriod {
  startAge: number;
  endAge: number;
  palaceName: string;
  branch: number;
  stars: StarInfo[];
  transformations: string[];
}

// ── 사화(四化) 적용 ────────────────────────────────────
export function applyFourTransformations(
  chart: ChartInfo
): TransformationResult[] {
  const results: TransformationResult[] = [];
  const yearStem = chart.yearStem;
  const [huaLu, huaQuan, huaKe, huaJi] = FOUR_TRANSFORMATIONS[yearStem];
  const transforms = [
    { type: "화록", star: huaLu },
    { type: "화권", star: huaQuan },
    { type: "화과", star: huaKe },
    { type: "화��", star: huaJi },
  ];

  for (const t of transforms) {
    for (const palace of chart.palaces) {
      const found = palace.stars.find((s) => s.name === t.star);
      if (found) {
        palace.transformations.push(t.type);
        results.push({
          type: t.type,
          star: t.star,
          palace: palace.name,
          branch: palace.branch,
        });
        break; // 각 사화는 하나의 궁에만 적용
      }
    }
  }

  return results;
}

// ── 삼방사정(三方四正) 분석 ─────────────────────────────
export function analyzeSanfang(chart: ChartInfo): SanfangResult[] {
  const results: SanfangResult[] = [];
  const branchToPalace = new Map<number, PalaceInfo>();
  for (const p of chart.palaces) {
    branchToPalace.set(p.branch, p);
  }

  for (const palace of chart.palaces) {
    const b = palace.branch;
    const oppBranch = (b + 6) % 12;
    const trine1 = (b + 4) % 12;
    const trine2 = (b + 8) % 12;

    const relatedBranches = [b, oppBranch, trine1, trine2];
    const allStars: StarInfo[] = [];
    for (const rb of relatedBranches) {
      const rp = branchToPalace.get(rb);
      if (rp) {
        allStars.push(...rp.stars);
      }
    }

    const oppPalace = branchToPalace.get(oppBranch);
    const trine1Palace = branchToPalace.get(trine1);
    const trine2Palace = branchToPalace.get(trine2);

    const interp = buildSanfangInterpretation(palace, oppPalace, trine1Palace, trine2Palace);

    results.push({
      palace: palace.name,
      directBranch: b,
      oppositeBranch: oppBranch,
      trines: [trine1, trine2],
      allStars,
      interpretation: interp,
    });
  }

  return results;
}

function buildSanfangInterpretation(
  main: PalaceInfo,
  opposite?: PalaceInfo,
  trine1?: PalaceInfo,
  trine2?: PalaceInfo
): string {
  const mainStarNames = main.stars.map((s) => s.name).join(", ");
  const oppStarNames = opposite?.stars.map((s) => s.name).join(", ") ?? "없음";

  const mainBright = main.stars.filter((s) => s.brightness === "묘" || s.brightness === "왕");
  const mainDark = main.stars.filter((s) => s.brightness === "함");

  let quality = "보통";
  if (mainBright.length >= 2 && mainDark.length === 0) quality = "매우 길";
  else if (mainBright.length >= 1) quality = "길";
  else if (mainDark.length >= 2) quality = "흉";
  else if (mainDark.length >= 1) quality = "다소 불리";

  const hasTransform = main.transformations.length > 0;
  const transformText = hasTransform
    ? ` ${main.transformations.join(", ")}이(가) 들어와 기운이 변화합니다.`
    : "";

  return (
    `${main.name} [${BRANCHES[main.branch]}${BRANCH_HANJA[main.branch]}]: ${quality}. ` +
    `본궁의 성요: ${mainStarNames || "없음"}. 대궁(${opposite?.name ?? ""}): ${oppStarNames}.` +
    transformText
  );
}

// ── 대한(大限) 산출 ────────────────────────────────────
export function calculateDahan(
  chart: ChartInfo,
  gender: "male" | "female",
  birthYear: number
): DahanPeriod[] {
  const periods: DahanPeriod[] = [];
  const bureau = chart.bureau;
  const yearStem = chart.yearStem;

  // 순행/역행 결정: 양남음녀 순행, 음남양녀 역행
  const isYang = yearStem % 2 === 0;
  const isMale = gender === "male";
  const forward = (isYang && isMale) || (!isYang && !isMale);

  const currentAge = new Date().getFullYear() - birthYear;

  // 명궁 위치에서 시작
  const mingGongBranch = chart.mingGongBranch;

  for (let i = 0; i < 12; i++) {
    const startAge = bureau + i * 10;
    const endAge = startAge + 9;

    // 대한 궁 위치: 순행이면 시계방향(branch 증가), 역행이면 반시계
    const branch = forward
      ? (mingGongBranch + i) % 12
      : ((mingGongBranch - i) % 12 + 12) % 12;

    // 해당 궁 찾기
    const palace = chart.palaces.find((p) => p.branch === branch);

    periods.push({
      startAge,
      endAge,
      palaceName: palace?.name ?? `${BRANCHES[branch]}궁`,
      branch,
      stars: palace?.stars ?? [],
      transformations: palace?.transformations ?? [],
    });
  }

  return periods;
}

// ── 궁별 종합 해석 ─────────────────────────────────────
export interface PalaceInterpretation {
  palace: string;
  baseDescription: string;
  starAnalysis: string;
  brightnessNote: string;
  transformNote: string;
}

export function interpretPalaces(chart: ChartInfo): PalaceInterpretation[] {
  return chart.palaces.map((palace) => {
    const baseDescription = PALACE_DESCRIPTIONS[palace.name] ?? "";

    // 성요 분석
    const starTexts = palace.stars
      .filter((s) => s.series === "자미계" || s.series === "천부계")
      .map((s) => {
        const desc = MAIN_STAR_DESCRIPTIONS[s.name] ?? "";
        const brightLabel = getBrightnessLabel(s.brightness);
        return `${s.name}(${MAIN_STAR_HANJA[s.name] ?? ""}) [${brightLabel}]: ${desc}`;
      });

    const auxStarNames = palace.stars
      .filter((s) => s.series === "보성" || s.series === "잡성")
      .map((s) => s.name);

    let starAnalysis = "";
    if (starTexts.length > 0) {
      starAnalysis = starTexts.join("\n");
    } else {
      starAnalysis = "주성이 없는 궁입니다. 삼방사정의 성요로 판단합니다.";
    }
    if (auxStarNames.length > 0) {
      starAnalysis += `\n보조성: ${auxStarNames.join(", ")}`;
    }

    // 밝기 종합
    const brightStars = palace.stars.filter(
      (s) => s.brightness === "묘" || s.brightness === "왕"
    );
    const darkStars = palace.stars.filter((s) => s.brightness === "함");
    let brightnessNote = "";
    if (brightStars.length > 0 && darkStars.length === 0) {
      brightnessNote = "성요가 묘왕(廟旺)하여 이 궁의 기운이 밝고 강합니다.";
    } else if (darkStars.length > 0 && brightStars.length === 0) {
      brightnessNote = "성요가 함지(陷地)에 있어 이 궁의 기운이 약합니다. 보성의 도움이 필요합니다.";
    } else if (brightStars.length > 0 && darkStars.length > 0) {
      brightnessNote = "묘왕과 함지의 성요가 섞여 있어 길흉이 혼재합니다.";
    } else {
      brightnessNote = "성요가 평지(平地)에 있어 무난합니다.";
    }

    // 사화
    let transformNote = "";
    if (palace.transformations.length > 0) {
      for (const t of palace.transformations) {
        switch (t) {
          case "화록":
            transformNote += "화록(化祿)이 들어와 재물과 풍요의 기운이 더해집니다. ";
            break;
          case "화권":
            transformNote += "화권(化權)이 들어와 권력과 주도권의 기운이 강해집니다. ";
            break;
          case "화과":
            transformNote += "화과(化科)가 들어와 학문과 명예의 기운이 빛납니다. ";
            break;
          case "화기":
            transformNote += "화기(化忌)가 들어와 집착과 시련의 기운이 있습니다. 주의가 필요합니다. ";
            break;
        }
      }
    }

    return {
      palace: palace.name,
      baseDescription,
      starAnalysis,
      brightnessNote,
      transformNote: transformNote.trim(),
    };
  });
}

function getBrightnessLabel(brightness: string): string {
  switch (brightness) {
    case "묘": return "廟 - 최강";
    case "왕": return "旺 - 강";
    case "평": return "平 - 보통";
    case "함": return "陷 - 약";
    default: return brightness;
  }
}

// ── 성요 조합 해석 ──────────────────────────────────────
export function analyzeStarCombinations(palace: PalaceInfo): string[] {
  const results: string[] = [];
  const starNames = new Set(palace.stars.map((s) => s.name));

  // 유명한 성요 조합
  if (starNames.has("자미") && starNames.has("천부")) {
    results.push("자미천부 동궁: 제왕과 재상이 함께하여 부귀겸전의 대길한 조합입니다.");
  }
  if (starNames.has("자미") && starNames.has("탐랑")) {
    results.push("자미탐랑 동궁: 풍류를 즐기는 제왕. 매력적이나 색정에 주의해야 합니다.");
  }
  if (starNames.has("자미") && starNames.has("칠살")) {
    results.push("자미칠살 동궁: 권위와 카리스마가 강하며, 변화를 두려워하지 않는 리더입니다.");
  }
  if (starNames.has("자미") && starNames.has("파군")) {
    results.push("자미파군 동궁: 개혁과 변화의 리더. 파란만장하지만 큰 업적을 이룰 수 있습니다.");
  }
  if (starNames.has("태양") && starNames.has("태음")) {
    results.push("일월동궁: 해와 달이 함께하여 음양이 조화를 이루는 길한 조합입니다.");
  }
  if (starNames.has("무곡") && starNames.has("탐랑")) {
    results.push("무탐동궁: 무곡의 재물과 탐랑의 욕망이 만나 사업 수완이 뛰어납니다.");
  }
  if (starNames.has("염정") && starNames.has("칠살")) {
    results.push("염살동궁: 강렬하고 파괴적인 에너지. 큰 성취 또는 큰 좌절의 극단적 조합입니다.");
  }
  if (starNames.has("천기") && starNames.has("태음")) {
    results.push("기음동궁: 지혜와 감성이 조화되어 학문과 예술에서 큰 성취를 이룹니다.");
  }
  if (starNames.has("거문") && starNames.has("태양")) {
    results.push("거일동궁: 태양이 거문의 어둠을 밝혀주어 언변이 뛰어나고 사회적 성공이 있습니다.");
  }
  if (starNames.has("녹존") && starNames.has("천마")) {
    results.push("녹마교치: 녹존과 천마가 함께하여 재물이 활발하게 움직이며, 활동적인 재물운입니다.");
  }

  // 화록+화권 동궁
  const transforms = palace.transformations;
  if (transforms.includes("화록") && transforms.includes("화���")) {
    results.push("화록화권 동궁: 재물과 권력이 함께 들어와 매우 길한 조합입니다.");
  }
  if (transforms.includes("화기") && transforms.includes("화록")) {
    results.push("화록화기 동궁: 재물은 있으나 집착이 강해 마음고생이 있을 수 있습니다.");
  }

  return results;
}
