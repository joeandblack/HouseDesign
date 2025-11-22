
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { HouseLayout, Room } from '../types';

interface BlueprintCanvasProps {
  layout: HouseLayout;
}

export const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({ layout }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Margins for axes and labels
  const margin = { top: 50, right: 50, bottom: 100, left: 70 };
  const FLOOR_GAP_PX = 80; // Gap between floors in pixels

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); 

    const { width: landW, height: landH } = layout.land;
    const floors = layout.floors;
    const numFloors = floors.length;

    const containerWidth = containerRef.current.clientWidth;
    const PADDING_FT = 5;
    const xScale = d3.scaleLinear()
      .domain([-PADDING_FT, landW + PADDING_FT])
      .range([margin.left, containerWidth - margin.right]);

    const pixelsPerFoot = (xScale(landW) - xScale(0)) / landW;
    const getY = (ft: number) => ft * pixelsPerFoot;

    // Calculate total height required
    // Height = margins + (height of all floors) + (gaps between floors)
    const svgContentHeight = margin.top + margin.bottom + (getY(landH) * numFloors) + (FLOOR_GAP_PX * (numFloors - 1));

    svg.attr("height", Math.max(700, svgContentHeight));

    // Grid Definition
    const defs = svg.append("defs");
    const pattern = defs.append("pattern")
      .attr("id", "grid")
      .attr("width", xScale(10) - xScale(0))
      .attr("height", getY(10))
      .attr("patternUnits", "userSpaceOnUse");
    pattern.append("path")
      .attr("d", `M ${xScale(10) - xScale(0)} 0 L 0 0 0 ${getY(10)}`)
      .attr("fill", "none")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1);

    // Render each floor
    floors.forEach((floor, index) => {
      const floorOffsetY = margin.top + index * (getY(landH) + FLOOR_GAP_PX);
      const floorG = svg.append("g")
        .attr("transform", `translate(0, ${floorOffsetY})`);

      // Label
      floorG.append("text")
        .attr("x", margin.left)
        .attr("y", -25)
        .attr("font-weight", "bold")
        .attr("font-size", "18px")
        .attr("fill", "#1e293b")
        .text(floor.name);

      // Land Boundary
      const landWidthPx = xScale(landW) - xScale(0);
      const landHeightPx = getY(landH);

      floorG.append("rect")
        .attr("x", xScale(0))
        .attr("y", 0)
        .attr("width", landWidthPx)
        .attr("height", landHeightPx)
        .attr("fill", "url(#grid)") 
        .attr("stroke", "#cbd5e1")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

      // Rooms Group
      const roomGroup = floorG.append("g").attr("class", "rooms");

      // 1. Draw all Fills
      floor.rooms.forEach((room) => {
        const x = xScale(room.x);
        const y = getY(room.y);
        const w = xScale(room.x + room.width) - xScale(room.x);
        const h = getY(room.height);
        
        roomGroup.append("rect")
          .attr("x", x)
          .attr("y", y)
          .attr("width", w)
          .attr("height", h)
          .attr("fill", room.color || '#cbd5e1')
          .attr("stroke", "none");
      });

      // 2. Draw Outlines (Borders)
      floor.rooms.forEach((room) => {
        const x = xScale(room.x);
        const y = getY(room.y);
        const w = xScale(room.x + room.width) - xScale(room.x);
        const h = getY(room.height);

        roomGroup.append("rect")
          .attr("x", x)
          .attr("y", y)
          .attr("width", w)
          .attr("height", h)
          .attr("fill", "none")
          .attr("stroke", "#334155")
          .attr("stroke-width", 2);
      });

      // 3. "Merge" visual pass: Draw over shared borders of same-name rooms
      const drawnPairs = new Set<string>();
      floor.rooms.forEach((r1) => {
        floor.rooms.forEach((r2) => {
          if (r1.id === r2.id || r1.name !== r2.name) return;
          
          const pairId = [r1.id, r2.id].sort().join('-');
          if (drawnPairs.has(pairId)) return;
          drawnPairs.add(pairId);

          // Check adjacency
          const r1Right = r1.x + r1.width;
          const r1Left = r1.x;
          const r1Top = r1.y;
          const r1Bottom = r1.y + r1.height;

          const r2Left = r2.x;
          const r2Right = r2.x + r2.width;
          const r2Top = r2.y;
          const r2Bottom = r2.y + r2.height;

          const overlapYStart = Math.max(r1Top, r2Top);
          const overlapYEnd = Math.min(r1Bottom, r2Bottom);
          
          const overlapXStart = Math.max(r1Left, r2Left);
          const overlapXEnd = Math.min(r1Right, r2Right);

          // Shared Vertical Edge
          if (Math.abs(r1Right - r2Left) < 0.1 && overlapYEnd > overlapYStart) {
             roomGroup.append("line")
               .attr("x1", xScale(r1Right))
               .attr("y1", getY(overlapYStart) + 1) 
               .attr("x2", xScale(r1Right))
               .attr("y2", getY(overlapYEnd) - 1)
               .attr("stroke", r1.color || '#cbd5e1')
               .attr("stroke-width", 3);
          }
          // Shared Horizontal Edge
          if (Math.abs(r1Bottom - r2Top) < 0.1 && overlapXEnd > overlapXStart) {
             roomGroup.append("line")
               .attr("x1", xScale(overlapXStart) + 1)
               .attr("y1", getY(r1Bottom))
               .attr("x2", xScale(overlapXEnd) - 1)
               .attr("y2", getY(r1Bottom))
               .attr("stroke", r1.color || '#cbd5e1')
               .attr("stroke-width", 3);
          }
        });
      });

      // 4. Labels
      const roomPartsByName: {[key: string]: Room[]} = {};
      floor.rooms.forEach(r => {
        if (!roomPartsByName[r.name]) roomPartsByName[r.name] = [];
        roomPartsByName[r.name].push(r);
      });

      Object.entries(roomPartsByName).forEach(([name, parts]) => {
        // Find largest part
        const mainPart = parts.reduce((prev, current) => 
          (prev.width * prev.height > current.width * current.height) ? prev : current
        );

        // Calculate total area
        const totalArea = parts.reduce((sum, r) => sum + (r.width * r.height), 0);

        // Render label on main part
        const x = xScale(mainPart.x);
        const y = getY(mainPart.y);
        const w = xScale(mainPart.x + mainPart.width) - xScale(mainPart.x);
        const h = getY(mainPart.height);

        // Only show labels if room is big enough
        if (w > 20 && h > 15) {
            const textGroup = roomGroup.append("text")
              .attr("x", x + w / 2)
              .attr("y", y + h / 2)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .style("pointer-events", "none");

            textGroup.append("tspan")
              .attr("x", x + w / 2)
              .attr("dy", "-0.4em")
              .attr("font-size", "10px")
              .attr("font-weight", "600")
              .attr("fill", "#1e293b")
              .text(name);

            textGroup.append("tspan")
              .attr("x", x + w / 2)
              .attr("dy", "1.2em")
              .attr("font-size", "8px")
              .attr("fill", "#475569")
              .text(`${Math.round(totalArea)} sqft`);
        }
        
        // Dimensions on sides
        const fontSize = "9px";
        const textColor = "#64748b";
        if (w > 20) {
            roomGroup.append("text")
              .attr("x", x + w / 2)
              .attr("y", y - 4)
              .attr("text-anchor", "middle")
              .attr("font-size", fontSize)
              .attr("fill", textColor)
              .text(`${mainPart.width}'`);
        }
        if (h > 20) {
            roomGroup.append("text")
              .attr("x", x - 4)
              .attr("y", y + h / 2)
              .attr("text-anchor", "end")
              .attr("dominant-baseline", "middle")
              .attr("font-size", fontSize)
              .attr("fill", textColor)
              .text(`${mainPart.height}'`);
        }
      });

      // Axes
      const yAxisScale = d3.scaleLinear().domain([0, landH]).range([0, getY(landH)]);
      floorG.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yAxisScale).ticks(5).tickFormat((d) => `${d}'`))
        .attr("color", "#94a3b8")
        .style("opacity", 0.5);
    });

    // Top Axis
    svg.append("g")
      .attr("transform", `translate(0, ${margin.top})`)
      .call(d3.axisTop(xScale).ticks(10).tickFormat((d) => `${d}'`))
      .attr("color", "#64748b");

    // Total Areas Calculation
    let totalMain = 0;
    let totalADU = 0;

    floors.forEach(f => {
        f.rooms.forEach(r => {
            const area = r.width * r.height;
            if (r.name.startsWith("ADU") || r.id.startsWith("adu_")) {
                totalADU += area;
            } else {
                totalMain += area;
            }
        });
    });

    // Position the legend below the last floor
    const totalFloorsHeight = numFloors * getY(landH) + (numFloors - 1) * FLOOR_GAP_PX;
    const legendY = margin.top + totalFloorsHeight + 30;

    const legendG = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${legendY})`);

    legendG.append("rect")
        .attr("x", -10)
        .attr("y", -15)
        .attr("width", 220)
        .attr("height", 60)
        .attr("fill", "white")
        .attr("stroke", "#e2e8f0")
        .attr("rx", 5);

    legendG.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-weight", "bold")
        .attr("font-size", "12px")
        .attr("fill", "#334155")
        .text("Total Area Calculation:");

    legendG.append("text")
        .attr("x", 0)
        .attr("y", 18)
        .attr("font-size", "11px")
        .attr("fill", "#475569")
        .text(`Main House (+Garage): ${Math.round(totalMain)} sqft`);

    legendG.append("text")
        .attr("x", 0)
        .attr("y", 34)
        .attr("font-size", "11px")
        .attr("fill", "#475569")
        .text(`ADU Unit: ${Math.round(totalADU)} sqft`);


    // Compass
    const compassG = svg.append("g")
      .attr("transform", `translate(${containerWidth - 50}, ${40})`);
    compassG.append("circle").attr("r", 18).attr("fill", "white").attr("stroke", "#cbd5e1");
    compassG.append("text").attr("x", -6).attr("y", 5).text("N").attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "#334155");
    compassG.append("text").attr("x", 0).attr("y", -8).text("E").attr("font-size", "10px").attr("font-weight", "bold").attr("fill", "#64748b");

  }, [layout]);

  return (
    <div ref={containerRef} className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
      <svg ref={svgRef} className="w-full block"></svg>
      <div className="fixed bottom-8 right-8 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-500 shadow-lg pointer-events-none z-10">
        Land: {layout.land.width}' x {layout.land.height}'
      </div>
    </div>
  );
};
