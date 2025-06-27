// 메이플스토리 화폐 변환 계산기 기본 설정값

export const DEFAULT_SETTINGS = {
  // MVP 등급 기본값
  mvpGrade: 'SILVER_PLUS',
  
  // 보유 마일리지 기본값
  availableMileage: 30000,
  
  // 마일리지 변환 비율 기본값 (%)
  mileageRates: {
    GROUP1: 30,
    GROUP2: 30,
    GROUP3: 30
  },

  // 캐시템 경매장 시세 (넥슨캐시로 캐시템 구매 후 메소로 판매) G1: 일반섭, G2: 에/헬, G3: 챌린저스
  cashItemRates: {
    GROUP1: {
      items: [
        {
          id: 'royal_style',
          name: '로얄',
          meso: 79870000,
          nx: 2200,
          availableMileageRatios: [0], // 마일리지 사용 불가
          remainingLimit: 50
        },
        {
          id: 'karma_scissor',
          name: '플가',
          meso: 172999999,
          nx: 5900,
          availableMileageRatios: [0], // 마일리지 사용 불가
          remainingLimit: 10
        },
        {
          id: 'premium_masterpiece',
          name: '프마피',
          meso: 67730000,
          nx: 1900,
          availableMileageRatios: [0], // 마일리지 사용 불가
          remainingLimit: 10
        },
        {
          id: 'platinum_apple',
          name: '플애플',
          meso: 133000000,
          nx: 3500,
          availableMileageRatios: [0], // 마일리지 사용 불가
          remainingLimit: 10
        },
        {
          id: 'hyper_megaphone',
          name: '하이퍼 확성기',
          meso: 31555444,
          nx: 990,
          availableMileageRatios: [0, 30], // 0%, 30% 사용 가능
          remainingLimit: 20
        }
      ]
    },
    GROUP2: {
      items: [
        {
          id: 'royal_style',
          name: '로얄',
          meso: 199999999,
          nx: 2200,
          availableMileageRatios: [0],
          remainingLimit: 5
        },
        {
          id: 'karma_scissor',
          name: '플가',
          meso: 506990005,
          nx: 5900,
          availableMileageRatios: [0],
          remainingLimit: 2
        },
        {
          id: 'premium_masterpiece',
          name: '프마피',
          meso: 166666655,
          nx: 1900,
          availableMileageRatios: [0],
          remainingLimit: 10
        },
        {
          id: 'platinum_apple',
          name: '플애플',
          meso: 277777777,
          nx: 3500,
          availableMileageRatios: [0],
          remainingLimit: 0
        },
        {
          id: 'hyper_megaphone',
          name: '하이퍼 확성기',
          meso: 76999999,
          nx: 990,
          availableMileageRatios: [0, 30],
          remainingLimit: 20
        },
        {
          id: 'mileage_return',
          name: '마일리턴',
          meso: 160000000,
          nx: 6900,
          availableMileageRatios: [0, 30, 100],
          remainingLimit: 50
        },
        {
          id: 'petit_water',
          name: '쁘생물',
          meso: 1277777777,
          nx: 13900,
          availableMileageRatios: [0, 30],
          remainingLimit: 3
        }
      ]
    },
    GROUP3: {
      items: [
        {
          id: 'royal_style',
          name: '로얄',
          meso: 76444211,
          nx: 2200,
          availableMileageRatios: [0],
          remainingLimit: 50
        },
        {
          id: 'karma_scissor',
          name: '플가',
          meso: 150000000,
          nx: 5900,
          availableMileageRatios: [0, 30],
          remainingLimit: 10
        },
        {
          id: 'premium_masterpiece',
          name: '프마피',
          meso: 52222220,
          nx: 1900,
          availableMileageRatios: [0],
          remainingLimit: 10
        },
        {
          id: 'platinum_apple',
          name: '플애플',
          meso: 130000000,
          nx: 3500,
          availableMileageRatios: [0],
          remainingLimit: 10
        },
        {
          id: 'hyper_megaphone',
          name: '하이퍼 확성기',
          meso: 33810000,
          nx: 990,
          availableMileageRatios: [0, 30],
          remainingLimit: 20
        }
      ]
    }
  },

  // 메소마켓 시세 (그룹별, 1억 메소당 메이플포인트)
  mesoMarketRates: {
    GROUP1_3: {
      buy: 3000,  // 메소로 메이플포인트 구매 시
      sell: 3000  // 메이플포인트로 메소 구매 시
    },
    GROUP2: {
      buy: 1200,
      sell: 1200
    }
  },

  // 현금거래 시세 (그룹별, 1억 메소당 원)
  cashTradeRates: {
    GROUP1: {
      buy: 2100,   // 현금으로 메소 구매 시
      sell: 2100   // 메소를 현금으로 판매 시
    },
    GROUP2: {
      buy: 1000,
      sell: 950
    },
    GROUP3: {
      buy: 2300,
      sell: 2250
    }
  },

  // 조각 거래 시세
  solTradeRates: {
    // 현금 거래 (개당 원)
    cash: {
      GROUP1: {
        buy: 100,    // 현금으로 조각 구매 시
        sell: 100    // 조각을 현금으로 판매 시
      },
      GROUP2: {
        buy: 85,
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
        buy: 4900000,   // 메소로 조각 구매 시
        sell: 4900000   // 조각을 메소로 판매 시
      },
      GROUP2: {
        buy: 8500000,
        sell: 8500000
      },
      GROUP3: {
        buy: 6000000,
        sell: 6000000
      }
    }
  },

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
    // 조각 거래
    solCashBuy_G1: { enabled: false },
    solCashBuy_G2: { enabled: true },
    solCashBuy_G3: { enabled: false },
    solCashSell_G1: { enabled: false },
    solCashSell_G2: { enabled: true },
    solCashSell_G3: { enabled: false },
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
      !settings.mesoMarketRates.GROUP1_3 || typeof settings.mesoMarketRates.GROUP1_3.buy !== 'number' || typeof settings.mesoMarketRates.GROUP1_3.sell !== 'number' ||
      !settings.mesoMarketRates.GROUP2 || typeof settings.mesoMarketRates.GROUP2.buy !== 'number' || typeof settings.mesoMarketRates.GROUP2.sell !== 'number') {
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
    mesoMarketRates: Object.keys(DEFAULT_SETTINGS.mesoMarketRates).reduce((acc, group) => {
      acc[group] = {
        buy: userSettings.mesoMarketRates?.[group]?.buy ?? DEFAULT_SETTINGS.mesoMarketRates[group].buy,
        sell: userSettings.mesoMarketRates?.[group]?.sell ?? DEFAULT_SETTINGS.mesoMarketRates[group].sell
      };
      return acc;
    }, {}),
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
    },
    mileageRates: {
      ...DEFAULT_SETTINGS.mileageRates,
      ...userSettings.mileageRates
    }
  };
}