"use client";

import type { DivinationResult } from "@/types/divination";

const TI_YONG_COLORS: Record<string, string> = {
  "상생": "#a6e3a1", "생": "#a6e3a1",
  "상극": "#f38ba8", "극": "#f38ba8",
  "비화": "#f9e2af", "화": "#f9e2af",
};

interface HexagramProps {
  label: string;
  lines: number[];
  name?: string;
  hanja?: string;
  changingLine?: number; // 1-indexed
}

function HexagramViz({ label, lines, name, hanja, changingLine = -1 }: HexagramProps) {
  if (!lines || !Array.isArray(lines)) return null;
  return (
    <div className="text-center">
      <div className="text-[10px] mb-2" style={{ color: "#6c7086" }}>{label}</div>
      <div className="flex flex-col-reverse gap-1.5 items-center">
        {lines.map((line, i) => {
          const isChanging = i === changingLine - 1;
          const color = isChanging ? "#f38ba8" : "#cdd6f4";
          return line === 1 ? (
            <div key={i} className="w-14 h-1.5 rounded-full" style={{ background: color }} />
          ) : (
            <div key={i} className="flex gap-2">
              <div className="w-5 h-1.5 rounded-full" style={{ background: color }} />
              <div className="w-5 h-1.5 rounded-full" style={{ background: color }} />
            </div>
          );
        })}
      </div>
      {name && (
        <div className="mt-2 text-xs" style={{ color: "#cdd6f4", fontFamily: "Georgia, serif" }}>
          {name}
        </div>
      )}
      {hanja && (
        <div className="text-[10px]" style={{ color: "#6c7086", fontFamily: "Georgia, serif" }}>
          {hanja}
        </div>
      )}
    </div>
  );
}

interface Props {
  result: DivinationResult;
}

export default function IchingCard({ result }: Props) {
  const { original, changed, mutual, reversed, inverted, changingLine, tiYong, maeHwa, originalLines, changedLines } = result.details;

  return (
    <div className="space-y-4">
      {/* 괘상 시각화 — 본괘 & 변괘 */}
      {originalLines && (
        <div className="rounded-lg p-4" style={{ background: "#262637" }}>
          <div className="flex gap-8 justify-center">
            <HexagramViz
              label="본괘 本卦"
              lines={originalLines}
              name={original?.name}
              hanja={original?.hanja}
              changingLine={changingLine?.position}
            />
            {changedLines && (
              <HexagramViz
                label="변괘 變卦"
                lines={changedLines}
                name={changed?.name}
                hanja={changed?.hanja}
              />
            )}
          </div>
        </div>
      )}

      {/* 괘 정보 테이블 */}
      {original && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>괘 정보</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {[
              { label: "본괘", value: `${original.name} (${original.hanja || ""})`, sub: original.keyword },
              changed && { label: "변괘", value: `${changed.name} (${changed.hanja || ""})`, sub: changed.keyword },
              mutual && { label: "호괘", value: `${mutual.name} (${mutual.hanja || ""})` },
              reversed && { label: "착괘", value: `${reversed.name} (${reversed.hanja || ""})` },
              inverted && { label: "종괘", value: `${inverted.name} (${inverted.hanja || ""})` },
            ].filter(Boolean).map((item: any, i) => (
              <div key={i} className="rounded p-2" style={{ background: "#262637" }}>
                <div style={{ color: "#a6e3a1" }}>{item.label}</div>
                <div className="mt-0.5" style={{ color: "#cdd6f4" }}>{item.value}</div>
                {item.sub && <div className="mt-0.5" style={{ color: "#6c7086" }}>{item.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 변효 (動爻) */}
      {changingLine && (
        <div className="rounded-lg p-3" style={{ background: "#262637" }}>
          <div className="text-xs font-medium mb-1" style={{ color: "#b4befe" }}>
            변효 動爻 — {changingLine.position}효
          </div>
          {changingLine.text && (
            <div className="text-xs mt-1" style={{ color: "#cdd6f4", fontFamily: "Georgia, serif" }}>
              {changingLine.text}
            </div>
          )}
          {changingLine.interpretation && (
            <div className="text-xs mt-1 leading-relaxed" style={{ color: "#6c7086" }}>
              {changingLine.interpretation}
            </div>
          )}
        </div>
      )}

      {/* 체용 분석 (體用) */}
      {tiYong && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>체용 분석 體用</div>
          <div className="rounded-lg p-3" style={{ background: "#262637" }}>
            <div className="flex gap-4 text-xs">
              <div className="flex-1 text-center">
                <div style={{ color: "#6c7086" }}>체괘 體</div>
                <div className="text-sm font-medium mt-1" style={{ color: "#a6e3a1" }}>
                  {tiYong.tiTrigram || "—"}
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-lg" style={{
                  color: TI_YONG_COLORS[tiYong.relation] || "#6c7086",
                }}>
                  {tiYong.relation === "상생" || tiYong.relation === "생" ? "→" : tiYong.relation === "상극" || tiYong.relation === "극" ? "⚡" : "≈"}
                </span>
              </div>
              <div className="flex-1 text-center">
                <div style={{ color: "#6c7086" }}>용괘 用</div>
                <div className="text-sm font-medium mt-1" style={{ color: "#f9e2af" }}>
                  {tiYong.yongTrigram || "—"}
                </div>
              </div>
            </div>
            <div className="text-center mt-2 text-xs" style={{
              color: TI_YONG_COLORS[tiYong.relation] || "#6c7086",
            }}>
              {tiYong.relation} — {tiYong.fortune || ""}
            </div>
          </div>
        </div>
      )}

      {/* 매화역수 정보 */}
      {maeHwa && (
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: "#b4befe" }}>매화역수 梅花易數</div>
          <div className="grid grid-cols-3 gap-1 text-center text-xs">
            <div className="rounded p-2" style={{ background: "#262637" }}>
              <div style={{ color: "#6c7086" }}>상수</div>
              <div className="mt-1" style={{ color: "#cdd6f4" }}>{maeHwa.numbers?.upperSum || "—"}</div>
            </div>
            <div className="rounded p-2" style={{ background: "#262637" }}>
              <div style={{ color: "#6c7086" }}>하수</div>
              <div className="mt-1" style={{ color: "#cdd6f4" }}>{maeHwa.numbers?.lowerSum || "—"}</div>
            </div>
            <div className="rounded p-2" style={{ background: "#262637" }}>
              <div style={{ color: "#6c7086" }}>변효</div>
              <div className="mt-1" style={{ color: "#cdd6f4" }}>{maeHwa.changingLine || "—"}효</div>
            </div>
          </div>
        </div>
      )}

      {/* 괘사 (卦辭) */}
      {original?.judgment && (
        <div className="rounded-lg p-3" style={{ background: "#262637" }}>
          <div className="text-xs font-medium mb-1" style={{ color: "#b4befe" }}>괘사 卦辭</div>
          <div className="text-xs leading-relaxed" style={{ color: "#cdd6f4", fontFamily: "Georgia, serif" }}>
            {original.judgment}
          </div>
        </div>
      )}

      {/* 구아사 */}
      {original?.guasa && (
        <div className="rounded-lg p-3" style={{ background: "#262637" }}>
          <div className="text-xs font-medium mb-1" style={{ color: "#b4befe" }}>구아사</div>
          <div className="text-xs leading-relaxed" style={{ color: "#6c7086", fontFamily: "Georgia, serif" }}>
            {original.guasa}
          </div>
        </div>
      )}
    </div>
  );
}
