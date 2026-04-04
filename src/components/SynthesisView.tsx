"use client";

import type { DivinationResult } from "@/types/divination";

/* ─── colors ─── */

const ELEMENT_COLORS: Record<string, string> = {
  wood: "#a6e3a1", fire: "#f38ba8", earth: "#f9e2af", metal: "#cdd6f4", water: "#89b4fa",
};
const ELEMENT_NAMES: Record<string, string> = {
  wood: "목 木", fire: "화 火", earth: "토 土", metal: "금 金", water: "수 水",
};

const TENDENCY_STYLES: Record<string, { color: string; icon: string }> = {
  "상승": { color: "#a6e3a1", icon: "↑" },
  "하강": { color: "#f38ba8", icon: "↓" },
  "전환": { color: "#cba6f7", icon: "⟳" },
  "안정": { color: "#89b4fa", icon: "—" },
  "혼란": { color: "#f9e2af", icon: "~" },
};

const GRADE_COLORS: Record<string, string> = {
  "대길": "#a6e3a1", "길": "#a6e3a1", "보통": "#6c7086", "주의": "#f9e2af", "흉": "#f38ba8",
};

const PERIOD_LABELS: Record<string, string> = {
  immediate: "즉시 (1개월)", "short-term": "단기 (3개월)",
  "medium-term": "중기 (1년)", "long-term": "장기 (3년+)",
  즉시: "즉시 (1개월)", 단기: "단기 (3개월)", 중기: "중기 (1년)", 장기: "장기 (3년+)",
};

const LUCKY_SECTIONS: { key: string; label: string; icon: string }[] = [
  { key: "colors", label: "색상", icon: "◉" },
  { key: "directions", label: "방위", icon: "◇" },
  { key: "numbers", label: "숫자", icon: "#" },
  { key: "foods", label: "음식", icon: "◎" },
  { key: "fields", label: "분야", icon: "▣" },
  { key: "days", label: "길일", icon: "☉" },
];

/* ─── component ─── */

interface Props {
  synthesisResult: DivinationResult;
}

