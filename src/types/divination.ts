/** 공통 점술 입력 */
export interface DivinationInput {
  name: string;
  gender: "male" | "female";
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm 또는 시진
  birthPlace?: string;
  // 호라리 전용
  horaryQuestion?: string;
  horaryDatetime?: string; // YYYY-MM-DDTHH:mm
  horaryLocation?: string;
}

/** 공통 점술 결과 */
export interface DivinationResult {
  system: string;
  summary: string;
  details: Record<string, any>;
  elements: DivinationElement[];
  nodes: DivinationNode[];
  edges: DivinationEdge[];
}

export interface DivinationElement {
  label: string;
  value: string;
  description: string;
}

export interface DivinationNode {
  id: string;
  label: string;
  category: string;
}

export interface DivinationEdge {
  source: string;
  target: string;
  relation: string;
}

/** 점술 엔진 인터페이스 */
export interface DivinationEngine {
  calculate(input: DivinationInput): DivinationResult;
}
