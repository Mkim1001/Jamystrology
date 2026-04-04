"use client";

import type { DivinationResult } from "@/types/divination";
import SajuCard from "./cards/SajuCard";
import ZiweiCard from "./cards/ZiweiCard";
import QimenCard from "./cards/QimenCard";
import IchingCard from "./cards/IchingCard";
import HoraryCard from "./cards/HoraryCard";
import BabylonianCard from "./cards/BabylonianCard";

const SYSTEM_LABELS: Record<string, string> = {
  saju: "사주팔자 四柱八字",
  ziwei: "자미두수 紫微斗數",
  qimen: "기문둔갑 奇門遁甲",
  iching: "주역 周易",
  horary: "호라리 점성술",
  babylonian: "바빌로니아 점성술",
};

const SYSTEM_COLORS: Record<string, string> = {
  saju: "#f38ba8",
  ziwei: "#cba6f7",
  qimen: "#89b4fa",
  iching: "#a6e3a1",
  horary: "#f9e2af",
  babylonian: "#fab387",
};

interface Props {
  systemKey: string;
  result: DivinationResult;
  onClose: () => void;
}

function SystemCard({ systemKey, result }: { systemKey: string; result: DivinationResult }) {
  switch (systemKey) {
    case "saju": return <SajuCard result={result} />;
    case "ziwei": return <ZiweiCard result={result} />;
    case "qimen": return <QimenCard result={result} />;
    case "iching": return <IchingCard result={result} />;
    case "horary": return <HoraryCard result={result} />;
    case "babylonian": return <BabylonianCard result={result} />;
    default: return null;
  }
}

export default function DetailPanel({ systemKey, result, onClose }: Props) {
  const accentColor = SYSTEM_COLORS[systemKey] || "#b4befe";
  const hasCard = ["saju", "ziwei", "qimen", "iching", "horary", "babylonian"].includes(systemKey);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#181825", width: 380 }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
          <h3 className="text-sm font-medium" style={{ color: "#cdd6f4" }}>
            {SYSTEM_LABELS[systemKey] || systemKey}
          </h3>
        </div>
        <button onClick={onClose} className="text-sm px-2 py-1 rounded transition-all duration-200 hover:bg-[#363650]"
          style={{ color: "#6c7086" }}>✕</button>
      </div>

      <div className="p-4 space-y-4">
        {/* 요약 */}
        <div className="text-xs leading-relaxed whitespace-pre-wrap"
          style={{ color: "#cdd6f4", fontFamily: "ui-monospace, monospace" }}>
          {result.summary}
        </div>

        {/* 시스템별 상세 카드 */}
        {hasCard && <SystemCard systemKey={systemKey} result={result} />}

        {/* 범용 Elements fallback (카드가 없거나 추가 정보) */}
        {(!hasCard && result.elements.length > 0) && (
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
        )}
      </div>
    </div>
  );
}
