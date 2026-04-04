"use client";

import type { DivinationResult } from "@/types/divination";

const SYSTEM_LABELS: Record<string, string> = {
  saju: "사주팔자 四柱八字",
  ziwei: "자미두수 紫微斗數",
  qimen: "기문둔갑 奇門遁甲",
  iching: "주역 周易",
  horary: "호라리 점성술",
  babylonian: "바빌로니아 점성술",
};

interface Props {
  systemKey: string;
  result: DivinationResult;
  onClose: () => void;
}

export default function DetailPanel({ systemKey, result, onClose }: Props) {
  return (
    <div className="h-full overflow-y-auto" style={{ background: "#181825", width: 320 }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <h3 className="text-sm font-medium" style={{ color: "#cdd6f4" }}>
          {SYSTEM_LABELS[systemKey] || systemKey}
        </h3>
        <button onClick={onClose} className="text-sm px-2 py-1 rounded transition-all duration-200"
          style={{ color: "#6c7086" }}>✕</button>
      </div>

      <div className="p-4 space-y-4">
        {/* 요약 */}
        <div className="text-xs leading-relaxed whitespace-pre-wrap"
          style={{ color: "#cdd6f4", fontFamily: "ui-monospace, monospace" }}>
          {result.summary}
        </div>

        {/* 주역 괘상 시각화 */}
        {systemKey === "iching" && result.details?.originalLines && (
          <div className="flex gap-6 justify-center py-4">
            {[
              { label: "본괘", lines: result.details.originalLines, name: result.details.original?.name, changingLine: result.details.changingLine?.position },
              { label: "변괘", lines: result.details.changedLines, name: result.details.changed?.name, changingLine: -1 },
            ].map((hex, idx) => (
              <div key={idx} className="text-center">
                <div className="text-xs mb-2" style={{ color: "#6c7086" }}>{hex.label}</div>
                <div className="flex flex-col-reverse gap-1.5">
                  {hex.lines?.map((line: number, i: number) => {
                    const isChanging = i === (hex.changingLine ?? -1) - 1;
                    const color = isChanging ? "#f38ba8" : "#cdd6f4";
                    return line === 1 ? (
                      <div key={i} className="w-16 h-1.5 rounded-full" style={{ background: color }} />
                    ) : (
                      <div key={i} className="flex gap-2">
                        <div className="w-6 h-1.5 rounded-full" style={{ background: color }} />
                        <div className="w-6 h-1.5 rounded-full" style={{ background: color }} />
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs mt-2" style={{ color: "#cdd6f4", fontFamily: "Georgia, serif" }}>
                  {hex.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Elements */}
        <div className="space-y-2">
          {result.elements.map((el, i) => (
            <div key={i} className="rounded p-3" style={{ background: "#262637" }}>
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium" style={{ color: "#b4befe" }}>{el.label}</span>
              </div>
              <div className="text-xs mt-1" style={{ color: "#cdd6f4", fontFamily: "ui-monospace, monospace" }}>
                {el.value}
              </div>
              {el.description && (
                <div className="text-xs mt-1" style={{ color: "#6c7086" }}>{el.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
