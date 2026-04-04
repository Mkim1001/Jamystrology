"use client";

import type { DivinationResult } from "@/types/divination";

const ELEMENT_COLORS: Record<string, string> = {
  wood: "#a6e3a1", fire: "#f38ba8", earth: "#f9e2af", metal: "#cdd6f4", water: "#89b4fa",
};
const ELEMENT_NAMES: Record<string, string> = {
  wood: "목", fire: "화", earth: "토", metal: "금", water: "수",
};

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

function stemStr(idx: number): string { return STEMS[idx] ?? "?"; }
function branchStr(idx: number): string { return BRANCHES[idx] ?? "?"; }

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
            {dayMaster.name}
          </div>
          <div className="text-xs mt-1" style={{ color: "#6c7086" }}>
            {dayMaster.elementName} · {dayMaster.yinYang}
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
            {[pillars.hour, pillars.day, pillars.month, pillars.year].map((p: any, i: number) => (
              <div key={`stem-${i}`} className="py-2 font-medium" style={{ background: "#262637", color: "#cdd6f4" }}>
                {typeof p?.stem === "number" ? stemStr(p.stem) : (p?.label?.charAt(0) || "—")}
              </div>
            ))}
            {/* 지지 */}
            {[pillars.hour, pillars.day, pillars.month, pillars.year].map((p: any, i: number) => (
              <div key={`branch-${i}`} className="py-2 rounded-b" style={{ background: "#262637", color: "#cdd6f4" }}>
                {typeof p?.branch === "number" ? branchStr(p.branch) : (p?.label?.charAt(1) || "—")}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 십신 (十神) */}
      {tenGods && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>십신 十神</div>
          <div className="grid grid-cols-4 gap-1 text-center text-xs">
            {(["hour", "day", "month", "year"] as const).map((key, i) => {
              const labels = ["시", "일", "월", "연"];
              const tg = tenGods[key];
              const display = tg
                ? (typeof tg === "string" ? tg : tg.stem || tg.role || "—")
                : "—";
              return (
                <div key={key} className="rounded p-2" style={{ background: "#262637" }}>
                  <div style={{ color: "#6c7086" }}>{labels[i]}</div>
                  <div className="mt-1 font-medium" style={{ color: "#cdd6f4" }}>{display}</div>
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
            용신: {ELEMENT_NAMES[yongshin.yongshin] || yongshin.yongshin} / 기신: {ELEMENT_NAMES[yongshin.gishin] || yongshin.gishin}
          </div>
          <div className="text-xs mt-1" style={{ color: "#6c7086" }}>
            일간 강약: {yongshin.strength} ({yongshin.strengthScore}%)
          </div>
          {yongshin.explanation && (
            <div className="text-xs mt-1 leading-relaxed" style={{ color: "#6c7086" }}>{yongshin.explanation}</div>
          )}
        </div>
      )}

      {/* 합충형파해 — combinations is CombinationResult[] */}
      {combinations && Array.isArray(combinations) && combinations.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>합충형파해</div>
          <div className="space-y-1">
            {combinations.map((c: any, i: number) => {
              const typeColors: Record<string, string> = { 합: "#a6e3a1", 충: "#f38ba8", 형: "#f9e2af", 파: "#fab387", 해: "#cba6f7" };
              const typeChar = c.type?.charAt(0) || "?";
              return (
                <div key={i} className="rounded px-3 py-1.5 text-xs flex items-center gap-2" style={{ background: "#262637" }}>
                  <span style={{ color: typeColors[typeChar] || "#6c7086" }}>{typeChar}</span>
                  <span style={{ color: "#cdd6f4" }}>
                    {c.name} ({Array.isArray(c.positions) ? c.positions.join("-") : ""})
                  </span>
                  {c.description && <span style={{ color: "#6c7086" }}> — {c.description}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 십이운성 — twelveStages is TwelveStageResult[] */}
      {twelveStages && Array.isArray(twelveStages) && twelveStages.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>십이운성 十二運性</div>
          <div className="grid grid-cols-4 gap-1 text-center text-xs">
            {twelveStages.slice(0, 4).map((stage: any, i: number) => (
              <div key={i} className="rounded p-2" style={{ background: "#262637" }}>
                <div style={{ color: "#6c7086" }}>{stage.position || ""}</div>
                <div className="mt-1" style={{ color: "#cdd6f4" }}>{stage.stage || stage.name || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 대운 — daewun is {periods: [], forward: boolean} */}
      {daewun && daewun.periods && Array.isArray(daewun.periods) && daewun.periods.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>대운 大運</div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {daewun.periods.map((d: any, i: number) => (
              <div key={i} className="shrink-0 text-center rounded p-2 min-w-[48px]" style={{
                background: d.isCurrent ? "rgba(180,190,254,0.15)" : "#262637",
                border: d.isCurrent ? "1px solid #b4befe" : "1px solid transparent",
              }}>
                <div className="text-[10px]" style={{ color: "#6c7086" }}>{d.startAge}~{d.endAge}세</div>
                <div className="text-xs font-medium mt-0.5" style={{ color: "#cdd6f4" }}>
                  {typeof d.stem === "number" ? stemStr(d.stem) : d.stem}
                  {typeof d.branch === "number" ? branchStr(d.branch) : d.branch}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 세운 — sewun is {stem, branch, year} single object */}
      {sewun && typeof sewun === "object" && !Array.isArray(sewun) && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>세운 歲運 ({sewun.year}년)</div>
          <div className="rounded-lg p-3 text-center" style={{ background: "#262637" }}>
            <div className="text-sm font-medium" style={{ color: "#cdd6f4" }}>
              {typeof sewun.stem === "number" ? stemStr(sewun.stem) : sewun.stem}
              {typeof sewun.branch === "number" ? branchStr(sewun.branch) : sewun.branch}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
