import React, { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { scalePoint, scaleLinear } from 'd3-scale';
import { max, sort } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { line, area } from 'd3-shape';
import { transition } from 'd3-transition';
import { easeCubicInOut } from 'd3-ease';
import styled from 'styled-components';

const Title = styled.div`
color: #000;
text-align: center;
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: normal;
margin: 10px;
`;

const ChartContainer = styled.div`
  width: ${(props) => props.$width}px;
  color: #333;
  font-family: 'Bennett Text', Georgia, serif;
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: .1rem;
  margin-bottom: 1rem;
  font-size: 12px;
`;

const LegendItem = styled.div`
  cursor: pointer;
  padding: 3px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  &::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 2px;
    margin-right: 6px;
    background-color: ${(props) => props.color || '#000'};
  }
`;


const ClearItem = styled.div`
  cursor: pointer;
  padding: 3px;
  border-radius: 6px;
  display: flex;
  align-items: center;
`;

export default function LineChart(props) {
  const { data, name, setHoveredQuarter, hoveredQuarter, setHoverCategories, hoverCategories, isMobile } = props;
  const svgRef = useRef();
  const margin = { top: 5, right: 8, bottom: 60, left: 40 };
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [chartWidth, setChartWidth] = useState((isMobile ? 400 : 570) - margin.left - margin.right);
  const height = 500 - margin.top - margin.bottom;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setChartWidth((isMobile ? 400 : 570) - margin.left - margin.right);
  }, [isMobile, windowWidth]);

  const colorMap = {
    "Military Personnel, Equipment & Facilities": "#DFC5B2",
    "Vehicles": "#B7BCD6",
    "Transportation Infrastructure": "#ACBCC5",
    "Residential Buildings": "#5088A1",
    "Manufacturing, Production & Construction": "#998C84",
    "Oil Infrastructure": "#D2D9B6",
    "Media and Telecom Facilities": "#9194A8",
    "Terrain": "#AEAC8D",
    "Water Infrastructure": "#8EBADB",
    "Electrical Infrastructure": "#78A898",
    "Financial and Banking Facilities": "#98D5D3"
  };

  const allCategories = Array.from(
    new Set(data.flatMap(d => d.categories.map(c => c.name)))
  );

  const sortedCategories = (hoverCategories.length > 0 ? hoverCategories : allCategories)
    .sort((a, b) => {
      const totalA = data.reduce((sum, d) => {
        const item = d.categories.find(c => c.name === a);
        return sum + (item ? item.count : 0);
      }, 0);
      const totalB = data.reduce((sum, d) => {
        const item = d.categories.find(c => c.name === b);
        return sum + (item ? item.count : 0);
      }, 0);
      return totalB - totalA;
    });

  const quarters = data.map((d) => d.quarter);
  const xScale = scalePoint().domain(quarters).range([0, chartWidth]);
  const visibleCategories = hoverCategories.length > 0 ? hoverCategories : allCategories;
  const yMax = max(data, (d) =>
    max(d.categories.filter(c => visibleCategories.includes(c.name)), c => c.count)
  );
  const yScale = scaleLinear().domain([0, yMax + (yMax / 4)]).range([height, 0]);

  useEffect(() => {
    const svg = select(svgRef.current);

    // preserve <g.main> so paths can transition
    let g = svg.select('g.main');
    if (g.empty()) {
      g = svg
        .attr('width', chartWidth + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('class', 'main')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      g.append('g').attr('class', 'y-axis');
      g.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${height})`);
      g.append('g').attr('class', 'x-custom-labels').attr('transform', `translate(0,${height})`);
    } else {
      let dataGroup = g.select('.data-group');
      if (dataGroup.empty()) {
        dataGroup = g.append('g').attr('class', 'data-group');
      }

      dataGroup.selectAll('path')
        .filter(function () {
          const cls = this.getAttribute('class');
          return cls && (cls.startsWith('line-') || cls.startsWith('area-'));
        })
        .attr('visibility', 'visible');
    }
    // Always update SVG width/height in case chart resizes
    svg
      .attr('width', chartWidth + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const t = transition().duration(1000).ease(easeCubicInOut);

    let dataGroup = g.select('.data-group');
    if (dataGroup.empty()) {
      dataGroup = g.append('g').attr('class', 'data-group');
    }
    let defs = svg.select('defs');
    if (defs.empty()) defs = svg.append('defs');

    // Update Y axis: only transition if already rendered
    const yAxisGroup = g.select('.y-axis');
    if (!yAxisGroup.selectAll('.tick').empty()) {
      yAxisGroup.transition(t)
        .call(axisLeft(yScale).ticks(5).tickSize(-chartWidth).tickPadding(8));
    } else {
      yAxisGroup
        .call(axisLeft(yScale).ticks(5).tickSize(-chartWidth).tickPadding(8));
    }

    yAxisGroup
      .call(g => g.selectAll('line').attr('stroke', '#D9D9D9').attr('stroke-width', 0.5))
      .call(g => g.selectAll('text').attr('x', -12).attr("color", "#595959").attr("font-size", 12))
      .attr("font-family", "Bennett Text");

    g.select('.x-axis')
      .transition(t)
      .call(axisBottom(xScale))
      .call(g => g.selectAll('line').attr('stroke', '#BCBCBC').attr('stroke-opacity', 0.35))
      .call(g => g.selectAll('text').attr('color', 'transparent'));

    const labelGroup = g.select('.x-custom-labels');
    labelGroup.selectAll('*').remove();

    quarters.forEach((q, i) => {
      const x = xScale(q);
      if (x == null) return;

      labelGroup.append('rect')
        .attr('class', 'hover-rect')
        .attr('x', x - (xScale.step() / 2))
        .attr('y', 0)
        .attr('width', xScale.step())
        .attr('height', height)
        .attr('fill', 'transparent')
        .on('mousemove', () => {

          // Update vertical line position
          verticalLine
            .attr('x1', x)
            .attr('x2', x)
            .style('opacity', 1);

          // Draw highlight circles
          highlightGroup.selectAll('circle').remove();
          const visibleCategories = hoverCategories.length > 0 ? hoverCategories : allCategories;
          visibleCategories.forEach((category) => {
            const classSuffix = category.replace(/[^a-zA-Z0-9_-]/g, '-');
            const pathVisible = g.select(`.line-${classSuffix}`).attr('visibility') !== 'hidden';

            if (!pathVisible) return;

            const entry = data.find(d => d.quarter === q)?.categories.find(c => c.name === category);
            if (entry) {
              highlightGroup.append('circle')
                .attr('cx', x)
                .attr('cy', yScale(entry.count))
                .attr('r', 4)
                .attr('fill', colorMap[category] || '#ccc')
                .attr('stroke', 'white')
                .attr('stroke-width', 1.5);
            }
          });
        })
        .on('mouseleave', () => {
          verticalLine.style('opacity', 0);
          highlightGroup.selectAll('circle').remove();
        });
    });

    quarters.forEach((q) => {
      const [quarter, year] = q.split(" ");
      const x = xScale(q);
      if (x != null) {
        const group = labelGroup.append("g").attr("transform", `translate(${x},0)`);
        group.append("text").attr("y", 22).attr("text-anchor", "middle").attr("font-size", 14).style("fill", "#595959").text(quarter);
        group.append("text").attr("y", 37).attr("font-size", 14).attr("text-anchor", "middle").style("fill", "#595959").text(year);
      }
    });

    const hoverGroup = g.select('.hover-group').empty()
      ? g.append('g').attr('class', 'hover-group')
      : g.select('.hover-group');

    hoverGroup.selectAll('*').remove();

    const verticalLine = hoverGroup.append('line')
      .attr('class', 'hover-line')
      .attr('stroke', '#999')
      .attr('stroke-dasharray', '2,2')
      .attr('y1', 0)
      .attr('y2', height)
      .style('opacity', 0);

    const highlightGroup = hoverGroup.append('g').attr('class', 'hover-circles');

    // Use the full svg for hover tracking so it sits above lines
    const overlayGroup = g.select('.hover-overlay').empty()
      ? g.append('g').attr('class', 'hover-overlay')
      : g.select('.hover-overlay');

    overlayGroup.selectAll('*').remove();

    const step = xScale.step ? xScale.step() : chartWidth / quarters.length;

    quarters.forEach((q) => {
      const x = xScale(q);
      if (x == null) return;

      overlayGroup.append('rect')
        .attr('x', x - step / 2)
        .attr('y', 0)
        .attr('width', step)
        .attr('height', height)
        .attr('fill', 'transparent')
        .on('mousemove', () => {
          setHoveredQuarter(q);
          verticalLine
            .attr('x1', x)
            .attr('x2', x)
            .style('opacity', 1);

          highlightGroup.selectAll('circle').remove();
          const visibleCategories = hoverCategories.length > 0 ? hoverCategories : allCategories;

          visibleCategories.forEach((category) => {
            const classSuffix = category.replace(/[^a-zA-Z0-9_-]/g, '-');
            const pathVisible = g.select(`.line-${classSuffix}`).attr('visibility') !== 'hidden';

            if (!pathVisible) return;

            const entry = data.find(d => d.quarter === q)?.categories.find(c => c.name === category);
            if (entry) {
              highlightGroup.append('circle')
                .attr('cx', x)
                .attr('cy', yScale(entry.count))
                .attr('r', 4)
                .attr('fill', colorMap[category] || '#ccc')
                .attr('stroke', 'white')
                .attr('stroke-width', 1.5);
            }
          });
        })
        .on('mouseleave', () => {
          setHoveredQuarter("");
          verticalLine.style('opacity', 0);
          highlightGroup.selectAll('circle').remove();
        });
    });

    const x = xScale(hoveredQuarter);
    verticalLine
      .attr('x1', x)
      .attr('x2', x)
      .style('opacity', hoveredQuarter === "" ? 0 : 1);

    highlightGroup.selectAll('circle').remove();
    const visibleCategories = hoverCategories.length > 0 ? hoverCategories : allCategories;
    visibleCategories.forEach((category) => {
      const entry = data.find(d => d.quarter === hoveredQuarter)?.categories.find(c => c.name === category);
      if (entry) {
        highlightGroup.append('circle')
          .attr('cx', x)
          .attr('cy', yScale(entry.count))
          .attr('r', 4)
          .attr('fill', colorMap[category] || '#ccc')
          .attr('stroke', 'white')
          .attr('stroke-width', 1.5);
      }
    });

    visibleCategories.forEach((category) => {
      const lineData = data.map((d) => {
        const entry = d.categories.find((c) => c.name === category);
        return { quarter: d.quarter, count: entry ? entry.count : 0 };
      });

      const id = `grad-${category.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
      const color = colorMap[category] || '#ccc';

      let gradient = defs.select(`#${id}`);
      if (gradient.empty()) {
        gradient = defs.append('linearGradient')
          .attr('id', id)
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '0%')
          .attr('y2', '100%');
        gradient.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.6);
        gradient.append('stop').attr('offset', '100%').attr('stop-color', '#ffffff').attr('stop-opacity', 0.8);
      }

      const areaPath = area().x(d => xScale(d.quarter)).y0(height).y1(d => yScale(d.count));
      const linePath = line().x(d => xScale(d.quarter)).y(d => yScale(d.count));

      const areaClass = `area-${category.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
      const lineClass = `line-${category.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

      const areaSelection = dataGroup.selectAll(`path.${areaClass}`).data([lineData], () => category);
      areaSelection
        .join(
          enter => enter.append('path')
            .attr('class', areaClass)
            .attr('fill', `url(#${id})`)
            .attr('fill-opacity', 0.7)
            .attr('stroke', 'none')
            .attr('d', areaPath),
          update => update.transition(t).attr('d', areaPath)
        )
        .each(function () {
          select(this)
            .transition(t)
            .style('opacity', hoverCategories.length === 0 || hoverCategories.includes(category) ? 1 : 0);
        });

      const lineSelection = dataGroup.selectAll(`path.${lineClass}`).data([lineData], () => category);
      lineSelection
        .join(
          enter => enter.append('path')
            .attr('class', lineClass)
            .attr('fill', 'none')
            .attr('stroke', hoverCategories.length === 0 || hoverCategories.includes(category) ? color : "red")
            .attr('stroke-width', 1.5)
            .attr('d', linePath),
          update => update.transition(t).attr('d', linePath)
        )
        .each(function () {
          select(this)
            .transition(t)
            .style('opacity', hoverCategories.length === 0 || hoverCategories.includes(category) ? 1 : 0);
        });
    });

    allCategories.forEach((category) => {
      const classSuffix = category.replace(/[^a-zA-Z0-9_-]/g, '-');
      const visible = hoverCategories.length === 0 || hoverCategories.includes(category);
      g.selectAll(`.line-${classSuffix}`)
        .transition(t)
        .style('opacity', visible ? 1 : 0);
      g.selectAll(`.area-${classSuffix}`)
        .transition(t)
        .style('opacity', visible ? 1 : 0);
    });
  }, [data, hoveredQuarter, hoverCategories, isMobile, chartWidth]);

  const handleLegendItemClick = (value) => {
    const tempArr = [...hoverCategories];
    if (tempArr.includes(value)) {
      const removeArr = tempArr.filter((v) => v !== value);
      setHoverCategories(removeArr);
    } else {
      tempArr.push(value);
      setHoverCategories(tempArr);
    }
  };

  return (
    <ChartContainer $width={isMobile ? 400 : 570}>
      <Title>Targets, By Total Number in Press Releases per Quarter in <span style={{ color: "#156082", fontWeight: 600 }}>{name}</span> </Title>
      <Legend>

        {Array.from(
          new Set(data.flatMap(d => d.categories.map(c => c.name)))
        ).map((name) => (
          <LegendItem style={{ border: hoverCategories.includes(name) ? `1px solid ${colorMap[name]}` : `1px solid #ffffff` }} onClick={() => handleLegendItemClick(name)} key={name} color={colorMap[name] || '#ccc'}>
            {name}
          </LegendItem>
        ))}
        {hoverCategories.length > 0 && (
          <ClearItem
            onClick={() => setHoverCategories([])}
            style={{

              color: '#666',
              fontWeight: 500
            }}
          >
            <span style={{
              display: 'inline-block',
              width: 5,
              height: 2,
              marginRight: 6,
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: -7,
                fontSize: 14,
                color: '#999'
              }}>×</span>
            </span>
            Clear All
          </ClearItem>
        )}
      </Legend>
      <svg ref={svgRef}></svg>
    </ChartContainer>
  );
};
