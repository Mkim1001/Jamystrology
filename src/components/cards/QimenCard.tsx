"use client";

import type { DivinationResult } from "@/types/divination";

// 3x3 九宮 grid layout (standard Qimen arrangement)
// [4巽SE] [9離S]  [2坤SW]
// [3震E]  [5中]   [7兌W]
// [8艮NE] [1坎N]  [6乾NW]
const PALACE_GRID = [
  { index: 3, name: "巽宮" }, { index: 8, name: "離宮" }, { index: 1, name: "坤宮" },
  { index: 2, name: "震宮" }, { index: 4, name: "中宮" }, { index: 6, name: "兌宮" },
  { index: 7, name: "艮宮" }, { index: 0, name: "坎宮" }, { index: 5, name: "乾宮" },
];

const NATURE_COLORS: Record<string, string> = {
  "길": "#a6e3a1", "대길": "#a6e3a1", "중길": "#a6e3a1",
  "흉": "#f38ba8", "대흉": "#f38ba8",
  "중립": "#6c7086", "평": "#6c7086",
};

interface Props {
  result: DivinationResult;
}

export default function QimenCard({ result }: Props) {
  const { chart, palaces, geokguks, yongshin, palaceInterpretations } = result.details;

  return (
    <div className="space-y-4">
      {/* 국수/둔갑 정보 */}
      {chart && (
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "#262637" }}>
            <div className="text-[10px]" style={{ color: "#6c7086" }}>국수</div>
            <div className="text-sm font-medium mt-0.5" style={{ color: "#89b4fa" }}>
              {chart.bureauNumber || "—"}국
            </div>
          </div>
          <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "#262637" }}>
            <div className="text-[10px]" style={{ color: "#6c7086" }}>양/음둔</div>
            <div className="text-sm font-medium mt-0.5" style={{ color: "#cdd6f4" }}>
              {chart.isYangDun ? "양둔" : "음둔"}
            </div>
          </div>
          <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "#262637" }}>
            <div className="text-[10px]" style={{ color: "#6c7086" }}>절기</div>
            <div className="text-sm font-medium mt-0.5" style={{ color: "#cdd6f4" }}>
              {chart.solarTerm || "—"}
            </div>
          </div>
        </div>
      )}

      {/* 3x3 구궁 그리드 */}
      {palaces && Array.isArray(palaces) && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>구궁반 九宮盤</div>
          <div className="grid grid-cols-3 gap-[2px]">
            {PALACE_GRID.map(pos => {
              const palace = palaces.find((p: any) => p.index === pos.index) || palaces[pos.index];
              if (!palace) {
                return (
                  <div key={pos.index} className="rounded p-2 min-h-[72px]" style={{ background: "#262637" }}>
                    <div className="text-[10px]" style={{ color: "#6c7086" }}>{pos.name}</div>
                  </div>
                );
              }

              return (
                <div key={pos.index} className="rounded p-2 min-h-[72px]" style={{ background: "#262637" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium" style={{ color: "#89b4fa" }}>
                      {palace.name || pos.name}
                    </span>
                    <span className="text-[8px]" style={{ color: "#6c7086" }}>
                      {palace.direction || ""}
                    </span>
                  </div>
                  {/* 천반/지반 */}
                  <div className="text-[10px] space-y-0.5">
                    {palace.tianpan && (
                      <div style={{ color: "#f9e2af" }}>天 {palace.tianpan}</div>
                    )}
                    {palace.dipan && (
                      <div style={{ color: "#a6e3a1" }}>地 {palace.dipan}</div>
                    )}
                    {palace.star && (
                      <div style={{ color: "#cba6f7" }}>星 {typeof palace.star === "string" ? palace.star : palace.star.name}</div>
                    )}
                    {palace.gate && (
                      <div style={{ color: "#f38ba8" }}>門 {typeof palace.gate === "string" ? palace.gate : palace.gate.name}</div>
                    )}
                    {palace.spirit && (
                      <div style={{ color: "#6c7086" }}>神 {typeof palace.spirit === "string" ? palace.spirit : palace.spirit.name}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 격국 (吉凶格局) */}
      {geokguks && Array.isArray(geokguks) && geokguks.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>격국 格局</div>
          <div className="space-y-1">
            {geokguks.map((g: any, i: number) => {
              const nature = g.nature || g.type || "";
              const color = NATURE_COLORS[nature] || "#6c7086";
              return (
                <div key={i} className="rounded px-3 py-1.5 text-xs flex items-center gap-2" style={{ background: "#262637" }}>
                  <span className="px-1 rounded text-[10px]" style={{ color, border: `1px solid ${color}` }}>
                    {nature || "—"}
                  </span>
                  <span style={{ color: "#cdd6f4" }}>{g.name || g.description || JSON.stringify(g)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 용신 분석 */}
      {yongshin && (
        <div className="rounded-lg p-3" style={{ background: "#262637" }}>
          <div className="text-xs font-medium mb-1" style={{ color: "#b4befe" }}>용신 분석</div>
          <div className="text-xs leading-relaxed" style={{ color: "#cdd6f4" }}>
            {typeof yongshin === "string" ? yongshin : yongshin.description || JSON.stringify(yongshin)}
          </div>
        </div>
      )}

      {/* 궁위 해석 */}
      {palaceInterpretations && Array.isArray(palaceInterpretations) && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>궁위 해석</div>
          <div className="space-y-1">
            {palaceInterpretations.slice(0, 6).map((interp: any, i: number) => (
              <div key={i} className="rounded px-3 py-2 text-xs" style={{ background: "#262637" }}>
                <span className="font-medium" style={{ color: "#89b4fa" }}>{interp.palace || interp.name}</span>
                <span className="ml-2" style={{ color: "#6c7086" }}>{interp.interpretation || interp.meaning || ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
