// ============================================================
// Ask AI 텍스트 생성 라이브러리
// 점술 결과를 구조화된 텍스트로 변환
// ============================================================

import type { DivinationResult } from "@/types/divination";

interface GenerateOptions {
  includeSystems: string[];
  promptPreset: string;
  userName: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

const SIJIN_MAP: Record<string, { hanja: string; time: string }> = {
  자: { hanja: "子", time: "23:00~01:00" }, 축: { hanja: "丑", time: "01:00~03:00" },
  인: { hanja: "寅", time: "03:00~05:00" }, 묘: { hanja: "卯", time: "05:00~07:00" },
  진: { hanja: "辰", time: "07:00~09:00" }, 사: { hanja: "巳", time: "09:00~11:00" },
  오: { hanja: "午", time: "11:00~13:00" }, 미: { hanja: "未", time: "13:00~15:00" },
  신: { hanja: "申", time: "15:00~17:00" }, 유: { hanja: "酉", time: "17:00~19:00" },
  술: { hanja: "戌", time: "19:00~21:00" }, 해: { hanja: "亥", time: "21:00~23:00" },
};

const DIVIDER = "───────────────────────────────────────";
const DOUBLE_DIVIDER = "═══════════════════════════════════════";

// ── 메인 생성 함수 ─────────────────────────────────────────

export function generateFullText(
  results: Record<string, DivinationResult>,
  synthesisResult: DivinationResult | null,
  options: GenerateOptions,
): string {
  const parts: string[] = [];

  // 헤더
  parts.push(DOUBLE_DIVIDER);
  parts.push("JAMYSTROLOGY 종합 분석 결과");
  parts.push(DOUBLE_DIVIDER);

  const sijin = SIJIN_MAP[options.birthTime];
  const sijinStr = sijin ? `${options.birthTime}시(${sijin.hanja}시) (${sijin.time})` : options.birthTime;
  parts.push(`이름: ${options.userName}`);
  parts.push(`성별: ${options.gender === "male" ? "남" : "여"}`);
  parts.push(`생년월일: 양력 ${formatBirthDate(options.birthDate)}`);
  parts.push(`생시: ${sijinStr}`);
  if (options.birthPlace) parts.push(`출생지: ${options.birthPlace}`);
  parts.push(`분석일시: ${new Date().toLocaleString("ko-KR")}`);
  parts.push("");

  // 프롬프트 프리셋
  if (options.promptPreset) {
    parts.push(`[요청] ${options.promptPreset}`);
    parts.push("");
  }

  // 각 시스템
  let sectionNum = 1;

  if (options.includeSystems.includes("saju") && results.saju) {
    parts.push(generateSajuText(results.saju, sectionNum++));
  }
  if (options.includeSystems.includes("ziwei") && results.ziwei) {
    parts.push(generateZiweiText(results.ziwei, sectionNum++));
  }
  if (options.includeSystems.includes("qimen") && results.qimen) {
    parts.push(generateQimenText(results.qimen, sectionNum++));
  }
  if (options.includeSystems.includes("iching") && results.iching) {
    parts.push(generateIchingText(results.iching, sectionNum++));
  }
  if (options.includeSystems.includes("horary") && results.horary) {
    parts.push(generateHoraryText(results.horary, sectionNum++));
  }
  if (options.includeSystems.includes("babylonian") && results.babylonian) {
    parts.push(generateBabylonianText(results.babylonian, sectionNum++));
  }
  if (options.includeSystems.includes("synthesis") && synthesisResult) {
    parts.push(generateSynthesisText(synthesisResult));
  }

  return parts.join("\n");
}

// ── 헬퍼 ───────────────────────────────────────────────────

function formatBirthDate(d: string): string {
  const [y, m, day] = d.split("-");
  return `${y}년 ${parseInt(m)}월 ${parseInt(day)}일`;
}

function sectionHeader(num: number, name: string, hanja: string): string {
  return `\n${DIVIDER}\n${num}. ${name} (${hanja})\n${DIVIDER}`;
}

function pad(str: string, len: number): string {
  const fullLen = Array.from(str).length;
  return str + " ".repeat(Math.max(0, len - fullLen));
}

// ── 사주팔자 ───────────────────────────────────────────────

function generateSajuText(r: DivinationResult, num: number): string {
  const d = r.details;
  const lines: string[] = [];

  lines.push(sectionHeader(num, "사주팔자", "四柱八字"));

  // 명식
  lines.push("【명식】");
  lines.push(`       년주      월주      일주      시주`);
  lines.push(`천간:  ${pad(d.pillars.year.label?.split("(")[0]?.slice(0, 1) || "", 8)}${pad(d.pillars.month.label?.split("(")[0]?.slice(0, 1) || "", 8)}${pad(d.pillars.day.label?.split("(")[0]?.slice(0, 1) || "", 8)}${d.pillars.hour.label?.split("(")[0]?.slice(0, 1) || ""}`);
  lines.push(`지지:  ${pad(d.pillars.year.label?.split("(")[0]?.slice(1, 2) || "", 8)}${pad(d.pillars.month.label?.split("(")[0]?.slice(1, 2) || "", 8)}${pad(d.pillars.day.label?.split("(")[0]?.slice(1, 2) || "", 8)}${d.pillars.hour.label?.split("(")[0]?.slice(1, 2) || ""}`);

  // 지장간
  if (d.hiddenStems) {
    const hsKeys = ["year", "month", "day", "hour"] as const;
    const hsLabels = hsKeys.map(k => {
      const hs = d.hiddenStems[k];
      if (!hs || !Array.isArray(hs)) return "-";
      return hs.map((h: { stemName?: string; name?: string }) => h.stemName || h.name || "").join(",");
    });
    lines.push(`지장간: ${pad(hsLabels[0], 8)}${pad(hsLabels[1], 8)}${pad(hsLabels[2], 8)}${hsLabels[3]}`);
  }
  lines.push("");

  // 일간 정보
  if (d.dayMaster) {
    lines.push(`【일간】 ${d.dayMaster.name} | ${d.dayMaster.elementName} | ${d.dayMaster.yinYang}`);
    lines.push("");
  }

  // 십신
  if (d.tenGods) {
    lines.push("【십신】");
    const tgKeys = ["year", "month", "day", "hour"] as const;
    const tgLabels = ["년주", "월주", "일주", "시주"];
    tgKeys.forEach((k, i) => {
      const tg = d.tenGods[k];
      if (tg) {
        lines.push(`${tgLabels[i]}: ${tg.stem || "(본인)"} ${tg.hanja ? `(${tg.hanja})` : ""} — ${tg.role || ""}`);
      }
    });
    lines.push("");
  }

  // 용신/기신
  if (d.yongshin) {
    lines.push("【용신/기신】");
    lines.push(`용신: ${d.yongshin.yongshin ? formatElementName(d.yongshin.yongshin) : "?"} — ${d.yongshin.explanation || ""}`);
    lines.push(`기신: ${d.yongshin.gishin ? formatElementName(d.yongshin.gishin) : "?"}`);
    lines.push(`일간 강약: ${d.yongshin.strength || "?"} (${d.yongshin.strengthScore ?? "?"}%)`);
    lines.push("");
  }

  // 합충형파해
  if (d.combinations && d.combinations.length > 0) {
    lines.push("【합충형파해】");
    d.combinations.forEach((c: { type: string; name: string; positions: string[]; description: string }) => {
      lines.push(`${c.type}: ${c.name} (${c.positions.join("-")}) — ${c.description}`);
    });
    lines.push("");
  }

  // 십이운성
  if (d.twelveStages && d.twelveStages.length > 0) {
    lines.push("【십이운성】");
    d.twelveStages.forEach((s: { position: string; stage: string; description: string }) => {
      lines.push(`${s.position}: ${s.stage} — ${s.description}`);
    });
    lines.push("");
  }

  // 신살
  if (d.spiritKills && d.spiritKills.length > 0) {
    lines.push("【신살】");
    const seen = new Set<string>();
    d.spiritKills.forEach((s: { name: string; korName: string; nature: string; description: string }) => {
      if (!seen.has(s.name)) {
        seen.add(s.name);
        lines.push(`${s.korName} (${s.nature}) — ${s.description}`);
      }
    });
    lines.push("");
  }

  // 대운
  if (d.daewun && d.daewun.periods) {
    lines.push("【대운】");
    const periods = d.daewun.periods.map((p: { stem: number; branch: number; startAge: number; endAge: number; isCurrent: boolean }, _i: number) => {
      const label = `${stemName(p.stem)}${branchName(p.branch)}(${p.startAge}~${p.endAge}세)`;
      return p.isCurrent ? `▶${label}` : label;
    });
    lines.push(periods.join(" → "));
    lines.push("");
  }

  // 세운
  if (d.sewun) {
    lines.push("【세운 (올해)】");
    lines.push(`${stemName(d.sewun.stem)}${branchName(d.sewun.branch)} (${d.sewun.year}년)`);
    lines.push("");
  }

  // 종합 해석
  lines.push("【종합 해석】");
  lines.push(r.summary);

  return lines.join("\n");
}

// ── 자미두수 ───────────────────────────────────────────────

function generateZiweiText(r: DivinationResult, num: number): string {
  const d = r.details;
  const lines: string[] = [];

  lines.push(sectionHeader(num, "자미두수", "紫微斗數"));

  // 기본 정보
  if (d.chart) {
    lines.push("【기본 정보】");
    lines.push(`명궁: ${d.chart.mingGong} | 신궁: ${d.chart.shenGong} | 오행국: ${d.chart.bureauName || `${d.chart.bureau}국`}`);
    lines.push("");
  }

  // 12궁 배치
  if (d.palaces && Array.isArray(d.palaces)) {
    lines.push("【12궁 배치】");
    d.palaces.forEach((p: { name: string; branch: string; stars: { name: string; brightness: string }[]; isBodyPalace: boolean }) => {
      const starStr = p.stars.map((s: { name: string; brightness: string }) => `${s.name}(${s.brightness})`).join(", ");
      const bodyMark = p.isBodyPalace ? " [신궁]" : "";
      lines.push(`${p.name}(${p.branch}): ${starStr || "—"}${bodyMark}`);
    });
    lines.push("");
  }

  // 사화
  if (d.transformations && d.transformations.length > 0) {
    lines.push("【사화 (四化)】");
    d.transformations.forEach((t: { type: string; star: string; palace: string }) => {
      lines.push(`${t.type}: ${t.star} → ${t.palace}`);
    });
    lines.push("");
  }

  // 삼방사정
  if (d.sanfang && d.sanfang.length > 0) {
    lines.push("【삼방사정 분석】");
    d.sanfang.forEach((s: { palace: string; interpretation: string }) => {
      lines.push(`${s.palace}: ${s.interpretation}`);
    });
    lines.push("");
  }

  // 궁 해석
  if (d.palaceInterpretations && d.palaceInterpretations.length > 0) {
    lines.push("【궁위 해석】");
    d.palaceInterpretations.forEach((p: { palace: string; interpretation: string }) => {
      lines.push(`${p.palace}: ${p.interpretation}`);
    });
    lines.push("");
  }

  // 대한
  if (d.currentDahan) {
    lines.push("【대한 (현재)】");
    lines.push(`${d.currentDahan.period} — ${d.currentDahan.palace}`);
    if (d.currentDahan.stars) {
      lines.push(`주성: ${d.currentDahan.stars}`);
    }
    lines.push("");
  }

  // 종합 해석
  lines.push("【종합 해석】");
  lines.push(r.summary);

  return lines.join("\n");
}

// ── 기문둔갑 ───────────────────────────────────────────────

function generateQimenText(r: DivinationResult, num: number): string {
  const d = r.details;
  const lines: string[] = [];

  lines.push(sectionHeader(num, "기문둔갑", "奇門遁甲"));

  // 국수
  if (d.chart) {
    lines.push("【국수】");
    lines.push(`${d.chart.isYangDun ? "양둔" : "음둔"} ${d.chart.bureauNumber}국 | 절기: ${d.chart.solarTerm} | ${d.chart.yuanQi}`);
    lines.push("");
  }

  // 구궁 배치
  if (d.palaces && Array.isArray(d.palaces)) {
    lines.push("【구궁 배치】");
    // 3x3 grid: indices [3,8,1], [2,4(center),6], [7,0,5] mapped to palace indices
    const grid = [
      [3, 8, 1],  // 4巽 9離 2坤
      [2, 4, 6],  // 3震 5中 7兌
      [7, 0, 5],  // 8艮 1坎 6乾
    ];
    const palaceMap: Record<number, typeof d.palaces[0]> = {};
    d.palaces.forEach((p: { index: number }) => { palaceMap[p.index] = p; });

    lines.push("┌──────────┬──────────┬──────────┐");
    grid.forEach((row, ri) => {
      const cells = row.map(idx => {
        const p = palaceMap[idx];
        if (!p) return pad(`${idx}궁`, 10);
        return pad(`${p.name}`, 10);
      });
      lines.push(`│ ${cells.join("│ ")}│`);

      row.forEach((idx, ci) => {
        const p = palaceMap[idx];
        if (p && ci === 0) {
          const detail = [
            `천:${p.tianpan || "-"}`,
            `지:${p.dipan || "-"}`,
            `문:${p.gate || "-"}`,
            `성:${p.star || "-"}`,
            `신:${p.spirit || "-"}`,
          ];
          // Print each palace detail on separate lines
          const otherPalaces = row.map(oidx => {
            const op = palaceMap[oidx];
            if (!op) return [];
            return [
              `천:${op.tianpan || "-"}`,
              `지:${op.dipan || "-"}`,
              `문:${op.gate || "-"}`,
              `성:${op.star || "-"}`,
              `신:${op.spirit || "-"}`,
            ];
          });
          for (let li = 0; li < 5; li++) {
            const cellLine = otherPalaces.map(op => pad(op[li] || "", 10));
            lines.push(`│ ${cellLine.join("│ ")}│`);
          }
        }
      });

      if (ri < 2) {
        lines.push("├──────────┼──────────┼──────────┤");
      }
    });
    lines.push("└──────────┴──────────┴──────────┘");
    lines.push("");
  }

  // 격국
  if (d.geokguks && d.geokguks.length > 0) {
    lines.push("【격국】");
    d.geokguks.forEach((g: { type: string; name: string; description: string; palace: number }) => {
      lines.push(`${g.name} (${g.type}) — ${g.description}`);
    });
    lines.push("");
  }

  // 종합 해석
  lines.push("【종합 해석】");
  lines.push(r.summary);

  return lines.join("\n");
}

// ── 주역 ───────────────────────────────────────────────────

function generateIchingText(r: DivinationResult, num: number): string {
  const d = r.details;
  const lines: string[] = [];

  lines.push(sectionHeader(num, "주역", "周易 — 매화역수"));

  // 괘상
  if (d.original) {
    lines.push("【괘상】");
    lines.push(`본괘: ${d.original.name} ${d.original.hanja} — ${d.original.number}번째 괘`);
    if (d.changed) lines.push(`변괘: ${d.changed.name} ${d.changed.hanja} — ${d.changed.number}번째 괘`);
    if (d.mutual) lines.push(`호괘: ${d.mutual.name} ${d.mutual.hanja}`);
    if (d.reversed) lines.push(`착괘: ${d.reversed.name} ${d.reversed.hanja}`);
    if (d.inverted) lines.push(`종괘: ${d.inverted.name} ${d.inverted.hanja}`);
    if (d.changingLine) lines.push(`변효: 제${d.changingLine.position}효`);
    lines.push("");

    // 상하괘
    if (d.original.upperTrigram && d.original.lowerTrigram) {
      lines.push("【괘 구성】");
      lines.push(`상괘: ${d.original.upperTrigram.name}(${d.original.upperTrigram.hanja}) — ${d.original.upperTrigram.nature} / ${d.original.upperTrigram.elementName}`);
      lines.push(`하괘: ${d.original.lowerTrigram.name}(${d.original.lowerTrigram.hanja}) — ${d.original.lowerTrigram.nature} / ${d.original.lowerTrigram.elementName}`);
      lines.push("");
    }

    // 괘사
    if (d.original.judgment || d.original.guasa) {
      lines.push("【본괘 괘사】");
      lines.push(d.original.judgment || d.original.guasa || "");
      lines.push("");
    }

    // 단전/상전
    if (d.original.danjeon) {
      lines.push("【단전】");
      lines.push(d.original.danjeon);
      lines.push("");
    }
    if (d.original.sangjeon) {
      lines.push("【상전】");
      lines.push(d.original.sangjeon);
      lines.push("");
    }
  }

  // 변효 효사
  if (d.changingLine) {
    lines.push("【변효 효사】");
    lines.push(`제${d.changingLine.position}효: ${d.changingLine.text}`);
    if (d.changingLine.interpretation) lines.push(`해석: ${d.changingLine.interpretation}`);
    lines.push("");
  }

  // 체용 분석
  if (d.tiYong) {
    lines.push("【체용 분석】");
    lines.push(`체괘: ${d.tiYong.tiTrigram || "?"} (${formatElementName(d.tiYong.tiElement)})`);
    lines.push(`용괘: ${d.tiYong.yongTrigram || "?"} (${formatElementName(d.tiYong.yongElement)})`);
    lines.push(`관계: ${d.tiYong.relation || "?"}`);
    lines.push(`길흉: ${d.tiYong.fortune || "?"}`);
    if (d.tiYong.interpretation) lines.push(`해석: ${d.tiYong.interpretation}`);
    lines.push("");
  }

  // 종합 해석
  lines.push("【종합 해석】");
  lines.push(r.summary);

  return lines.join("\n");
}

// ── 호라리 점성술 ──────────────────────────────────────────

function generateHoraryText(r: DivinationResult, num: number): string {
  const d = r.details;
  const lines: string[] = [];

  lines.push(sectionHeader(num, "호라리 점성술", "Horary Astrology"));

  // 질문
  if (d.horaryQuestion) {
    lines.push(`【질문】 ${d.horaryQuestion}`);
  }
  if (d.chart?.datetime) {
    lines.push(`【질문 시점】 ${d.chart.datetime}`);
  }
  lines.push("");

  // 차트 요약
  if (d.chart) {
    lines.push("【차트 요약】");
    lines.push(`ASC: ${d.chart.ascSignName || "?"} ${d.chart.asc ? `${d.chart.asc.toFixed(1)}°` : ""}`);
    lines.push(`MC: ${d.chart.mc ? `${d.chart.mc.toFixed(1)}°` : "?"}`);
    lines.push(`Planetary Hour: ${d.chart.planetaryHourName || "?"}`);
    lines.push(`Day/Night: ${d.chart.isDaytime ? "주간" : "야간"}`);
    lines.push("");
  }

  // 행성 위치
  if (d.planets && Array.isArray(d.planets)) {
    lines.push("【행성 위치】");
    d.planets.forEach((p: { symbol: string; name: string; signName: string; degree: number; minute: number; house: number; retrograde: boolean }) => {
      const retro = p.retrograde ? " (R)" : "";
      lines.push(`${p.symbol} ${p.name}: ${p.signName} ${p.degree}°${p.minute}' | ${p.house}H${retro}`);
    });
    lines.push("");
  }

  // Significators
  if (d.significators) {
    lines.push("【Significators】");
    lines.push(`Querent (1H ruler): Planet ${d.significators.querentPlanet}`);
    lines.push(`Quesited (${d.significators.quesitedHouse}H ruler): Planet ${d.significators.quesitedPlanet}`);
    lines.push(`Moon co-significator: ${d.significators.moonCoSig ? "Yes" : "No"}`);
    lines.push("");
  }

  // Dignities
  if (d.dignities && Array.isArray(d.dignities)) {
    lines.push("【Essential Dignities】");
    d.dignities.forEach((dig: { name: string; signName: string; score: number; description: string }) => {
      lines.push(`${dig.name}: ${dig.signName} | Score: ${dig.score} | ${dig.description}`);
    });
    lines.push("");
  }

  // Aspects
  if (d.aspects && Array.isArray(d.aspects) && d.aspects.length > 0) {
    lines.push("【핵심 Aspects】");
    d.aspects.forEach((a: { planet1Name: string; typeName: string; planet2Name: string; applying: boolean; orb: number; nature: string }) => {
      lines.push(`${a.planet1Name} ${a.typeName} ${a.planet2Name} (${a.applying ? "applying" : "separating"}, ${a.orb.toFixed(1)}°) [${a.nature}]`);
    });
    lines.push("");
  }

  // Moon
  if (d.moon) {
    lines.push("【Moon 상태】");
    lines.push(`Void of Course: ${d.moon.voidOfCourse ? "Yes" : "No"}`);
    lines.push(`Via Combusta: ${d.moon.viaCombusta ? "Yes" : "No"}`);
    if (d.moon.description) lines.push(d.moon.description);
    lines.push("");
  }

  // 판단
  if (d.judgment) {
    lines.push("【판단】");
    lines.push(`답변: ${d.judgment.overallAnswer} (확신도: ${d.judgment.confidence}%)`);
    if (d.judgment.perfectionType) lines.push(`성취 유형: ${d.judgment.perfectionType}`);
    if (d.judgment.reasoning) {
      const reasons = Array.isArray(d.judgment.reasoning) ? d.judgment.reasoning : [d.judgment.reasoning];
      reasons.forEach((reason: string) => lines.push(`  - ${reason}`));
    }
    lines.push("");
  }

  // 종합 해석
  lines.push("【종합 해석】");
  lines.push(r.summary);

  return lines.join("\n");
}

// ── 바빌로니아 점성술 ──────────────────────────────────────

function generateBabylonianText(r: DivinationResult, num: number): string {
  const d = r.details;
  const lines: string[] = [];

  lines.push(sectionHeader(num, "바빌로니아 점성술", "Babylonian Astrology"));

  // MUL.APIN 경로
  if (d.path) {
    lines.push("【MUL.APIN 경로】");
    lines.push(`경로: ${d.path.name} (${d.path.korean}) — ${d.path.direction}`);
    lines.push(`원소: ${d.path.element} | ${d.path.meaning}`);
    lines.push("");
  }

  // 별자리
  if (d.constellations && d.constellations.length > 0) {
    lines.push("【별자리】");
    d.constellations.forEach((c: { babylonian: string; korean: string; meaning: string; deity: string }) => {
      lines.push(`${c.babylonian} (${c.korean}) — ${c.meaning}${c.deity ? ` [${c.deity}]` : ""}`);
    });
    lines.push("");
  }

  // 행성신
  if (d.planets && Array.isArray(d.planets)) {
    lines.push("【행성신】");
    d.planets.forEach((p: { name: string; sumerian: string; celestialBody: string; element: string; strength: string; omen: string; nature: string }) => {
      lines.push(`${p.name}(${p.sumerian}/${p.celestialBody}): ${p.element} | 강도:${p.strength} | ${p.omen} [${p.nature}]`);
    });
    lines.push("");
  }

  // 행성 징조
  if (d.planetaryOmens && d.planetaryOmens.length > 0) {
    lines.push("【Enuma Anu Enlil 징조】");
    d.planetaryOmens.forEach((o: { korean: string; relationship: string; omen: string; nature: string }) => {
      lines.push(`${o.korean} (${o.relationship}) — ${o.omen} [${o.nature}]`);
    });
    lines.push("");
  }

  // 바빌로니아 월
  if (d.babMonth) {
    lines.push("【바빌로니아 월】");
    lines.push(`${d.babMonth.name} (${d.babMonth.korean}) — ${d.babMonth.nature}`);
    lines.push(d.babMonth.description);
    lines.push("");
  }

  // 월상
  if (d.lunarPhase) {
    lines.push("【월상】");
    lines.push(`${d.lunarPhase.korean} (${d.lunarPhase.phase}) — ${d.lunarPhase.nature}`);
    lines.push(d.lunarPhase.meaning);
    lines.push("");
  }

  // 일운
  if (d.dayOmen) {
    lines.push("【일운】");
    lines.push(`${d.dayOmen.nature}: ${d.dayOmen.description}`);
    lines.push("");
  }

  // 총운
  if (d.overallFortune) {
    lines.push(`【총운】 ${d.overallFortune}`);
    if (d.overallDescription) lines.push(d.overallDescription);
    lines.push("");
  }

  // 종합 해석
  lines.push("【종합 해석】");
  lines.push(r.summary);

  return lines.join("\n");
}

// ── 종합 분석 ──────────────────────────────────────────────

function generateSynthesisText(synth: DivinationResult): string {
  const d = synth.details;
  const lines: string[] = [];

  lines.push(`\n${DOUBLE_DIVIDER}`);
  lines.push("종합 분석 (Synthesis)");
  lines.push(DOUBLE_DIVIDER);

  // 핵심 메시지
  if (d.coreMessage) {
    lines.push("【핵심 메시지】");
    lines.push(d.coreMessage);
    lines.push("");
  }

  // 오행 밸런스
  if (d.fiveElementProfile) {
    const p = d.fiveElementProfile;
    const names: Record<string, string> = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };
    lines.push("【오행 밸런스】");
    const scores = Object.entries(p.scores as Record<string, number>)
      .map(([k, v]) => `${names[k] || k}: ${v}%`)
      .join(" | ");
    lines.push(scores);
    if (p.coreEnergy) lines.push(`핵심 에너지: ${names[p.coreEnergy] || p.coreEnergy}`);
    if (p.weakEnergy) lines.push(`약한 에너지: ${names[p.weakEnergy] || p.weakEnergy}`);
    lines.push(`밸런스 점수: ${p.balance}/100`);
    if (p.generationChain) lines.push(`상생 흐름: ${p.generationChain}`);
    if (p.destructionTension) lines.push(`상극 긴장: ${p.destructionTension}`);
    lines.push("");
  }

