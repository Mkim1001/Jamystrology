import { DivinationInput, DivinationResult } from "@/types/divination";

export function calculate(input: DivinationInput): DivinationResult {
  return {
    system: "사주팔자",
    summary: "",
    details: {},
    elements: [],
    nodes: [],
    edges: [],
  };
}
