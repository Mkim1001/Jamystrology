"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import type { DivinationResult } from "@/types/divination";
import GraphControls from "./GraphControls";
import GraphTooltip, { type TooltipData } from "./GraphTooltip";

/* ─── constants ─── */

const SYSTEM_COLORS: Record<string, string> = {
  saju: "#f38ba8", ziwei: "#cba6f7", qimen: "#89b4fa",
  iching: "#a6e3a1", horary: "#f9e2af", babylonian: "#fab387",
  synthesis: "#b4befe",
};

const CATEGORY_RADIUS: Record<string, number> = {
  core: 16, pillar: 16, palace: 16, hexagram: 16,
  major: 12, star: 12, planet: 12, gate: 12,
  minor: 8, element: 8, branch: 8, stem: 8, aspect: 8,
};
const DEFAULT_RADIUS = 6;

const EDGE_STYLES: Record<string, { dash: string; color: string; width: number }> = {
  "상생": { dash: "", color: "#a6e3a1", width: 1.2 },
  "상극": { dash: "4 2", color: "#f38ba8", width: 1.2 },
  "합": { dash: "", color: "#89b4fa", width: 1.5 },
  "충": { dash: "3 3", color: "#f38ba8", width: 1.5 },
  "형": { dash: "2 2", color: "#fab387", width: 1 },
  "해": { dash: "6 2", color: "#f9e2af", width: 1 },
  "파": { dash: "1 2", color: "#f38ba8", width: 1 },
  cross: { dash: "6 3", color: "#b4befe", width: 1.5 },
  resonance: { dash: "", color: "#b4befe", width: 2 },
};
const DEFAULT_EDGE = { dash: "", color: "#585b70", width: 1 };

/* ─── types ─── */

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  category: string;
  system: string;
  radius: number;
  color: string;
}

interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  relation: string;
  edgeType: string;
}

interface Props {
  results: Record<string, DivinationResult>;
  synthesisResult?: DivinationResult | null;
  onNodeClick: (systemKey: string) => void;
}

/* ─── component ─── */

