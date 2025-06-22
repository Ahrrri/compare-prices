// 그래프 기반 경로 탐색 및 계산 유틸리티

// 그래프 구조 정의
export function createCurrencyGraph(settings) {
  const { mesoMarketRates, cashTradeRates, solTradeRates, mvpGrade, voucherDiscounts, exchangeOptions } = settings;
  
  const nodes = [
    { id: 'KRW', name: '현금', type: 'currency' },
    { id: 'NX', name: '넥슨캐시', type: 'currency' },
    { id: 'MP', name: '메이플포인트', type: 'currency' },
    { id: 'MESO_G1', name: '일반섭 메소', type: 'meso', group: 'GROUP1' },
    { id: 'MESO_G2', name: '에오스 메소', type: 'meso', group: 'GROUP2' },
    { id: 'MESO_G3', name: '챌린저스 메소', type: 'meso', group: 'GROUP3' },
    { id: 'SOL_G1', name: '일반섭 솔 에르다 조각', type: 'sol', group: 'GROUP1' },
    { id: 'SOL_G2', name: '에오스 솔 에르다 조각', type: 'sol', group: 'GROUP2' },
    { id: 'SOL_G3', name: '챌린저스 솔 에르다 조각', type: 'sol', group: 'GROUP3' }
  ];

  const edges = [];

  // 직접 변환 경로들
  if (exchangeOptions?.direct?.enabled) {
    edges.push(
      { from: 'KRW', to: 'NX', type: 'direct', fee: 0, description: '현금 → 넥슨캐시 (1:1)' },
      { from: 'NX', to: 'MP', type: 'direct', fee: 0, description: '넥슨캐시 → 메이플포인트 (1:1)' }
    );
  }

  // 상품권 할인 경로
  if (voucherDiscounts) {
    // 각 상품권별로 활성화된 경우만 추가
    Object.entries(voucherDiscounts).forEach(([key, voucher]) => {
      if (voucher.enabled && voucher.rate > 0) {
        // 한도가 있는 경우 남은 한도 확인
        if (voucher.limit === 0 || voucher.remainingLimit > 0) {
          edges.push({
            from: 'KRW',
            to: 'NX',
            type: 'voucher',
            fee: -voucher.rate,
            description: `${voucher.name} 할인 (${voucher.rate}% 할인)`,
            voucherKey: key
          });
        }
      }
    });
  }

  // 메소마켓 경로들
  // MP → 메소 (구매 - 수수료 없음)
  if (exchangeOptions?.mesomarketBuy_G13?.enabled) {
    edges.push(
      { from: 'MP', to: 'MESO_G1', type: 'mesomarket', fee: 0, rate: mesoMarketRates.GROUP1_3, description: '메소마켓 구매 (수수료 없음)' },
      { from: 'MP', to: 'MESO_G3', type: 'mesomarket', fee: 0, rate: mesoMarketRates.GROUP1_3, description: '메소마켓 구매 (수수료 없음)' }
    );
  }
  if (exchangeOptions?.mesomarketBuy_G2?.enabled) {
    edges.push(
      { from: 'MP', to: 'MESO_G2', type: 'mesomarket', fee: 0, rate: mesoMarketRates.GROUP2, description: '메소마켓 구매 (수수료 없음)' }
    );
  }

  // 메소 → MP (판매 - 1% 수수료)
  if (exchangeOptions?.mesomarketSell_G13?.enabled) {
    edges.push(
      { from: 'MESO_G1', to: 'MP', type: 'mesomarket', fee: 1, rate: mesoMarketRates.GROUP1_3, description: '메소마켓 판매 (1% 수수료)' },
      { from: 'MESO_G3', to: 'MP', type: 'mesomarket', fee: 1, rate: mesoMarketRates.GROUP1_3, description: '메소마켓 판매 (1% 수수료)' }
    );
  }
  if (exchangeOptions?.mesomarketSell_G2?.enabled) {
    edges.push(
      { from: 'MESO_G2', to: 'MP', type: 'mesomarket', fee: 1, rate: mesoMarketRates.GROUP2, description: '메소마켓 판매 (1% 수수료)' }
    );
  }

  // 현금거래 경로들
  const cashTradeFeeRate = (mvpGrade === 'SILVER_PLUS') ? 3 : 5;
  
  // KRW → 메소 (구매)
  if (exchangeOptions?.cashtradeBuy_G1?.enabled) {
    edges.push(
      { from: 'KRW', to: 'MESO_G1', type: 'cashtrade', fee: cashTradeFeeRate, rate: cashTradeRates.GROUP1, description: `현금거래 구매 (구매자 ${cashTradeFeeRate}% 수수료)` }
    );
  }
  if (exchangeOptions?.cashtradeBuy_G2?.enabled) {
    edges.push(
      { from: 'KRW', to: 'MESO_G2', type: 'cashtrade', fee: cashTradeFeeRate, rate: cashTradeRates.GROUP2, description: `현금거래 구매 (구매자 ${cashTradeFeeRate}% 수수료)` }
    );
  }
  if (exchangeOptions?.cashtradeBuy_G3?.enabled) {
    edges.push(
      { from: 'KRW', to: 'MESO_G3', type: 'cashtrade', fee: cashTradeFeeRate, rate: cashTradeRates.GROUP3, description: `현금거래 구매 (구매자 ${cashTradeFeeRate}% 수수료)` }
    );
  }

  // 메소 → KRW (판매)
  if (exchangeOptions?.cashtradeSell_G1?.enabled) {
    edges.push(
      { from: 'MESO_G1', to: 'KRW', type: 'cashtrade', fee: 0, rate: cashTradeRates.GROUP1, description: '현금거래 판매 (판매자 수수료 없음)' }
    );
  }
  if (exchangeOptions?.cashtradeSell_G2?.enabled) {
    edges.push(
      { from: 'MESO_G2', to: 'KRW', type: 'cashtrade', fee: 0, rate: cashTradeRates.GROUP2, description: '현금거래 판매 (판매자 수수료 없음)' }
    );
  }
  if (exchangeOptions?.cashtradeSell_G3?.enabled) {
    edges.push(
      { from: 'MESO_G3', to: 'KRW', type: 'cashtrade', fee: 0, rate: cashTradeRates.GROUP3, description: '현금거래 판매 (판매자 수수료 없음)' }
    );
  }

  // 솔 에르다 조각 거래 경로들
  if (solTradeRates) {
    const solMesoFeeRate = (mvpGrade === 'SILVER_PLUS') ? 3 : 5;
    
    // 현금 - 솔 에르다 거래
    if (exchangeOptions?.solCashBuy_G1?.enabled) {
      edges.push(
        { from: 'KRW', to: 'SOL_G1', type: 'soltrade', subtype: 'cash', fee: 0, rate: solTradeRates.cash.GROUP1, description: '솔 에르다 현금거래 구매' }
      );
    }
    if (exchangeOptions?.solCashSell_G1?.enabled) {
      edges.push(
        { from: 'SOL_G1', to: 'KRW', type: 'soltrade', subtype: 'cash', fee: 0, rate: solTradeRates.cash.GROUP1, description: '솔 에르다 현금거래 판매' }
      );
    }
    if (exchangeOptions?.solCashBuy_G2?.enabled) {
      edges.push(
        { from: 'KRW', to: 'SOL_G2', type: 'soltrade', subtype: 'cash', fee: 0, rate: solTradeRates.cash.GROUP2, description: '솔 에르다 현금거래 구매' }
      );
    }
    if (exchangeOptions?.solCashSell_G2?.enabled) {
      edges.push(
        { from: 'SOL_G2', to: 'KRW', type: 'soltrade', subtype: 'cash', fee: 0, rate: solTradeRates.cash.GROUP2, description: '솔 에르다 현금거래 판매' }
      );
    }
    if (exchangeOptions?.solCashBuy_G3?.enabled) {
      edges.push(
        { from: 'KRW', to: 'SOL_G3', type: 'soltrade', subtype: 'cash', fee: 0, rate: solTradeRates.cash.GROUP3, description: '솔 에르다 현금거래 구매' }
      );
    }
    if (exchangeOptions?.solCashSell_G3?.enabled) {
      edges.push(
        { from: 'SOL_G3', to: 'KRW', type: 'soltrade', subtype: 'cash', fee: 0, rate: solTradeRates.cash.GROUP3, description: '솔 에르다 현금거래 판매' }
      );
    }

    // 메소 - 솔 에르다 거래 (메소 구매자에게만 수수료)
    if (exchangeOptions?.solMesoBuy_G1?.enabled) {
      edges.push(
        { from: 'MESO_G1', to: 'SOL_G1', type: 'soltrade', subtype: 'meso', fee: solMesoFeeRate, rate: solTradeRates.meso.GROUP1, description: `솔 에르다 메소거래 구매 (구매자 ${solMesoFeeRate}% 수수료)` }
      );
    }
    if (exchangeOptions?.solMesoSell_G1?.enabled) {
      edges.push(
        { from: 'SOL_G1', to: 'MESO_G1', type: 'soltrade', subtype: 'meso', fee: 0, rate: solTradeRates.meso.GROUP1, description: '솔 에르다 메소거래 판매 (판매자 수수료 없음)' }
      );
    }
    if (exchangeOptions?.solMesoBuy_G2?.enabled) {
      edges.push(
        { from: 'MESO_G2', to: 'SOL_G2', type: 'soltrade', subtype: 'meso', fee: solMesoFeeRate, rate: solTradeRates.meso.GROUP2, description: `솔 에르다 메소거래 구매 (구매자 ${solMesoFeeRate}% 수수료)` }
      );
    }
    if (exchangeOptions?.solMesoSell_G2?.enabled) {
      edges.push(
        { from: 'SOL_G2', to: 'MESO_G2', type: 'soltrade', subtype: 'meso', fee: 0, rate: solTradeRates.meso.GROUP2, description: '솔 에르다 메소거래 판매 (판매자 수수료 없음)' }
      );
    }
    if (exchangeOptions?.solMesoBuy_G3?.enabled) {
      edges.push(
        { from: 'MESO_G3', to: 'SOL_G3', type: 'soltrade', subtype: 'meso', fee: solMesoFeeRate, rate: solTradeRates.meso.GROUP3, description: `솔 에르다 메소거래 구매 (구매자 ${solMesoFeeRate}% 수수료)` }
      );
    }
    if (exchangeOptions?.solMesoSell_G3?.enabled) {
      edges.push(
        { from: 'SOL_G3', to: 'MESO_G3', type: 'soltrade', subtype: 'meso', fee: 0, rate: solTradeRates.meso.GROUP3, description: '솔 에르다 메소거래 판매 (판매자 수수료 없음)' }
      );
    }
  }

  return { nodes, edges };
}

