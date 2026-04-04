"use client";

import type { DivinationResult } from "@/types/divination";

const PALACE_GRID_ORDER = [
  // 4x3 grid: top row (L→R), middle-left, middle-right, bottom row (R→L)
  // Standard Ziwei chart layout:
  //  [巳] [午] [未] [申]
  //  [辰]           [酉]
  //  [卯]           [戌]
  //  [寅] [丑] [子] [亥]
  { row: 0, col: 0, branch: 3 },  // 辰 (진)
  { row: 0, col: 1, branch: 4 },  // 巳 (사)
  { row: 0, col: 2, branch: 5 },  // 午 (오)
  { row: 0, col: 3, branch: 6 },  // 未 (미)
  { row: 1, col: 0, branch: 2 },  // 卯 (묘)
  { row: 1, col: 3, branch: 7 },  // 申 (신)
  { row: 2, col: 0, branch: 1 },  // 寅 (인)
  { row: 2, col: 3, branch: 8 },  // 酉 (유)
  { row: 3, col: 0, branch: 0 },  // 丑 (축)
  { row: 3, col: 1, branch: 11 }, // 子 (자)
  { row: 3, col: 2, branch: 10 }, // 亥 (해)
  { row: 3, col: 3, branch: 9 },  // 戌 (술)
];

interface Props {
  result: DivinationResult;
}

export default function ZiweiCard({ result }: Props) {
  const { chart, palaces, transformations, currentDahan, palaceInterpretations } = result.details;

  // Build 4x4 grid
  const grid: (any | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));
  if (palaces && Array.isArray(palaces)) {
    PALACE_GRID_ORDER.forEach(pos => {
      const palace = palaces.find((p: any) => p.branchIndex === pos.branch) || palaces[pos.branch];
      if (palace) grid[pos.row][pos.col] = palace;
    });
  }

  return (
    <div className="space-y-4">
      {/* 명궁/신궁 정보 */}
      {chart && (
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "#262637" }}>
            <div className="text-[10px]" style={{ color: "#6c7086" }}>명궁</div>
            <div className="text-sm font-medium mt-0.5" style={{ color: "#cba6f7" }}>
              {chart.mingGong || "—"}
            </div>
          </div>
          <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "#262637" }}>
            <div className="text-[10px]" style={{ color: "#6c7086" }}>신궁</div>
            <div className="text-sm font-medium mt-0.5" style={{ color: "#cba6f7" }}>
              {chart.shenGong || "—"}
            </div>
          </div>
          <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "#262637" }}>
            <div className="text-[10px]" style={{ color: "#6c7086" }}>국수</div>
            <div className="text-sm font-medium mt-0.5" style={{ color: "#cdd6f4" }}>
              {chart.bureauName || chart.bureau || "—"}
            </div>
          </div>
        </div>
      )}

      {/* 4x3 명반 그리드 (center empty) */}
      {palaces && Array.isArray(palaces) && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>명반 命盤</div>
          <div className="grid grid-cols-4 gap-[2px]">
            {grid.flat().map((palace, idx) => {
              const row = Math.floor(idx / 4);
              const col = idx % 4;
              const isCenter = (row === 1 || row === 2) && (col === 1 || col === 2);

              if (isCenter) {
                // Center 2x2: display chart summary on first cell
                if (row === 1 && col === 1) {
                  return (
                    <div key={idx} className="col-span-2 row-span-2 rounded flex flex-col items-center justify-center p-2"
                      style={{ background: "#1e1e2e" }}>
                      <div className="text-xs font-medium" style={{ color: "#cba6f7" }}>紫微斗數</div>
                      {chart?.ziweiPosition && (
                        <div className="text-[10px] mt-1" style={{ color: "#6c7086" }}>
                          紫微: {chart.ziweiPosition}
                        </div>
                      )}
                      {chart?.tianfuPosition && (
                        <div className="text-[10px]" style={{ color: "#6c7086" }}>
                          天府: {chart.tianfuPosition}
                        </div>
                      )}
                    </div>
                  );
                }
                return null; // Other center cells handled by col-span/row-span
              }

              if (!palace) {
                return <div key={idx} className="rounded p-1.5 min-h-[60px]" style={{ background: "#262637" }} />;
              }

              const isMing = palace.name === "명궁" || palace.isMingGong;
              const isBody = palace.isBodyPalace;

              return (
                <div key={idx} className="rounded p-1.5 min-h-[60px]" style={{
                  background: isMing ? "rgba(203,166,247,0.1)" : "#262637",
                  border: isMing ? "1px solid rgba(203,166,247,0.3)" : "1px solid transparent",
                }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium" style={{ color: isMing ? "#cba6f7" : "#6c7086" }}>
                      {palace.name}
                    </span>
                    {isBody && <span className="text-[8px] px-1 rounded" style={{ background: "#363650", color: "#f9e2af" }}>身</span>}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-0.5">
                    {palace.stars?.slice(0, 4).map((star: any, si: number) => (
                      <span key={si} className="text-[9px]" style={{
                        color: star.isMajor ? "#cba6f7" : "#6c7086",
                      }}>
                        {typeof star === "string" ? star : star.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 사화 (四化) */}
      {transformations && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>사화 四化</div>
          <div className="grid grid-cols-4 gap-1 text-center text-xs">
            {["화록", "화권", "화과", "화기"].map((name, i) => {
              const keys = ["huaLu", "huaQuan", "huaKe", "huaJi"];
              const colors = ["#a6e3a1", "#f9e2af", "#89b4fa", "#f38ba8"];
              const val = transformations[keys[i]];
              return (
                <div key={name} className="rounded p-2" style={{ background: "#262637" }}>
                  <div style={{ color: colors[i] }}>{name}</div>
                  <div className="mt-1" style={{ color: "#cdd6f4" }}>{val?.star || val || "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 현재 대한 */}
      {currentDahan && (
        <div className="rounded-lg p-3" style={{ background: "#262637" }}>
          <div className="text-xs font-medium mb-1" style={{ color: "#b4befe" }}>현재 대한 大限</div>
          <div className="text-xs" style={{ color: "#cdd6f4" }}>
            {currentDahan.period || "—"} · {currentDahan.palace || "—"}
          </div>
          {currentDahan.stars && (
            <div className="text-xs mt-1" style={{ color: "#6c7086" }}>
              {Array.isArray(currentDahan.stars) ? currentDahan.stars.join(", ") : currentDahan.stars}
            </div>
          )}
        </div>
      )}

      {/* 궁위 해석 요약 */}
      {palaceInterpretations && Array.isArray(palaceInterpretations) && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>궁위 해석</div>
          <div className="space-y-1">
            {palaceInterpretations.slice(0, 6).map((interp: any, i: number) => (
              <div key={i} className="rounded px-3 py-2 text-xs" style={{ background: "#262637" }}>
                <span className="font-medium" style={{ color: "#cba6f7" }}>{interp.palace || interp.name}</span>
                <span className="ml-2" style={{ color: "#6c7086" }}>{interp.interpretation || interp.summary || ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
