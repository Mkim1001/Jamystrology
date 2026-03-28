/* ==========================================
   Horary Astrology Engine
   ⚠️ Uses question datetime, NOT birth datetime
   ========================================== */

import { HoraryInput, DivinationResult } from '@/types/divination';

/**
 * 호라리 점성술은 다른 시스템과 달리 "질문 시점"의 날짜/시간을 사용합니다.
 * BirthInput이 아닌 HoraryInput을 받습니다.
 */
export function calculate(_input: HoraryInput): DivinationResult {
  // TODO: Phase 5에서 구현
  return {
    system: 'horary',
    systemName: '호라리 점성술',
    summary: '',
    details: {},
    elements: [],
    nodes: [],
    edges: [],
  };
}