// 경로 계산 함수
export function calculateConversion(fromAmount, edge, settings) {
  const { fee, rate, type } = edge;
  
  if (type === 'direct') {
    // 1:1 직접 변환
    return fromAmount * (1 - fee / 100);
  }
  
  if (type === 'voucher') {
    // 상품권 할인: 할인율만큼 적게 지불하여 더 많은 양 구매
    // 예: 5% 할인 시 95,000원으로 100,000 넥슨캐시 구매
    // 즉, 95,000원 → 100,000 넥슨캐시 = 95,000 / (1 - 0.05)
    return fromAmount / (1 - Math.abs(fee) / 100);
  }
  
  if (type === 'mesomarket') {
    if (edge.from === 'MP') {
      // MP → 메소
      return (fromAmount / rate) * 100000000 * (1 - fee / 100);
    } else {
      // 메소 → MP
      return (fromAmount / 100000000) * rate * (1 - fee / 100);
    }
  }
  
  if (type === 'cashtrade') {
    if (edge.from === 'KRW') {
      // KRW → 메소
      return (fromAmount / rate) * 100000000 * (1 - fee / 100);
    } else {
      // 메소 → KRW
      return (fromAmount / 100000000) * rate * (1 - fee / 100);
    }
  }
  
  if (type === 'soltrade') {
    if (edge.subtype === 'cash') {
      if (edge.from === 'KRW') {
        // KRW → 솔 에르다 (개당 가격)
        return Math.floor(fromAmount / rate) * (1 - fee / 100);
      } else {
        // 솔 에르다 → KRW
        return fromAmount * rate * (1 - fee / 100);
      }
    } else if (edge.subtype === 'meso') {
      if (edge.from.startsWith('MESO_')) {
        // 메소 → 솔 에르다 (개당 메소 가격)
        return Math.floor(fromAmount / rate) * (1 - fee / 100);
      } else {
        // 솔 에르다 → 메소
        return fromAmount * rate * (1 - fee / 100);
      }
    }
  }
  
  return fromAmount;
}

