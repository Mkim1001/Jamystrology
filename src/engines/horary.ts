import { DivinationInput, DivinationResult } from "@/types/divination";

export function calculate(input: DivinationInput): DivinationResult {
  return {
    system: "호라리 점성술",
    summary: "",
    details: {},
    elements: [],
    nodes: [],
    edges: [],
  };
}
