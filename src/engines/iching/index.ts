// ============================================================
// 주역(周易) 엔진 - 메인 진입점
// 매화역수(梅花易數) 방식의 64괘 점술
// ============================================================

import type { DivinationInput, DivinationResult, DivinationNode, DivinationEdge, DivinationElement } from "@/types/divination";
import {
  TRIGRAMS,
  ELEMENT_NAMES,
  GENERATES,
  OVERCOMES,
  type Element,
  type Hexagram,
} from "./data";
import {
  parseHour,
  performAnalysis,
  getChangingLineInterpretation,
  type IChingAnalysis,
} from "./analysis";

// ── 메인 계산 ─────────────────────────────────────────────

export function calculate(input: DivinationInput): DivinationResult {
  // 1. 입력 파싱
  const [yearStr, monthStr, dayStr] = input.birthDate.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hourNum = parseHour(input.birthTime);

  // 2. 전체 분석 수행
  const analysis = performAnalysis(year, month, day, hourNum);

  // 3. 결과 조립
  const summary = buildSummary(analysis);
  const elements = buildElements(analysis);
  const nodes = buildNodes(analysis);
  const edges = buildEdges(analysis);

  return {
    system: "주역(매화역수)",
    summary,
    details: {
      maeHwa: analysis.maeHwa,
      original: {
        name: analysis.original.name,
        hanja: analysis.original.hanja,
        number: analysis.original.number,
        keyword: analysis.original.keyword,
        judgment: analysis.original.judgment,
        guasa: analysis.original.guasa,
        danjeon: analysis.original.danjeon,
        sangjeon: analysis.original.sangjeon,
        lines: analysis.original.lines,
        upperTrigram: formatTrigram(analysis.original.upper),
        lowerTrigram: formatTrigram(analysis.original.lower),
      },
      changed: {
        name: analysis.changed.name,
        hanja: analysis.changed.hanja,
        number: analysis.changed.number,
        keyword: analysis.changed.keyword,
        judgment: analysis.changed.judgment,
        guasa: analysis.changed.guasa,
        lines: analysis.changed.lines,
        upperTrigram: formatTrigram(analysis.changed.upper),
        lowerTrigram: formatTrigram(analysis.changed.lower),
      },
      mutual: {
        name: analysis.mutual.name,
        hanja: analysis.mutual.hanja,
        number: analysis.mutual.number,
        keyword: analysis.mutual.keyword,
        judgment: analysis.mutual.judgment,
        guasa: analysis.mutual.guasa,
      },
      reversed: {
        name: analysis.reversed.name,
        hanja: analysis.reversed.hanja,
        number: analysis.reversed.number,
        keyword: analysis.reversed.keyword,
      },
      inverted: {
        name: analysis.inverted.name,
        hanja: analysis.inverted.hanja,
        number: analysis.inverted.number,
        keyword: analysis.inverted.keyword,
      },
      changingLine: {
        position: analysis.maeHwa.changingLine,
        text: analysis.original.lines[analysis.maeHwa.changingLine - 1],
        interpretation: getChangingLineInterpretation(analysis.maeHwa.changingLine),
      },
      tiYong: analysis.tiYong,
      originalLines: analysis.originalLines,
      changedLines: analysis.changedLines,
    },
    elements,
    nodes,
    edges,
  };
}

// ── 헬퍼 ──────────────────────────────────────────────────

function formatTrigram(idx: number) {
  const t = TRIGRAMS[idx];
  return {
    name: t.name,
    hanja: t.hanja,
    nature: t.nature,
    element: t.element,
    elementName: ELEMENT_NAMES[t.element],
    direction: t.direction,
    family: t.family,
  };
}

function hexLabel(h: Hexagram): string {
  return `${h.name}(${h.hanja})`;
}

// ── 요약 텍스트 ──────────────────────────────────────────

function buildSummary(a: IChingAnalysis): string {
  const upper = TRIGRAMS[a.original.upper];
  const lower = TRIGRAMS[a.original.lower];
  const ti = TRIGRAMS[a.tiYong.tiTrigram];
  const yong = TRIGRAMS[a.tiYong.yongTrigram];

  return (
    `본괘: ${hexLabel(a.original)} [${a.original.judgment}] - ${a.original.keyword}\n` +
    `  상괘 ${upper.name}(${upper.hanja}/${upper.nature}) + 하괘 ${lower.name}(${lower.hanja}/${lower.nature})\n` +
    `변괘: ${hexLabel(a.changed)} - ${a.changed.keyword}\n` +
    `호괘: ${hexLabel(a.mutual)} - ${a.mutual.keyword}\n` +
    `변효: 제${a.maeHwa.changingLine}효\n` +
    `체용: 체=${ti.name}(${ELEMENT_NAMES[a.tiYong.tiElement]}) / 용=${yong.name}(${ELEMENT_NAMES[a.tiYong.yongElement]}) → ${a.tiYong.relation} [${a.tiYong.fortune}]`
  );
}