export default function GraphView({ results, synthesisResult, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

  const [enabledSystems, setEnabledSystems] = useState<Set<string>>(
    new Set(Object.keys(SYSTEM_COLORS))
  );
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  /* ─── build graph data ─── */

  const { nodes, edges } = useMemo(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeIds = new Set<string>();

    const addSystem = (sysKey: string, result: DivinationResult) => {
      if (!result?.summary || !enabledSystems.has(sysKey)) return;
      const color = SYSTEM_COLORS[sysKey] || "#6c7086";

      for (const n of result.nodes) {
        const id = `${sysKey}::${n.id}`;
        if (nodeIds.has(id)) continue;
        nodeIds.add(id);
        nodes.push({
          id,
          label: n.label.length > 18 ? n.label.slice(0, 18) + "…" : n.label,
          category: n.category,
          system: sysKey,
          radius: CATEGORY_RADIUS[n.category] || DEFAULT_RADIUS,
          color,
        });
      }

      for (const e of result.edges) {
        const src = `${sysKey}::${e.source}`;
        const tgt = `${sysKey}::${e.target}`;
        if (nodeIds.has(src) && nodeIds.has(tgt)) {
          edges.push({ source: src, target: tgt, relation: e.relation, edgeType: "internal" });
        }
      }
    };

    // 6 systems
    for (const [key, result] of Object.entries(results)) {
      addSystem(key, result);
    }

    // synthesis cross-system edges
    if (synthesisResult && enabledSystems.has("synthesis")) {
      for (const n of (synthesisResult.nodes || [])) {
        const id = `synthesis::${n.id}`;
        if (nodeIds.has(id)) continue;
        nodeIds.add(id);
        nodes.push({
          id,
          label: n.label.length > 18 ? n.label.slice(0, 18) + "…" : n.label,
          category: n.category,
          system: "synthesis",
          radius: CATEGORY_RADIUS[n.category] || DEFAULT_RADIUS,
          color: SYSTEM_COLORS.synthesis,
        });
      }
      for (const e of (synthesisResult.edges || [])) {
        // synthesis edges may reference cross-system nodes
        const src = String(e.source);
        const tgt = String(e.target);

        // Try exact match first, then prefixed
        const findId = (raw: string) => {
          if (nodeIds.has(raw)) return raw;
          const prefixed = `synthesis::${raw}`;
          if (nodeIds.has(prefixed)) return prefixed;
          // search across systems
          for (const sys of Object.keys(SYSTEM_COLORS)) {
            const candidate = `${sys}::${raw}`;
            if (nodeIds.has(candidate)) return candidate;
          }
          return null;
        };

        const srcId = findId(src);
        const tgtId = findId(tgt);
        if (srcId && tgtId) {
          edges.push({ source: srcId, target: tgtId, relation: e.relation, edgeType: "cross" });
        }
      }
    }

    return { nodes, edges };
  }, [results, synthesisResult, enabledSystems]);

  /* ─── D3 rendering ─── */

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const sel = d3.select(svg);
    sel.selectAll("*").remove();

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;

    if (nodes.length === 0) {
      sel.append("text")
        .attr("x", width / 2).attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#6c7086").attr("font-size", 13)
        .text("분석 결과를 입력하면 그래프가 생성됩니다");
      return;
    }

    /* root group (zoom target) */
    const g = sel.append("g");
    gRef.current = g;

    /* zoom */
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 6])
      .on("zoom", (event) => g.attr("transform", event.transform));
    sel.call(zoom);
    zoomRef.current = zoom;

    /* edge glow defs */
    const defs = sel.append("defs");
    const glowFilter = defs.append("filter").attr("id", "glow");
    glowFilter.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "blur");
    glowFilter.append("feMerge").selectAll("feMergeNode")
      .data(["blur", "SourceGraphic"]).join("feMergeNode")
      .attr("in", d => d);

    /* simulation */
    const linkDistance = (e: GraphEdge) => {
      if (e.edgeType === "cross") return 150;
      const src = typeof e.source === "object" ? e.source as GraphNode : null;
      const tgt = typeof e.target === "object" ? e.target as GraphNode : null;
      if (src && tgt) return 80 + (src.radius + tgt.radius);
      return 100;
    };

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphEdge>(edges)
        .id(d => d.id)
        .distance(linkDistance)
        .strength(0.4))
      .force("charge", d3.forceManyBody<GraphNode>()
        .strength(d => -200 - d.radius * 5))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force("collide", d3.forceCollide<GraphNode>()
        .radius(d => d.radius + 4)
        .strength(0.7))
      .force("x", d3.forceX(width / 2).strength(0.02))
      .force("y", d3.forceY(height / 2).strength(0.02))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    simulationRef.current = simulation;

    /* edges */
    const link = g.append("g")
      .attr("class", "edges")
      .selectAll<SVGLineElement, GraphEdge>("line")
      .data(edges)
      .join("line")
      .each(function (d) {
        const style = EDGE_STYLES[d.relation] || (d.edgeType === "cross" ? EDGE_STYLES.cross : DEFAULT_EDGE);
        d3.select(this)
          .attr("stroke", style.color)
          .attr("stroke-width", style.width)
          .attr("stroke-dasharray", style.dash)
          .attr("stroke-opacity", 0.15);
      });

    /* node groups */
    const nodeGroup = g.append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer");

    /* outer glow ring (hidden until hover) */
    nodeGroup.append("circle")
      .attr("class", "glow-ring")
      .attr("r", d => d.radius + 4)
      .attr("fill", "none")
      .attr("stroke", d => d.color)
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0)
      .attr("filter", "url(#glow)");

    /* main circle */
    nodeGroup.append("circle")
      .attr("class", "node-circle")
      .attr("r", d => d.radius)
      .attr("fill", d => d.color)
      .attr("fill-opacity", 0.6)
      .attr("stroke", d => d.color)
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.8);

    /* inner dot for core nodes */
    nodeGroup.filter(d => d.radius >= 12)
      .append("circle")
      .attr("r", 2)
      .attr("fill", "#1e1e2e")
      .attr("fill-opacity", 0.6);

    /* labels */
    const labels = g.append("g")
      .attr("class", "labels")
      .selectAll<SVGTextElement, GraphNode>("text")
      .data(nodes)
      .join("text")
      .text(d => d.label)
      .attr("fill", "#cdd6f4")
      .attr("font-size", d => d.radius >= 12 ? 11 : 9)
      .attr("font-family", "ui-monospace, SFMono-Regular, monospace")
      .attr("text-anchor", "middle")
      .attr("dy", d => d.radius + 14)
      .attr("opacity", 0.5)
      .attr("pointer-events", "none");

    /* connected-set helper */
    const getConnected = (nodeId: string): Set<string> => {
      const set = new Set<string>();
      set.add(nodeId);
      edges.forEach(e => {
        const sId = typeof e.source === "object" ? (e.source as GraphNode).id : String(e.source);
        const tId = typeof e.target === "object" ? (e.target as GraphNode).id : String(e.target);
        if (sId === nodeId) set.add(tId);
        if (tId === nodeId) set.add(sId);
      });
      return set;
    };

    /* drag */
    const drag = d3.drag<SVGGElement, GraphNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGroup.call(drag);

    /* hover interactions (Obsidian style) */
    nodeGroup
      .on("mouseover", function (_event, d) {
        const connected = getConnected(d.id);

        // Nodes
        nodeGroup.select(".node-circle")
          .transition().duration(150)
          .attr("fill-opacity", (n: any) => connected.has(n.id) ? 1.0 : 0.05)
          .attr("stroke-opacity", (n: any) => connected.has(n.id) ? 1.0 : 0.05);

        // Glow ring on hovered
        d3.select(this).select(".glow-ring")
          .transition().duration(150)
          .attr("stroke-opacity", 0.6);

        // Enlarge hovered
        d3.select(this).select(".node-circle")
          .transition().duration(150)
          .attr("r", d.radius * 1.25);

        // Edges
        link.transition().duration(150)
          .attr("stroke-opacity", (e: any) => {
            const sId = typeof e.source === "object" ? e.source.id : String(e.source);
            const tId = typeof e.target === "object" ? e.target.id : String(e.target);
            return (sId === d.id || tId === d.id) ? 0.8 : 0.02;
          })
          .attr("stroke-width", (e: any) => {
            const sId = typeof e.source === "object" ? e.source.id : String(e.source);
            const tId = typeof e.target === "object" ? e.target.id : String(e.target);
            const style = EDGE_STYLES[e.relation] || DEFAULT_EDGE;
            return (sId === d.id || tId === d.id) ? style.width * 2 : style.width;
          });

        // Labels
        labels.transition().duration(150)
          .attr("opacity", (n: any) => connected.has(n.id) ? 1.0 : 0.03);

        // Inner dots
        nodeGroup.select("circle:nth-child(3)")
          .transition().duration(150)
          .attr("fill-opacity", (n: any) => connected.has(n.id) ? 0.6 : 0.02);

        // Tooltip
        const svgRect = svg.getBoundingClientRect();
        setTooltip({
          x: (d.x || 0) + svgRect.left,
          y: (d.y || 0) + svgRect.top,
          id: d.id, label: d.label,
          system: d.system, category: d.category,
          color: d.color,
          connectedCount: connected.size - 1,
        });
      })
      .on("mousemove", function (_event, d) {
        // Update tooltip position with current transform
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        setTooltip(prev => prev ? {
          ...prev,
          x: _event.clientX - rect.left,
          y: _event.clientY - rect.top,
        } : null);
      })
      .on("mouseout", function () {
        nodeGroup.select(".node-circle")
          .transition().duration(200)
          .attr("fill-opacity", 0.6)
          .attr("stroke-opacity", 0.8);

        nodeGroup.select(".glow-ring")
          .transition().duration(200)
          .attr("stroke-opacity", 0);

        d3.select(this).select(".node-circle")
          .transition().duration(200)
          .attr("r", (d: any) => d.radius);

        link.transition().duration(200)
          .attr("stroke-opacity", 0.15)
          .attr("stroke-width", (e: any) => {
            const style = EDGE_STYLES[e.relation] || DEFAULT_EDGE;
            return style.width;
          });

        labels.transition().duration(200)
          .attr("opacity", 0.5);

        nodeGroup.select("circle:nth-child(3)")
          .transition().duration(200)
          .attr("fill-opacity", 0.6);

        setTooltip(null);
      })
      .on("click", (_event, d) => {
        _event.stopPropagation();
        onNodeClick(d.system);
      });

    /* tick */
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);

      nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);

      labels
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

    /* initial fit-to-view after settling */
    simulation.on("end", () => {
      if (nodes.length < 2) return;
      const xs = nodes.map(n => n.x || 0);
      const ys = nodes.map(n => n.y || 0);
      const x0 = Math.min(...xs) - 40;
      const y0 = Math.min(...ys) - 40;
      const x1 = Math.max(...xs) + 40;
      const y1 = Math.max(...ys) + 40;
      const bw = x1 - x0;
      const bh = y1 - y0;
      const scale = Math.min(width / bw, height / bh, 1.5) * 0.85;
      const tx = (width - bw * scale) / 2 - x0 * scale;
      const ty = (height - bh * scale) / 2 - y0 * scale;
      sel.transition().duration(600)
        .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
    });

    return () => { simulation.stop(); };
  }, [nodes, edges, onNodeClick]);

  /* ─── control callbacks ─── */

  const toggleSystem = useCallback((key: string) => {
    setEnabledSystems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300)
      .call(zoomRef.current.scaleBy, 1.4);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300)
      .call(zoomRef.current.scaleBy, 0.7);
  }, []);

  const handleResetView = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    d3.select(svgRef.current).transition().duration(500)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(1).translate(-width / 2, -height / 2));
  }, []);

  /* ─── render ─── */

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" style={{ background: "#1e1e2e" }}>
      {/* grid pattern background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, #cdd6f4 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      <svg ref={svgRef} className="absolute inset-0 w-full h-full" />

      <GraphControls
        enabledSystems={enabledSystems}
        onToggleSystem={toggleSystem}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />

      <GraphTooltip data={tooltip} />

      {/* legend: edge types */}
      <div className="absolute bottom-4 right-4 rounded-lg px-3 py-2" style={{
        background: "rgba(24,24,37,0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div className="text-[9px] mb-1.5 tracking-wide" style={{ color: "#6c7086" }}>엣지 유형</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            { label: "상생", color: "#a6e3a1", dash: false },
            { label: "상극", color: "#f38ba8", dash: true },
            { label: "합", color: "#89b4fa", dash: false },
            { label: "충", color: "#f38ba8", dash: true },
            { label: "교차", color: "#b4befe", dash: true },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <svg width="16" height="2">
                <line x1="0" y1="1" x2="16" y2="1"
                  stroke={item.color} strokeWidth="1.5"
                  strokeDasharray={item.dash ? "3 2" : ""} />
              </svg>
              <span className="text-[9px]" style={{ color: "#6c7086" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
