import React from 'react';
import styled from 'styled-components';
import { scaleLinear } from 'd3-scale';
import CircleLegend from './CircleLegend';

const GridWrapper = styled.div`
  padding: 2rem 2rem 2rem 1.5rem;
  font-family: 'Bennett Text', Georgia, serif;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width:550px;
`;

const CategoryRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const CategoryLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  padding-bottom: ${({ offset }) => offset + 12}px;
  text-align: start;
`;

const QuarterRow = styled.div`
  display: flex;
  align-items: flex-end;
`;

const CircleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
`;

const QuarterLabel = styled.div`
  font-size: 12px;
  text-align: center;
  padding-bottom: ${({ offset }) => offset + 6}px;
     transition: padding-bottom 1s ease-in-out
`;

const CountLabel = styled.div`
  font-size: 12px;
  margin-top: ${({ offset }) => offset + 6}px;
  color: ${({ color }) => color};
  font-weight: 600;
  transition: margin-top 1s ease-in-out;
  filter: brightness(.5);
`;


const CircleStack = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BlurredCircle = styled.div`
  position: absolute;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  opacity: 0.7;
  filter: blur(3px);
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  transition: height 1s ease-in, width 1s ease-in-out
`;

const OutlineCircle = styled.div`
  position: absolute;
  border-radius: 50%;
  border: 1px solid ${({ color }) => color};
  opacity: 0.7;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  transition: height 1s ease-in, width 1s ease-in-out
`;

const CenterDot = styled.div`
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: ${({ color }) => color};
  border-radius: 50%;
  filter: brightness(.85);
`;

const LegendGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
`;

const colorMap = {
  "Military Personnel, Equipment & Facilities": "#DFC5B2",
  "Vehicles": "#B7BCD6",
  "Transportation Infrastructure": "#ACBCC5",
  "Residential Buildings": "#5088A1",
  "Manufacturing, Production, and Construction": "#998C84",
  "Oil Infrastructure": "#D2D9B6",
  "Media and Telecom Facilities": "#9194A8",
  "Terrain": "#AEAC8D",
  "Water Infrastructure": "#8EBADB",
  "Electrical Infrastructure": "#78A898",
  "Financial and Banking Facilities": "#98D5D3"
};

export default function CategoryBubbleChart(props) {
  const { data, sizeScale, hoveredQuarter, setHoveredQuarter, hoverCategories, isMobile } = props;
  const categories = Array.from(
    new Set(data.flatMap(d => d.categories.map(c => c.name)))
  ).sort((a, b) => {
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

  const maxRadiiByCategory = {};
  categories.forEach(cat => {
    const maxCount = Math.max(
      ...data.map(d => {
        const found = d.categories.find(c => c.name === cat);
        return found ? found.count : 0;
      })
    );
    maxRadiiByCategory[cat] = sizeScale(maxCount);
  });

  return (
    <GridWrapper style={{ width: isMobile ? "370px" : "550px" }}>
      {categories.filter((c) => hoverCategories.length === 0 || hoverCategories.includes(c)).map((category, i) => {
        const maxCategorySize = Math.max(
          ...data.map(d => {
            const found = d.categories.find(c => c.name === category);
            return found ? sizeScale(found.count) : 0;
          })
        );

        return (
          <CategoryRow key={category}>
            {i === 0 && <LegendGroup>
              <CategoryLabel offset={0}>{category}</CategoryLabel>
              <CircleLegend data={data} sizeScale={sizeScale} />
            </LegendGroup>}
            {i !== 0 && <CategoryLabel offset={0}>{category}</CategoryLabel>}
            <QuarterRow>
              {data.map((d) => {
                const found = d.categories.find(c => c.name === category);
                const count = found ? found.count : 0;
                const size = sizeScale(count);
                const label = d.quarter.split(" ");
                const color = colorMap[category] || '#ccc';
                return (
                  <CircleContainer style={{ opacity: hoveredQuarter === "" || hoveredQuarter === d.quarter ? 1 : .3 }} onMouseMove={() => setHoveredQuarter(d.quarter)} onMouseLeave={() => setHoveredQuarter("")} key={`${category}-${d.quarter}`}>
                    <QuarterLabel offset={-5}>{label[0]}</QuarterLabel>
                    <QuarterLabel offset={maxRadiiByCategory[category] / 2}>{label[1]}</QuarterLabel>
                    {count !== 0 && <CircleStack >
                      <BlurredCircle size={size} color={color} />
                      <OutlineCircle size={size} color={color} />
                      <CenterDot color={color} />
                    </CircleStack>}
                    <CountLabel color={color} offset={maxRadiiByCategory[category] / 2}>{count}</CountLabel>
                  </CircleContainer>
                );
              })}
            </QuarterRow>
          </CategoryRow>
        );
      })}
    </GridWrapper>
  );
}