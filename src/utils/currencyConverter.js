// MVP 등급별 혜택
const MVP_BENEFITS = {
  NONE: { discount: 0, bonus: 0 }, // 실버 미만 (없음/브론즈)
  SILVER_PLUS: { discount: 0.10, bonus: 0 }, // 실버 이상 (실버/골드/다이아/레드)
};

// 화폐 변환 함수
export function convertCurrency(amount, fromCurrency, toCurrency, settings) {
  const { mesoMarketRates, cashTradeRates, mvpGrade, mileage, voucherDiscounts, worldGroup, targetWorldGroup } = settings;
  
  if (!amount || amount <= 0) return [];
  
  const paths = [];
  
  // KRW to MESO
  if (fromCurrency === 'KRW' && toCurrency === 'MESO') {
    // 메소마켓 시세 결정
    const marketKey = (targetWorldGroup === 'GROUP2') ? 'GROUP2' : 'GROUP1_3';
    const marketRate = mesoMarketRates[marketKey];
    
    // 경로 1: KRW -> NX -> MP -> 메소 (메소마켓)
    const nxAmount = amount;
    const mpAmount = nxAmount;
    const mesoAmount = (mpAmount / marketRate) * 100000000;
    
    paths.push({
      name: '메소마켓 이용',
      steps: [
        { from: 'KRW', to: 'NX', amount: amount, result: nxAmount, description: '현금 → 넥슨캐시' },
        { from: 'NX', to: 'MP', amount: nxAmount, result: mpAmount, description: '넥슨캐시 → 메이플포인트' },
        { from: 'MP', to: 'MESO', amount: mpAmount, result: mesoAmount, description: `메소마켓 (수수료 없음, 1억메소당 ${marketRate}메이플포인트)` }
      ],
      finalAmount: mesoAmount,
      efficiency: 100
    });
    
    // 경로 2: 현금거래 (메소 구매)
    const cashTradeRate = cashTradeRates[targetWorldGroup];
    const cashTradeMesoAmountBeforeFee = (amount / cashTradeRate) * 100000000;
    
    // MVP에 따른 수수료 (구매자가 부담)
    const cashTradeFeeRate = (mvpGrade === 'SILVER_PLUS') ? 0.03 : 0.05;
    const cashTradeAfterFee = cashTradeMesoAmountBeforeFee * (1 - cashTradeFeeRate);
    const feeRatePercent = cashTradeFeeRate * 100;
    
    const worldName = targetWorldGroup === 'GROUP1' ? '일반섭' : targetWorldGroup === 'GROUP2' ? '에오스' : '챌린저스';
    
    paths.push({
      name: `${worldName} 현금거래 (메소 구매)`,
      steps: [
        { from: 'KRW', to: 'MESO', amount: amount, result: cashTradeAfterFee, description: `현금거래 (구매자 ${feeRatePercent}% 수수료, 1억메소당 ${cashTradeRate}원)` }
      ],
      finalAmount: cashTradeAfterFee,
      efficiency: Math.round((cashTradeAfterFee / cashTradeMesoAmountBeforeFee) * 100),
      note: `구매자 수수료 ${formatNumber(cashTradeMesoAmountBeforeFee - cashTradeAfterFee, 'meso')}메소 차감`
    });
    
    // 경로 3: KRW -> NX -> 캐시템 -> 경매장 (예시)
    const auctionMesoAmount = mesoAmount * 0.85;
    
    paths.push({
      name: '캐시템 경매장 판매',
      steps: [
        { from: 'KRW', to: 'NX', amount: amount, result: nxAmount, description: '현금 → 넥슨캐시' },
        { from: 'NX', to: 'ITEM', amount: nxAmount, result: '캐시템', description: '캐시템 구매' },
        { from: 'ITEM', to: 'MESO', amount: '캐시템', result: auctionMesoAmount, description: '경매장 판매 (수수료 5%)' }
      ],
      finalAmount: auctionMesoAmount,
      efficiency: 85,
      warning: '실제 효율은 캐시템 종류와 경매장 시세에 따라 달라집니다.'
    });
  }
  
  // MESO to MP
  if (fromCurrency === 'MESO' && toCurrency === 'MP') {
    // 메소마켓 시세 결정 (그룹별)
    const marketKey = (worldGroup === 'GROUP2') ? 'GROUP2' : 'GROUP1_3';
    const marketRate = mesoMarketRates[marketKey];
    
    // 메소 → MP 수수료 1%
    const feeRate = 0.01;
    const amountAfterFee = amount * (1 - feeRate);
    const mpAmount = (amountAfterFee / 100000000) * marketRate;
    
    paths.push({
      name: '메소마켓 이용',
      steps: [
        { from: 'MESO', to: 'MP', amount: amount, result: mpAmount, description: `메소마켓 (1% 수수료, 1억메소당 ${marketRate}메이플포인트)` }
      ],
      finalAmount: mpAmount,
      efficiency: Math.round((mpAmount / ((amount / 100000000) * marketRate)) * 100),
      note: `수수료 ${formatNumber(amount * feeRate, 'meso')}메소 차감`
    });
  }
  
  // MP to MESO
  if (fromCurrency === 'MP' && toCurrency === 'MESO') {
    // 메소마켓 시세 결정 (그룹별)
    const marketKey = (targetWorldGroup === 'GROUP2') ? 'GROUP2' : 'GROUP1_3';
    const marketRate = mesoMarketRates[marketKey];
    
    // MP → 메소 수수료 없음
    const mesoAmount = (amount / marketRate) * 100000000;
    
    paths.push({
      name: '메소마켓 이용',
      steps: [
        { from: 'MP', to: 'MESO', amount: amount, result: mesoAmount, description: `메소마켓 (수수료 없음, 1억메소당 ${marketRate}MP)` }
      ],
      finalAmount: mesoAmount,
      efficiency: 100
    });
  }
  
  // KRW to MP
  if (fromCurrency === 'KRW' && toCurrency === 'MP') {
    // 경로 1: 직접 변환
    const nxAmount = amount;
    const mpAmount = nxAmount;
    
    paths.push({
      name: '직접 변환',
      steps: [
        { from: 'KRW', to: 'NX', amount: amount, result: nxAmount, description: '현금 → 넥슨캐시' },
        { from: 'NX', to: 'MP', amount: nxAmount, result: mpAmount, description: '넥슨캐시 → 메이플포인트' }
      ],
      finalAmount: mpAmount,
      efficiency: 100
    });
    
    // 경로 2: 현금거래로 메소 구매 후 메소마켓 (각 그룹별)
    ['GROUP1', 'GROUP2', 'GROUP3'].forEach(group => {
      const cashTradeRate = cashTradeRates[group];
      const cashTradeMesoAmount = (amount / cashTradeRate) * 100000000;
      
      // MVP에 따른 수수료
      const cashTradeFeeRate = (mvpGrade === 'SILVER_PLUS') ? 0.03 : 0.05;
      const cashTradeAfterFee = cashTradeMesoAmount * (1 - cashTradeFeeRate);
      
      // 메소마켓 시세
      const marketKey = (group === 'GROUP2') ? 'GROUP2' : 'GROUP1_3';
      const marketRate = mesoMarketRates[marketKey];
      
      // 메소 → MP (1% 수수료)
      const mesoMarketFee = 0.01;
      const mesoAfterMarketFee = cashTradeAfterFee * (1 - mesoMarketFee);
      const finalMpAmount = (mesoAfterMarketFee / 100000000) * marketRate;
      
      const groupName = group === 'GROUP1' ? '일반섭' : group === 'GROUP2' ? '에오스' : '챌린저스';
      
      paths.push({
        name: `${groupName} 현금거래 → 메소마켓`,
        steps: [
          { from: 'KRW', to: 'MESO', amount: amount, result: cashTradeAfterFee, description: `${groupName} 현금거래 (구매자 ${cashTradeFeeRate * 100}% 수수료)` },
          { from: 'MESO', to: 'MP', amount: cashTradeAfterFee, result: finalMpAmount, description: `메소마켓 (1% 수수료, 1억메소당 ${marketRate}메이플포인트)` }
        ],
        finalAmount: finalMpAmount,
        efficiency: Math.round((finalMpAmount / mpAmount) * 100),
        note: `총 수수료: 현금거래 ${formatNumber(cashTradeMesoAmount - cashTradeAfterFee, 'meso')}메소 + 메소마켓 ${formatNumber(cashTradeAfterFee - mesoAfterMarketFee, 'meso')}메소`
      });
    });
  }
  
  // NX to MP
  if (fromCurrency === 'NX' && toCurrency === 'MP') {
    const mpAmount = amount;
    
    paths.push({
      name: '직접 변환',
      steps: [
        { from: 'NX', to: 'MP', amount: amount, result: mpAmount, description: '넥슨캐시 → 메이플포인트' }
      ],
      finalAmount: mpAmount,
      efficiency: 100
    });
  }
  
  // NX to MESO
  if (fromCurrency === 'NX' && toCurrency === 'MESO') {
    const mpAmount = amount;
    const mesoAmount = (mpAmount / mesoMarketRate) * 100000000;
    
    paths.push({
      name: '메소마켓 이용',
      steps: [
        { from: 'NX', to: 'MP', amount: amount, result: mpAmount, description: '넥슨캐시 → 메이플포인트' },
        { from: 'MP', to: 'MESO', amount: mpAmount, result: mesoAmount, description: `메소마켓 (1억메소당 ${mesoMarketRate}MP)` }
      ],
      finalAmount: mesoAmount,
      efficiency: 100
    });
  }
  
  // KRW to NX
  if (fromCurrency === 'KRW' && toCurrency === 'NX') {
    // 경로 1: 직접 구매
    const nxAmount = amount;
    
    paths.push({
      name: '직접 구매',
      steps: [
        { from: 'KRW', to: 'NX', amount: amount, result: nxAmount, description: '현금 → 넥슨캐시 (1:1)' }
      ],
      finalAmount: nxAmount,
      efficiency: 100
    });
    
    // 경로 2: 상품권 할인 구매
    if (voucherDiscounts) {
      // 한도가 있는 상품권들 계산
      const limitedVouchers = Object.values(voucherDiscounts).filter(v => v.limit > 0 && v.rate > 0);
      const totalLimitedAmount = limitedVouchers.reduce((sum, v) => sum + v.limit, 0);
      const maxLimitedDiscount = limitedVouchers.reduce((sum, v) => sum + (v.limit * v.rate / 100), 0);
      
      // 상시 할인
      const regularDiscount = voucherDiscounts.regular || { rate: 0 };
      
      if (amount <= totalLimitedAmount) {
        // 전액 한도 내 할인 가능
        const bestRate = Math.max(...limitedVouchers.map(v => v.rate));
        const discountAmount = amount * bestRate / 100;
        const actualCost = amount - discountAmount;
        
        paths.push({
          name: `상품권 할인 구매 (${bestRate}% 할인)`,
          steps: [
            { from: 'KRW', to: 'VOUCHER', amount: actualCost, result: `상품권 ${formatNumber(amount, 'currency')}원`, description: `${bestRate}% 할인 적용` },
            { from: 'VOUCHER', to: 'NX', amount: `상품권 ${formatNumber(amount, 'currency')}원`, result: amount, description: '상품권 → 넥슨캐시' }
          ],
          finalAmount: amount,
          actualCost: actualCost,
          efficiency: Math.round((amount / actualCost) * 100),
          note: `실제 지출: ${formatNumber(actualCost, 'currency')}원 (${formatNumber(discountAmount, 'currency')}원 절약)`
        });
      } else {
        // 한도 초과분은 상시 할인 적용
        const regularAmount = amount - totalLimitedAmount;
        const regularDiscountAmount = regularAmount * regularDiscount.rate / 100;
        const totalCost = totalLimitedAmount - maxLimitedDiscount + regularAmount - regularDiscountAmount;
        const totalSaved = amount - totalCost;
        
        paths.push({
          name: '상품권 할인 구매 (복합 할인)',
          steps: [
            { from: 'KRW', to: 'VOUCHER', amount: totalLimitedAmount - maxLimitedDiscount, result: `상품권 ${formatNumber(totalLimitedAmount, 'currency')}원`, description: `한도 내 최대 할인` },
            { from: 'KRW', to: 'NX', amount: regularAmount - regularDiscountAmount, result: formatNumber(regularAmount, 'currency'), description: `나머지 ${regularDiscount.rate}% 할인` },
            { from: 'TOTAL', to: 'NX', amount: totalCost, result: amount, description: '총 넥슨캐시' }
          ],
          finalAmount: amount,
          actualCost: totalCost,
          efficiency: Math.round((amount / totalCost) * 100),
          warning: `월 한도(${formatNumber(totalLimitedAmount, 'currency')}원) 초과`,
          note: `실제 지출: ${formatNumber(totalCost, 'currency')}원 (${formatNumber(totalSaved, 'currency')}원 절약)`
        });
      }
      
      // 상시 할인만 적용
      if (regularDiscount.rate > 0) {
        const regularDiscountAmount = amount * regularDiscount.rate / 100;
        const regularCost = amount - regularDiscountAmount;
        
        paths.push({
          name: `상시 할인 구매 (${regularDiscount.rate}% 할인)`,
          steps: [
            { from: 'KRW', to: 'NX', amount: regularCost, result: amount, description: `${regularDiscount.rate}% 할인 적용` }
          ],
          finalAmount: amount,
          actualCost: regularCost,
          efficiency: Math.round((amount / regularCost) * 100),
          note: `실제 지출: ${formatNumber(regularCost, 'currency')}원 (${formatNumber(regularDiscountAmount, 'currency')}원 절약)`
        });
      }
    }
  }
  
  // MESO to KRW (메소 판매)
  if (fromCurrency === 'MESO' && toCurrency === 'KRW') {
    // 현금거래로 메소 → 현금 (판매자는 수수료 없음)
    const cashTradeRate = cashTradeRates[worldGroup];
    const cashAmount = (amount / 100000000) * cashTradeRate;
    
    const worldName = worldGroup === 'GROUP1' ? '일반섭' : worldGroup === 'GROUP2' ? '에오스' : '챌린저스';
    
    paths.push({
      name: `${worldName} 현금거래 (메소 판매)`,
      steps: [
        { from: 'MESO', to: 'KRW', amount: amount, result: cashAmount, description: `현금거래 (수수료 없음, 1억메소당 ${cashTradeRate}원)` }
      ],
      finalAmount: cashAmount,
      efficiency: 100,
      note: `판매자는 수수료 부담 없음`
    });
  }
  
  // 마일리지 할인 적용
  if (mileage > 0 && (fromCurrency === 'KRW' || fromCurrency === 'NX')) {
    paths.forEach(path => {
      if (path.steps.some(step => step.to === 'NX' || step.from === 'NX')) {
        const discount = Math.min(mileage, amount * 0.3); // 최대 30% 할인
        path.mileageDiscount = discount;
        path.discountedAmount = amount - discount;
      }
    });
  }
  
  // MVP 할인 적용
  if (mvpGrade !== 'NONE' && (fromCurrency === 'KRW' || fromCurrency === 'NX')) {
    paths.forEach(path => {
      if (path.steps.some(step => step.to === 'NX' || step.from === 'NX')) {
        const mvpDiscount = MVP_BENEFITS[mvpGrade].discount;
        path.mvpDiscount = amount * mvpDiscount;
      }
    });
  }
  
  return paths;
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
    // 솔 에르다 조각: 개수 단위로 표시
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