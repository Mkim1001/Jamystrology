"use client";

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
}

export default function Sidebar({
  activeSystem, activeView, userName, birthDate,
  onSelectSystem, onChangeView, onNewAnalysis, results,
}: Props) {
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
        {SYSTEM_TREE.map(group => (
          <div key={group.group} className="mb-2">
            <div className="px-4 py-1 text-xs font-medium" style={{ color: "#6c7086" }}>
              ▾ {group.group}
            </div>
            {group.items.map(item => {
              const isActive = activeSystem === item.key;
              const hasResult = results[item.key.split("-")[0]];
              return (
                <button key={item.key} onClick={() => onSelectSystem(item.key)}
                  className="w-full flex items-center gap-2 px-4 py-1.5 text-sm transition-all duration-200 text-left"
                  style={{
                    background: isActive ? "#363650" : "transparent",
                    color: isActive ? "#cdd6f4" : "#6c7086",
                    borderLeft: isActive ? `2px solid ${item.color}` : "2px solid transparent",
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="truncate">{item.name}</span>
                  {hasResult && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: "#363650", color: "#6c7086" }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
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
    </div>
  );
}