  // 공명 패턴
  if (d.resonances && d.resonances.length > 0) {
    lines.push("【공명 패턴】");
    d.resonances.forEach((r: { theme: string; description: string; systems: string[]; score: number }) => {
      lines.push(`"${r.theme}" — ${r.systems.length}개 시스템 공명 (${Math.round(r.score * 100)}%)`);
      lines.push(`  ${r.description}`);
    });
    lines.push("");
  }

  // 충돌
  if (d.conflicts && d.conflicts.length > 0) {
    lines.push("【충돌】");
    d.conflicts.forEach((c: { domain: string; system1: { name: string; interpretation: string }; system2: { name: string; interpretation: string }; resolution: string }) => {
      lines.push(`${c.domain}: ${c.system1.name}(${c.system1.interpretation}) vs ${c.system2.name}(${c.system2.interpretation})`);
      lines.push(`  → ${c.resolution}`);
    });
    lines.push("");
  }

  // 12영역 점수
  if (d.domains && d.domains.length > 0) {
    lines.push("【12영역 분석】");
    d.domains.forEach((dm: { domain: string; score: number; grade: string; synthesis: string; advice: string }, i: number) => {
      lines.push(`${i + 1}. ${dm.domain}: ${dm.score}점 (${dm.grade})`);
      if (dm.synthesis) lines.push(`   ${dm.synthesis}`);
      if (dm.advice) lines.push(`   → ${dm.advice}`);
    });
    lines.push("");
  }

