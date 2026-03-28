import { DivinationInput, DivinationResult } from "@/types/divination";

export function calculate(input: DivinationInput): DivinationResult {
  return {
    system: "자미두수",
    summary: "",
    details: {},
    elements: [],
    nodes: [],
    edges: [],
  };
}