// ── DivinationElement 배열 ───────────────────────────────

function buildElements(a: IChingAnalysis): DivinationElement[] {
  const elements: DivinationElement[] = [];

  // 본괘
  elements.push({
    label: "본괘(本卦)",
    value: `${hexLabel(a.original)} [${a.original.judgment}]`,
    description: `${a.original.keyword} - ${a.original.guasa}`,
  });

  // 변괘
  elements.push({
    label: "변괘(變卦)",
    value: `${hexLabel(a.changed)} [${a.changed.judgment}]`,
    description: `${a.changed.keyword} - ${a.changed.guasa}`,
  });

  // 호괘
  elements.push({
    label: "호괘(互卦)",
    value: `${hexLabel(a.mutual)} [${a.mutual.judgment}]`,
    description: `${a.mutual.keyword} - ${a.mutual.guasa}`,
  });

  // 착괘
  elements.push({
    label: "착괘(錯卦)",
    value: hexLabel(a.reversed),
    description: `${a.reversed.keyword} - 본괘의 반대 상황, 대비되는 관점`,
  });

  // 종괘
  elements.push({
    label: "종괘(綜卦)",
    value: hexLabel(a.inverted),
    description: `${a.inverted.keyword} - 본괘를 뒤집어 본 상황, 상대방의 관점`,
  });

  // 변효
  elements.push({
    label: `변효(變爻) 제${a.maeHwa.changingLine}효`,
    value: a.original.lines[a.maeHwa.changingLine - 1],
    description: getChangingLineInterpretation(a.maeHwa.changingLine),
  });

  // 체용
  const ti = TRIGRAMS[a.tiYong.tiTrigram];
  const yong = TRIGRAMS[a.tiYong.yongTrigram];
  elements.push({
    label: "체용(體用)",
    value: `${a.tiYong.relation} [${a.tiYong.fortune}]`,
    description: `체: ${ti.name}(${ELEMENT_NAMES[a.tiYong.tiElement]}) / 용: ${yong.name}(${ELEMENT_NAMES[a.tiYong.yongElement]}) - ${a.tiYong.interpretation}`,
  });

  // 단전
  elements.push({
    label: "단전(彖傳)",
    value: a.original.danjeon,
    description: "괘의 의미를 해석하는 공자의 단전",
  });

  // 상전
  elements.push({
    label: "상전(象傳)",
    value: a.original.sangjeon,
    description: "괘의 상(象)을 해석하고 군자의 도를 설명하는 상전",
  });

  // 산출 정보
  elements.push({
    label: "매화역수 산출",
    value: `상괘수=${a.maeHwa.numbers.upperSum} 하괘수=${a.maeHwa.numbers.lowerSum} 변효수=${a.maeHwa.numbers.lineSum}`,
    description: `년수=${a.maeHwa.numbers.yearNum} 월=${a.maeHwa.numbers.monthNum} 일=${a.maeHwa.numbers.dayNum} 시=${a.maeHwa.numbers.hourNum}`,
  });

  return elements;
}

// ── 노드 생성 ────────────────────────────────────────────

function buildNodes(a: IChingAnalysis): DivinationNode[] {
  const nodes: DivinationNode[] = [];

  // 본괘 노드
  nodes.push({
    id: "iching-original",
    label: `본괘: ${hexLabel(a.original)} [${a.original.judgment}]`,
    category: "hexagram",
  });

  // 변괘 노드
  nodes.push({
    id: "iching-changed",
    label: `변괘: ${hexLabel(a.changed)} [${a.changed.judgment}]`,
    category: "hexagram",
  });

  // 호괘 노드
  nodes.push({
    id: "iching-mutual",
    label: `호괘: ${hexLabel(a.mutual)} [${a.mutual.judgment}]`,
    category: "hexagram",
  });

  // 착괘 노드
  nodes.push({
    id: "iching-reversed",
    label: `착괘: ${hexLabel(a.reversed)}`,
    category: "hexagram",
  });

  // 종괘 노드
  nodes.push({
    id: "iching-inverted",
    label: `종괘: ${hexLabel(a.inverted)}`,
    category: "hexagram",
  });

  // 상괘 노드
  const upper = TRIGRAMS[a.original.upper];
  nodes.push({
    id: "iching-upper",
    label: `상괘: ${upper.name}(${upper.hanja}) ${upper.nature} ${ELEMENT_NAMES[upper.element]}`,
    category: "trigram",
  });

  // 하괘 노드
  const lower = TRIGRAMS[a.original.lower];
  nodes.push({
    id: "iching-lower",
    label: `하괘: ${lower.name}(${lower.hanja}) ${lower.nature} ${ELEMENT_NAMES[lower.element]}`,
    category: "trigram",
  });

  // 체괘 노드
  const ti = TRIGRAMS[a.tiYong.tiTrigram];
  nodes.push({
    id: "iching-ti",
    label: `체괘: ${ti.name}(${ti.hanja}) ${ELEMENT_NAMES[ti.element]}`,
    category: "tiyong",
  });

  // 용괘 노드
  const yong = TRIGRAMS[a.tiYong.yongTrigram];
  nodes.push({
    id: "iching-yong",
    label: `용괘: ${yong.name}(${yong.hanja}) ${ELEMENT_NAMES[yong.element]}`,
    category: "tiyong",
  });

  // 변효 노드
  nodes.push({
    id: "iching-line",
    label: `제${a.maeHwa.changingLine}효: ${a.original.lines[a.maeHwa.changingLine - 1].substring(0, 30)}...`,
    category: "line",
  });

  // 6효 노드
  for (let i = 0; i < 6; i++) {
    const lineType = a.originalLines[i] === 1 ? "양(陽)" : "음(陰)";
    const isChanging = i === a.maeHwa.changingLine - 1;
    nodes.push({
      id: `iching-line-${i + 1}`,
      label: `${i + 1}효: ${lineType}${isChanging ? " ★변효" : ""}`,
      category: "line",
    });
  }

  return nodes;
}