  // 시기별 전략
  if (d.timeline && d.timeline.length > 0) {
    lines.push("【시기별 전략】");
    d.timeline.forEach((t: { period: string; tendency: string; energy: string; description: string }) => {
      lines.push(`${t.period}: ${t.tendency} (${t.energy})`);
      lines.push(`  ${t.description}`);
    });
    lines.push("");
  }

  // 주의사항
  if (d.warnings && d.warnings.length > 0) {
    lines.push("【주의사항】");
    d.warnings.forEach((w: string) => lines.push(`⚠ ${w}`));
    lines.push("");
  }

  // 행운의 요소
  if (d.luckyFactors) {
    const lf = d.luckyFactors;
    lines.push("【행운의 요소】");
    if (lf.colors?.length) lines.push(`색상: ${lf.colors.join(", ")}`);
    if (lf.directions?.length) lines.push(`방위: ${lf.directions.join(", ")}`);
    if (lf.numbers?.length) lines.push(`숫자: ${lf.numbers.join(", ")}`);
    if (lf.foods?.length) lines.push(`음식: ${lf.foods.join(", ")}`);
    if (lf.fields?.length) lines.push(`분야: ${lf.fields.join(", ")}`);
    if (lf.days?.length) lines.push(`요일: ${lf.days.join(", ")}`);
  }

  return lines.join("\n");
}

// ── 유틸 ───────────────────────────────────────────────────

const STEM_NAMES = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCH_NAMES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const ELEMENT_NAME_MAP: Record<string, string> = {
  wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)",
};

function stemName(idx: number): string { return STEM_NAMES[idx] || "?"; }
function branchName(idx: number): string { return BRANCH_NAMES[idx] || "?"; }
function formatElementName(elem: string): string { return ELEMENT_NAME_MAP[elem] || elem; }

// ── 토큰 추정 ──────────────────────────────────────────────

export function estimateTokens(text: string): number {
  // 한글 약 1.5 토큰/글자, 영문 약 0.25 토큰/단어, 대략 글자수 * 0.7
  const koreanChars = (text.match(/[가-힣]/g) || []).length;
  const otherChars = text.length - koreanChars;
  return Math.round(koreanChars * 1.5 + otherChars * 0.4);
}
