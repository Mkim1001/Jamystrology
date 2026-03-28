import { DivinationInput, DivinationResult } from "@/types/divination";

export function calculate(input: DivinationInput): DivinationResult {
  return {
    system: "주역",
    summary: "",
    details: {},
    elements: [],
    nodes: [],
    edges: [],
  };
}
