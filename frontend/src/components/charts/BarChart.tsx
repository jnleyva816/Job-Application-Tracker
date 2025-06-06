import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  colorScheme?: string[];
  showValues?: boolean;
  animationDuration?: number;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 60 },
  colorScheme = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'],
  showValues = true,
  animationDuration = 750
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create main group
    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.label))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([chartHeight, 0]);

    // Create color scale
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(data.map(d => d.label))
      .range(colorScheme);

    // Add gradient definitions
    const defs = svg.append('defs');
    data.forEach((d, i) => {
      const gradient = defs
        .append('linearGradient')
        .attr('id', `gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', chartHeight)
        .attr('x2', 0).attr('y2', 0);

      const baseColor = d.color || colorScale(d.label);
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', baseColor)
        .attr('stop-opacity', 0.8);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', baseColor)
        .attr('stop-opacity', 1);
    });

    // Create bars with animation
    const bars = chart
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.label) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', chartHeight)
      .attr('height', 0)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', (_d, i) => `url(#gradient-${i})`)
      .style('cursor', 'pointer');

    // Animate bars
    bars
      .transition()
      .duration(animationDuration)
      .ease(d3.easeElasticOut.amplitude(1).period(0.3))
      .attr('y', d => yScale(d.value))
      .attr('height', d => chartHeight - yScale(d.value));

    // Add value labels if enabled
    if (showValues) {
      const labels = chart
        .selectAll('.value-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
        .attr('y', chartHeight)
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .style('font-family', 'Inter, system-ui, sans-serif')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('fill', '#374151')
        .style('opacity', 0);

      labels
        .transition()
        .delay(animationDuration / 2)
        .duration(300)
        .style('opacity', 1)
        .attr('y', d => yScale(d.value) - 5)
        .text(d => d.value.toLocaleString());
    }

    // Add x-axis
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    chart
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-family', 'Inter, system-ui, sans-serif')
      .style('font-size', '11px')
      .style('fill', '#6b7280');

    // Add y-axis
    const yAxis = d3.axisLeft(yScale).tickSizeOuter(0).ticks(5);
    chart
      .append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-family', 'Inter, system-ui, sans-serif')
      .style('font-size', '11px')
      .style('fill', '#6b7280');

    // Style axis lines
    chart.selectAll('.domain')
      .style('stroke', '#e5e7eb')
      .style('stroke-width', 1);

    chart.selectAll('.tick line')
      .style('stroke', '#e5e7eb')
      .style('stroke-width', 1);

    // Add hover effects
    bars
      .on('mouseover', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('filter', 'brightness(1.1)')
          .attr('transform', 'scale(1.02)');

        // Add tooltip
        const tooltip = chart
          .append('g')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        const rect = tooltip
          .append('rect')
          .attr('rx', 8)
          .attr('ry', 8)
          .attr('fill', '#1f2937')
          .attr('stroke', '#374151')
          .attr('stroke-width', 1);

        const text = tooltip
          .append('text')
          .attr('fill', 'white')
          .attr('font-family', 'Inter, system-ui, sans-serif')
          .attr('font-size', '12px')
          .attr('font-weight', '500')
          .text(`${d.label}: ${d.value.toLocaleString()}`);

        const bbox = (text.node() as SVGTextElement).getBBox();
        rect
          .attr('width', bbox.width + 16)
          .attr('height', bbox.height + 12)
          .attr('x', bbox.x - 8)
          .attr('y', bbox.y - 6);

        const mouseX = (xScale(d.label) || 0) + xScale.bandwidth() / 2;
        const mouseY = yScale(d.value) - 10;

        tooltip
          .attr('transform', `translate(${mouseX - bbox.width / 2},${mouseY - bbox.height - 8})`)
          .transition()
          .duration(200)
          .style('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style('filter', 'brightness(1)')
          .attr('transform', 'scale(1)');

        chart.select('.tooltip').remove();
      });

  }, [data, width, height, margin, colorScheme, showValues, animationDuration]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="overflow-visible"
      style={{ background: 'transparent' }}
      data-testid="bar-chart-svg"
    />
  );
};

export default BarChart; 