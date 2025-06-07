import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DonutChartData {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  colorScheme?: string[];
  showLabels?: boolean;
  showPercentages?: boolean;
  animationDuration?: number;
  minSliceAngle?: number; // Minimum angle in radians for showing labels
  useLegend?: boolean; // Option to show legend instead of labels
  legendPosition?: 'right' | 'bottom';
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  width = 400,
  height = 400,
  innerRadius = 60,
  outerRadius = 120,
  colorScheme = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'],
  showLabels = true,
  showPercentages = true,
  animationDuration = 750,
  minSliceAngle = 0.1, // ~5.7 degrees minimum
  useLegend = false,
  legendPosition = 'right'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();
    if (legendRef.current) {
      legendRef.current.innerHTML = '';
    }

    const svg = d3.select(svgRef.current);
    const centerX = width / 2;
    const centerY = height / 2;

    // Create main group
    const chart = svg
      .append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    // Calculate total for percentages
    const total = d3.sum(data, d => d.value);

    // Filter out zero values and sort by value for better visualization
    const filteredData = data.filter(d => d.value > 0).sort((a, b) => b.value - a.value);

    // Create pie generator
    const pie = d3.pie<DonutChartData>()
      .value(d => d.value)
      .sort(null)
      .padAngle(0.02); // Small padding between slices

    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<DonutChartData>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(3);

    // Create hover arc generator
    const hoverArc = d3.arc<d3.PieArcDatum<DonutChartData>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius + 8)
      .cornerRadius(3);

    // Create color scale
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(filteredData.map(d => d.label))
      .range(colorScheme);

    // Add gradient definitions
    const defs = svg.append('defs');
    filteredData.forEach((d, i) => {
      const gradient = defs
        .append('radialGradient')
        .attr('id', `donut-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', outerRadius);

       
      const baseColor = d.color || colorScale(d.label);
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', baseColor)
        .attr('stop-opacity', 1);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.rgb(baseColor).darker(0.3).toString())
        .attr('stop-opacity', 0.9);
    });

    // Add shadow filter
    const filter = defs.append('filter')
      .attr('id', 'donut-shadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('stdDeviation', 4)
      .attr('flood-color', '#000000')
      .attr('flood-opacity', 0.1);

    // Generate pie data
    const pieData = pie(filteredData);

    // Create arcs
    const arcs = chart
      .selectAll('.arc')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Add paths with animation
    const paths = arcs
      .append('path')
      .attr('fill', (_d, i) => `url(#donut-gradient-${i})`)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('filter', 'url(#donut-shadow)')
      .attr('d', arc); // Set final path immediately as fallback

    // Animate from zero if animation is enabled
    if (animationDuration > 0) {
      paths
        .attr('d', (d) => {
          const initialData = { ...d, startAngle: 0, endAngle: 0 };
          return arc(initialData as d3.PieArcDatum<DonutChartData>) || '';
        })
        .transition()
        .duration(animationDuration)
        .ease(d3.easeElastic.amplitude(1).period(0.4))
        .attr('d', arc);
    }

    // Add labels if enabled and not using legend
    if (showLabels && !useLegend) {
      // Only show labels for slices above minimum angle threshold
      const labelData = pieData.filter(d => (d.endAngle - d.startAngle) >= minSliceAngle);
      
      // Calculate optimal label radius based on chart size
      const labelRadius = outerRadius + Math.max(30, outerRadius * 0.3);
      
      // Adaptive font size based on chart size
      const fontSize = Math.max(10, Math.min(14, outerRadius / 8));
      
      const labelArc = d3.arc<d3.PieArcDatum<DonutChartData>>()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

      // Calculate label positions and detect collisions
      const labelPositions = labelData.map(d => {
        const centroid = labelArc.centroid(d);
        const midAngle = d.startAngle < Math.PI ? d.startAngle + (d.endAngle - d.startAngle) / 2 : d.startAngle + (d.endAngle - d.startAngle) / 2;
        const percentage = ((d.data.value / total) * 100).toFixed(1);
        const text = showPercentages ? `${d.data.label} (${percentage}%)` : d.data.label;
        
        return {
          data: d,
          x: centroid[0],
          y: centroid[1],
          text,
          midAngle,
          side: midAngle < Math.PI ? 'right' : 'left'
        };
      });

      // Separate labels by side and sort by angle
      const leftLabels = labelPositions.filter(l => l.side === 'left').sort((a, b) => a.midAngle - b.midAngle);
      const rightLabels = labelPositions.filter(l => l.side === 'right').sort((a, b) => a.midAngle - b.midAngle);

      // Adjust positions to prevent overlap
      const adjustLabels = (labels: typeof labelPositions, side: 'left' | 'right') => {
        const minSpacing = fontSize + 4;
        for (let i = 1; i < labels.length; i++) {
          // eslint-disable-next-line security/detect-object-injection
          const current = labels[i];
           
          const previous = labels[i - 1];
          if (Math.abs(current.y - previous.y) < minSpacing) {
            current.y = previous.y + (current.y > previous.y ? minSpacing : -minSpacing);
          }
        }
        
        // Adjust x position for better alignment
        labels.forEach(label => {
          label.x = (labelRadius + 15) * (side === 'right' ? 1 : -1);
        });
      };

      adjustLabels(leftLabels, 'left');
      adjustLabels(rightLabels, 'right');

      const allAdjustedLabels = [...leftLabels, ...rightLabels];

      // Add connecting lines with improved path
      const lines = chart
        .selectAll('.label-line')
        .data(allAdjustedLabels)
        .enter()
        .append('polyline')
        .attr('class', 'label-line')
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .style('opacity', 0);

      lines
        .transition()
        .delay(animationDuration / 2)
        .duration(300)
        .style('opacity', 0.6)
        .attr('points', d => {
          const outerPoint = arc.centroid(d.data);
          const labelPoint = [d.x, d.y];
          const midPoint = [(outerPoint[0] + labelPoint[0]) / 2, (outerPoint[1] + labelPoint[1]) / 2];
          return [outerPoint, midPoint, labelPoint].map(p => p.join(',')).join(' ');
        });

      // Add labels with improved positioning
      const labels = chart
        .selectAll('.label-text')
        .data(allAdjustedLabels)
        .enter()
        .append('text')
        .attr('class', 'label-text')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('text-anchor', d => d.side === 'right' ? 'start' : 'end')
        .attr('dominant-baseline', 'middle')
        .style('font-family', 'Inter, system-ui, sans-serif')
        .style('font-size', `${fontSize}px`)
        .style('font-weight', '500')
        .style('fill', '#374151')
        .style('opacity', 0);

      labels
        .transition()
        .delay(animationDuration / 2)
        .duration(300)
        .style('opacity', 1)
        .text(d => d.text);
    }

    // Create legend if enabled
    if (useLegend && legendRef.current) {
      const legendContainer = d3.select(legendRef.current);
      
      const legendItems = legendContainer
        .selectAll('.legend-item')
        .data(filteredData)
        .enter()
        .append('div')
        .attr('class', 'legend-item')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('margin-bottom', '8px')
        .style('font-family', 'Inter, system-ui, sans-serif')
        .style('font-size', '12px')
        .style('cursor', 'pointer');

      legendItems
        .append('div')
        .style('width', '12px')
        .style('height', '12px')
        .style('border-radius', '2px')
        .style('margin-right', '8px')
         
        .style('background-color', (d) => d.color || colorScale(d.label))
        .style('flex-shrink', '0');

      legendItems
        .append('span')
        .style('color', '#374151')
        .text(d => {
          const percentage = ((d.value / total) * 100).toFixed(1);
          return showPercentages ? `${d.label} (${percentage}%)` : d.label;
        });

      // Add hover effects for legend
      legendItems
        .on('mouseover', function(_event, d) {
          const index = filteredData.indexOf(d);
          paths.style('opacity', (_pathData, i) => i === index ? 1 : 0.3);
        })
        .on('mouseout', function() {
          paths.style('opacity', 1);
        });
    }

    // Add center text
    const centerText = chart.append('g').attr('class', 'center-text');
    
    centerText.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('y', -8)
      .style('font-family', 'Inter, system-ui, sans-serif')
      .style('font-size', `${Math.max(20, outerRadius / 5)}px`)
      .style('font-weight', '700')
      .style('fill', '#1f2937')
      .style('opacity', 0)
      .text(total.toLocaleString())
      .transition()
      .delay(animationDuration)
      .duration(300)
      .style('opacity', 1);

    centerText.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('y', 8)
      .style('font-family', 'Inter, system-ui, sans-serif')
      .style('font-size', `${Math.max(10, outerRadius / 10)}px`)
      .style('font-weight', '500')
      .style('fill', '#6b7280')
      .style('opacity', 0)
      .text('Total')
      .transition()
      .delay(animationDuration)
      .duration(300)
      .style('opacity', 1);

    // Add hover effects with improved tooltip
    paths
      .on('mouseover', function(_event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', (data) => hoverArc(data as d3.PieArcDatum<DonutChartData>) || '')
          .style('filter', 'url(#donut-shadow) brightness(1.1)');

        // Add enhanced tooltip
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
          .attr('stroke-width', 1)
          .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))');

        const percentage = ((d.data.value / total) * 100).toFixed(1);
        const text = tooltip
          .append('text')
          .attr('fill', 'white')
          .attr('font-family', 'Inter, system-ui, sans-serif')
          .attr('font-size', '12px')
          .attr('font-weight', '500')
          .attr('x', 8)
          .attr('y', 16)
          .text(`${d.data.label}: ${d.data.value.toLocaleString()} (${percentage}%)`);

        const bbox = (text.node() as SVGTextElement).getBBox();
        rect
          .attr('width', bbox.width + 16)
          .attr('height', bbox.height + 12);

        const [mouseX, mouseY] = d3.pointer(event, chart.node());
        tooltip
          .attr('transform', `translate(${mouseX + 15},${mouseY - bbox.height - 15})`)
          .transition()
          .duration(200)
          .style('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', (data) => arc(data as d3.PieArcDatum<DonutChartData>) || '')
          .style('filter', 'url(#donut-shadow)');

        chart.select('.tooltip').remove();
      });

  }, [data, width, height, innerRadius, outerRadius, colorScheme, showLabels, showPercentages, animationDuration, minSliceAngle, useLegend]);

  if (useLegend) {
    const isRightLegend = legendPosition === 'right';
    const containerStyle = isRightLegend 
      ? { display: 'flex', alignItems: 'center', gap: '24px' }
      : { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '16px' };

    return (
      <div style={containerStyle}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible"
          style={{ background: 'transparent' }}
          data-testid="donut-chart-svg"
        />
        <div 
          ref={legendRef}
          className="legend-container"
          style={{ 
            maxWidth: isRightLegend ? '200px' : 'none',
            display: isRightLegend ? 'block' : 'flex',
            flexWrap: 'wrap' as const,
            gap: isRightLegend ? '0' : '16px',
            justifyContent: 'center'
          }}
        />
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="overflow-visible"
      style={{ background: 'transparent' }}
      data-testid="donut-chart-svg"
    />
  );
};

export default DonutChart; 