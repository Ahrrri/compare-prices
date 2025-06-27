// 그래프 기반 경로 탐색 및 계산 유틸리티

// 그래프 구조 정의
export function createCurrencyGraph(settings) {
  const { mesoMarketRates, cashTradeRates, solTradeRates, cashItemRates, mvpGrade, voucherDiscounts, exchangeOptions } = settings;
  
  const nodes = [
    { id: 'KRW', name: '현금', type: 'currency' },
    { id: 'NX', name: '넥슨캐시', type: 'currency' },
    { id: 'MP', name: '메이플포인트', type: 'currency' },
    { id: 'MESO_G1', name: '일반섭 메소', type: 'meso', group: 'GROUP1' },
    { id: 'MESO_G2', name: '에오스 메소', type: 'meso', group: 'GROUP2' },
    { id: 'MESO_G3', name: '챌린저스 메소', type: 'meso', group: 'GROUP3' },
    { id: 'SOL_G1', name: '일반섭 조각', type: 'sol', group: 'GROUP1' },
    { id: 'SOL_G2', name: '에오스 조각', type: 'sol', group: 'GROUP2' },
    { id: 'SOL_G3', name: '챌린저스 조각', type: 'sol', group: 'GROUP3' }
  ];

  const edges = [];

  // 현금→넥슨캐시 최적 경로 선택 (상시 할인 vs 상품권 할인)
  const krwToNxOptions = [];
  
  // 상시 할인 (직접 변환) 옵션 추가
  if (exchangeOptions?.direct?.enabled) {
    krwToNxOptions.push({
      key: 'direct',
      name: '상시 할인',
      rate: 0,
      type: 'direct',
      priority: 1
    });
  }

  // 상품권 할인 옵션들 추가
  if (voucherDiscounts) {
    Object.entries(voucherDiscounts).forEach(([key, voucher]) => {
      if (voucher.enabled && voucher.rate > 0 && 
          (voucher.limit === 0 || voucher.remainingLimit > 0)) {
        krwToNxOptions.push({
          key,
          name: voucher.name,
          rate: voucher.rate,
          type: 'voucher',
          priority: key === 'nexon' ? 2 : key === 'book' ? 3 : key === 'culture' ? 4 : 999
        });
      }
    });
  }

  if (krwToNxOptions.length > 0) {
    // 할인율 우선, 할인율이 동일하면 우선순위 순
    const bestOption = krwToNxOptions.sort((a, b) => {
      // 할인율이 다르면 할인율 높은 순
      if (a.rate !== b.rate) return b.rate - a.rate;
      
      // 할인율이 동일하면 우선순위 순 (상시 할인 > 넥슨카드 > 도서문화 > 컬처랜드)
      return a.priority - b.priority;
    })[0];

    // 선택된 옵션에 따라 경로 추가
    if (bestOption.type === 'direct') {
      edges.push({ 
        from: 'KRW', 
        to: 'NX', 
        type: 'direct', 
        fee: 0, 
        description: '현금 → 넥슨캐시 (1:1)' 
      });
    } else {
      edges.push({
        from: 'KRW',
        to: 'NX',
        type: 'voucher',
        fee: -bestOption.rate,
        description: `${bestOption.name} 할인 (${bestOption.rate}% 할인)`,
        voucherKey: bestOption.key
      });
    }
  }

  // 넥슨캐시 → 메이플포인트 (직접 변환이 활성화된 경우)
  if (exchangeOptions?.direct?.enabled) {
    edges.push({ 
      from: 'NX', 
      to: 'MP', 
      type: 'direct', 
      fee: 0, 
      description: '넥슨캐시 → 메이플포인트 (1:1)' 
    });
  }

  // 메소마켓 경로들
  // MP → 메소 (구매 - 수수료 없음)
  if (exchangeOptions?.mesomarketBuy_G13?.enabled) {
    edges.push(
      { from: 'MP', to: 'MESO_G1', type: 'mesomarket', fee: 0, rate: mesoMarketRates.GROUP1_3.sell, description: '메소 구매 (수수료 없음)' },
      { from: 'MP', to: 'MESO_G3', type: 'mesomarket', fee: 0, rate: mesoMarketRates.GROUP1_3.sell, description: '메소 구매 (수수료 없음)' }
    );
  }
  if (exchangeOptions?.mesomarketBuy_G2?.enabled) {
    edges.push(
      { from: 'MP', to: 'MESO_G2', type: 'mesomarket', fee: 0, rate: mesoMarketRates.GROUP2.sell, description: '메소 구매 (수수료 없음)' }
    );
  }

  // 메소 → MP (판매 - 1% 수수료)
  if (exchangeOptions?.mesomarketSell_G13?.enabled) {
    edges.push(
      { from: 'MESO_G1', to: 'MP', type: 'mesomarket', fee: 1, rate: mesoMarketRates.GROUP1_3.buy, description: '메소 판매 (1% 수수료)' },
      { from: 'MESO_G3', to: 'MP', type: 'mesomarket', fee: 1, rate: mesoMarketRates.GROUP1_3.buy, description: '메소 판매 (1% 수수료)' }
    );
  }
  if (exchangeOptions?.mesomarketSell_G2?.enabled) {
    edges.push(
      { from: 'MESO_G2', to: 'MP', type: 'mesomarket', fee: 1, rate: mesoMarketRates.GROUP2.buy, description: '메소 판매 (1% 수수료)' }
    );
  }

  // 캐시템 경매장 경로들 (넥슨캐시 → 메소, 일방향만)
  const cashItemFeeRate = (mvpGrade === 'SILVER_PLUS') ? 3 : 5;
  
  // 각 그룹별로 효율 좋은 캐시템 선택 (상품권과 동일한 로직)
  ['GROUP1', 'GROUP2', 'GROUP3'].forEach((group, groupIndex) => {
    const groupNum = groupIndex + 1;
    const isEnabled = exchangeOptions?.[`cashItem_G${groupNum}`]?.enabled;
    
    if (cashItemRates && isEnabled && cashItemRates[group]?.items) {
      const availableItems = cashItemRates[group].items.filter(item => 
        item.remainingLimit > 0 &&
        item.meso > 0 && 
        item.nx > 0
      );
      
      if (availableItems.length > 0) {
        // 효율 순으로 정렬 (메소/넥슨캐시 비율이 높은 순)
        const sortedItems = availableItems.sort((a, b) => {
          const efficiencyA = (a.meso / a.nx) * (1 - cashItemFeeRate / 100);
          const efficiencyB = (b.meso / b.nx) * (1 - cashItemFeeRate / 100);
          return efficiencyB - efficiencyA;
        });
        
        // 가장 효율 좋은 아이템 선택
        const bestItem = sortedItems[0];
        
        edges.push({
          from: 'NX',
          to: `MESO_G${groupNum}`,
          type: 'cashitem',
          fee: cashItemFeeRate,
          mesoPerNx: bestItem.meso,
          nxAmount: bestItem.nx,
          itemName: bestItem.name,
          itemId: bestItem.id,
          limit: bestItem.limit,
          remainingLimit: bestItem.remainingLimit,
          description: `${bestItem.name} 판매 (판매자 ${cashItemFeeRate}% 수수료)`
        });
      }
    }
  });

  // 현금거래 경로들
  const cashTradeFeeRate = (mvpGrade === 'SILVER_PLUS') ? 3 : 5;
  
  // KRW → 메소 (구매)
  if (exchangeOptions?.cashtradeBuy_G1?.enabled) {
    edges.push(
      { from: 'KRW', to: 'MESO_G1', type: 'cashtrade', fee: cashTradeFeeRate, rate: cashTradeRates.GROUP1.buy, description: `메소 구매 (구매자 ${cashTradeFeeRate}% 수수료)` }
    );
  }
  if (exchangeOptions?.cashtradeBuy_G2?.enabled) {
    edges.push(
      { from: 'KRW', to: 'MESO_G2', type: 'cashtrade', fee: cashTradeFeeRate, rate: cashTradeRates.GROUP2.buy, description: `메소 구매 (구매자 ${cashTradeFeeRate}% 수수료)` }
    );
  }
  if (exchangeOptions?.cashtradeBuy_G3?.enabled) {
    edges.push(
      { from: 'KRW', to: 'MESO_G3', type: 'cashtrade', fee: cashTradeFeeRate, rate: cashTradeRates.GROUP3.buy, description: `메소 구매 (구매자 ${cashTradeFeeRate}% 수수료)` }
    );
  }

  // 메소 → KRW (판매)
  if (exchangeOptions?.cashtradeSell_G1?.enabled) {
    edges.push(
      { from: 'MESO_G1', to: 'KRW', type: 'cashtrade', fee: 0, rate: cashTradeRates.GROUP1.sell, description: '메소 판매 (판매자 수수료 없음)' }
    );
  }
  if (exchangeOptions?.cashtradeSell_G2?.enabled) {
    edges.push(
      { from: 'MESO_G2', to: 'KRW', type: 'cashtrade', fee: 0, rate: cashTradeRates.GROUP2.sell, description: '메소 판매 (판매자 수수료 없음)' }
    );
  }
  if (exchangeOptions?.cashtradeSell_G3?.enabled) {
    edges.push(
      { from: 'MESO_G3', to: 'KRW', type: 'cashtrade', fee: 0, rate: cashTradeRates.GROUP3.sell, description: '메소 판매 (판매자 수수료 없음)' }
    );
  }

  // 조각 거래 경로들
  if (solTradeRates) {
    const solMesoFeeRate = (mvpGrade === 'SILVER_PLUS') ? 3 : 5;
    
    // 현금 - 조각 거래
    if (exchangeOptions?.solCashBuy_G1?.enabled) {
      edges.push(
        { from: 'KRW', to: 'SOL_G1', type: 'soltrade', subtype: 'cash', fee: 0, rate: solTradeRates.cash.GROUP1.buy, description: '조각 구매' }
      );
    }
    if (exchangeOptions?.solCashSell_G1?.enabled) {
      edges.push(
        { from: 'SOL_G1', to: 'KRW', type: 'soltrade', subtype: 'cash', fee: 0, rate: solTradeRates.cash.GROUP1.sell, description: '조각 판매' }
      );
    }
    if (exchangeOptions?.solCashBuy_G2?.enabled) {
      edges.push(
        { from: 'KRW', to: 'SOL_G2', type: 'soltrade', subtype: 'cash', fee: 0, rate: solTradeRates.cash.GROUP2.buy, description: '조각 구매' }
      );
    }
    if (exchangeOptions?.solCashSell_G2?.enabled) {
      edges.push(
        { from: 'SOL_G2', to: 'KRW', type: 'soltrade', subtype: 'cash', fee: 0, rate: solTradeRates.cash.GROUP2.sell, description: '조각 판매' }
      );
    }
    if (exchangeOptions?.solCashBuy_G3?.enabled) {
      edges.push(
        { from: 'KRW', to: 'SOL_G3', type: 'soltrade', subtype: 'cash', fee: 0, rate: solTradeRates.cash.GROUP3.buy, description: '조각 구매' }
      );
    }
    if (exchangeOptions?.solCashSell_G3?.enabled) {
      edges.push(
        { from: 'SOL_G3', to: 'KRW', type: 'soltrade', subtype: 'cash', fee: 0, rate: solTradeRates.cash.GROUP3.sell, description: '조각 판매' }
      );
    }

    // 메소 - 조각 거래 (메소를 얻는 사람에게 수수료)
    if (exchangeOptions?.solMesoBuy_G1?.enabled) {
      edges.push(
        { from: 'MESO_G1', to: 'SOL_G1', type: 'soltrade', subtype: 'meso', fee: 0, rate: solTradeRates.meso.GROUP1.buy, description: '조각 구매 (조각 구매자 수수료 없음)' }
      );
    }
    if (exchangeOptions?.solMesoSell_G1?.enabled) {
      edges.push(
        { from: 'SOL_G1', to: 'MESO_G1', type: 'soltrade', subtype: 'meso', fee: solMesoFeeRate, rate: solTradeRates.meso.GROUP1.sell, description: `조각 판매 (조각 판매자 ${solMesoFeeRate}% 수수료)` }
      );
    }
    if (exchangeOptions?.solMesoBuy_G2?.enabled) {
      edges.push(
        { from: 'MESO_G2', to: 'SOL_G2', type: 'soltrade', subtype: 'meso', fee: 0, rate: solTradeRates.meso.GROUP2.buy, description: '조각 구매 (조각 구매자 수수료 없음)' }
      );
    }
    if (exchangeOptions?.solMesoSell_G2?.enabled) {
      edges.push(
        { from: 'SOL_G2', to: 'MESO_G2', type: 'soltrade', subtype: 'meso', fee: solMesoFeeRate, rate: solTradeRates.meso.GROUP2.sell, description: `조각 판매 (조각 판매자 ${solMesoFeeRate}% 수수료)` }
      );
    }
    if (exchangeOptions?.solMesoBuy_G3?.enabled) {
      edges.push(
        { from: 'MESO_G3', to: 'SOL_G3', type: 'soltrade', subtype: 'meso', fee: 0, rate: solTradeRates.meso.GROUP3.buy, description: '조각 구매 (조각 구매자 수수료 없음)' }
      );
    }
    if (exchangeOptions?.solMesoSell_G3?.enabled) {
      edges.push(
        { from: 'SOL_G3', to: 'MESO_G3', type: 'soltrade', subtype: 'meso', fee: solMesoFeeRate, rate: solTradeRates.meso.GROUP3.sell, description: `조각 판매 (조각 판매자 ${solMesoFeeRate}% 수수료)` }
      );
    }
  }

  return { nodes, edges };
}

