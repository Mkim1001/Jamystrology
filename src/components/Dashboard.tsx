"use client";

import type { DivinationResult } from "@/types/divination";

const SYSTEM_CONFIG: { key: string; name: string; hanja: string; color: string }[] = [
  { key: "saju", name: "사주팔자", hanja: "四柱八字", color: "#f38ba8" },
  { key: "ziwei", name: "자미두수", hanja: "紫微斗數", color: "#cba6f7" },
  { key: "qimen", name: "기문둔갑", hanja: "奇門遁甲", color: "#89b4fa" },
  { key: "iching", name: "주역", hanja: "周易", color: "#a6e3a1" },
  { key: "horary", name: "호라리 점성술", hanja: "Horary", color: "#f9e2af" },
  { key: "babylonian", name: "바빌로니아", hanja: "Babylon", color: "#fab387" },
];

function getJudgmentColor(summary: string): string {
  if (summary.includes("대길") || summary.includes("긍정")) return "#a6e3a1";
  if (summary.includes("길") || summary.includes("길하")) return "#a6e3a1";
  if (summary.includes("흉") || summary.includes("부정")) return "#f38ba8";
  return "#6c7086";
}

interface Props {
  results: Record<string, DivinationResult>;
  synthesisResult: DivinationResult | null;
  onSelectSystem: (key: string) => void;
}

export default function Dashboard({ results, synthesisResult, onSelectSystem }: Props) {
  return (
    <div className="p-6 overflow-y-auto h-full">
      {/* 브레드크럼 */}
      <div className="text-xs mb-4" style={{ color: "#6c7086" }}>
        대시보드 &gt; 전체 요약
      </div>

      {/* 종합 메시지 */}
      {synthesisResult && (
        <div className="mb-6 pl-4" style={{ borderLeft: "3px solid #b4befe" }}>
          <p className="text-base" style={{ color: "#cdd6f4" }}>
            {synthesisResult.details?.coreMessage || synthesisResult.summary.split("\n")[0]}
          </p>
          {/* 오행 밸런스 */}
          {synthesisResult.details?.fiveElementProfile && (
            <div className="flex gap-3 mt-3">
              {(["wood", "fire", "earth", "metal", "water"] as const).map(e => {
                const score = synthesisResult.details.fiveElementProfile.scores[e] || 0;
                const colors: Record<string, string> = {
                  wood: "#a6e3a1", fire: "#f38ba8", earth: "#f9e2af", metal: "#cdd6f4", water: "#89b4fa",
                };
                const names: Record<string, string> = { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" };
                return (
                  <div key={e} className="flex-1">
                    <div className="flex justify-between text-[10px] mb-1" style={{ color: "#6c7086" }}>
                      <span>{names[e]}</span><span>{score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "#1e1e2e" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${score}%`, background: colors[e] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 시스템별 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {SYSTEM_CONFIG.map(sys => {
          const result = results[sys.key];
          if (!result || !result.summary) return null;
          const summaryLines = result.summary.split("\n");
          const judgmentColor = getJudgmentColor(result.summary);

          return (
            <button key={sys.key} onClick={() => onSelectSystem(sys.key)}
              className="text-left rounded-lg p-4 transition-all duration-200 group"
              style={{
                background: "#262637",
                borderLeft: `2px solid ${sys.color}`,
              }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium" style={{ color: "#cdd6f4" }}>{sys.name}</span>
                  <span className="text-xs ml-2" style={{ color: "#6c7086", fontFamily: "Georgia, serif" }}>{sys.hanja}</span>
                </div>
                <span className="w-2 h-2 rounded-full" style={{ background: judgmentColor }} />
              </div>
              <div className="text-xs leading-relaxed" style={{ color: "#6c7086", fontFamily: "ui-monospace, monospace" }}>
                {summaryLines[0]}
              </div>
              {summaryLines[1] && (
                <div className="text-xs mt-1 leading-relaxed" style={{ color: "#6c7086" }}>
                  {summaryLines[1]}
                </div>
              )}
              <div className="mt-3 text-xs transition-all duration-200"
                style={{ color: "#b4befe", opacity: 0.6 }}>
                상세보기 ▸
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
