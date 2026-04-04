"use client";

import { useState } from "react";

const SYSTEM_TREE = [
  {
    group: "동양 점술",
    items: [
      { key: "saju", name: "사주팔자", color: "#f38ba8" },
      { key: "ziwei", name: "자미두수", color: "#cba6f7" },
      { key: "qimen", name: "기문둔갑", color: "#89b4fa" },
      { key: "iching", name: "주역", color: "#a6e3a1" },
    ],
  },
  {
    group: "서양 점술",
    items: [
      { key: "horary", name: "호라리 점성술", color: "#f9e2af" },
      { key: "babylonian", name: "바빌로니아", color: "#fab387" },
    ],
  },
  {
    group: "통합 분석",
    items: [
      { key: "synthesis-elements", name: "오행 프로파일", color: "#b4befe" },
      { key: "synthesis-timeline", name: "시간축 분석", color: "#b4befe" },
      { key: "synthesis-domains", name: "12영역 분석", color: "#b4befe" },
      { key: "synthesis-resonance", name: "공명/충돌 맵", color: "#b4befe" },
    ],
  },
];

const ALL_SYSTEM_KEYS = ["saju", "ziwei", "qimen", "iching", "horary", "babylonian"];

const VIEW_TABS = [
  { key: "dashboard", icon: "▦", label: "대시보드" },
  { key: "graph", icon: "◎", label: "그래프" },
  { key: "synthesis", icon: "◈", label: "통합분석" },
] as const;

interface Props {
  activeSystem: string | null;
  activeView: string;
  userName: string;
  birthDate: string;
  onSelectSystem: (key: string) => void;
  onChangeView: (view: string) => void;
  onNewAnalysis: () => void;
  results: Record<string, any>;
  onRunAdditional: (keys: string[]) => void;
  onReRunAll: () => void;
  loading: boolean;
  loadingSystems: Set<string>;
}