// ── 엣지 생성 ────────────────────────────────────────────

function buildEdges(a: IChingAnalysis): DivinationEdge[] {
  const edges: DivinationEdge[] = [];

  // 본괘 → 변괘 (변효에 의한 변화)
  edges.push({
    source: "iching-original",
    target: "iching-changed",
    relation: `변효(제${a.maeHwa.changingLine}효)`,
  });

  // 본괘 → 호괘
  edges.push({
    source: "iching-original",
    target: "iching-mutual",
    relation: "호괘(2-5효)",
  });

  // 본괘 → 착괘
  edges.push({
    source: "iching-original",
    target: "iching-reversed",
    relation: "착괘(효 반전)",
  });

  // 본괘 → 종괘
  edges.push({
    source: "iching-original",
    target: "iching-inverted",
    relation: "종괘(상하 뒤집기)",
  });

  // 본괘 ↔ 상괘/하괘
  edges.push({
    source: "iching-original",
    target: "iching-upper",
    relation: "상괘 구성",
  });
  edges.push({
    source: "iching-original",
    target: "iching-lower",
    relation: "하괘 구성",
  });

  // 체용 관계 엣지
  edges.push({
    source: "iching-ti",
    target: "iching-yong",
    relation: `${a.tiYong.relation} [${a.tiYong.fortune}]`,
  });

  // 체괘/용괘 → 상/하괘 연결
  const tiSource = a.tiYong.tiPosition === "upper" ? "iching-upper" : "iching-lower";
  const yongSource = a.tiYong.yongPosition === "upper" ? "iching-upper" : "iching-lower";
  edges.push({ source: tiSource, target: "iching-ti", relation: "체(體)" });
  edges.push({ source: yongSource, target: "iching-yong", relation: "용(用)" });

  // 오행 생극 엣지
  const tiElem = a.tiYong.tiElement;
  const yongElem = a.tiYong.yongElement;
  if (GENERATES[tiElem] === yongElem) {
    edges.push({ source: "iching-ti", target: "iching-yong", relation: `생(生): ${ELEMENT_NAMES[tiElem]}→${ELEMENT_NAMES[yongElem]}` });
  } else if (GENERATES[yongElem] === tiElem) {
    edges.push({ source: "iching-yong", target: "iching-ti", relation: `생(生): ${ELEMENT_NAMES[yongElem]}→${ELEMENT_NAMES[tiElem]}` });
  } else if (OVERCOMES[tiElem] === yongElem) {
    edges.push({ source: "iching-ti", target: "iching-yong", relation: `극(克): ${ELEMENT_NAMES[tiElem]}→${ELEMENT_NAMES[yongElem]}` });
  } else if (OVERCOMES[yongElem] === tiElem) {
    edges.push({ source: "iching-yong", target: "iching-ti", relation: `극(克): ${ELEMENT_NAMES[yongElem]}→${ELEMENT_NAMES[tiElem]}` });
  }

  // 변효 → 본괘 연결
  edges.push({
    source: `iching-line-${a.maeHwa.changingLine}`,
    target: "iching-line",
    relation: "변효 상세",
  });

  // 효 인접 연결
  for (let i = 1; i < 6; i++) {
    edges.push({
      source: `iching-line-${i}`,
      target: `iching-line-${i + 1}`,
      relation: "인접",
    });
  }

  // 하괘/상괘 효 연결
  edges.push({ source: "iching-lower", target: "iching-line-1", relation: "하괘 초효" });
  edges.push({ source: "iching-upper", target: "iching-line-4", relation: "상괘 사효" });

  return edges;
}
