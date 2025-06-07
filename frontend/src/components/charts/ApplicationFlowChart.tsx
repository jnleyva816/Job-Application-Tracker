import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ApplicationFlowData {
  total: number;
  byStatus: {
    Applied: number;
    Interviewing: number;
    Offered: number;
    Rejected: number;
  };
  currentStatusDistribution?: {
    Applied: number;
    Interviewing: number;
    Offered: number;
    Rejected: number;
  };
  offerStatusDistribution?: {
    ACCEPTED: number;
    DECLINED: number;
    PENDING: number;
  };
  successRate: number;
  averageResponseTime: number;
  interviewStats?: {
    totalInterviews: number;
    upcoming: number;
    past: number;
    conversionRate: number;
    averagePerApplication: number;
  };
}

interface ApplicationFlowChartProps {
  stats: ApplicationFlowData;
  width?: number;
  height?: number;
}

interface FlowNode {
  id: string;
  name: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface FlowLink {
  source: string;
  target: string;
  value: number;
  color: string;
  sourceY?: number;
  targetY?: number;
}

const ApplicationFlowChart: React.FC<ApplicationFlowChartProps> = ({
  stats,
  width = 800,
  height = 450
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !stats) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Add CSS styles for enhanced electricity effects
    const style = document.createElement('style');
    style.textContent = `
      .electricity-path {
        filter: drop-shadow(0 0 8px currentColor);
        animation: electricity-pulse 4s ease-in-out infinite alternate;
      }
      
      @keyframes electricity-pulse {
        0% { 
          opacity: 0.6;
          filter: drop-shadow(0 0 4px currentColor) brightness(1);
        }
        50% {
          opacity: 0.9;
          filter: drop-shadow(0 0 12px currentColor) brightness(1.2);
        }
        100% { 
          opacity: 0.8;
          filter: drop-shadow(0 0 8px currentColor) brightness(1.1);
        }
      }
      
      .flow-spark {
        animation: spark-flow 6s linear infinite;
      }
      
      @keyframes spark-flow {
        0% { 
          transform: translateX(-20px);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% { 
          transform: translateX(100px);
          opacity: 0;
        }
      }
      
      .electricity-glow {
        animation: glow-pulse 3s ease-in-out infinite alternate;
      }
      
      @keyframes glow-pulse {
        from {
          filter: drop-shadow(0 0 5px currentColor);
        }
        to {
          filter: drop-shadow(0 0 15px currentColor) drop-shadow(0 0 25px currentColor);
        }
      }
    `;
    
    // Append styles to document head if not already present
    if (!document.querySelector('#electricity-styles')) {
      style.id = 'electricity-styles';
      document.head.appendChild(style);
    }

    // Calculate flow values based on your data
    const currentStatus = stats.currentStatusDistribution || stats.byStatus;
    const total = stats.total || 1;
    
    // Calculate flow data - including pending applications
    const pendingApplications = currentStatus.Applied; // Currently applied, waiting for response
    const interviewingApplications = currentStatus.Interviewing; // Currently in interview process
    const toInterviews = currentStatus.Interviewing + currentStatus.Offered;
    const toOffers = currentStatus.Offered;
    
    // All rejections flow directly from applications (simplified view)
    const totalRejected = Math.max(1, total - currentStatus.Applied - currentStatus.Interviewing - currentStatus.Offered);
    
    // Interview records data from stats
    const totalInterviewRecords = stats.interviewStats?.totalInterviews || 0;
    const upcomingInterviews = stats.interviewStats?.upcoming || 0;
    const pastInterviews = stats.interviewStats?.past || 0;
    
    // Use real offer status data instead of estimates
    const acceptedOffers = stats.offerStatusDistribution?.ACCEPTED || 0;
    const declinedOffers = stats.offerStatusDistribution?.DECLINED || 0;
    const pendingOffers = stats.offerStatusDistribution?.PENDING || 0;

    // Define colors matching your existing theme
    const colors = {
      applications: '#667eea',
      pending: '#fcd34d', // Yellow for pending
      interviewing: '#fb923c', // Orange for interviewing status
      interviewRecords: '#e879f9', // Purple for interview records
      interviews: '#fb923c', // Orange for interviews
      offers: '#43e97b',
      accepted: '#51cf66',
      rejected: '#ef4444', // Red for rejected
      declined: '#ff6b6b'
    };

    // Create nodes with proper Sankey positioning
    const nodeWidth = 100;
    const nodeHeight = 60;
    const nodes: FlowNode[] = [
      {
        id: 'applications',
        name: 'Applications',
        value: total,
        x: 50,
        y: chartHeight / 2 - 30,
        width: nodeWidth,
        height: nodeHeight,
        color: colors.applications
      },
      {
        id: 'rejected',
        name: 'Rejected',
        value: totalRejected,
        x: chartWidth * 0.25,
        y: chartHeight * 0.1,
        width: nodeWidth,
        height: nodeHeight,
        color: colors.rejected
      },
      {
        id: 'pending',
        name: 'Pending',
        value: pendingApplications,
        x: chartWidth * 0.25,
        y: chartHeight * 0.3,
        width: nodeWidth,
        height: nodeHeight,
        color: colors.pending
      },
      {
        id: 'interviewing',
        name: 'Interviewing',
        value: interviewingApplications,
        x: chartWidth * 0.25,
        y: chartHeight * 0.5,
        width: nodeWidth,
        height: nodeHeight,
        color: colors.interviewing
      },
      {
        id: 'offers',
        name: 'Offers',
        value: toOffers,
        x: chartWidth * 0.25,
        y: chartHeight * 0.7,
        width: nodeWidth,
        height: nodeHeight,
        color: colors.offers
      },
      {
        id: 'interviewRecords',
        name: 'Interview Records',
        value: totalInterviewRecords,
        x: chartWidth * 0.5,
        y: chartHeight * 0.45,
        width: nodeWidth,
        height: nodeHeight,
        color: colors.interviewRecords
      },
      {
        id: 'declined',
        name: 'Declined',
        value: declinedOffers,
        x: chartWidth * 0.5,
        y: chartHeight * 0.6,
        width: nodeWidth,
        height: nodeHeight,
        color: colors.declined
      },
      {
        id: 'accepted',
        name: 'Accepted',
        value: acceptedOffers,
        x: chartWidth * 0.5,
        y: chartHeight * 0.75,
        width: nodeWidth,
        height: nodeHeight,
        color: colors.accepted
      }
    ].filter(node => node.value > 0); // Hide nodes with zero values

    // Create links with proper source/target Y positions for Sankey curves
    const links: FlowLink[] = [
      {
        source: 'applications',
        target: 'rejected',
        value: totalRejected,
        color: colors.rejected,
        sourceY: nodes[0].y + nodes[0].height * 0.1,
        targetY: (nodes.find(n => n.id === 'rejected')?.y || 0) + (nodes.find(n => n.id === 'rejected')?.height || 0) / 2
      },
      {
        source: 'applications',
        target: 'pending',
        value: pendingApplications,
        color: colors.pending,
        sourceY: nodes[0].y + nodes[0].height * 0.3,
        targetY: (nodes.find(n => n.id === 'pending')?.y || 0) + (nodes.find(n => n.id === 'pending')?.height || 0) / 2
      },
      {
        source: 'applications',
        target: 'interviewing',
        value: interviewingApplications,
        color: colors.interviewing,
        sourceY: nodes[0].y + nodes[0].height * 0.7,
        targetY: (nodes.find(n => n.id === 'interviewing')?.y || 0) + (nodes.find(n => n.id === 'interviewing')?.height || 0) / 2
      },
      // Direct connection from Applications to Offers (now at bottom)
      {
        source: 'applications',
        target: 'offers',
        value: toOffers,
        color: colors.offers,
        sourceY: nodes[0].y + nodes[0].height * 0.9,
        targetY: (nodes.find(n => n.id === 'offers')?.y || 0) + (nodes.find(n => n.id === 'offers')?.height || 0) / 2
      },
      {
        source: 'interviewing',
        target: 'interviewRecords',
        value: totalInterviewRecords,
        color: colors.interviewRecords,
        sourceY: (nodes.find(n => n.id === 'interviewing')?.y || 0) + (nodes.find(n => n.id === 'interviewing')?.height || 0) / 2,
        targetY: (nodes.find(n => n.id === 'interviewRecords')?.y || 0) + (nodes.find(n => n.id === 'interviewRecords')?.height || 0) / 2
      },
      {
        source: 'offers',
        target: 'declined',
        value: declinedOffers,
        color: colors.declined,
        sourceY: (nodes.find(n => n.id === 'offers')?.y || 0) + (nodes.find(n => n.id === 'offers')?.height || 0) * 0.3,
        targetY: (nodes.find(n => n.id === 'declined')?.y || 0) + (nodes.find(n => n.id === 'declined')?.height || 0) / 2
      },
      {
        source: 'offers',
        target: 'accepted',
        value: acceptedOffers,
        color: colors.accepted,
        sourceY: (nodes.find(n => n.id === 'offers')?.y || 0) + (nodes.find(n => n.id === 'offers')?.height || 0) * 0.7,
        targetY: (nodes.find(n => n.id === 'accepted')?.y || 0) + (nodes.find(n => n.id === 'accepted')?.height || 0) / 2
      }
    ].filter(link => {
      // Only include links where both source and target nodes exist and have values > 0
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      return sourceNode && targetNode && link.value > 0;
    });

    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add title
    chart
      .append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-lg font-semibold fill-light-text dark:fill-dark-text')
      .text('Application Journey Flow');

    // Create gradients for flows
    const defs = svg.append('defs');
    
    // Add animated electricity patterns for each link
    links.forEach((link, i) => {
      // Create main gradient
      const gradient = defs
        .append('linearGradient')
        .attr('id', `flow-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', link.color)
        .attr('stop-opacity', 0.7);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', link.color)
        .attr('stop-opacity', 0.4);

      // Create animated electricity pattern
      const electricityPattern = defs
        .append('pattern')
        .attr('id', `electricity-pattern-${i}`)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 40)
        .attr('height', 8)
        .attr('patternTransform', 'rotate(0)');

      // Animated electricity dots/sparks
      const electricityGroup = electricityPattern.append('g');
      
      // Create multiple spark elements for more dynamic effect
      for (let j = 0; j < 3; j++) {
        electricityGroup
          .append('circle')
          .attr('cx', j * 13 + 5)
          .attr('cy', 4)
          .attr('r', 1)
          .attr('fill', link.color)
          .attr('opacity', 0.9)
          .append('animate')
          .attr('attributeName', 'opacity')
          .attr('values', '0.3;1;0.3')
          .attr('dur', '1s')
          .attr('begin', `${j * 0.3}s`)
          .attr('repeatCount', 'indefinite');

        electricityGroup
          .append('circle')
          .attr('cx', j * 13 + 5)
          .attr('cy', 4)
          .attr('r', 0.5)
          .attr('fill', '#ffffff')
          .attr('opacity', 0.7)
          .append('animate')
          .attr('attributeName', 'opacity')
          .attr('values', '0;0.8;0')
          .attr('dur', '1s')
          .attr('begin', `${j * 0.3 + 0.1}s`)
          .attr('repeatCount', 'indefinite');
      }

      // Animate the pattern position for flowing effect
      electricityPattern
        .append('animateTransform')
        .attr('attributeName', 'patternTransform')
        .attr('type', 'translate')
        .attr('values', '0,0; 40,0')
        .attr('dur', '4s')
        .attr('repeatCount', 'indefinite');

      // Create flowing gradient for the electricity effect
      const flowingGradient = defs
        .append('linearGradient')
        .attr('id', `flowing-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      flowingGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', link.color)
        .attr('stop-opacity', 0.1);

      flowingGradient.append('stop')
        .attr('offset', '30%')
        .attr('stop-color', link.color)
        .attr('stop-opacity', 0.8);

      flowingGradient.append('stop')
        .attr('offset', '70%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', 0.9);

      flowingGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', link.color)
        .attr('stop-opacity', 0.1);

      // Animate the flowing gradient (continuous left to right)
      flowingGradient
        .append('animateTransform')
        .attr('attributeName', 'gradientTransform')
        .attr('type', 'translate')
        .attr('values', '-200 0; 200 0')
        .attr('dur', '5s')
        .attr('repeatCount', 'indefinite');
    });

    // Helper function to create Sankey-style curved paths
    const createSankeyPath = (link: FlowLink): { path: string; strokeWidth: number } | null => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      
      if (!sourceNode || !targetNode || link.value === 0) return null;

      const sourceX = sourceNode.x + sourceNode.width;
      const sourceY = link.sourceY || (sourceNode.y + sourceNode.height / 2);
      const targetX = targetNode.x;
      const targetY = link.targetY || (targetNode.y + targetNode.height / 2);
      
      // Dynamic stroke width calculation
      // Scale from 2 to 100 pixels based on application count (max 500,000)
      const maxApplications = 500000;
      const minStrokeWidth = 2;
      const maxStrokeWidth = 100;
      
      // Calculate the scaling factor based on the link value
      const scaleFactor = Math.min(link.value / maxApplications, 1); // Cap at 1 for values > 500,000
      const strokeWidth = minStrokeWidth + (scaleFactor * (maxStrokeWidth - minStrokeWidth));
      
      // Ensure minimum visibility and reasonable maximum
      const finalStrokeWidth = Math.max(minStrokeWidth, Math.min(strokeWidth, maxStrokeWidth));
      
      // Calculate control points for smooth Sankey curves
      const controlPoint1X = sourceX + (targetX - sourceX) * 0.5;
      const controlPoint2X = sourceX + (targetX - sourceX) * 0.5;
      
      // Create cubic bezier path for smooth Sankey curve
      return {
        path: `M ${sourceX} ${sourceY - finalStrokeWidth/2} C ${controlPoint1X} ${sourceY - finalStrokeWidth/2} ${controlPoint2X} ${targetY - finalStrokeWidth/2} ${targetX} ${targetY - finalStrokeWidth/2} L ${targetX} ${targetY + finalStrokeWidth/2} C ${controlPoint2X} ${targetY + finalStrokeWidth/2} ${controlPoint1X} ${sourceY + finalStrokeWidth/2} ${sourceX} ${sourceY + finalStrokeWidth/2} Z`,
        strokeWidth: finalStrokeWidth
      };
    };

    // Create tooltip div
    const tooltip = d3.select('body')
      .selectAll('.flow-tooltip')
      .data([0])
      .join('div')
      .attr('class', 'flow-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.3)')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('max-width', '250px')
      .style('line-height', '1.4');

    // Function to get tooltip content for each flow connection
    const getTooltipContent = (link: FlowLink): string => {
      const percentage = total > 0 ? ((link.value / total) * 100).toFixed(1) : '0';
      
      switch (`${link.source}-${link.target}`) {
        case 'applications-rejected':
          return `<strong>Applications → Rejected</strong><br/>
                  ${link.value.toLocaleString()} applications (${percentage}%) were rejected<br/>
                  <em>Applications that didn't make it past initial screening</em>`;
        
        case 'applications-pending':
          return `<strong>Applications → Pending</strong><br/>
                  ${link.value.toLocaleString()} applications (${percentage}%) are awaiting response<br/>
                  <em>Applications submitted but no response yet</em>`;
        
        case 'applications-interviewing':
          return `<strong>Applications → Interviewing</strong><br/>
                  ${link.value.toLocaleString()} applications (${percentage}%) entered interview process<br/>
                  <em>Applications that progressed to interview stage</em>`;
        
        case 'applications-offers':
          return `<strong>Applications → Offers</strong><br/>
                  ${link.value.toLocaleString()} applications (${percentage}%) resulted in job offers<br/>
                  <em>Direct conversion from application to offer</em>`;
        
        case 'interviewing-interviewRecords':
          return `<strong>Interviewing → Interview Records</strong><br/>
                  ${link.value.toLocaleString()} total interviews scheduled<br/>
                  <em>Actual interview sessions for applications in interview process</em>`;
        
        case 'offers-declined':
          return `<strong>Offers → Declined</strong><br/>
                  ${link.value.toLocaleString()} offers were declined<br/>
                  <em>Job offers that were turned down</em>`;
        
        case 'offers-accepted':
          return `<strong>Offers → Accepted</strong><br/>
                  ${link.value.toLocaleString()} offers were accepted<br/>
                  <em>Job offers that resulted in employment</em>`;
        
        default:
          return `<strong>${link.source} → ${link.target}</strong><br/>
                  ${link.value.toLocaleString()} items<br/>
                  <em>Connection in application journey</em>`;
      }
    };

    // Draw flow paths with proper Sankey curves
    links.forEach((link, i) => {
      const pathData = createSankeyPath(link);
      if (!pathData) return;
      
      // Draw the base flow path (background)
      const basePath = chart
        .append('path')
        .attr('d', pathData.path)
        .attr('fill', `url(#flow-gradient-${i})`)
        .attr('stroke', 'none')
        .attr('opacity', 0)
        .transition()
        .delay(i * 100)
        .duration(500)
        .attr('opacity', 0.6);

      // Draw the animated electricity overlay
      const electricityPath = chart
        .append('path')
        .attr('d', pathData.path)
        .attr('fill', `url(#flowing-gradient-${i})`)
        .attr('stroke', `url(#electricity-pattern-${i})`)
        .attr('stroke-width', 2)
        .attr('class', 'electricity-path electricity-glow')
        .style('color', link.color) // Set color for CSS currentColor
        .attr('opacity', 0)
        .transition()
        .delay(i * 100 + 200)
        .duration(500)
        .attr('opacity', 0.8);

      // Add pulsing animation to the electricity path
      electricityPath
        .transition()
        .duration(3000)
        .ease(d3.easeSinInOut)
        .attr('opacity', 0.4)
        .transition()
        .duration(3000)
        .ease(d3.easeSinInOut)
        .attr('opacity', 0.8)
        .on('end', function repeat() {
          d3.select(this)
            .transition()
            .duration(3000)
            .ease(d3.easeSinInOut)
            .attr('opacity', 0.4)
            .transition()
            .duration(3000)
            .ease(d3.easeSinInOut)
            .attr('opacity', 0.8)
            .on('end', repeat);
        });

      // Add flowing spark particles
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      
      if (sourceNode && targetNode) {
        const sourceX = sourceNode.x + sourceNode.width;
        const sourceY = link.sourceY || (sourceNode.y + sourceNode.height / 2);
        const targetX = targetNode.x;
        const targetY = link.targetY || (targetNode.y + targetNode.height / 2);
        
        // Create 3-5 flowing spark particles per path
        const numSparks = Math.min(5, Math.max(3, Math.floor(link.value / 20)));
        
        for (let sparkIndex = 0; sparkIndex < numSparks; sparkIndex++) {
          const spark = chart
            .append('circle')
            .attr('r', 1.2)
            .attr('fill', '#ffffff')
            .attr('opacity', 0.9)
            .attr('class', 'flow-spark')
            .style('filter', `drop-shadow(0 0 4px ${link.color})`)
            .attr('cx', sourceX)
            .attr('cy', sourceY);

          // Animate spark along the bezier path
          const animateSpark = () => {
            spark
              .attr('cx', sourceX)
              .attr('cy', sourceY)
              .attr('opacity', 0)
              .transition()
              .delay(sparkIndex * 800 + Math.random() * 1500)
              .duration(200)
              .attr('opacity', 0.9)
              .transition()
              .duration(4000)
              .ease(d3.easeLinear)
              .attr('cx', targetX)
              .attr('cy', targetY)
              .transition()
              .duration(300)
              .attr('opacity', 0)
              .on('end', animateSpark); // Loop the animation
          };
          
          animateSpark();
        }
      }

      // Create invisible wider path for better hover detection
      const hoverPath = chart
        .append('path')
        .attr('d', pathData.path)
        .attr('fill', 'transparent')
        .attr('stroke', 'transparent')
        .attr('stroke-width', Math.max(20, pathData.strokeWidth + 10)) // Minimum 20px hover area
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          console.log('Hover detected on path:', link.source, '->', link.target); // Debug log
          
          // Show tooltip
          tooltip
            .style('visibility', 'visible')
            .html(getTooltipContent(link));
          
          // Intensify the electricity effect on hover
          basePath
            .transition()
            .duration(150)
            .attr('opacity', 0.9);
          
          electricityPath
            .transition()
            .duration(150)
            .attr('opacity', 1)
            .attr('stroke-width', 3);
        })
        .on('mousemove', function(event) {
          // Position tooltip directly on mouse cursor
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            tooltip
              .style('top', (event.clientY - rect.top + window.scrollY) + 'px')
              .style('left', (event.clientX - rect.left + window.scrollX) + 'px');
          }
        })
        .on('mouseout', function(event) {
          console.log('Mouse out from path:', link.source, '->', link.target); // Debug log
          
          // Hide tooltip
          tooltip.style('visibility', 'hidden');
          
          // Reset flow path opacity and effects
          basePath
            .transition()
            .duration(150)
            .attr('opacity', 0.6);

          electricityPath
            .transition()
            .duration(150)
            .attr('opacity', 0.8)
            .attr('stroke-width', 2);
        });
    });

    // Draw nodes
    const nodeGroups = chart
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // Node rectangles with rounded corners
    nodeGroups
      .append('rect')
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => d.color)
      .attr('opacity', 0.9)
      .attr('stroke', '#1f2937') // Dark border
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))')
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 1)
          .attr('stroke-width', 3)
          .style('filter', 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.9)
          .attr('stroke-width', 2)
          .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))');
      });

    // Node labels
    nodeGroups
      .append('text')
      .attr('x', d => d.width / 2)
      .attr('y', d => d.height / 2 - 8)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('class', 'text-sm font-semibold fill-white')
      .text(d => d.name);

    // Node values
    nodeGroups
      .append('text')
      .attr('x', d => d.width / 2)
      .attr('y', d => d.height / 2 + 8)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('class', 'text-xs font-bold fill-white')
      .text(d => d.value.toLocaleString());

    // Add conversion percentages
    const conversionData = [
      { label: 'Interview Status Rate', value: ((interviewingApplications / total) * 100).toFixed(1) + '%', x: chartWidth * 0.25, y: chartHeight - 10 },
      { label: 'Interview Records', value: totalInterviewRecords.toString(), x: chartWidth * 0.45, y: chartHeight - 10 },
      { label: 'Offer Rate', value: ((toOffers / total) * 100).toFixed(1) + '%', x: chartWidth * 0.65, y: chartHeight - 10 },
      { label: 'Success Rate', value: ((acceptedOffers / total) * 100).toFixed(1) + '%', x: chartWidth * 0.8, y: chartHeight - 10 }
    ];

    const metricsGroup = chart
      .selectAll('.metric')
      .data(conversionData)
      .enter()
      .append('g')
      .attr('class', 'metric')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    metricsGroup
      .append('rect')
      .attr('x', -25)
      .attr('y', -12)
      .attr('width', 50)
      .attr('height', 24)
      .attr('rx', 12)
      .attr('fill', colors.applications)
      .attr('opacity', 0.1);

    metricsGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -2)
      .attr('class', 'text-xs font-bold fill-light-text dark:fill-dark-text')
      .text(d => d.value);

    metricsGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 10)
      .attr('class', 'text-xs fill-light-text-secondary dark:fill-dark-text-secondary')
      .text(d => d.label);

  }, [stats, width, height]);

  return (
    <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-2xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
          Application Flow Analysis
        </h2>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Visual representation of your job application journey from submission to outcome
        </p>
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />

      {/* Summary metrics below the chart */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {stats.total}
          </div>
          <div className="text-xs text-blue-500 dark:text-blue-300">
            Total Applications
          </div>
        </div>
        
        <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {stats.currentStatusDistribution?.Interviewing || 0}
          </div>
          <div className="text-xs text-orange-500 dark:text-orange-300">
            Currently Interviewing
          </div>
        </div>
        
        <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {stats.interviewStats?.totalInterviews || 0}
          </div>
          <div className="text-xs text-purple-500 dark:text-purple-300">
            Total Interviews
          </div>
        </div>
        
        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {stats.successRate.toFixed(0)}%
          </div>
          <div className="text-xs text-green-500 dark:text-green-300">
            Success Rate
          </div>
        </div>
        
        <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {stats.averageResponseTime}d
          </div>
          <div className="text-xs text-amber-500 dark:text-amber-300">
            Avg Response Time
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFlowChart; 