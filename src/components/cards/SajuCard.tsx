"use client";

import type { DivinationResult } from "@/types/divination";

const ELEMENT_COLORS: Record<string, string> = {
  wood: "#a6e3a1", fire: "#f38ba8", earth: "#f9e2af", metal: "#cdd6f4", water: "#89b4fa",
};
const ELEMENT_NAMES: Record<string, string> = {
  wood: "목", fire: "화", earth: "토", metal: "금", water: "수",
};

interface Props {
  result: DivinationResult;
}

export default function SajuCard({ result }: Props) {
  const { pillars, dayMaster, tenGods, hiddenStems, combinations, twelveStages, yongshin, daewun, sewun } = result.details;

  return (
    <div className="space-y-4">
      {/* 일주(日主) 요약 */}
      {dayMaster && (
        <div className="rounded-lg p-3 text-center" style={{ background: "#262637" }}>
          <div className="text-xs mb-1" style={{ color: "#6c7086" }}>일주 日主</div>
          <div className="text-lg font-bold" style={{ color: ELEMENT_COLORS[dayMaster.element] || "#cdd6f4" }}>
            {dayMaster.name} ({dayMaster.stem})
          </div>
          <div className="text-xs mt-1" style={{ color: "#6c7086" }}>
            {dayMaster.elementName} · {dayMaster.yinYang === "yang" ? "양" : "음"}
          </div>
        </div>
      )}

      {/* 명식 테이블 (四柱) */}
      {pillars && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>명식 四柱</div>
          <div className="grid grid-cols-4 gap-1 text-center text-xs">
            {/* 헤더 */}
            {["시주", "일주", "월주", "연주"].map(h => (
              <div key={h} className="py-1 rounded-t" style={{ background: "#363650", color: "#6c7086" }}>{h}</div>
            ))}
            {/* 천간 */}
            {[pillars.hour, pillars.day, pillars.month, pillars.year].map((p: any, i: number) => {
              const stemEl = p?.stemElement || "";
              return (
                <div key={`stem-${i}`} className="py-2 font-medium" style={{
                  background: "#262637",
                  color: ELEMENT_COLORS[stemEl] || "#cdd6f4",
                }}>
                  {p?.stemLabel || p?.stem || "—"}
                </div>
              );
            })}
            {/* 지지 */}
            {[pillars.hour, pillars.day, pillars.month, pillars.year].map((p: any, i: number) => {
              const branchEl = p?.branchElement || "";
              return (
                <div key={`branch-${i}`} className="py-2 rounded-b" style={{
                  background: "#262637",
                  color: ELEMENT_COLORS[branchEl] || "#cdd6f4",
                }}>
                  {p?.branchLabel || p?.branch || "—"}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 십신 (十神) */}
      {tenGods && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>십신 十神</div>
          <div className="grid grid-cols-4 gap-1 text-center text-xs">
            {["시", "일", "월", "연"].map((label, i) => {
              const keys = ["hour", "day", "month", "year"];
              const val = tenGods[keys[i]];
              return (
                <div key={label} className="rounded p-2" style={{ background: "#262637" }}>
                  <div style={{ color: "#6c7086" }}>{label}</div>
                  <div className="mt-1 font-medium" style={{ color: "#cdd6f4" }}>{val || "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 오행 분포 */}
      {dayMaster && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>오행 분포</div>
          <div className="flex gap-2">
            {(["wood", "fire", "earth", "metal", "water"] as const).map(el => {
              const isCore = dayMaster.element === el;
              return (
                <div key={el} className="flex-1 text-center rounded p-2" style={{
                  background: isCore ? "rgba(180,190,254,0.1)" : "#262637",
                  border: isCore ? `1px solid ${ELEMENT_COLORS[el]}` : "1px solid transparent",
                }}>
                  <div className="text-sm" style={{ color: ELEMENT_COLORS[el] }}>{ELEMENT_NAMES[el]}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#6c7086" }}>{el}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 용신 */}
      {yongshin && (
        <div className="rounded-lg p-3" style={{ background: "#262637" }}>
          <div className="text-xs font-medium mb-1" style={{ color: "#b4befe" }}>용신 · 기신</div>
          <div className="text-xs" style={{ color: "#cdd6f4" }}>
            용신: {yongshin.yongshin} / 기신: {yongshin.gishin}
          </div>
          <div className="text-xs mt-1" style={{ color: "#6c7086" }}>
            일간 강약: {yongshin.strength}
          </div>
          {yongshin.explanation && (
            <div className="text-xs mt-1 leading-relaxed" style={{ color: "#6c7086" }}>{yongshin.explanation}</div>
          )}
        </div>
      )}

      {/* 합충형파해 */}
      {combinations && (combinations.harmonies?.length > 0 || combinations.clashes?.length > 0 || combinations.harms?.length > 0) && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>합충형파해</div>
          <div className="space-y-1">
            {combinations.harmonies?.map((h: any, i: number) => (
              <div key={`h-${i}`} className="rounded px-3 py-1.5 text-xs flex items-center gap-2" style={{ background: "#262637" }}>
                <span style={{ color: "#a6e3a1" }}>合</span>
                <span style={{ color: "#cdd6f4" }}>{typeof h === "string" ? h : h.description || JSON.stringify(h)}</span>
              </div>
            ))}
            {combinations.clashes?.map((c: any, i: number) => (
              <div key={`c-${i}`} className="rounded px-3 py-1.5 text-xs flex items-center gap-2" style={{ background: "#262637" }}>
                <span style={{ color: "#f38ba8" }}>冲</span>
                <span style={{ color: "#cdd6f4" }}>{typeof c === "string" ? c : c.description || JSON.stringify(c)}</span>
              </div>
            ))}
            {combinations.harms?.map((h: any, i: number) => (
              <div key={`harm-${i}`} className="rounded px-3 py-1.5 text-xs flex items-center gap-2" style={{ background: "#262637" }}>
                <span style={{ color: "#f9e2af" }}>害</span>
                <span style={{ color: "#cdd6f4" }}>{typeof h === "string" ? h : h.description || JSON.stringify(h)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 십이운성 */}
      {twelveStages && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>십이운성 十二運性</div>
          <div className="grid grid-cols-4 gap-1 text-center text-xs">
            {["hour", "day", "month", "year"].map((key, i) => {
              const stage = twelveStages[key];
              const labels = ["시", "일", "월", "연"];
              return (
                <div key={key} className="rounded p-2" style={{ background: "#262637" }}>
                  <div style={{ color: "#6c7086" }}>{labels[i]}</div>
                  <div className="mt-1" style={{ color: "#cdd6f4" }}>{stage?.name || stage || "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 대운 */}
      {daewun && Array.isArray(daewun) && daewun.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>대운 大運</div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {daewun.map((d: any, i: number) => (
              <div key={i} className="shrink-0 text-center rounded p-2 min-w-[48px]" style={{
                background: d.isCurrent ? "rgba(180,190,254,0.15)" : "#262637",
                border: d.isCurrent ? "1px solid #b4befe" : "1px solid transparent",
              }}>
                <div className="text-[10px]" style={{ color: "#6c7086" }}>{d.startAge || d.age}세</div>
                <div className="text-xs font-medium mt-0.5" style={{
                  color: ELEMENT_COLORS[d.element] || "#cdd6f4",
                }}>
                  {d.stem}{d.branch}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 세운 */}
      {sewun && Array.isArray(sewun) && sewun.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>세운 歲運</div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {sewun.slice(0, 10).map((s: any, i: number) => (
              <div key={i} className="shrink-0 text-center rounded p-2 min-w-[48px]" style={{ background: "#262637" }}>
                <div className="text-[10px]" style={{ color: "#6c7086" }}>{s.year}</div>
                <div className="text-xs mt-0.5" style={{ color: "#cdd6f4" }}>{s.stem}{s.branch}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