export default function Sidebar({
  activeSystem, activeView, userName, birthDate,
  onSelectSystem, onChangeView, onNewAnalysis, results,
  onRunAdditional, onReRunAll, loading, loadingSystems,
}: Props) {
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [confirmRun, setConfirmRun] = useState<string | null>(null);

  const unrunSystems = ALL_SYSTEM_KEYS.filter(k => !results[k]);
  const completedCount = ALL_SYSTEM_KEYS.filter(k => results[k]).length;
  const hasSynthesis = completedCount >= 2;

  const handleSystemClick = (key: string) => {
    // For synthesis items, just select
    if (key.startsWith("synthesis-")) {
      onSelectSystem(key);
      return;
    }
    // If system has results, select it
    if (results[key]) {
      onSelectSystem(key);
      return;
    }
    // If system not run, confirm dialog
    setConfirmRun(key);
  };

  const handleConfirmRun = (key: string) => {
    setConfirmRun(null);
    onRunAdditional([key]);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "#181825", width: 240 }}>
      {/* 사용자 정보 */}
      <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="text-sm font-medium" style={{ color: "#cdd6f4" }}>{userName}</div>
        <div className="text-xs mt-0.5" style={{ color: "#6c7086" }}>{birthDate}</div>
        <button onClick={onNewAnalysis}
          className="mt-2 text-xs px-3 py-1 rounded transition-all duration-200"
          style={{ color: "#b4befe", border: "1px solid rgba(255,255,255,0.06)" }}>
          + 새 분석
        </button>
      </div>

      {/* 시스템 트리 */}
      <div className="flex-1 overflow-y-auto py-2">
        {SYSTEM_TREE.map(group => {
          const isSynthesisGroup = group.group === "통합 분석";
          return (
            <div key={group.group} className="mb-2">
              <div className="px-4 py-1 text-xs font-medium" style={{ color: "#6c7086" }}>
                ▾ {group.group}
              </div>
              {group.items.map(item => {
                const isActive = activeSystem === item.key;
                const isSynthesisItem = item.key.startsWith("synthesis-");
                const hasResult = isSynthesisItem ? hasSynthesis : !!results[item.key];
                const isLoading = loadingSystems.has(item.key);
                const isDisabled = isSynthesisItem && !hasSynthesis;

                return (
                  <button key={item.key}
                    onClick={() => !isDisabled && handleSystemClick(item.key)}
                    className="w-full flex items-center gap-2 px-4 py-1.5 text-sm transition-all duration-200 text-left"
                    style={{
                      background: isActive ? "#363650" : "transparent",
                      color: isActive ? "#cdd6f4" : hasResult ? "#a6adc8" : "#6c7086",
                      borderLeft: isActive ? `2px solid ${item.color}` : "2px solid transparent",
                      opacity: isDisabled ? 0.3 : hasResult ? 1 : 0.5,
                    }}>
                    {/* 상태 점 */}
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                      background: isLoading ? "#f9e2af" : hasResult ? item.color : "#6c7086",
                      animation: isLoading ? "pulse 1.5s ease-in-out infinite" : undefined,
                    }} />
                    <span className="truncate">{item.name}</span>
                    {/* 상태 표시 */}
                    <span className="ml-auto text-[10px] shrink-0">
                      {isLoading ? (
                        <span style={{ color: "#f9e2af" }}>⟳</span>
                      ) : hasResult ? (
                        <span style={{ color: "#a6e3a1" }}>✓</span>
                      ) : (
                        <span style={{ color: "#6c7086" }}>—</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* 확인 다이얼로그 */}
        {confirmRun && (
          <div className="mx-3 my-2 p-3 rounded-lg" style={{ background: "#262637", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-xs mb-2" style={{ color: "#cdd6f4" }}>
              이 시스템을 분석하시겠습니까?
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleConfirmRun(confirmRun)}
                className="flex-1 py-1 rounded text-xs transition-all duration-200"
                style={{ background: "#b4befe", color: "#1e1e2e" }}>
                분석
              </button>
              <button onClick={() => setConfirmRun(null)}
                className="flex-1 py-1 rounded text-xs transition-all duration-200"
                style={{ background: "#363650", color: "#6c7086" }}>
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 추가 분석 / 전체 재실행 */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {/* 추가 분석 */}
        {unrunSystems.length > 0 && (
          <div className="relative">
            <button onClick={() => setShowAddDropdown(!showAddDropdown)}
              disabled={loading}
              className="w-full py-1.5 rounded text-xs transition-all duration-200 disabled:opacity-40"
              style={{ color: "#b4befe", border: "1px solid rgba(255,255,255,0.06)" }}>
              + 추가 분석
            </button>
            {showAddDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg overflow-hidden"
                style={{ background: "#262637", border: "1px solid rgba(255,255,255,0.06)" }}>
                {unrunSystems.map(key => {
                  const item = SYSTEM_TREE.flatMap(g => g.items).find(i => i.key === key);
                  if (!item) return null;
                  return (
                    <button key={key}
                      onClick={() => { setShowAddDropdown(false); onRunAdditional([key]); }}
                      className="w-full text-left px-3 py-2 text-xs transition-all duration-200 flex items-center gap-2"
                      style={{ color: "#a6adc8" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 전체 재실행 */}
        <button onClick={onReRunAll} disabled={loading}
          className="w-full py-1.5 rounded text-xs transition-all duration-200 disabled:opacity-40"
          style={{ color: "#6c7086", border: "1px solid rgba(255,255,255,0.06)" }}>
          ↻ 전체 재실행
        </button>
      </div>

      {/* 뷰 전환 */}
      <div className="p-3 border-t flex gap-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {VIEW_TABS.map(tab => (
          <button key={tab.key} onClick={() => onChangeView(tab.key)}
            className="flex-1 py-1.5 text-center rounded text-xs transition-all duration-200"
            style={{
              background: activeView === tab.key ? "#363650" : "transparent",
              color: activeView === tab.key ? "#b4befe" : "#6c7086",
            }}>
            <div>{tab.icon}</div>
            <div className="mt-0.5">{tab.label}</div>
          </button>
        ))}
      </div>

      {/* pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
