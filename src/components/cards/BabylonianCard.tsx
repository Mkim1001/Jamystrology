"use client";

import type { DivinationResult } from "@/types/divination";

const PATH_COLORS: Record<string, string> = {
  Anu: "#f9e2af",
  Enlil: "#89b4fa",
  Ea: "#a6e3a1",
};

const NATURE_COLORS: Record<string, string> = {
  "길": "#a6e3a1", "긍정": "#a6e3a1", "favorable": "#a6e3a1",
  "흉": "#f38ba8", "부정": "#f38ba8", "unfavorable": "#f38ba8",
  "중립": "#6c7086", "neutral": "#6c7086",
  "mixed": "#f9e2af", "혼합": "#f9e2af",
};

interface Props {
  result: DivinationResult;
}

export default function BabylonianCard({ result }: Props) {
  const { babMonth, lunarPhase, path, constellations, planets, planetaryOmens, dayOmen, overallFortune, overallDescription } = result.details;

  return (
    <div className="space-y-4">
      {/* 총운 */}
      {overallFortune && (
        <div className="rounded-lg p-3 text-center" style={{ background: "#262637" }}>
          <div className="text-[10px] mb-1" style={{ color: "#6c7086" }}>총운</div>
          <div className="text-sm font-medium" style={{
            color: overallFortune.includes("길") || overallFortune.includes("긍정")
              ? "#a6e3a1"
              : overallFortune.includes("흉") || overallFortune.includes("부정")
                ? "#f38ba8" : "#fab387",
          }}>
            {overallFortune}
          </div>
        </div>
      )}

      {/* 경로 (Path of Anu/Enlil/Ea) */}
      {path && (
        <div className="rounded-lg p-3" style={{
          background: "#262637",
          borderLeft: `2px solid ${PATH_COLORS[path.type] || "#fab387"}`,
        }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium" style={{ color: PATH_COLORS[path.type] || "#fab387" }}>
              {path.name} ({path.korean || path.type})
            </span>
            <span className="text-[10px]" style={{ color: "#6c7086" }}>{path.direction || ""}</span>
          </div>
          <div className="text-xs" style={{ color: "#cdd6f4" }}>
            원소: {path.element || "—"}
          </div>
          {path.meaning && (
            <div className="text-xs mt-1 leading-relaxed" style={{ color: "#6c7086" }}>{path.meaning}</div>
          )}
        </div>
      )}

      {/* 바빌로니아 월 & 월상 */}
      <div className="flex gap-2">
        {babMonth && (
          <div className="flex-1 rounded-lg p-3" style={{ background: "#262637" }}>
            <div className="text-[10px]" style={{ color: "#6c7086" }}>바빌로니아 월</div>
            <div className="text-xs font-medium mt-0.5" style={{ color: "#fab387" }}>
              {babMonth.korean || babMonth.name} ({babMonth.number}월)
            </div>
            {babMonth.patron && (
              <div className="text-[10px] mt-0.5" style={{ color: "#6c7086" }}>수호: {babMonth.patron}</div>
            )}
            {babMonth.nature && (
              <div className="text-[10px] mt-0.5" style={{
                color: NATURE_COLORS[babMonth.nature] || "#6c7086",
              }}>{babMonth.nature}</div>
            )}
          </div>
        )}
        {lunarPhase && (
          <div className="flex-1 rounded-lg p-3" style={{ background: "#262637" }}>
            <div className="text-[10px]" style={{ color: "#6c7086" }}>월상</div>
            <div className="text-xs font-medium mt-0.5" style={{ color: "#f9e2af" }}>
              {lunarPhase.korean || lunarPhase.phase}
            </div>
            <div className="text-[10px] mt-0.5" style={{
              color: NATURE_COLORS[lunarPhase.nature] || "#6c7086",
            }}>{lunarPhase.nature}</div>
            {lunarPhase.meaning && (
              <div className="text-[10px] mt-0.5" style={{ color: "#6c7086" }}>{lunarPhase.meaning}</div>
            )}
          </div>
        )}
      </div>

      {/* 행성신 (Planet Gods) */}
      {planets && Array.isArray(planets) && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>행성신 Planetary Gods</div>
          <div className="space-y-1">
            {planets.map((p: any, i: number) => (
              <div key={i} className="rounded px-3 py-2 text-xs flex items-start justify-between" style={{ background: "#262637" }}>
                <div>
                  <span className="font-medium" style={{ color: "#fab387" }}>{p.name}</span>
                  <span className="ml-1 text-[10px]" style={{ color: "#6c7086" }}>
                    {p.sumerian ? `(${p.sumerian})` : ""}
                  </span>
                  {p.celestialBody && (
                    <div className="text-[10px] mt-0.5" style={{ color: "#6c7086" }}>{p.celestialBody}</div>
                  )}
                </div>
                <div className="text-right">
                  {p.element && <div style={{ color: "#cdd6f4" }}>{p.element}</div>}
                  {p.strength && <div style={{ color: "#6c7086" }}>{p.strength}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 별자리 */}
      {constellations && Array.isArray(constellations) && constellations.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>별자리</div>
          <div className="space-y-1">
            {constellations.map((c: any, i: number) => (
              <div key={i} className="rounded px-3 py-1.5 text-xs flex items-center justify-between" style={{ background: "#262637" }}>
                <div>
                  <span className="font-medium" style={{ color: "#cdd6f4" }}>{c.korean || c.name}</span>
                  <span className="ml-1 text-[10px]" style={{ color: "#6c7086" }}>
                    {c.babylonian ? `(${c.babylonian})` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  {c.path && (
                    <span style={{ color: PATH_COLORS[c.path] || "#6c7086" }}>{c.path}</span>
                  )}
                  {c.deity && (
                    <span style={{ color: "#6c7086" }}>{c.deity}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 행성 전조 (Planetary Omens) */}
      {planetaryOmens && Array.isArray(planetaryOmens) && planetaryOmens.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>행성 전조 Omens</div>
          <div className="space-y-1">
            {planetaryOmens.map((o: any, i: number) => {
              const color = NATURE_COLORS[o.nature] || "#6c7086";
              return (
                <div key={i} className="rounded px-3 py-2 text-xs" style={{ background: "#262637" }}>
                  <div className="flex items-center gap-2">
                    <span className="px-1 rounded text-[10px]" style={{ color, border: `1px solid ${color}` }}>
                      {o.nature || "—"}
                    </span>
                    <span style={{ color: "#cdd6f4" }}>{o.korean || o.relationship || ""}</span>
                  </div>
                  {o.omen && (
                    <div className="mt-1 leading-relaxed" style={{ color: "#6c7086" }}>{o.omen}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 일일 전조 */}
      {dayOmen && (
        <div className="rounded-lg p-3" style={{ background: "#262637" }}>
          <div className="text-xs font-medium mb-1" style={{ color: "#b4befe" }}>일일 전조</div>
          <div className="text-xs" style={{
            color: NATURE_COLORS[dayOmen.nature] || "#cdd6f4",
          }}>
            {dayOmen.nature}: {dayOmen.description}
          </div>
        </div>
      )}

      {/* 상세 설명 */}
      {overallDescription && (
        <div className="rounded-lg p-3" style={{ background: "#262637" }}>
          <div className="text-xs font-medium mb-1" style={{ color: "#b4befe" }}>상세 해석</div>
          <div className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "#6c7086" }}>
            {overallDescription}
          </div>
        </div>
      )}
    </div>
  );
}
