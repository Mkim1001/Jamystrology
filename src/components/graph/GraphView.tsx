"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import type { DivinationNode, DivinationEdge, DivinationResult } from "@/types/divination";

const SYSTEM_COLORS: Record<string, string> = {
  saju: "#f38ba8", ziwei: "#cba6f7", qimen: "#89b4fa",
  iching: "#a6e3a1", horary: "#f9e2af", babylonian: "#fab387",
  synthesis: "#b4befe",
};

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
  onSelectNode: (systemKey: string) => void;
}

export default function GraphView({ results, onSelectNode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [enabledSystems, setEnabledSystems] = useState<Set<string>>(new Set(Object.keys(SYSTEM_COLORS)));

  const buildGraphData = useCallback(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeIds = new Set<string>();

    for (const [sysKey, result] of Object.entries(results)) {
      if (!result?.summary || !enabledSystems.has(sysKey)) continue;
      const color = SYSTEM_COLORS[sysKey] || "#6c7086";

      for (const node of result.nodes.slice(0, 8)) {
        const id = `${sysKey}-${node.id}`;
        if (nodeIds.has(id)) continue;
        nodeIds.add(id);
        const isRoot = node.category === "pillar" || node.category === "palace" || node.category === "hexagram";
        nodes.push({
          id, label: node.label.substring(0, 20),
          category: node.category, system: sysKey,
          radius: isRoot ? 12 : 8, color,
        });
      }

      for (const edge of result.edges.slice(0, 12)) {
        const sourceId = `${sysKey}-${edge.source}`;
        const targetId = `${sysKey}-${edge.target}`;
        if (nodeIds.has(sourceId) && nodeIds.has(targetId)) {
          edges.push({
            source: sourceId, target: targetId,
            relation: edge.relation, edgeType: "internal",
          });
        }
      }
    }

    return { nodes, edges };
  }, [results, enabledSystems]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    const { nodes, edges } = buildGraphData();
    if (nodes.length === 0) return;

    const g = svg.append("g");

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 5])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    // Force simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphEdge>(edges).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<GraphNode>().radius(d => d.radius * 2));

    // Edges
    const link = g.append("g").selectAll("line")
      .data(edges).join("line")
      .attr("stroke", "#6c7086").attr("stroke-opacity", 0.15).attr("stroke-width", 1);

    // Nodes
    const node = g.append("g").selectAll<SVGCircleElement, GraphNode>("circle")
      .data(nodes).join("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => d.color)
      .attr("fill-opacity", 0.6)
      .attr("stroke", d => d.color)
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 1)
      .style("cursor", "pointer")
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on("start", (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on("end", (event, d) => { if (!event.active) simulation.alphaTarget(0); })
      );

    // Labels
    const labels = g.append("g").selectAll("text")
      .data(nodes).join("text")
      .text(d => d.label)
      .attr("fill", "#cdd6f4")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .attr("dy", d => d.radius + 14)
      .attr("opacity", 0.6);

    // Hover interaction
    node.on("mouseover", function (event, d) {
      const connected = new Set<string>();
      connected.add(d.id);
      edges.forEach(e => {
        const sId = typeof e.source === "object" ? (e.source as GraphNode).id : e.source;
        const tId = typeof e.target === "object" ? (e.target as GraphNode).id : e.target;
        if (sId === d.id) connected.add(tId);
        if (tId === d.id) connected.add(sId);
      });

      node.attr("fill-opacity", n => connected.has(n.id) ? 0.9 : 0.05);
      link.attr("stroke-opacity", e => {
        const sId = typeof e.source === "object" ? (e.source as GraphNode).id : e.source;
        const tId = typeof e.target === "object" ? (e.target as GraphNode).id : e.target;
        return sId === d.id || tId === d.id ? 0.8 : 0.02;
      });
      labels.attr("opacity", n => connected.has(n.id) ? 1 : 0.05);
      d3.select(this).attr("r", d.radius * 1.3).attr("stroke-width", 3);
      setHoveredNode(d.id);
    })
    .on("mouseout", function (event, d) {
      node.attr("fill-opacity", 0.6);
      link.attr("stroke-opacity", 0.15);
      labels.attr("opacity", 0.6);
      d3.select(this).attr("r", d.radius).attr("stroke-width", 1.5);
      setHoveredNode(null);
    })
    .on("click", (event, d) => { onSelectNode(d.system); });

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);
      node.attr("cx", d => d.x!).attr("cy", d => d.y!);
      labels.attr("x", d => d.x!).attr("y", d => d.y!);
    });

    return () => { simulation.stop(); };
  }, [buildGraphData, onSelectNode]);

  const toggleSystem = (sys: string) => {
    setEnabledSystems(prev => {
      const next = new Set(prev);
      if (next.has(sys)) next.delete(sys); else next.add(sys);
      return next;
    });
  };

  return (
    <div className="relative w-full h-full" style={{ background: "#1e1e2e" }}>
      <svg ref={svgRef} className="w-full h-full" />

      {/* 컨트롤 패널 */}
      <div className="absolute top-4 left-4 rounded-lg p-3 space-y-1"
        style={{ background: "rgba(24,24,37,0.8)", backdropFilter: "blur(8px)" }}>
        <div className="text-xs mb-2" style={{ color: "#6c7086" }}>시스템 필터</div>
        {Object.entries(SYSTEM_COLORS).map(([key, color]) => (
          <button key={key} onClick={() => toggleSystem(key)}
            className="flex items-center gap-2 w-full text-left text-xs py-0.5 transition-all duration-200"
            style={{
              color: enabledSystems.has(key) ? "#cdd6f4" : "#6c7086",
              opacity: enabledSystems.has(key) ? 1 : 0.3,
            }}>
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            {key}
          </button>
        ))}
      </div>

      {/* 호버 툴팁 */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 rounded px-3 py-2 text-xs"
          style={{ background: "#262637", border: "1px solid rgba(255,255,255,0.1)", color: "#cdd6f4" }}>
          {hoveredNode}
        </div>
      )}
    </div>
  );
}
