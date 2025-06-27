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
      const voucherInfo = voucherDiscounts[bestOption.key];
      edges.push({
        from: 'KRW',
        to: 'NX',
        type: 'voucher',
        fee: -bestOption.rate,
        description: `${bestOption.name} 할인 (${bestOption.rate}% 할인)`,
        voucherKey: bestOption.key,
        remainingLimit: voucherInfo?.remainingLimit || 0
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
  
  // 각 그룹별로 캐시템 처리 (개별 아이템 + 마일리지 비율별 엣지 생성)
  ['GROUP1', 'GROUP2', 'GROUP3'].forEach((group, groupIndex) => {
    const groupNum = groupIndex + 1;
    const isEnabled = exchangeOptions?.[`cashItem_G${groupNum}`]?.enabled;
    
    if (cashItemRates && isEnabled && cashItemRates[group]?.items) {
      const availableItems = cashItemRates[group].items.filter(item => 
        item.remainingLimit > 0 &&
        item.meso > 0 && 
        item.nx > 0 &&
        item.availableMileageRatios && item.availableMileageRatios.length > 0
      );
      
      // 각 아이템별로 개별 엣지 생성
      availableItems.forEach(item => {
        // 아이템이 지원하는 각 마일리지 비율별로 엣지 생성
        item.availableMileageRatios.forEach(mileageRatio => {
          const mileageText = mileageRatio === 0 ? '' : ` (마일리지 ${mileageRatio}%)`;
          
          edges.push({
            from: 'NX',
            to: `MESO_G${groupNum}`,
            type: 'cashitem_single',
            fee: cashItemFeeRate,
            item: item,
            mileageRatio: mileageRatio,
            availableMileage: settings.availableMileage || 0,
            mileageRate: settings.mileageRates?.[group] || 70,
            description: `${item.name}${mileageText}`
          });
        });
      });
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

/**
 * 개별 캐시템 변환 함수 (단일 아이템 + 고정 마일리지 비율)
 * @param {number} nxAmount - 사용할 넥슨캐시 양
 * @param {object} edge - 캐시템 엣지 정보 (단일 아이템)
 * @returns {object} { meso: 획득 메소 양, usedCash: 사용한 캐시, usedMileage: 사용한 마일리지, remainingCash: 남은 캐시, remainingMileage: 남은 마일리지 }
 */
function calculateSingleCashItemConversion(nxAmount, edge) {
  const { item, mileageRatio, availableMileage = 0, fee, mileageRate = 70 } = edge;
  
  console.log(`💰 단일 캐시템 변환 시작: ${item.name} (마일리지 ${mileageRatio}%), ${nxAmount.toLocaleString()}캐시`);
  
  // 구매 가능한 최대 개수 계산
  const maxPurchasableByLimit = item.remainingLimit;
  const maxPurchasableByCash = Math.floor(nxAmount / item.nx);
  const maxPurchasable = Math.min(maxPurchasableByLimit, maxPurchasableByCash);
  
  if (maxPurchasable <= 0) {
    console.log(`⚠️ ${item.name}: 구매 불가 (한도: ${maxPurchasableByLimit}, 캐시: ${maxPurchasableByCash})`);
    return {
      meso: 0,
      usedCash: 0,
      usedMileage: 0,
      earnedMileage: 0,
      netMileageUsed: 0,
      netCashCost: 0,
      remainingCash: nxAmount,
      remainingMileage: availableMileage,
      itemCombination: []
    };
  }
  
  // 마일리지 사용량 계산
  let usedMileage = 0;
  let actualItemsToBuy = maxPurchasable;
  
  if (mileageRatio > 0) {
    const requiredMileagePerItem = Math.ceil(item.nx * (mileageRatio / 100));
    const maxPurchasableByMileage = Math.floor(availableMileage / requiredMileagePerItem);
    
    if (maxPurchasableByMileage < maxPurchasable) {
      actualItemsToBuy = maxPurchasableByMileage;
      console.log(`📉 마일리지 부족으로 구매량 조정: ${maxPurchasable} → ${actualItemsToBuy}`);
    }
    
    usedMileage = actualItemsToBuy * requiredMileagePerItem;
  }
  
  // 실제 캐시 소모량 계산 (마일리지 사용분만큼 절약)
  const totalCashCost = actualItemsToBuy * item.nx;
  const cashUsed = mileageRatio > 0 ? totalCashCost - usedMileage : totalCashCost;
  
  // 획득 메소 계산
  const totalMeso = actualItemsToBuy * item.meso * (1 - fee / 100);
  
  // 마일리지 적립 계산 (캐시 사용량의 5%)
  const earnedMileage = Math.floor(cashUsed * 0.05);
  
  // 순 마일리지 소모량
  const netMileageUsed = usedMileage - earnedMileage;
  
  // 순 캐시 비용 (마일리지를 캐시로 환산)
  const mileageCashEquivalent = netMileageUsed * (mileageRate / 100);
  const netCashCost = cashUsed + mileageCashEquivalent;
  
  const result = {
    meso: Math.floor(totalMeso),
    usedCash: cashUsed,
    usedMileage: usedMileage,
    earnedMileage: earnedMileage,
    netMileageUsed: netMileageUsed,
    netCashCost: netCashCost,
    remainingCash: nxAmount - cashUsed,
    remainingMileage: availableMileage - usedMileage + earnedMileage,
    itemCombination: [{
      name: item.name,
      quantity: actualItemsToBuy,
      usedMileage: mileageRatio > 0,
      mileageUsed: usedMileage,
      cashUsed: cashUsed,
      mesoGained: Math.floor(totalMeso)
    }]
  };
  
  console.log(`✅ ${item.name} ${actualItemsToBuy}개 구매: 캐시 ${cashUsed.toLocaleString()}, 마일리지 ${usedMileage.toLocaleString()} → ${totalMeso.toLocaleString()} 메소`);
  
  return result;
}

// 실제 총 투입량 계산 함수 (역방향 전파 방식)
function calculateActualTotalInput(steps, initialAmount) {
  if (steps.length === 0) return initialAmount;
  
  // 뒤에서부터 앞으로 역추적하여 실제 소진율 계산
  let currentUtilizationRatio = 1.0; // 100% 사용률로 시작
  
  // 뒤에서부터 각 단계의 소진율을 계산
  for (let i = steps.length - 1; i >= 0; i--) {
    const step = steps[i];
    
    // 모든 단계에서 실제 투입량과 명목 투입량 비교
    const nominalInput = step.inputAmount;
    let actualUsed = nominalInput; // 기본값: 100% 사용
    
    // 1. 캐시템 변환의 경우
    if (step.cashItemDetails) {
      actualUsed = step.cashItemDetails.usedCash || step.actualInputAmount || nominalInput;
    }
    // 2. 다른 종류의 제한이 있는 변환의 경우 (향후 확장)
    else if (step.actualInputAmount !== undefined && step.actualInputAmount !== nominalInput) {
      actualUsed = step.actualInputAmount;
    }
    // 3. 상품권 한도, 거래소 한도 등 다른 제약이 있는 경우 (향후 확장)
    else if (step.utilizationDetails) {
      // 예: step.utilizationDetails = { used: 80000, limit: 100000, reason: "상품권 월 한도" }
      actualUsed = step.utilizationDetails.used || nominalInput;
    }
    
    // 소진율 계산
    const stepUtilizationRatio = actualUsed / nominalInput;
    
    // 100% 미만 사용된 경우에만 로그 출력
    if (stepUtilizationRatio < 1.0) {
      const reason = step.cashItemDetails ? "캐시템 한도" : 
                     step.utilizationDetails?.reason || 
                     "기타 제약";
      console.log(`🔄 Step ${i}: ${nominalInput.toLocaleString()} → ${actualUsed.toLocaleString()} (${(stepUtilizationRatio * 100).toFixed(1)}% 사용, ${reason})`);
    }
    
    // 현재 소진율에 이 단계의 소진율을 곱해서 누적
    currentUtilizationRatio *= stepUtilizationRatio;
  }
  
  // 초기 투입량에 최종 소진율 적용
  const actualTotalInput = initialAmount * currentUtilizationRatio;
  
  console.log(`📊 전체 소진율: ${(currentUtilizationRatio * 100).toFixed(1)}% (${initialAmount.toLocaleString()} → ${actualTotalInput.toLocaleString()})`);
  
  return actualTotalInput;
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
    
    // 상품권 한도 확인
    if (edge.voucherKey && edge.remainingLimit !== undefined) {
      // 한도가 설정된 경우, 할인된 가격으로 구매할 수 있는 최대량 계산
      const maxKrwByLimit = edge.remainingLimit;
      const actualKrwUsed = Math.min(fromAmount, maxKrwByLimit);
      return actualKrwUsed / (1 - Math.abs(fee) / 100);
    }
    
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
    // 넥슨캐시 → 메소 (캐시템 경매장) - 레거시 단일 아이템 처리
    const { mesoPerNx, nxAmount, remainingLimit = Infinity } = edge;
    const mesoPerSingleNx = mesoPerNx / nxAmount;
    
    // 한도 제한 적용 (변환할 수 있는 최대 캐시 양 계산)
    const maxNxByLimit = remainingLimit * nxAmount;
    const actualNxUsed = Math.min(fromAmount, maxNxByLimit);
    
    return Math.floor(actualNxUsed * mesoPerSingleNx * (1 - fee / 100));
  }
  
  if (type === 'cashitem_multi') {
    // 넥슨캐시 → 메소 (캐시템 경매장) - 레거시 복합 아이템 처리 (더 이상 사용되지 않음)
    console.warn('cashitem_multi 타입은 더 이상 지원되지 않습니다. cashitem_single을 사용하세요.');
    return 0;
  }
  
  if (type === 'cashitem_single') {
    // 넥슨캐시 → 메소 (캐시템 경매장) - 개별 아이템 처리
    return calculateSingleCashItemConversion(fromAmount, edge);
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
  
  function dfs(currentNodeId, targetNodeId, currentPath, currentAmount, visited, depth) {
    // 깊이 제한
    if (depth > actualMaxDepth) return;
      
    // 목표 노드에 도달한 경우
    if (currentNodeId === targetNodeId) {
      // 실제 투입량 계산
      const actualTotalInput = calculateActualTotalInput(currentPath, startAmount);
      
      paths.push({
        steps: [...currentPath],
        finalAmount: currentAmount,
        nominalInput: startAmount, // 명목 투입량
        actualInput: actualTotalInput // 실제 투입량
      });
      return;
    }
    
    // 현재 노드에서 나가는 엣지들 찾기
    const outgoingEdges = edges.filter(edge => edge.from === currentNodeId);
    
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.to)) {
        const conversionResult = calculateConversion(currentAmount, edge);
        
        // 캐시템 변환의 경우 객체 반환, 일반 변환의 경우 숫자 반환
        let newAmount, cashItemDetails = null;
        if (typeof conversionResult === 'object' && conversionResult.meso !== undefined) {
          // 캐시템 변환 결과
          newAmount = conversionResult.meso;
          cashItemDetails = conversionResult;
        } else {
          // 일반 변환 결과
          newAmount = conversionResult;
        }
        
        // 계산 결과가 비정상적인지 확인
        if (newAmount <= 0 || !isFinite(newAmount)) {
          continue;
        }
        
        const newVisited = new Set(visited);
        newVisited.add(edge.to);
        
        // 실제 투입량 계산 (캐시템의 경우 실제 사용한 양을 추적)
        let actualInputAmount = currentAmount;
        if (cashItemDetails) {
          // 캐시템 변환의 경우 실제 사용한 캐시 + 마일리지 순소모를 캐시로 환산
          actualInputAmount = cashItemDetails.netCashCost || cashItemDetails.usedCash;
        }

        const step = {
          from: edge.from,
          to: edge.to,
          inputAmount: currentAmount, // 명목 투입량
          actualInputAmount, // 실제 투입량
          outputAmount: newAmount,
          edge: edge,
          description: edge.description,
          cashItemDetails // 캐시템 상세 정보 (있는 경우)
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
      
      const conversionResult = calculateConversion(currentAmount, edge);
      
      // 캐시템 변환의 경우 객체 반환, 일반 변환의 경우 숫자 반환
      let newAmount, cashItemDetails = null;
      if (typeof conversionResult === 'object' && conversionResult.meso !== undefined) {
        // 캐시템 변환 결과
        newAmount = conversionResult.meso;
        cashItemDetails = conversionResult;
      } else {
        // 일반 변환 결과
        newAmount = conversionResult;
      }
      
      if (newAmount <= 0 || !isFinite(newAmount)) {
        continue;
      }
      
      const step = {
        from: edge.from,
        to: edge.to,
        inputAmount: currentAmount,
        outputAmount: newAmount,
        edge: edge,
        description: edge.description,
        cashItemDetails // 캐시템 상세 정보 (있는 경우)
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

// 최적 경로들 선별 (실제 효율성 순으로 정렬)
export function getBestPaths(allPaths) {
  // 실제 효율 기준으로 정렬 (최종 금액 / 실제 투입 금액)
  return allPaths.sort((a, b) => {
    // 실제 투입량 사용 (actualInput이 있으면 사용, 없으면 첫 단계의 inputAmount)
    const actualInputA = a.actualInput || (a.steps.length > 0 ? a.steps[0].inputAmount : 1);
    const actualInputB = b.actualInput || (b.steps.length > 0 ? b.steps[0].inputAmount : 1);
    
    // 실제 효율 계산 (최종 금액 / 실제 투입 금액)
    const actualEfficiencyA = a.finalAmount / actualInputA;
    const actualEfficiencyB = b.finalAmount / actualInputB;
    
    // 높은 효율 순으로 정렬
    return actualEfficiencyB - actualEfficiencyA;
  });
}

// 재화 우선순위 정의 (낮은 숫자 = 높은 우선순위)
const CURRENCY_PRIORITY = {
  'KRW': 1,      // 1만원
  'NX': 2,       // 1만 넥슨캐시
  'MP': 3,       // 1만 메이플포인트
  'MESO_G1': 4,  // 1억 메소 (일반섭)
  'MESO_G2': 4,  // 1억 메소 (에오스)
  'MESO_G3': 4,  // 1억 메소 (챌린저스)
  'SOL_G1': 5,   // 1개 (일반섭 조각)
  'SOL_G2': 5,   // 1개 (에오스 조각)
  'SOL_G3': 5    // 1개 (챌린저스 조각)
};

// 재화별 단위 정의
const CURRENCY_UNITS = {
  'KRW': { base: 1, unit: '원' },
  'NX': { base: 1, unit: '캐시' },
  'MP': { base: 1, unit: '메포' },
  'MESO_G1': { base: 100000000, unit: '1억 일반섭 메소' },
  'MESO_G2': { base: 100000000, unit: '1억 에오스 메소' },
  'MESO_G3': { base: 100000000, unit: '1억 챌린저스 메소' },
  'SOL_G1': { base: 1, unit: '1개 일반섭 조각' },
  'SOL_G2': { base: 1, unit: '1개 에오스 조각' },
  'SOL_G3': { base: 1, unit: '1개 챌린저스 조각' }
};

// 효율 계산 함수 (낮은 우선순위 재화 / 높은 우선순위 재화)
export function calculateEfficiencyRatio(inputCurrency, inputAmount, outputCurrency, outputAmount) {
  const inputPriority = CURRENCY_PRIORITY[inputCurrency] || 999;
  const outputPriority = CURRENCY_PRIORITY[outputCurrency] || 999;
  
  const inputUnit = CURRENCY_UNITS[inputCurrency];
  const outputUnit = CURRENCY_UNITS[outputCurrency];
  
  if (!inputUnit || !outputUnit) {
    return { ratio: outputAmount / inputAmount, text: `${(outputAmount / inputAmount).toFixed(1)}배` };
  }
  
  // 높은 우선순위를 분자에, 낮은 우선순위를 분모에
  if (inputPriority < outputPriority) {
    // input이 높은 우선순위 → input/output (예: 원/메소)
    const normalizedInput = inputAmount / inputUnit.base;
    const normalizedOutput = outputAmount / outputUnit.base;
    const ratio = normalizedInput / normalizedOutput;
    return {
      ratio,
      text: `${ratio.toFixed(1)} ${inputUnit.unit}/${outputUnit.unit}`
    };
  } else if (outputPriority < inputPriority) {
    // output이 높은 우선순위 → output/input (예: 원/메소)
    const normalizedInput = inputAmount / inputUnit.base;
    const normalizedOutput = outputAmount / outputUnit.base;
    const ratio = normalizedOutput / normalizedInput;
    return {
      ratio,
      text: `${ratio.toFixed(1)} ${outputUnit.unit}/${inputUnit.unit}`
    };
  } else {
    // 같은 우선순위 → input/output (output이 분모)
    const normalizedInput = inputAmount / inputUnit.base;
    const normalizedOutput = outputAmount / outputUnit.base;
    const ratio = normalizedInput / normalizedOutput;
    return {
      ratio,
      text: `${ratio.toFixed(1)} ${inputUnit.unit}/${outputUnit.unit}`
    };
  }
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