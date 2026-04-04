"use client";

import type { DivinationResult } from "@/types/divination";
import SajuCard from "./cards/SajuCard";
import ZiweiCard from "./cards/ZiweiCard";
import QimenCard from "./cards/QimenCard";
import IchingCard from "./cards/IchingCard";
import HoraryCard from "./cards/HoraryCard";
import BabylonianCard from "./cards/BabylonianCard";

const SYSTEM_META: Record<string, { name: string; hanja: string; color: string }> = {
  saju: { name: "사주팔자", hanja: "四柱八字", color: "#f38ba8" },
  ziwei: { name: "자미두수", hanja: "紫微斗數", color: "#cba6f7" },
  qimen: { name: "기문둔갑", hanja: "奇門遁甲", color: "#89b4fa" },
  iching: { name: "주역", hanja: "周易", color: "#a6e3a1" },
  horary: { name: "호라리 점성술", hanja: "Horary", color: "#f9e2af" },
  babylonian: { name: "바빌로니아", hanja: "Babylon", color: "#fab387" },
};

const OTHER_SYSTEMS = [
  { key: "saju", icon: "命", desc: "사주팔자" },
  { key: "ziwei", icon: "星", desc: "자미두수" },
  { key: "qimen", icon: "門", desc: "기문둔갑" },
  { key: "iching", icon: "易", desc: "주역" },
  { key: "horary", icon: "☿", desc: "호라리" },
  { key: "babylonian", icon: "𒀭", desc: "바빌로니아" },
];

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

interface Props {
  systemKey: string;
  result: DivinationResult;
  onBack: () => void;
  onReRun: () => void;
  onRunSystem: (key: string) => void;
  loading: boolean;
  loadingSystems: Set<string>;
  results: Record<string, DivinationResult>;
}

export default function SingleSystemView({
  systemKey, result, onBack, onReRun, onRunSystem,
  loading, loadingSystems, results,
}: Props) {
  const meta = SYSTEM_META[systemKey] || { name: systemKey, hanja: "", color: "#b4befe" };
  const others = OTHER_SYSTEMS.filter(s => s.key !== systemKey);

  return (
    <div className="min-h-screen" style={{ background: "#1e1e2e" }}>
      {/* 상단 네비 */}
      <div className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#181825" }}>
        <button onClick={onBack} className="flex items-center gap-2 text-sm transition-all duration-200"
          style={{ color: "#b4befe" }}>
          ← 전체 분석으로
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
          <span className="text-sm font-medium" style={{ color: "#cdd6f4" }}>{meta.name}</span>
          <span className="text-xs" style={{ color: "#6c7086", fontFamily: "Georgia, serif" }}>{meta.hanja}</span>
        </div>
        <button onClick={onReRun} disabled={loading}
          className="text-xs px-3 py-1.5 rounded transition-all duration-200 disabled:opacity-40"
          style={{ color: "#b4befe", border: "1px solid rgba(255,255,255,0.06)" }}>
          {loadingSystems.has(systemKey) ? "분석 중..." : "↻ 재실행"}
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 요약 */}
        <div className="mb-6 pl-4" style={{ borderLeft: `3px solid ${meta.color}` }}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: "#cdd6f4", fontFamily: "ui-monospace, monospace" }}>
            {result.summary}
          </div>
        </div>

        {/* 시스템별 상세 카드 */}
        <div className="mb-8">
          <SystemCard systemKey={systemKey} result={result} />
        </div>

        {/* Elements 전문 */}
        {result.elements.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-medium mb-3" style={{ color: "#6c7086" }}>상세 요소</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.elements.map((el, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: "#262637" }}>
                  <div className="text-xs font-medium mb-1" style={{ color: "#b4befe" }}>{el.label}</div>
                  <div className="text-xs" style={{ color: "#cdd6f4", fontFamily: "ui-monospace, monospace" }}>
                    {el.value}
                  </div>
                  {el.description && (
                    <div className="text-xs mt-1" style={{ color: "#6c7086" }}>{el.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 다른 시스템 CTA */}
        <div className="pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="text-xs mb-4" style={{ color: "#6c7086" }}>다른 시스템도 분석해보세요</div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {others.map(sys => {
              const hasSysResult = !!results[sys.key];
              const sysLoading = loadingSystems.has(sys.key);
              const sysMeta = SYSTEM_META[sys.key];
              return (
                <button key={sys.key}
                  onClick={() => onRunSystem(sys.key)}
                  disabled={loading}
                  className="shrink-0 rounded-lg p-3 text-center transition-all duration-200 disabled:opacity-40 hover:scale-105"
                  style={{
                    background: "#262637",
                    border: hasSysResult ? `1px solid ${sysMeta.color}` : "1px solid rgba(255,255,255,0.06)",
                    minWidth: 100,
                  }}>
                  <div className="text-lg mb-1" style={{ color: sysMeta.color, fontFamily: "Georgia, serif" }}>
                    {sys.icon}
                  </div>
                  <div className="text-[10px]" style={{ color: hasSysResult ? "#a6e3a1" : "#6c7086" }}>
                    {sysLoading ? "분석 중..." : hasSysResult ? `${sys.desc} ✓` : sys.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
