"use client";

import type { DivinationResult } from "@/types/divination";

const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#cba6f7",
  sextile: "#a6e3a1",
  square: "#f38ba8",
  trine: "#89b4fa",
  opposition: "#f38ba8",
};

const DIGNITY_COLORS: Record<string, string> = {
  domicile: "#a6e3a1",
  exaltation: "#89b4fa",
  detriment: "#f38ba8",
  fall: "#f38ba8",
};

interface Props {
  result: DivinationResult;
}

export default function HoraryCard({ result }: Props) {
  const { chart, planets, significators, dignities, aspects, moon, judgment, horaryQuestion } = result.details;

  return (
    <div className="space-y-4">
      {/* 질문 */}
      {horaryQuestion && (
        <div className="rounded-lg p-3" style={{ background: "rgba(249,226,175,0.08)", borderLeft: "2px solid #f9e2af" }}>
          <div className="text-[10px] mb-1" style={{ color: "#6c7086" }}>질문</div>
          <div className="text-xs" style={{ color: "#f9e2af" }}>{horaryQuestion}</div>
        </div>
      )}

      {/* 판단 결과 */}
      {judgment && (
        <div className="rounded-lg p-3 text-center" style={{ background: "#262637" }}>
          <div className="text-[10px] mb-1" style={{ color: "#6c7086" }}>판단 Judgment</div>
          <div className="text-lg font-bold" style={{
            color: judgment.overallAnswer === "Yes" || judgment.overallAnswer === "긍정"
              ? "#a6e3a1"
              : judgment.overallAnswer === "No" || judgment.overallAnswer === "부정"
                ? "#f38ba8" : "#f9e2af",
          }}>
            {judgment.overallAnswer}
          </div>
          {judgment.confidence && (
            <div className="text-[10px] mt-1" style={{ color: "#6c7086" }}>
              확신도: {judgment.confidence}
            </div>
          )}
          {judgment.perfectionType && (
            <div className="text-xs mt-1" style={{ color: "#cdd6f4" }}>
              성립 유형: {judgment.perfectionType}
            </div>
          )}
          {judgment.reasoning && (
            <div className="text-xs mt-2 leading-relaxed text-left" style={{ color: "#6c7086" }}>
              {judgment.reasoning}
            </div>
          )}
        </div>
      )}

      {/* 차트 정보 */}
      {chart && (
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg p-2 text-center" style={{ background: "#262637" }}>
            <div className="text-[10px]" style={{ color: "#6c7086" }}>ASC</div>
            <div className="text-xs font-medium mt-0.5" style={{ color: "#f9e2af" }}>
              {chart.ascSignName || chart.ascSign || "—"}
            </div>
            <div className="text-[10px]" style={{ color: "#6c7086" }}>
              {chart.asc ? `${chart.asc.toFixed(1)}°` : ""}
            </div>
          </div>
          <div className="flex-1 rounded-lg p-2 text-center" style={{ background: "#262637" }}>
            <div className="text-[10px]" style={{ color: "#6c7086" }}>MC</div>
            <div className="text-xs font-medium mt-0.5" style={{ color: "#cdd6f4" }}>
              {chart.mc ? `${chart.mc.toFixed(1)}°` : "—"}
            </div>
          </div>
          <div className="flex-1 rounded-lg p-2 text-center" style={{ background: "#262637" }}>
            <div className="text-[10px]" style={{ color: "#6c7086" }}>행성시</div>
            <div className="text-xs font-medium mt-0.5" style={{ color: "#cdd6f4" }}>
              {chart.planetaryHourName || chart.planetaryHour || "—"}
            </div>
          </div>
        </div>
      )}

      {/* 시그니피케이터 */}
      {significators && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>시그니피케이터</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="rounded p-2" style={{ background: "#262637" }}>
              <div style={{ color: "#6c7086" }}>질문자 (L1)</div>
              <div className="mt-0.5 font-medium" style={{ color: "#f9e2af" }}>
                {significators.querent || "—"}
              </div>
            </div>
            <div className="rounded p-2" style={{ background: "#262637" }}>
              <div style={{ color: "#6c7086" }}>질문대상 (L{significators.quesitedHouse || "?"})</div>
              <div className="mt-0.5 font-medium" style={{ color: "#f9e2af" }}>
                {significators.quesited || "—"}
              </div>
            </div>
            {significators.moonCoSig && (
              <div className="rounded p-2 col-span-2" style={{ background: "#262637" }}>
                <div style={{ color: "#6c7086" }}>달 (공동 시그니피케이터)</div>
                <div className="mt-0.5" style={{ color: "#cdd6f4" }}>{significators.moonCoSig}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 행성 테이블 */}
      {planets && Array.isArray(planets) && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>행성 위치</div>
          <div className="rounded overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* 헤더 */}
            <div className="grid grid-cols-5 text-[10px] px-2 py-1" style={{ background: "#363650", color: "#6c7086" }}>
              <span>행성</span><span>별자리</span><span>하우스</span><span>도수</span><span>역행</span>
            </div>
            {planets.map((p: any, i: number) => (
              <div key={i} className="grid grid-cols-5 text-[10px] px-2 py-1.5 items-center" style={{
                background: i % 2 === 0 ? "#262637" : "#2a2a3f",
                color: "#cdd6f4",
              }}>
                <span>{p.symbol || ""} {p.name}</span>
                <span>{p.signName || p.sign}</span>
                <span>{p.house || "—"}H</span>
                <span>{typeof p.degree === "number" ? `${p.degree.toFixed(1)}°` : p.degree || "—"}</span>
                <span style={{ color: p.retrograde ? "#f38ba8" : "#6c7086" }}>
                  {p.retrograde ? "R" : "D"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 하우스 커스프 */}
      {chart?.cusps && Array.isArray(chart.cusps) && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>하우스 커스프</div>
          <div className="grid grid-cols-4 gap-1 text-[10px]">
            {chart.cusps.map((c: any, i: number) => (
              <div key={i} className="rounded p-1.5 text-center" style={{ background: "#262637" }}>
                <div style={{ color: "#6c7086" }}>{c.house || i + 1}H</div>
                <div style={{ color: "#cdd6f4" }}>{c.signName || c.sign}</div>
                <div style={{ color: "#6c7086" }}>
                  {typeof c.degree === "number" ? `${c.degree.toFixed(1)}°` : c.degree || ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 위엄 (Dignities) */}
      {dignities && Array.isArray(dignities) && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>본질적 위엄</div>
          <div className="space-y-1">
            {dignities.map((d: any, i: number) => (
              <div key={i} className="rounded px-3 py-1.5 text-xs flex items-center justify-between" style={{ background: "#262637" }}>
                <span style={{ color: "#cdd6f4" }}>{d.planet}</span>
                <div className="flex gap-2">
                  {d.domicile && <span style={{ color: DIGNITY_COLORS.domicile }}>거주</span>}
                  {d.exaltation && <span style={{ color: DIGNITY_COLORS.exaltation }}>고양</span>}
                  {d.detriment && <span style={{ color: DIGNITY_COLORS.detriment }}>손해</span>}
                  {d.fall && <span style={{ color: DIGNITY_COLORS.fall }}>함락</span>}
                  <span style={{ color: "#6c7086" }}>({d.score || 0})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 상 (Aspects) */}
      {aspects && Array.isArray(aspects) && aspects.length > 0 && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>행성 상 Aspects</div>
          <div className="space-y-1">
            {aspects.slice(0, 10).map((a: any, i: number) => {
              const color = ASPECT_COLORS[a.type] || "#6c7086";
              return (
                <div key={i} className="rounded px-3 py-1.5 text-xs flex items-center gap-2" style={{ background: "#262637" }}>
                  <span style={{ color }}>{a.typeName || a.type}</span>
                  <span style={{ color: "#cdd6f4" }}>
                    {a.planet1} — {a.planet2}
                  </span>
                  <span className="ml-auto text-[10px]" style={{ color: "#6c7086" }}>
                    {a.applying ? "적용" : "분리"} {typeof a.orb === "number" ? `${a.orb.toFixed(1)}°` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 달 분석 */}
      {moon && (
        <div className="rounded-lg p-3" style={{ background: "#262637" }}>
          <div className="text-xs font-medium mb-1" style={{ color: "#b4befe" }}>달 Moon</div>
          <div className="text-xs leading-relaxed" style={{ color: "#cdd6f4" }}>
            {typeof moon === "string" ? moon : moon.description || moon.summary || JSON.stringify(moon)}
          </div>
        </div>
      )}
    </div>
  );
}
