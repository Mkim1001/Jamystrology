/* ==========================================
   사주팔자 (Four Pillars of Destiny) Engine
   ========================================== */

import { BirthInput, DivinationResult } from '@/types/divination';

export function calculate(_input: BirthInput): DivinationResult {
  // TODO: Phase 1에서 구현
  return {
    system: 'saju',
    systemName: '사주팔자',
    summary: '',
    details: {},
    elements: [],
    nodes: [],
    edges: [],
  };
}