export default function SynthesisView({ synthesisResult }: Props) {
  const d = synthesisResult.details;
  if (!d) return null;

  const { fiveElementProfile, timeline, domains, resonances, conflicts, coreMessage, topThemes, warnings, luckyFactors } = d;

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#1e1e2e" }}>
      <div className="max-w-4xl mx-auto p-6 space-y-8">

        {/* 헤더 */}
        <div>
          <div className="text-xs mb-1" style={{ color: "#6c7086" }}>통합분석 &gt; 종합 리포트</div>
          <h2 className="text-xl font-medium" style={{ color: "#cdd6f4" }}>통합 분석 리포트</h2>
          {topThemes && topThemes.length > 0 && (
            <div className="flex gap-2 mt-2">
              {topThemes.map((theme: string, i: number) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded" style={{
                  background: "rgba(180,190,254,0.1)", color: "#b4befe",
                  border: "1px solid rgba(180,190,254,0.2)",
                }}>{theme}</span>
              ))}
            </div>
          )}
        </div>

        {/* ────── 핵심 메시지 (인용구) ────── */}
        {coreMessage && (
          <div className="pl-4 py-3" style={{ borderLeft: "3px solid #b4befe" }}>
            <p className="text-base leading-relaxed" style={{ color: "#cdd6f4" }}>{coreMessage}</p>
          </div>
        )}

        {/* ────── 오행 프로파일 ────── */}
        {fiveElementProfile && (
          <section>
            <SectionTitle title="오행 프로파일" sub="五行 Profile" />
            <div className="rounded-lg p-5" style={{ background: "#262637" }}>
              <div className="space-y-3">
                {(["wood", "fire", "earth", "metal", "water"] as const).map(el => {
                  const score = fiveElementProfile.scores?.[el] ?? 0;
                  const isCore = fiveElementProfile.coreEnergy === el;
                  const isWeak = fiveElementProfile.weakEnergy === el;
                  return (
                    <div key={el} className="flex items-center gap-3">
                      <div className="w-16 text-xs font-medium shrink-0" style={{
                        color: ELEMENT_COLORS[el],
                      }}>
                        {ELEMENT_NAMES[el]}
                        {isCore && <span className="ml-1 text-[9px]" style={{ color: "#b4befe" }}>★</span>}
                        {isWeak && <span className="ml-1 text-[9px]" style={{ color: "#f38ba8" }}>▽</span>}
                      </div>
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "#1e1e2e" }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{
                          width: `${Math.min(score, 100)}%`,
                          background: `linear-gradient(90deg, ${ELEMENT_COLORS[el]}80, ${ELEMENT_COLORS[el]})`,
                        }} />
                      </div>
                      <div className="w-10 text-right text-xs font-mono" style={{ color: "#cdd6f4" }}>
                        {score}%
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 균형도 & 상생/상극 */}
              <div className="mt-4 pt-3 grid grid-cols-3 gap-3 text-center text-xs" style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div>
                  <div style={{ color: "#6c7086" }}>균형도</div>
                  <div className="text-sm font-medium mt-0.5" style={{ color: "#b4befe" }}>
                    {fiveElementProfile.balance ?? "—"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#6c7086" }}>상생 흐름</div>
                  <div className="mt-0.5" style={{ color: "#a6e3a1" }}>
                    {fiveElementProfile.generationChain || "—"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#6c7086" }}>상극 긴장</div>
                  <div className="mt-0.5" style={{ color: "#f38ba8" }}>
                    {fiveElementProfile.destructionTension || "—"}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ────── 시기별 종합 ────── */}
        {timeline && Array.isArray(timeline) && timeline.length > 0 && (
          <section>
            <SectionTitle title="시기별 종합" sub="Timeline" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {timeline.map((entry: any, i: number) => {
                const style = TENDENCY_STYLES[entry.tendency] || { color: "#6c7086", icon: "?" };
                return (
                  <div key={i} className="rounded-lg p-4" style={{ background: "#262637" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: "#cdd6f4" }}>
                        {PERIOD_LABELS[entry.period] || entry.period}
                      </span>
                      <span className="text-sm font-bold" style={{ color: style.color }}>
                        {style.icon} {entry.tendency}
                      </span>
                    </div>
                    {entry.energy && (
                      <div className="text-[10px] mb-2 px-1.5 py-0.5 rounded inline-block" style={{
                        background: "rgba(180,190,254,0.1)", color: "#b4befe",
                      }}>
                        {entry.energy}
                      </div>
                    )}
                    <p className="text-xs leading-relaxed" style={{ color: "#6c7086" }}>
                      {entry.description}
                    </p>
                    {entry.confidence != null && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex-1 h-1 rounded-full" style={{ background: "#1e1e2e" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${entry.confidence * 100}%`,
                            background: style.color,
                          }} />
                        </div>
                        <span className="text-[9px]" style={{ color: "#6c7086" }}>
                          {Math.round(entry.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ────── 12영역 분석 ────── */}
        {domains && Array.isArray(domains) && domains.length > 0 && (
          <section>
            <SectionTitle title="12영역 분석" sub="Life Domains" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {domains.map((domain: any, i: number) => {
                const gradeColor = GRADE_COLORS[domain.grade] || "#6c7086";
                return (
                  <div key={i} className="rounded-lg p-4" style={{ background: "#262637" }}>
                    {/* 헤더: 영역명 + 점수/등급 */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: "#cdd6f4" }}>
                        {domain.domain}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono" style={{ color: "#b4befe" }}>
                          {domain.score}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                          color: gradeColor,
                          border: `1px solid ${gradeColor}`,
                        }}>
                          {domain.grade}
                        </span>
                      </div>
                    </div>

                    {/* 점수 바 */}
                    <div className="h-1.5 rounded-full mb-3" style={{ background: "#1e1e2e" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{
                        width: `${Math.min(domain.score, 100)}%`,
                        background: gradeColor,
                      }} />
                    </div>

                    {/* 시스템별 한줄 요약 */}
                    {domain.systemInputs && domain.systemInputs.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {domain.systemInputs.slice(0, 3).map((si: any, j: number) => (
                          <div key={j} className="flex items-start gap-1.5 text-[10px]">
                            <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full" style={{
                              background: SYSTEM_COLORS[si.system] || "#6c7086",
                            }} />
                            <span style={{ color: "#6c7086" }}>{si.interpretation}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 종합 & 조언 */}
                    {domain.synthesis && (
                      <p className="text-xs leading-relaxed mb-1" style={{ color: "#cdd6f4" }}>
                        {domain.synthesis}
                      </p>
                    )}
                    {domain.advice && (
                      <p className="text-[10px] leading-relaxed" style={{ color: "#b4befe" }}>
                        💡 {domain.advice}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ────── 공명/충돌 ────── */}
        {((resonances && resonances.length > 0) || (conflicts && conflicts.length > 0)) && (
          <section>
            <SectionTitle title="공명/충돌 맵" sub="Resonance & Conflicts" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 공명 */}
              {resonances && resonances.length > 0 && (
                <div className="rounded-lg p-4" style={{ background: "#262637" }}>
                  <div className="text-xs font-medium mb-3" style={{ color: "#a6e3a1" }}>공명 Resonance</div>
                  <div className="space-y-2.5">
                    {resonances.map((r: any, i: number) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs" style={{ color: "#cdd6f4" }}>{r.theme}</span>
                          <span className="text-[10px] font-mono" style={{ color: "#a6e3a1" }}>
                            {r.score}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "#1e1e2e" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${Math.min(r.score, 100)}%`,
                            background: "linear-gradient(90deg, #a6e3a180, #a6e3a1)",
                          }} />
                        </div>
                        <div className="flex gap-1 mt-1">
                          {r.systems?.map((sys: string, j: number) => (
                            <span key={j} className="text-[9px] px-1 rounded" style={{
                              background: "rgba(255,255,255,0.03)", color: "#6c7086",
                            }}>{sys}</span>
                          ))}
                        </div>
                        {r.description && (
                          <p className="text-[10px] mt-1 leading-relaxed" style={{ color: "#6c7086" }}>
                            {r.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 충돌 */}
              {conflicts && conflicts.length > 0 && (
                <div className="rounded-lg p-4" style={{ background: "#262637" }}>
                  <div className="text-xs font-medium mb-3" style={{ color: "#f38ba8" }}>충돌 Conflicts</div>
                  <div className="space-y-3">
                    {conflicts.map((c: any, i: number) => (
                      <div key={i} className="rounded p-3" style={{ background: "#1e1e2e" }}>
                        <div className="text-xs font-medium mb-1.5" style={{ color: "#f38ba8" }}>
                          {c.domain}
                        </div>
                        <div className="flex gap-2 text-[10px] mb-2">
                          <div className="flex-1 rounded p-2" style={{ background: "#262637" }}>
                            <div style={{ color: SYSTEM_COLORS[c.system1?.name] || "#6c7086" }}>
                              {c.system1?.name}
                            </div>
                            <div className="mt-0.5" style={{ color: "#cdd6f4" }}>{c.system1?.interpretation}</div>
                          </div>
                          <div className="flex items-center text-sm" style={{ color: "#f38ba8" }}>⚡</div>
                          <div className="flex-1 rounded p-2" style={{ background: "#262637" }}>
                            <div style={{ color: SYSTEM_COLORS[c.system2?.name] || "#6c7086" }}>
                              {c.system2?.name}
                            </div>
                            <div className="mt-0.5" style={{ color: "#cdd6f4" }}>{c.system2?.interpretation}</div>
                          </div>
                        </div>
                        {c.resolution && (
                          <p className="text-[10px] leading-relaxed" style={{ color: "#b4befe" }}>
                            ↳ {c.resolution}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ────── 경고 ────── */}
        {warnings && warnings.length > 0 && (
          <section>
            <div className="space-y-1.5">
              {warnings.map((w: string, i: number) => (
                <div key={i} className="rounded-lg px-4 py-2.5 text-xs flex items-start gap-2" style={{
                  background: "rgba(243,139,168,0.06)",
                  border: "1px solid rgba(243,139,168,0.15)",
                }}>
                  <span style={{ color: "#f38ba8" }}>⚠</span>
                  <span style={{ color: "#cdd6f4" }}>{w}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ────── 실천 조언 — 행운의 요소 ────── */}
        {luckyFactors && (
          <section>
            <SectionTitle title="행운의 요소" sub="Lucky Factors" />
            <div className="rounded-lg p-5" style={{ background: "#262637" }}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {LUCKY_SECTIONS.map(sec => {
                  const items = luckyFactors[sec.key];
                  if (!items || !Array.isArray(items) || items.length === 0) return null;
                  return (
                    <div key={sec.key}>
                      <div className="text-[10px] font-medium mb-1.5 flex items-center gap-1" style={{ color: "#6c7086" }}>
                        <span>{sec.icon}</span>
                        <span>{sec.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((item: any, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 rounded" style={{
                            background: "#1e1e2e",
                            color: "#cdd6f4",
                            border: "1px solid rgba(180,190,254,0.15)",
                          }}>
                            {String(item)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 바닥 여백 */}
        <div className="h-8" />
      </div>
    </div>
  );
}

/* ─── shared ─── */

const SYSTEM_COLORS: Record<string, string> = {
  saju: "#f38ba8", "사주팔자": "#f38ba8",
  ziwei: "#cba6f7", "자미두수": "#cba6f7",
  qimen: "#89b4fa", "기문둔갑": "#89b4fa",
  iching: "#a6e3a1", "주역": "#a6e3a1",
  horary: "#f9e2af", "호라리": "#f9e2af",
  babylonian: "#fab387", "바빌로니아": "#fab387",
  synthesis: "#b4befe",
};

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-baseline gap-2 mb-3">
      <h3 className="text-sm font-medium" style={{ color: "#cdd6f4" }}>{title}</h3>
      <span className="text-[10px]" style={{ color: "#6c7086" }}>{sub}</span>
    </div>
  );
}
