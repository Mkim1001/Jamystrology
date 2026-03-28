/* ==========================================
   Shared Types for All Divination Engines
   ========================================== */

/** 오행 (Five Elements) */
export type FiveElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/** 음양 */
export type YinYang = '양' | '음';

/** 성별 */
export type Gender = 'male' | 'female';

/** 점술 시스템 ID */
export type DivinationSystem = 'saju' | 'ziwei' | 'qimen' | 'iching' | 'horary' | 'babylonian';

/** 그래프 노드 카테고리 */
export type NodeCategory =
  | 'pillar' | 'tenGod' | 'element' | 'spirit'      // 사주
  | 'palace' | 'star' | 'sihua'                       // 자미두수
  | 'door' | 'qimenStar' | 'deity' | 'stem'           // 기문둔갑
  | 'hexagram' | 'trigram' | 'line'                    // 주역
  | 'planet' | 'house' | 'aspect' | 'sign'             // 호라리
  | 'omen' | 'path' | 'planetGod'                      // 바빌로니아
  | 'synthesis' | 'insight';                            // 통합

/** 그래프 노드 */
export interface DivinationNode {
  id: string;
  label: string;
  sublabel?: string;
  category: NodeCategory;
  system: DivinationSystem | 'synthesis';
  element?: FiveElement;
  importance?: number; // 1-10, for node sizing
  detail?: string;
}

/** 그래프 엣지 */
export interface DivinationEdge {
  source: string;
  target: string;
  relation: string;
  strength?: number; // 0-1
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
}

/** 해석 요소 */
export interface InterpretationElement {
  label: string;
  value: string;
  description: string;
  importance?: 'high' | 'medium' | 'low';
}

/** 모든 점술 엔진의 공통 결과 인터페이스 */
export interface DivinationResult {
  system: DivinationSystem;
  systemName: string;
  summary: string;
  details: Record<string, unknown>;
  elements: InterpretationElement[];
  nodes: DivinationNode[];
  edges: DivinationEdge[];
}

/** 공통 입력 (생년월일시 기반 시스템들) */
export interface BirthInput {
  name: string;
  gender: Gender;
  birthDate: Date;
  birthHour: number;   // 0-23
  birthMinute?: number;
  birthPlace?: string;
}

/** 호라리 전용 입력 (질문 시점 기반) */
export interface HoraryInput {
  question: string;
  questionDate: Date;      // 질문 시점 날짜
  questionHour: number;    // 질문 시점 시간 0-23
  questionMinute: number;  // 질문 시점 분 0-59
  questionPlace?: string;  // 질문 장소
  latitude?: number;
  longitude?: number;
}

/** 전체 입력 (모든 시스템 통합) */
export interface DivinationInput {
  birth: BirthInput;
  horary: HoraryInput;
}

/** 오행 정보 */
export const FIVE_ELEMENTS: Record<FiveElement, {
  name: string;
  hanja: string;
  color: string;
  generates: FiveElement;
  overcomes: FiveElement;
  weakens: FiveElement;
  fears: FiveElement;
  direction: string;
  season: string;
}> = {
  wood: { name: '목', hanja: '木', color: '#00b894', generates: 'fire', overcomes: 'earth', weakens: 'water', fears: 'metal', direction: '동', season: '봄' },
  fire: { name: '화', hanja: '火', color: '#ff6b6b', generates: 'earth', overcomes: 'metal', weakens: 'wood', fears: 'water', direction: '남', season: '여름' },
  earth: { name: '토', hanja: '土', color: '#ffeaa7', generates: 'metal', overcomes: 'water', weakens: 'fire', fears: 'wood', direction: '중앙', season: '환절기' },
  metal: { name: '금', hanja: '金', color: '#dfe6e9', generates: 'water', overcomes: 'wood', weakens: 'earth', fears: 'fire', direction: '서', season: '가을' },
  water: { name: '수', hanja: '水', color: '#4ecdc4', generates: 'wood', overcomes: 'fire', weakens: 'metal', fears: 'earth', direction: '북', season: '겨울' },
};

/** 천간 */
export const HEAVENLY_STEMS = {
  names: ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const,
  hanja: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const,
  elements: ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'] as const satisfies readonly FiveElement[],
  yinYang: ['양', '음', '양', '음', '양', '음', '양', '음', '양', '음'] as const satisfies readonly YinYang[],
};

/** 지지 */
export const EARTHLY_BRANCHES = {
  names: ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const,
  hanja: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const,
  animals: ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'] as const,
  elements: ['water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water'] as const satisfies readonly FiveElement[],
  /** 지장간: [여기, 중기, 정기] - 천간 인덱스 */
  hiddenStems: [
    [9],          // 子: 계
    [9, 7, 5],    // 丑: 계, 신, 기
    [4, 2, 0],    // 寅: 무, 병, 갑
    [1],          // 卯: 을
    [1, 9, 4],    // 辰: 을, 계, 무
    [4, 6, 2],    // 巳: 무, 경, 병
    [5, 3],       // 午: 기, 정
    [3, 1, 5],    // 未: 정, 을, 기
    [4, 8, 6],    // 申: 무, 임, 경
    [7],          // 酉: 신
    [7, 3, 4],    // 戌: 신, 정, 무
    [4, 0, 8],    // 亥: 무, 갑, 임
  ] as const,
};
