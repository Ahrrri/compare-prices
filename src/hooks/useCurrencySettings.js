import { useState } from 'react';

export const useCurrencySettings = () => {
  // 메소마켓 시세 (그룹별)
  const [mesoMarketRates, setMesoMarketRates] = useState({
    GROUP1_3: 2600, // 그룹1+3 통합 (1억 메소당 메이플포인트)
    GROUP2: 1400    // 그룹2 (1억 메소당 메이플포인트)
  });
  
  // 현금거래 시세 (그룹별, 1억 메소당 원)
  const [cashTradeRates, setCashTradeRates] = useState({
    GROUP1: 1800,
    GROUP2: 1100,
    GROUP3: 2200
  });
  
  // 솔 에르다 조각 거래 시세
  const [solTradeRates, setSolTradeRates] = useState({
    // 현금 거래 (개당 원)
    cash: {
      GROUP1: 100,
      GROUP2: 80,
      GROUP3: 120
    },
    // 메소 거래 (개당 메소)
    meso: {
      GROUP1: 5000000, // 500만 메소
      GROUP2: 7000000, // 700만 메소
      GROUP3: 5500000  // 550만 메소
    }
  });

  const [mvpGrade, setMvpGrade] = useState('SILVER_PLUS');
  
  // 상품권 할인 설정
  const [voucherDiscounts, setVoucherDiscounts] = useState({
    culture: { rate: 5, limit: 200000, remainingLimit: 200000, enabled: true, name: '컬처랜드' },
    book: { rate: 5, limit: 200000, remainingLimit: 200000, enabled: true, name: '도서문화상품권' },
    nexon: { rate: 5, limit: 200000, remainingLimit: 200000, enabled: true, name: '넥슨카드' },
    regular: { rate: 2, limit: 0, remainingLimit: 0, enabled: true, name: '상시 할인' } // 한도 없음
  });
  
  // 교환 방식 활성화 설정
  const [exchangeOptions, setExchangeOptions] = useState({
    direct: { enabled: true },
    mesomarketBuy_G13: { enabled: true },
    mesomarketBuy_G2: { enabled: true },
    mesomarketSell_G13: { enabled: true },
    mesomarketSell_G2: { enabled: true },
    cashtradeBuy_G1: { enabled: true },
    cashtradeBuy_G2: { enabled: true },
    cashtradeBuy_G3: { enabled: true },
    cashtradeSell_G1: { enabled: true },
    cashtradeSell_G2: { enabled: true },
    cashtradeSell_G3: { enabled: true },
    // 솔 에르다 거래
    solCashBuy_G1: { enabled: true },
    solCashBuy_G2: { enabled: true },
    solCashBuy_G3: { enabled: true },
    solCashSell_G1: { enabled: true },
    solCashSell_G2: { enabled: true },
    solCashSell_G3: { enabled: true },
    solMesoBuy_G1: { enabled: true },
    solMesoBuy_G2: { enabled: true },
    solMesoBuy_G3: { enabled: true },
    solMesoSell_G1: { enabled: true },
    solMesoSell_G2: { enabled: true },
    solMesoSell_G3: { enabled: true }
  });

  return {
    // States
    mesoMarketRates,
    cashTradeRates,
    solTradeRates,
    mvpGrade,
    voucherDiscounts,
    exchangeOptions,
    
    // Setters
    setMesoMarketRates,
    setCashTradeRates,
    setSolTradeRates,
    setMvpGrade,
    setVoucherDiscounts,
    setExchangeOptions
  };
};