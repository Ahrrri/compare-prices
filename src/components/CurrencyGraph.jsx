import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { createCurrencyGraph } from '../utils/graphPathfinder';
import './CurrencyGraph.css';

const CurrencyGraph = ({ 
  inputAmount,
  mesoMarketRates, 
  cashTradeRates, 
  solTradeRates,
  cashItemRates,
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
      cashItemRates,
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
        'NX': { x: 0.8 * width / 3, y: 300 },
        'MP': { x: (2.2 * width) / 3, y: 300 },
        'MESO_G1': { x: width / 6, y: 500 },
        'MESO_G2': { x: width / 2, y: 500 },
        'MESO_G3': { x: (5 * width) / 6, y: 500 },
        'SOL_G1': { x: width / 6, y: 650 },
        'SOL_G2': { x: width / 2.2, y: 650 },
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
      .data(["direct", "voucher", "mesomarket", "cashtrade", "cashitem", "soltrade"])
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
      .attr("fill", "#999"); // 모든 화살표 마커를 회색으로

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
      .attr("stroke-linecap", "round") // 호버링 인식 개선
      .attr("stroke", d => {
        const isHighlighted = isEdgeHighlighted(d);
        if (isHighlighted) {
          return "#FF1744"; // 하이라이트 색상 (빨간색)
        }
        // 하이라이트되지 않은 화살표는 모두 회색
        return "#999";
      })
      .attr("stroke-width", d => {
        const isHighlighted = isEdgeHighlighted(d);
        if (highlightedPath && highlightedPath.length > 0) {
          return isHighlighted ? 4 : 1; // 하이라이트된 것은 두껍게, 아닌 것은 얇게
        }
        return Math.max(2, d.efficiency / 25);
      })
      .attr("class", d => {
        const isHighlighted = isEdgeHighlighted(d);
        if (highlightedPath && highlightedPath.length > 0) {
          return isHighlighted ? "edge-highlighted" : "edge-dimmed";
        }
        return "";
      })
      .attr("opacity", d => {
        const isHighlighted = isEdgeHighlighted(d);
        if (highlightedPath && highlightedPath.length > 0) {
          return isHighlighted ? 1.0 : 0.05; // CSS와 동일하게 설정
        }
        return 0.8;
      })
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
        // 하이라이트된 경로가 있고, 현재 엣지가 하이라이트된 경우만 호버 효과
        if (!highlightedPath || !isEdgeHighlighted(d)) return;
        
        // 엣지 정보 툴팁만 표시 (선 두께 변경 없음)
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
              tooltipContent += `시세: ${d.rate.toLocaleString()} 메포/1억메소`;
            }
            break;
          case 'cashtrade':
            tooltipContent += `현금거래 (${d.fee}% 수수료)<br/>`;
            if (d.rate) {
              tooltipContent += `시세: ${d.rate.toLocaleString()} 원/1억메소`;
            }
            break;
          case 'cashitem':
            tooltipContent += `캐시템 경매장 (${d.fee}% 수수료)`;
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
        // 하이라이트된 경로가 있고, 현재 엣지가 하이라이트된 경우만 툴팁 숨김
        if (!highlightedPath || !isEdgeHighlighted(d)) return;
        
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // 화살표 렌더링 (6:4 위치에 고정)
    const arrows = edgeGroup
      .selectAll(".arrow")
      .data(edges)
      .enter()
      .append("polygon")
      .attr("class", "arrow")
      .attr("points", "0,-10 20,0 0,10") // 화살표 모양 (크기 증가)
      .attr("fill", d => {
        const isHighlighted = isEdgeHighlighted(d);
        if (isHighlighted) {
          return "#FF1744"; // 하이라이트 색상
        }
        // 하이라이트되지 않은 화살표는 모두 회색
        return "#999";
      })
      .attr("opacity", d => {
        const isHighlighted = isEdgeHighlighted(d);
        if (highlightedPath && highlightedPath.length > 0) {
          return isHighlighted ? 1.0 : 0.05;
        }
        return 0.8;
      })
      .attr("transform", d => {
        const sourceNode = nodes.find(n => n.id === d.source);
        const targetNode = nodes.find(n => n.id === d.target);
        if (!sourceNode || !targetNode) return "translate(0,0)";
        
        // 6:4 위치 계산 (시작점에서 60% 지점)
        const arrowX = sourceNode.x + (targetNode.x - sourceNode.x) * 0.6;
        const arrowY = sourceNode.y + (targetNode.y - sourceNode.y) * 0.6;
        
        // 화살표 회전 각도 계산
        const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x) * 180 / Math.PI;
        
        return `translate(${arrowX},${arrowY}) rotate(${angle})`;
      })
      .attr("class", d => {
        const isHighlighted = isEdgeHighlighted(d);
        if (highlightedPath && highlightedPath.length > 0) {
          return isHighlighted ? "arrow edge-highlighted" : "arrow edge-dimmed";
        }
        return "arrow";
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
        if (selectedNode && d.id === selectedNode.id) return "#E8F5E8"; // 시작점 배경
        if (selectedTarget && d.id === selectedTarget.id) return "#FFEBEE"; // 목표점 배경
        
        const isHighlighted = isNodeHighlighted(d);
        if (isHighlighted) {
          return "#FFEBEE"; // 하이라이트된 노드 배경
        }
        
        // 선택되지 않은 노드는 무색
        return "#F5F5F5";
      })
      .attr("stroke", d => {
        if (selectedNode && d.id === selectedNode.id) return "#4CAF50";
        if (selectedTarget && d.id === selectedTarget.id) return "#F44336";
        
        const isHighlighted = isNodeHighlighted(d);
        if (isHighlighted) {
          return "#FF1744"; // 하이라이트된 노드 테두리
        }
        
        // 선택되지 않은 노드는 회색
        return "#999";
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
      .text(d => d.name)
      .attr("class", d => {
        const isHighlighted = isNodeHighlighted(d);
        if (highlightedPath && highlightedPath.length > 0) {
          return isHighlighted ? "text-highlighted" : "text-dimmed";
        }
        return "";
      });

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

  }, [mesoMarketRates, cashTradeRates, solTradeRates, cashItemRates, mvpGrade, voucherDiscounts, exchangeOptions, inputAmount, selectedNode, selectedTarget, highlightedPath]);

  return (
    <div className="currency-graph-container">
      <svg ref={svgRef}></svg>
      <div className="currency-graph-legend">
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-indicator legend-direct"></span> 직접 변환
          </div>
          <div className="legend-item">
            <span className="legend-indicator legend-voucher"></span> 상품권 할인
          </div>
          <div className="legend-item">
            <span className="legend-indicator legend-meso-market"></span> 메소마켓
          </div>
          <div className="legend-item">
            <span className="legend-indicator legend-cash-trade"></span> 현금거래
          </div>
          <div className="legend-item">
            <span className="legend-indicator legend-cash-item"></span> 캐시템 경매장
          </div>
          <div className="legend-item">
            <span className="legend-indicator legend-sol-trade"></span> 솔 에르다 거래
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