// DFS로 모든 경로 탐색
export function findAllPaths(graph, fromNodeId, toNodeId, maxDepth = 4, testAmount = null) {
  const { nodes, edges } = graph;
  const paths = [];
  
  // 솔 에르다 관련 경로인지 확인
  const isSolPath = fromNodeId.includes('SOL') || toNodeId.includes('SOL');
  
  // 시작 금액 설정: 솔 에르다 경로는 실제 금액 사용, 그 외는 정규화
  const startAmount = isSolPath && testAmount ? testAmount : 1;
  
  function dfs(currentNodeId, targetNodeId, currentPath, currentAmount, visited, depth) {
    if (depth > maxDepth) return;
    
    if (currentNodeId === targetNodeId) {
      paths.push({
        steps: [...currentPath],
        finalAmount: currentAmount
      });
      return;
    }
    
    // 현재 노드에서 나가는 엣지들 찾기
    const outgoingEdges = edges.filter(edge => edge.from === currentNodeId);
    
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.to)) {
        const newAmount = calculateConversion(currentAmount, edge);
        const newVisited = new Set(visited);
        newVisited.add(edge.to);
        
        const step = {
          from: edge.from,
          to: edge.to,
          inputAmount: currentAmount,
          outputAmount: newAmount,
          edge: edge,
          description: edge.description
        };
        
        dfs(edge.to, targetNodeId, [...currentPath, step], newAmount, newVisited, depth + 1);
      }
    }
  }
  
  const visited = new Set([fromNodeId]);
  dfs(fromNodeId, toNodeId, [], startAmount, visited, 0);
  
  return paths;
}

// 최적 경로들 선별 (상위 5개)
export function getBestPaths(allPaths, actualAmount, isSolPath = false) {
  // 최종 금액 기준으로 정렬
  const sortedPaths = allPaths
    .map(path => {
      // 솔 에르다 경로는 이미 실제 금액으로 계산되어 있음
      if (isSolPath) {
        return path;
      }
      
      // 일반 경로는 실제 금액 적용
      return {
        ...path,
        finalAmount: path.finalAmount * actualAmount,
        steps: path.steps.map(step => ({
          ...step,
          inputAmount: step.inputAmount * actualAmount,
          outputAmount: step.outputAmount * actualAmount
        }))
      };
    })
    .sort((a, b) => b.finalAmount - a.finalAmount);
  
  return sortedPaths.slice(0, 5);
}