// 경로 계산 함수
export function calculateConversion(fromAmount, edge) {
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
  
  if (type === 'cashitem') {
    // 넥슨캐시 → 메소 (캐시템 경매장)
    // 설정: X 메소 / Y 캐시, 구매자 수수료
    const { mesoPerNx, nxAmount, remainingLimit = Infinity } = edge;
    const mesoPerSingleNx = mesoPerNx / nxAmount;
    
    // 한도 제한 적용 (변환할 수 있는 최대 캐시 양 계산)
    const maxNxByLimit = remainingLimit * nxAmount;
    const actualNxUsed = Math.min(fromAmount, maxNxByLimit);
    
    return Math.floor(actualNxUsed * mesoPerSingleNx * (1 - fee / 100));
  }
  
  if (type === 'soltrade') {
    if (edge.subtype === 'cash') {
      if (edge.from === 'KRW') {
        // KRW → 조각 (개당 가격, 현금거래는 수수료 없음)
        return Math.floor(fromAmount / rate);
      } else {
        // 조각 → KRW (현금거래는 수수료 없음)
        return fromAmount * rate;
      }
    } else if (edge.subtype === 'meso') {
      if (edge.from.startsWith('MESO_')) {
        // 메소 → 조각 (개당 메소 가격, 조각 구매자는 수수료 없음)
        const solCount = Math.floor(fromAmount / rate);
        return solCount;
      } else {
        // 조각 → 메소 (조각 판매자가 수수료 부담)
        return Math.floor(fromAmount * rate * (1 - fee / 100));
      }
    }
  }
  
  return fromAmount;
}

