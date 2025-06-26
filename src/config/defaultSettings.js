// 메이플스토리 화폐 변환 계산기 기본 설정값

export const DEFAULT_SETTINGS = {
  // 메소마켓 시세 (그룹별)
  mesoMarketRates: {
    GROUP1_3: 2600, // 그룹1+3 통합 (1억 메소당 메이플포인트)
    GROUP2: 1400    // 그룹2 (1억 메소당 메이플포인트)
  },

  // 현금거래 시세 (그룹별, 1억 메소당 원)
  cashTradeRates: {
    GROUP1: {
      buy: 1800,   // 현금으로 메소 구매 시
      sell: 1800   // 메소를 현금으로 판매 시
    },
    GROUP2: {
      buy: 1100,
      sell: 1100
    },
    GROUP3: {
      buy: 2200,
      sell: 2200
    }
  },

  // 솔 에르다 조각 거래 시세
  solTradeRates: {
    // 현금 거래 (개당 원)
    cash: {
      GROUP1: {
        buy: 100,    // 현금으로 솔 에르다 구매 시
        sell: 100    // 솔 에르다를 현금으로 판매 시
      },
      GROUP2: {
        buy: 80,
        sell: 80
      },
      GROUP3: {
        buy: 120,
        sell: 120
      }
    },
    // 메소 거래 (개당 메소)
    meso: {
      GROUP1: {
        buy: 5000000,   // 메소로 솔 에르다 구매 시 (500만 메소)
        sell: 5000000   // 솔 에르다를 메소로 판매 시
      },
      GROUP2: {
        buy: 7000000,   // 700만 메소
        sell: 7000000
      },
      GROUP3: {
        buy: 5500000,   // 550만 메소
        sell: 5500000
      }
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
      !settings.cashTradeRates.GROUP1 || typeof settings.cashTradeRates.GROUP1.buy !== 'number' || typeof settings.cashTradeRates.GROUP1.sell !== 'number' ||
      !settings.cashTradeRates.GROUP2 || typeof settings.cashTradeRates.GROUP2.buy !== 'number' || typeof settings.cashTradeRates.GROUP2.sell !== 'number' ||
      !settings.cashTradeRates.GROUP3 || typeof settings.cashTradeRates.GROUP3.buy !== 'number' || typeof settings.cashTradeRates.GROUP3.sell !== 'number') {
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
    cashTradeRates: Object.keys(DEFAULT_SETTINGS.cashTradeRates).reduce((acc, group) => {
      acc[group] = {
        buy: userSettings.cashTradeRates?.[group]?.buy ?? DEFAULT_SETTINGS.cashTradeRates[group].buy,
        sell: userSettings.cashTradeRates?.[group]?.sell ?? DEFAULT_SETTINGS.cashTradeRates[group].sell
      };
      return acc;
    }, {}),
    solTradeRates: {
      cash: Object.keys(DEFAULT_SETTINGS.solTradeRates.cash).reduce((acc, group) => {
        acc[group] = {
          buy: userSettings.solTradeRates?.cash?.[group]?.buy ?? DEFAULT_SETTINGS.solTradeRates.cash[group].buy,
          sell: userSettings.solTradeRates?.cash?.[group]?.sell ?? DEFAULT_SETTINGS.solTradeRates.cash[group].sell
        };
        return acc;
      }, {}),
      meso: Object.keys(DEFAULT_SETTINGS.solTradeRates.meso).reduce((acc, group) => {
        acc[group] = {
          buy: userSettings.solTradeRates?.meso?.[group]?.buy ?? DEFAULT_SETTINGS.solTradeRates.meso[group].buy,
          sell: userSettings.solTradeRates?.meso?.[group]?.sell ?? DEFAULT_SETTINGS.solTradeRates.meso[group].sell
        };
        return acc;
      }, {})
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