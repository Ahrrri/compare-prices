import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { createCurrencyGraph } from '../utils/graphPathfinder';
import './CurrencyGraph.css';

const CurrencyGraph = ({ 
  inputAmount,
  mesoMarketRates, 
  cashTradeRates, 
  solTradeRates,
  mvpGrade, 
  voucherDiscounts,
  exchangeOptions,
  onNodeSelect,
  selectedNode,
  selectedTarget,
  highlightedPath
}) => {
  const svgRef = useRef();

  // 그래프 데이터 생성
  const createGraphData = () => {
    const settings = {
      mesoMarketRates,
      cashTradeRates,
      solTradeRates,
      mvpGrade,
      voucherDiscounts,
      exchangeOptions
    };
    
    const graph = createCurrencyGraph(settings);
    
    // 엣지를 D3 형식으로 변환 (추가 정보 포함)
    const edgesForD3 = graph.edges.map(edge => ({
      source: edge.from,
      target: edge.to,
      type: edge.type,
      efficiency: edge.fee <= 0 ? 100 + Math.abs(edge.fee) : 100 - edge.fee,
      fee: edge.fee,
      rate: edge.rate, // 설정 비율 정보
      description: edge.description
    }));
    
    return { nodes: graph.nodes, edges: edgesForD3 };
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // 기존 툴팁 제거
    d3.selectAll(".tooltip").remove();

    const width = 1000;
    const height = 700;
    
    svg
      .attr("width", width)
      .attr("height", 800)
      .attr("class", "currency-graph-svg");

    const { nodes, edges } = createGraphData();

    // 노드 위치 설정 (고정 레이아웃)
    nodes.forEach(node => {
      const positions = {
        'KRW': { x: width / 2, y: 150 },
        'NX': { x: width / 3, y: 300 },
        'MP': { x: (2 * width) / 3, y: 300 },
        'MESO_G1': { x: width / 6, y: 500 },
        'MESO_G2': { x: width / 2, y: 500 },
        'MESO_G3': { x: (5 * width) / 6, y: 500 },
        'SOL_G1': { x: width / 6, y: 650 },
        'SOL_G2': { x: width / 2, y: 650 },
        'SOL_G3': { x: (5 * width) / 6, y: 650 }
      };
      const pos = positions[node.id] || { x: width / 2, y: 350 };
      node.x = pos.x;
      node.y = pos.y;
      node.fx = pos.x; // 고정 위치
      node.fy = pos.y;
    });

    // 노드 그룹 생성
    const nodeGroup = svg.append("g").attr("class", "nodes");
    const edgeGroup = svg.append("g").attr("class", "edges");

    // 화살표 마커 정의
    svg.append("defs").selectAll("marker")
      .data(["direct", "voucher", "mesomarket", "cashtrade", "soltrade"])
      .enter().append("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 55) // 노드 반지름(45) + 마진(10)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", d => {
        switch(d) {
          case 'direct': return "#2196F3";
          case 'voucher': return "#4CAF50";
          case 'mesomarket': return "#FF9800";
          case 'cashtrade': return "#F44336";
          case 'soltrade': return "#9C27B0";
          default: return "#999";
        }
      });

    // 하이라이트된 경로 확인 함수
    const isEdgeHighlighted = (edge) => {
      if (!highlightedPath) return false;
      return highlightedPath.some(step => 
        step.from === edge.source && step.to === edge.target
      );
    };

    // 엣지 렌더링 (directed)
    const links = edgeGroup
      .selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .attr("stroke", d => {
        const isHighlighted = isEdgeHighlighted(d);
        if (isHighlighted) {
          return "#FF1744"; // 하이라이트 색상 (빨간색)
        }
        switch(d.type) {
          case 'direct': return "#2196F3";
          case 'voucher': return "#4CAF50";
          case 'mesomarket': return "#FF9800";
          case 'cashtrade': return "#F44336";
          case 'soltrade': return "#9C27B0";
          default: return "#999";
        }
      })
      .attr("stroke-width", d => {
        const isHighlighted = isEdgeHighlighted(d);
        return isHighlighted ? 4 : Math.max(2, d.efficiency / 25);
      })
      .attr("opacity", d => {
        const isHighlighted = isEdgeHighlighted(d);
        if (highlightedPath) {
          return isHighlighted ? 1.0 : 0.3; // 하이라이트된 것만 선명하게
        }
        return 0.8;
      })
      .attr("marker-end", d => `url(#arrow-${d.type})`)
      .attr("x1", d => {
        const sourceNode = nodes.find(n => n.id === d.source);
        return sourceNode ? sourceNode.x : 0;
      })
      .attr("y1", d => {
        const sourceNode = nodes.find(n => n.id === d.source);
        return sourceNode ? sourceNode.y : 0;
      })
      .attr("x2", d => {
        const targetNode = nodes.find(n => n.id === d.target);
        return targetNode ? targetNode.x : 0;
      })
      .attr("y2", d => {
        const targetNode = nodes.find(n => n.id === d.target);
        return targetNode ? targetNode.y : 0;
      })
      .on("mouseover", function(event, d) {
        // 엣지 하이라이트
        d3.select(this)
          .attr("stroke-width", d => {
            const isHighlighted = isEdgeHighlighted(d);
            return isHighlighted ? 5 : Math.max(3, d.efficiency / 20);
          });
        
        // 엣지 정보 툴팁
        const sourceNode = nodes.find(n => n.id === d.source);
        const targetNode = nodes.find(n => n.id === d.target);
        let tooltipContent = `<strong>${sourceNode?.name} → ${targetNode?.name}</strong><br/>`;
        
        switch(d.type) {
          case 'direct':
            tooltipContent += '직접 변환 (1:1)';
            break;
          case 'voucher':
            tooltipContent += `상품권 할인 (${Math.abs(d.fee)}% 할인)`;
            break;
          case 'mesomarket':
            tooltipContent += `메소마켓 (${d.fee}% 수수료)<br/>`;
            if (d.rate) {
              tooltipContent += `시세: ${d.rate.toLocaleString()} MP/1억메소`;
            }
            break;
          case 'cashtrade':
            tooltipContent += `현금거래 (${d.fee}% 수수료)<br/>`;
            if (d.rate) {
              tooltipContent += `시세: ${d.rate.toLocaleString()} 원/1억메소`;
            }
            break;
          case 'soltrade':
            tooltipContent += `솔 에르다 거래 (${d.fee}% 수수료)<br/>`;
            if (d.rate) {
              tooltipContent += `시세: ${d.rate.toLocaleString()} 원/솔 에르다`;
            }
            break;
        }
        
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(tooltipContent)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(event, d) {
        // 엣지 원상복구
        d3.select(this)
          .attr("stroke-width", d => {
            const isHighlighted = isEdgeHighlighted(d);
            return isHighlighted ? 4 : Math.max(2, d.efficiency / 25);
          });
        
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // 노드 렌더링
    const nodeElements = nodeGroup
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer");

    // 하이라이트된 경로에 포함된 노드 확인 함수
    const isNodeHighlighted = (node) => {
      if (!highlightedPath) return false;
      return highlightedPath.some(step => 
        step.from === node.id || step.to === node.id
      );
    };

    // 노드 원형
    nodeElements
      .append("circle")
      .attr("r", 45)
      .attr("fill", d => {
        const isHighlighted = isNodeHighlighted(d);
        if (isHighlighted) {
          return "#FFEBEE"; // 하이라이트된 노드 배경
        }
        switch(d.type) {
          case 'currency': return "#E3F2FD";
          case 'meso': return "#FFF3E0";
          case 'sol': return "#F3E5F5";
          default: return "#F5F5F5";
        }
      })
      .attr("stroke", d => {
        if (selectedNode && d.id === selectedNode.id) return "#4CAF50";
        if (selectedTarget && d.id === selectedTarget.id) return "#F44336";
        
        const isHighlighted = isNodeHighlighted(d);
        if (isHighlighted) {
          return "#FF1744"; // 하이라이트된 노드 테두리
        }
        
        switch(d.type) {
          case 'currency': return "#2196F3";
          case 'meso': return "#FF9800";
          case 'sol': return "#9C27B0";
          default: return "#999";
        }
      })
      .attr("stroke-width", d => {
        if ((selectedNode && d.id === selectedNode.id) || (selectedTarget && d.id === selectedTarget.id)) {
          return 4;
        }
        const isHighlighted = isNodeHighlighted(d);
        return isHighlighted ? 3 : 2;
      })
      .attr("opacity", d => {
        if (highlightedPath) {
          const isHighlighted = isNodeHighlighted(d);
          return isHighlighted ? 1.0 : 0.6; // 하이라이트된 것만 선명하게
        }
        return 1.0;
      });

    // 노드 텍스트
    nodeElements
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(d => d.name);

    // 노드 클릭 이벤트
    nodeElements.on("click", (event, d) => {
      if (onNodeSelect) {
        onNodeSelect(d);
      }
    });

    // 툴팁 생성
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");

    // 노드 호버 효과
    nodeElements
      .on("mouseover", function(event, d) {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", 50)
          .attr("stroke-width", 3);
        
        // 툴팁 표시
        let tooltipContent = `<strong>${d.name}</strong><br/>`;
        if (d.type === 'currency') {
          tooltipContent += '화폐 타입';
        } else if (d.type === 'meso') {
          tooltipContent += `메소 (${d.group})`;
        } else if (d.type === 'sol') {
          tooltipContent += `솔 에르다 조각 (${d.group})`;
        }
        
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(tooltipContent)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", 45)
          .attr("stroke-width", d => {
            if ((selectedNode && d.id === selectedNode.id) || (selectedTarget && d.id === selectedTarget.id)) {
              return 4;
            }
            const isHighlighted = isNodeHighlighted(d);
            return isHighlighted ? 3 : 2;
          });
        
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // 컴포넌트 언마운트 시 툴팁 제거
    return () => {
      tooltip.remove();
    };

  }, [mesoMarketRates, cashTradeRates, solTradeRates, mvpGrade, voucherDiscounts, exchangeOptions, inputAmount, selectedNode, selectedTarget, highlightedPath]);

  return (
    <div className="currency-graph-container">
      <svg ref={svgRef}></svg>
      <div className="currency-graph-legend">
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-indicator legend-direct">■</span> 직접 변환
          </div>
          <div className="legend-item">
            <span className="legend-indicator legend-voucher">■</span> 상품권 할인
          </div>
          <div className="legend-item">
            <span className="legend-indicator legend-meso-market">■</span> 메소마켓
          </div>
          <div className="legend-item">
            <span className="legend-indicator legend-cash-trade">■</span> 현금거래
          </div>
          <div className="legend-item">
            <span className="legend-indicator legend-sol-trade">■</span> 솔 에르다 거래
          </div>
        </div>
        <div className="legend-indicators">
          <span className="legend-start-point">●</span> 시작점 | 
          <span className="legend-target-point">●</span> 목표점
        </div>
      </div>
    </div>
  );
};

export default CurrencyGraph;