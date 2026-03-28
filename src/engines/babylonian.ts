import { DivinationInput, DivinationResult } from "@/types/divination";

export function calculate(input: DivinationInput): DivinationResult {
  return {
    system: "바빌로니아 점성술",
    summary: "",
    details: {},
    elements: [],
    nodes: [],
    edges: [],
  };
}
