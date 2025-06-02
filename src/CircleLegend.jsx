import { max as d3max, min as d3min } from "d3-array";
import { select } from "d3-selection";
import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const LegendWrapper = styled.div`
  display: flex;
  align-items: center;
  font-family: 'Bennett Text', Georgia, serif;
  gap: .25rem;
`;

const LegendText = styled.div`
  font-size: 12px;
  color: #2a4b5c;
  max-width: 109px;
  text-align:left;
`;

const Svg = styled.svg`
  overflow: visible;
`;

export default function CircleLegend({ data, sizeScale }) {
  const ref = useRef();

  useEffect(() => {
    const svg = select(ref.current);
    svg.selectAll("*").remove();

    const allCounts = data.flatMap(d => d.categories.map(c => c.count));
    const min = d3min(allCounts) + 1;
    const max = d3max(allCounts);
    const mid = Math.round((min + max) / 2);

    const values = [1, 150, 300];
    const spacing = 2;
    const circleX = 50;
    const labelX = circleX;
    const lastY = 80;

    const circles = values
      .slice()
      .sort((a, b) => sizeScale(b) - sizeScale(a));

    circles.forEach((val, i) => {
      const r = sizeScale(val) / 2;
      const cy = lastY - r;

      svg
        .append("circle")
        .attr("cx", circleX)
        .attr("cy", cy)
        .attr("r", r)
        .attr("fill", "#abc2d1")
        .attr("fill-opacity", 0.4)
        .attr("stroke", "#abc2d1");

      svg
        .append("text")
        .attr("x", labelX)
        .attr("y", cy - (3 - i) * 12)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(val)
        .style("font-size", "12px")
        .style("fill", "#2a4b5c")
        .style("font-weight", "600");
    });
  }, [sizeScale]);

  return (
    <LegendWrapper>
      <LegendText>
        <div style={{ fontWeight: 600, fontSize: "12px" }}>TARGETS</div>
        <div style={{ fontSize: "12px", color: "#444" }}>
          The larger the circle, the more targets.
        </div>
      </LegendText>
      <Svg ref={ref} width={100} height={100} />
    </LegendWrapper>
  );
}