// DFS로 모든 경로 탐색 (일반 변환용 - visited 사용)
export function findAllPaths(graph, fromNodeId, toNodeId, maxDepth = null, amount = 1) {
  const { nodes, edges } = graph;
  const paths = [];
  
  // 시작 금액
  const startAmount = amount;
  
  // 깊이 제한: 일반 변환은 노드 수 - 1로 충분
  const actualMaxDepth = maxDepth || (nodes.length - 1);
  
  // 무한동력 감지를 위한 임계값 (시작 금액의 10배)
  const arbitrageThreshold = startAmount * 10;
  
  function dfs(currentNodeId, targetNodeId, currentPath, currentAmount, visited, depth) {
    // 깊이 제한
    if (depth > actualMaxDepth) return;
    
    // 무한동력 감지: 현재 금액이 시작 금액의 10배를 넘으면 중단
    if (currentAmount > arbitrageThreshold) {
      console.warn(`무한동력 감지: 경로에서 금액이 ${currentAmount.toLocaleString()}로 비정상적으로 증가했습니다.`);
      return;
    }
    
    // 목표 노드에 도달한 경우
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
        
        // 계산 결과가 비정상적인지 확인
        if (newAmount <= 0 || !isFinite(newAmount)) {
          continue;
        }
        
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

// 순환 경로 전용 탐색 함수 (무한동력 감지용) - visited 사용
function findCyclePaths(graph, startNodeId, startAmount, maxDepth = 5) {
  const { edges } = graph;
  const paths = [];
  
  console.log(`🔍 ${getNodeDisplayName(startNodeId)}에서 사이클 탐색 시작`);
  
  function dfs(currentNodeId, targetNodeId, currentPath, currentAmount, visited, depth) {
    if (depth > maxDepth) return;
    
    // 목표 노드(시작점)에 도달했고, 최소 1단계 이상인 경우
    if (currentNodeId === targetNodeId && currentPath.length > 0) {
      const pathDesc = simplifyPath(currentPath);
      console.log(`🔄 사이클 발견: ${pathDesc}, 최종 금액: ${currentAmount.toLocaleString()}`);
      
      paths.push({
        steps: [...currentPath],
        finalAmount: currentAmount
      });
      return;
    }
    
    const outgoingEdges = edges.filter(edge => edge.from === currentNodeId);
    
    for (const edge of outgoingEdges) {
      // visited 체크: 시작점이 아닌 노드는 재방문 금지
      if (edge.to !== targetNodeId && visited.has(edge.to)) {
        continue;
      }
      
      const newAmount = calculateConversion(currentAmount, edge);
      
      if (newAmount <= 0 || !isFinite(newAmount)) {
        continue;
      }
      
      const step = {
        from: edge.from,
        to: edge.to,
        inputAmount: currentAmount,
        outputAmount: newAmount,
        edge: edge,
        description: edge.description
      };
      
      const newVisited = new Set(visited);
      if (edge.to !== targetNodeId) {
        newVisited.add(edge.to);
      }
      
      dfs(edge.to, targetNodeId, [...currentPath, step], newAmount, newVisited, depth + 1);
    }
  }
  
  const visited = new Set([startNodeId]);
  dfs(startNodeId, startNodeId, [], startAmount, visited, 0);
  
  console.log(`✅ ${getNodeDisplayName(startNodeId)} 사이클 탐색 완료: ${paths.length}개 발견`);
  return paths;
}

// 노드 ID를 사용자 친화적 이름으로 변환
function getNodeDisplayName(nodeId) {
  const nodeNames = {
    'KRW': '현금',
    'NX': '넥슨캐시',
    'MP': '메이플포인트',
    'MESO_G1': '일반섭 메소',
    'MESO_G2': '에오스 메소', 
    'MESO_G3': '챌린저스 메소',
    'SOL_G1': '일반섭 조각',
    'SOL_G2': '에오스 조각',
    'SOL_G3': '챌린저스 조각'
  };
  return nodeNames[nodeId] || nodeId;
}

// 간단한 사이클 유효성 검증
function isValidCycle(steps, startAmount, minProfitRate = 0.01) {
  if (steps.length === 0) return false;
  
  // 시작과 끝이 같은 노드인지 확인
  const startNode = steps[0].from;
  const endNode = steps[steps.length - 1].to;
  
  if (startNode !== endNode) {
    console.log(`❌ 사이클이 아님: ${getNodeDisplayName(startNode)} → ${getNodeDisplayName(endNode)}`);
    return false;
  }
  
  // 최종 금액 계산
  let currentAmount = startAmount;
  for (const step of steps) {
    currentAmount = calculateConversion(currentAmount, step.edge);
  }
  
  const profitRate = (currentAmount - startAmount) / startAmount;
  const isValid = profitRate > minProfitRate;
  
  console.log(`📊 사이클 검증: ${simplifyPath(steps)}, 수익률: ${(profitRate * 100).toFixed(2)}%, 유효: ${isValid ? '✅' : '❌'}`);
  
  return isValid;
}

// 사이클 경로 정규화 함수
function normalizeCyclePath(steps) {
  if (steps.length === 0) return '';
  
  // 1. 노드 시퀀스 추출 (마지막 노드는 첫 번째와 동일하므로 제외)
  const nodes = steps.map(step => step.from);
  
  console.log('원본 노드 시퀀스:', nodes.map(n => getNodeDisplayName(n)));
  
  // 2. 알파벳 순으로 가장 앞서는 노드의 인덱스 찾기
  let minIndex = 0;
  for (let i = 1; i < nodes.length; i++) {
    if (nodes[i] < nodes[minIndex]) {
      minIndex = i;
    }
  }
  
  // 3. 정규화된 순환 패턴 생성
  const normalizedNodes = [
    ...nodes.slice(minIndex),
    ...nodes.slice(0, minIndex)
  ];
  
  const normalizedKey = normalizedNodes.join('→');
  console.log('정규화된 키:', normalizedKey);
  console.log('정규화된 경로:', normalizedNodes.map(n => getNodeDisplayName(n)).join(' → '));
  
  return normalizedKey;
}

// 경로에서 연속된 중복 노드 제거 함수
function simplifyPath(steps) {
  if (steps.length === 0) return '';
  
  const simplifiedNodes = [getNodeDisplayName(steps[0].from)];
  
  for (const step of steps) {
    const toNode = getNodeDisplayName(step.to);
    // 이전 노드와 다른 경우에만 추가
    if (simplifiedNodes[simplifiedNodes.length - 1] !== toNode) {
      simplifiedNodes.push(toNode);
    }
  }
  
  return simplifiedNodes.join(' → ');
}

// 무한동력(arbitrage) 경로 감지 함수 (정규화 적용)
export function detectArbitrage(graph, startAmount = 1000000) {
  const { nodes } = graph;
  const validOpportunities = [];
  
  console.log('🔍 무한동력 감지 시작');
  
  // 각 노드에서 시작해서 같은 노드로 돌아오는 경로 찾기
  for (const node of nodes) {
    const cyclePaths = findCyclePaths(graph, node.id, startAmount);
    
    for (const path of cyclePaths) {
      // 사이클 유효성 검증 (1% 이상 이익)
      if (isValidCycle(path.steps, startAmount, 0.01)) {
        validOpportunities.push({
          startNode: node.id,
          startNodeDisplay: getNodeDisplayName(node.id),
          startAmount: startAmount,
          finalAmount: path.finalAmount,
          profit: path.finalAmount - startAmount,
          profitRate: ((path.finalAmount - startAmount) / startAmount * 100).toFixed(2),
          steps: path.steps,
          pathDescription: simplifyPath(path.steps),
          normalizedKey: normalizeCyclePath(path.steps)
        });
      }
    }
  }
  
  // 정규화된 키를 기준으로 중복 제거 (가장 높은 수익률을 가진 것만 유지)
  const normalizedMap = new Map();
  
  for (const opportunity of validOpportunities) {
    const key = opportunity.normalizedKey;
    
    if (!normalizedMap.has(key) || normalizedMap.get(key).profit < opportunity.profit) {
      console.log(`🔄 정규화 그룹 업데이트: ${key}, 수익: ${opportunity.profit.toLocaleString()}원`);
      normalizedMap.set(key, opportunity);
    } else {
      console.log(`❌ 중복 제거: ${opportunity.pathDescription} (더 낮은 수익)`);
    }
  }
  
  const uniqueOpportunities = Array.from(normalizedMap.values());
  
  console.log(`✅ 무한동력 감지 완료: ${uniqueOpportunities.length}개 고유 패턴 발견`);
  
  // 이익이 큰 순서대로 정렬
  return uniqueOpportunities.sort((a, b) => b.profit - a.profit);
}

// 최적 경로들 선별 (효율성 순으로 정렬)
export function getBestPaths(allPaths) {
  // 최종 금액 기준으로 정렬 (이미 실제 금액으로 계산되어 있음)
  return allPaths.sort((a, b) => b.finalAmount - a.finalAmount);
}

// 숫자 포맷팅 함수
export function formatNumber(num, type = 'default') {
  // 타입별 반올림 처리
  let roundedNum = num;
  
  if (type === 'currency') {
    // 현금/넥슨캐시/메이플포인트: 1원 단위까지
    roundedNum = Math.round(num);
  } else if (type === 'meso') {
    // 메소: 만 메소 단위까지
    roundedNum = Math.round(num / 10000) * 10000;
  } else if (type === 'sol') {
    // 조각: 개수 단위로 표시
    return `${Math.floor(num).toLocaleString()}개`;
  } else {
    // 기본: 소수점 2자리까지
    roundedNum = Math.round(num * 100) / 100;
  }
  
  if (roundedNum >= 100000000) {
    const billions = Math.floor(roundedNum / 100000000);
    const remainder = roundedNum % 100000000;
    if (remainder === 0) {
      return `${billions}억`;
    } else if (remainder >= 10000) {
      const tenThousands = Math.floor(remainder / 10000);
      const lastRemainder = remainder % 10000;
      if (lastRemainder === 0) {
        return `${billions}억 ${tenThousands}만`;
      } else {
        return `${billions}억 ${tenThousands}만 ${lastRemainder}`;
      }
    } else {
      return `${billions}억 ${remainder}`;
    }
  } else if (roundedNum >= 10000) {
    const tenThousands = Math.floor(roundedNum / 10000);
    const remainder = roundedNum % 10000;
    if (remainder === 0) {
      return `${tenThousands}만`;
    } else {
      return `${tenThousands}만 ${remainder}`;
    }
  }
  return roundedNum.toLocaleString();
}