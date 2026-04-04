"use client";

const SYSTEM_META: { key: string; label: string; color: string }[] = [
  { key: "saju", label: "사주팔자", color: "#f38ba8" },
  { key: "ziwei", label: "자미두수", color: "#cba6f7" },
  { key: "qimen", label: "기문둔갑", color: "#89b4fa" },
  { key: "iching", label: "주역", color: "#a6e3a1" },
  { key: "horary", label: "호라리", color: "#f9e2af" },
  { key: "babylonian", label: "바빌로니아", color: "#fab387" },
  { key: "synthesis", label: "통합", color: "#b4befe" },
];

interface Props {
  enabledSystems: Set<string>;
  onToggleSystem: (key: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  nodeCount: number;
  edgeCount: number;
}

export default function GraphControls({
  enabledSystems, onToggleSystem,
  onZoomIn, onZoomOut, onResetView,
  nodeCount, edgeCount,
}: Props) {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 select-none" style={{ zIndex: 10 }}>
      {/* 시스템 필터 */}
      <div className="rounded-lg p-3" style={{
        background: "rgba(24,24,37,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div className="text-[10px] font-medium mb-2 tracking-wide" style={{ color: "#6c7086" }}>
          필터
        </div>
        <div className="space-y-0.5">
          {SYSTEM_META.map(sys => {
            const active = enabledSystems.has(sys.key);
            return (
              <button key={sys.key} onClick={() => onToggleSystem(sys.key)}
                className="flex items-center gap-2 w-full text-left text-xs py-1 px-1 rounded transition-all duration-150"
                style={{
                  color: active ? "#cdd6f4" : "#45475a",
                  background: active ? "rgba(255,255,255,0.03)" : "transparent",
                }}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0 transition-opacity duration-150" style={{
                  background: sys.color,
                  opacity: active ? 1 : 0.2,
                }} />
                <span className="truncate">{sys.label}</span>
                {active && (
                  <span className="ml-auto text-[9px]" style={{ color: "#6c7086" }}>✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 통계 */}
        <div className="mt-2 pt-2 flex gap-3 text-[10px]" style={{
          borderTop: "1px solid rgba(255,255,255,0.06)", color: "#6c7086",
        }}>
          <span>{nodeCount} 노드</span>
          <span>{edgeCount} 엣지</span>
        </div>
      </div>

      {/* 줌 컨트롤 */}
      <div className="rounded-lg overflow-hidden" style={{
        background: "rgba(24,24,37,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {[
          { label: "+", action: onZoomIn },
          { label: "−", action: onZoomOut },
          { label: "⌂", action: onResetView },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action}
            className="block w-full px-3 py-2 text-sm text-center transition-colors duration-150"
            style={{
              color: "#cdd6f4",
              borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
