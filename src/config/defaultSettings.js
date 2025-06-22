// 메이플스토리 화폐 변환 계산기 기본 설정값

export const DEFAULT_SETTINGS = {
  // 메소마켓 시세 (그룹별)
  mesoMarketRates: {
    GROUP1_3: 2600, // 그룹1+3 통합 (1억 메소당 메이플포인트)
    GROUP2: 1400    // 그룹2 (1억 메소당 메이플포인트)
  },

  // 현금거래 시세 (그룹별, 1억 메소당 원)
  cashTradeRates: {
    GROUP1: 1800,
    GROUP2: 1100,
    GROUP3: 2200
  },

  // 솔 에르다 조각 거래 시세
  solTradeRates: {
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
  },

  // 캐시템 경매장 시세 (넥슨캐시로 캐시템 구매 후 메소로 판매)
  cashItemRates: {
    GROUP1: { meso: 78000000, nx: 2200 }, // 7800만 메소 / 2200 캐시
    GROUP2: { meso: 173333333, nx: 2200 }, // 17333만 메소 / 2200 캐시  
    GROUP3: { meso: 78000000, nx: 2200 }  // 7800만 메소 / 2200 캐시
  },

  // MVP 등급 기본값
  mvpGrade: 'SILVER_PLUS',

  // 상품권 할인 설정
  voucherDiscounts: {
    culture: { 
      rate: 5, 
      limit: 200000, 
      remainingLimit: 200000, 
      enabled: true, 
      name: '컬처랜드' 
    },
    book: { 
      rate: 5, 
      limit: 200000, 
      remainingLimit: 200000, 
      enabled: true, 
      name: '도서문화상품권' 
    },
    nexon: { 
      rate: 5, 
      limit: 200000, 
      remainingLimit: 200000, 
      enabled: true, 
      name: '넥슨카드' 
    },
    regular: { 
      rate: 2, 
      limit: 0, 
      remainingLimit: 0, 
      enabled: true, 
      name: '상시 할인' 
    }
  },

  // 교환 방식 활성화 설정
  exchangeOptions: {
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
    // 캐시템 경매장
    cashItem_G1: { enabled: true },
    cashItem_G2: { enabled: true },
    cashItem_G3: { enabled: true },
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
  }
};

// 설정 검증 함수
export function validateSettings(settings) {
  const errors = [];

  // 메소마켓 시세 검증
  if (!settings.mesoMarketRates || 
      typeof settings.mesoMarketRates.GROUP1_3 !== 'number' ||
      typeof settings.mesoMarketRates.GROUP2 !== 'number') {
    errors.push('메소마켓 시세 설정이 올바르지 않습니다.');
  }

  // 현금거래 시세 검증
  if (!settings.cashTradeRates ||
      typeof settings.cashTradeRates.GROUP1 !== 'number' ||
      typeof settings.cashTradeRates.GROUP2 !== 'number' ||
      typeof settings.cashTradeRates.GROUP3 !== 'number') {
    errors.push('현금거래 시세 설정이 올바르지 않습니다.');
  }

  // MVP 등급 검증
  if (!['NONE', 'SILVER_PLUS'].includes(settings.mvpGrade)) {
    errors.push('MVP 등급 설정이 올바르지 않습니다.');
  }

  return errors;
}

// 설정 병합 함수 (기본값 + 사용자 설정)
export function mergeSettings(userSettings = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...userSettings,
    mesoMarketRates: {
      ...DEFAULT_SETTINGS.mesoMarketRates,
      ...userSettings.mesoMarketRates
    },
    cashTradeRates: {
      ...DEFAULT_SETTINGS.cashTradeRates,
      ...userSettings.cashTradeRates
    },
    solTradeRates: {
      cash: {
        ...DEFAULT_SETTINGS.solTradeRates.cash,
        ...userSettings.solTradeRates?.cash
      },
      meso: {
        ...DEFAULT_SETTINGS.solTradeRates.meso,
        ...userSettings.solTradeRates?.meso
      }
    },
    cashItemRates: {
      ...DEFAULT_SETTINGS.cashItemRates,
      ...userSettings.cashItemRates
    },
    voucherDiscounts: {
      ...DEFAULT_SETTINGS.voucherDiscounts,
      ...userSettings.voucherDiscounts
    },
    exchangeOptions: {
      ...DEFAULT_SETTINGS.exchangeOptions,
      ...userSettings.exchangeOptions
    }
  };
}