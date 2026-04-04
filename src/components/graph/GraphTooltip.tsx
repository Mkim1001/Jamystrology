"use client";

const SYSTEM_LABELS: Record<string, string> = {
  saju: "사주팔자", ziwei: "자미두수", qimen: "기문둔갑",
  iching: "주역", horary: "호라리", babylonian: "바빌로니아",
  synthesis: "통합분석",
};

export interface TooltipData {
  x: number;
  y: number;
  id: string;
  label: string;
  system: string;
  category: string;
  color: string;
  connectedCount: number;
}

interface Props {
  data: TooltipData | null;
}

export default function GraphTooltip({ data }: Props) {
  if (!data) return null;

  return (
    <div className="absolute pointer-events-none transition-opacity duration-100" style={{
      left: data.x + 16,
      top: data.y - 8,
      zIndex: 20,
      opacity: 1,
    }}>
      <div className="rounded-lg px-3 py-2 min-w-[120px]" style={{
        background: "rgba(30,30,46,0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
      }}>
        {/* 노드 이름 */}
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: data.color }} />
          <span className="text-xs font-medium" style={{ color: "#cdd6f4" }}>
            {data.label}
          </span>
        </div>

        {/* 시스템 & 카테고리 */}
        <div className="text-[10px] space-y-0.5" style={{ color: "#6c7086" }}>
          <div>{SYSTEM_LABELS[data.system] || data.system}</div>
          <div className="flex items-center justify-between gap-3">
            <span>{data.category}</span>
            <span>{data.connectedCount} 연결</span>
          </div>
        </div>
      </div>
    </div>
  );
}
