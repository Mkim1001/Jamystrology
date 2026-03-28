import { DivinationInput, DivinationResult } from "@/types/divination";

export function calculate(input: DivinationInput): DivinationResult {
  return {
    system: "기문둔갑",
    summary: "",
    details: {},
    elements: [],
    nodes: [],
    edges: [],
  };
}
