// 외부 설정 파일 로더

/**
 * 외부 JSON 설정 파일을 로드합니다.
 * @param {string} configPath - 설정 파일 경로 (기본값: '/config.json')
 * @returns {Promise<object>} 설정 객체
 */
export async function loadExternalConfig(configPath = '/config.json') {
  try {
    const response = await fetch(configPath);
    if (!response.ok) {
      throw new Error(`설정 파일을 불러올 수 없습니다: ${response.status}`);
    }
    
    const config = await response.json();
    console.log('외부 설정 파일 로드 성공:', config.description || 'Unknown config');
    
    return config.settings || config;
  } catch (error) {
    console.warn('외부 설정 파일 로드 실패, 기본값 사용:', error.message);
    return null;
  }
}


/**
 * exchangeOptions를 방향별로 분리합니다.
 * @param {object} exchangeOptions - 원본 exchangeOptions 객체
 * @returns {object} 방향별로 분리된 객체
 */
function flattenExchangeOptions(exchangeOptions) {
  const flattened = {};
  
  Object.entries(exchangeOptions).forEach(([key, value]) => {
    // 메소마켓 (메소->메포, 메포->메소)
    if (key === 'mesomarketBuy_G13') {
      flattened['mesotomptrade_g1_3'] = value.enabled || false;
    } else if (key === 'mesomarketSell_G13') {
      flattened['mptomesotrade_g1_3'] = value.enabled || false;
    } else if (key === 'mesomarketBuy_G2') {
      flattened['mesotomptrade_g2'] = value.enabled || false;
    } else if (key === 'mesomarketSell_G2') {
      flattened['mptomesotrade_g2'] = value.enabled || false;
    }
    
    // 현금거래 (현금->메소, 메소->현금)
    else if (key === 'cashtradeBuy_G1') {
      flattened['krwtomesotrade_g1'] = value.enabled || false;
    } else if (key === 'cashtradeSell_G1') {
      flattened['mesotokrwtrade_g1'] = value.enabled || false;
    } else if (key === 'cashtradeBuy_G2') {
      flattened['krwtomesotrade_g2'] = value.enabled || false;
    } else if (key === 'cashtradeSell_G2') {
      flattened['mesotokrwtrade_g2'] = value.enabled || false;
    } else if (key === 'cashtradeBuy_G3') {
      flattened['krwtomesotrade_g3'] = value.enabled || false;
    } else if (key === 'cashtradeSell_G3') {
      flattened['mesotokrwtrade_g3'] = value.enabled || false;
    }
    
    // 솔 에르다 거래 (현금->솔, 솔->현금, 메소->솔, 솔->메소)
    else if (key === 'solCashBuy_G1') {
      flattened['krwtosoltrade_g1'] = value.enabled || false;
    } else if (key === 'solCashSell_G1') {
      flattened['soltokrwtrade_g1'] = value.enabled || false;
    } else if (key === 'solMesoBuy_G1') {
      flattened['mesotosoltrade_g1'] = value.enabled || false;
    } else if (key === 'solMesoSell_G1') {
      flattened['soltomesotrade_g1'] = value.enabled || false;
    } else if (key === 'solCashBuy_G2') {
      flattened['krwtosoltrade_g2'] = value.enabled || false;
    } else if (key === 'solCashSell_G2') {
      flattened['soltokrwtrade_g2'] = value.enabled || false;
    } else if (key === 'solMesoBuy_G2') {
      flattened['mesotosoltrade_g2'] = value.enabled || false;
    } else if (key === 'solMesoSell_G2') {
      flattened['soltomesotrade_g2'] = value.enabled || false;
    } else if (key === 'solCashBuy_G3') {
      flattened['krwtosoltrade_g3'] = value.enabled || false;
    } else if (key === 'solCashSell_G3') {
      flattened['soltokrwtrade_g3'] = value.enabled || false;
    } else if (key === 'solMesoBuy_G3') {
      flattened['mesotosoltrade_g3'] = value.enabled || false;
    } else if (key === 'solMesoSell_G3') {
      flattened['soltomesotrade_g3'] = value.enabled || false;
    }
    
    // 캐시템 경매장 (넥슨캐시->메소)
    else if (key === 'cashItem_G1') {
      flattened['nxtomesotrade_g1'] = value.enabled || false;
    } else if (key === 'cashItem_G2') {
      flattened['nxtomesotrade_g2'] = value.enabled || false;
    } else if (key === 'cashItem_G3') {
      flattened['nxtomesotrade_g3'] = value.enabled || false;
    }
  });
  
  return flattened;
}

/**
 * 방향별로 분리된 exchangeOptions를 원본 형태로 복원합니다.
 * @param {object} flattened - 분리된 객체
 * @returns {object} 원본 형태의 exchangeOptions
 */
function unflattenExchangeOptions(flattened) {
  const exchangeOptions = {};
  
  // 메소마켓
  exchangeOptions['mesomarketBuy_G13'] = { enabled: flattened['mesotomptrade_g1_3'] || false };
  exchangeOptions['mesomarketSell_G13'] = { enabled: flattened['mptomesotrade_g1_3'] || false };
  exchangeOptions['mesomarketBuy_G2'] = { enabled: flattened['mesotomptrade_g2'] || false };
  exchangeOptions['mesomarketSell_G2'] = { enabled: flattened['mptomesotrade_g2'] || false };
  
  // 현금거래
  exchangeOptions['cashtradeBuy_G1'] = { enabled: flattened['krwtomesotrade_g1'] || false };
  exchangeOptions['cashtradeSell_G1'] = { enabled: flattened['mesotokrwtrade_g1'] || false };
  exchangeOptions['cashtradeBuy_G2'] = { enabled: flattened['krwtomesotrade_g2'] || false };
  exchangeOptions['cashtradeSell_G2'] = { enabled: flattened['mesotokrwtrade_g2'] || false };
  exchangeOptions['cashtradeBuy_G3'] = { enabled: flattened['krwtomesotrade_g3'] || false };
  exchangeOptions['cashtradeSell_G3'] = { enabled: flattened['mesotokrwtrade_g3'] || false };
  
  // 솔 에르다 거래
  exchangeOptions['solCashBuy_G1'] = { enabled: flattened['krwtosoltrade_g1'] || false };
  exchangeOptions['solCashSell_G1'] = { enabled: flattened['soltokrwtrade_g1'] || false };
  exchangeOptions['solMesoBuy_G1'] = { enabled: flattened['mesotosoltrade_g1'] || false };
  exchangeOptions['solMesoSell_G1'] = { enabled: flattened['soltomesotrade_g1'] || false };
  exchangeOptions['solCashBuy_G2'] = { enabled: flattened['krwtosoltrade_g2'] || false };
  exchangeOptions['solCashSell_G2'] = { enabled: flattened['soltokrwtrade_g2'] || false };
  exchangeOptions['solMesoBuy_G2'] = { enabled: flattened['mesotosoltrade_g2'] || false };
  exchangeOptions['solMesoSell_G2'] = { enabled: flattened['soltomesotrade_g2'] || false };
  exchangeOptions['solCashBuy_G3'] = { enabled: flattened['krwtosoltrade_g3'] || false };
  exchangeOptions['solCashSell_G3'] = { enabled: flattened['soltokrwtrade_g3'] || false };
  exchangeOptions['solMesoBuy_G3'] = { enabled: flattened['mesotosoltrade_g3'] || false };
  exchangeOptions['solMesoSell_G3'] = { enabled: flattened['soltomesotrade_g3'] || false };
  
  // 캐시템 경매장
  exchangeOptions['cashItem_G1'] = { enabled: flattened['nxtomesotrade_g1'] || false };
  exchangeOptions['cashItem_G2'] = { enabled: flattened['nxtomesotrade_g2'] || false };
  exchangeOptions['cashItem_G3'] = { enabled: flattened['nxtomesotrade_g3'] || false };
  
  return exchangeOptions;
}

/**
 * 설정을 JSON 파일로 다운로드합니다.
 * @param {object} settings - 다운로드할 설정 객체
 * @param {string} filename - 파일명 (기본값: 'maple-currency-settings.json')
 */
export function downloadSettingsAsFile(settings, filename = 'maple-currency-settings.json') {
  try {
    // exchangeOptions를 방향별로 분리
    const flattenedExchangeOptions = flattenExchangeOptions(settings.exchangeOptions || {});
    
    const configData = {
      description: "메이플스토리 화폐 변환 계산기 설정 파일",
      version: "1.1",
      exportedAt: new Date().toISOString(),
      
      // MVP 등급
      "MVP 등급": settings.mvpGrade,
      
      // 캐시템 경매장 (웹에서 첫 번째로 나오는 섹션)
      "캐시템 경매장": {
        "그룹1 (일반섭)": {
          "메소": settings.cashItemRates.GROUP1.meso,
          "넥슨캐시": settings.cashItemRates.GROUP1.nx,
          "넥슨캐시→메소 거래 활성화": flattenedExchangeOptions.nxtomesotrade_g1
        },
        "그룹2 (에오스)": {
          "메소": settings.cashItemRates.GROUP2.meso,
          "넥슨캐시": settings.cashItemRates.GROUP2.nx,
          "넥슨캐시→메소 거래 활성화": flattenedExchangeOptions.nxtomesotrade_g2
        },
        "그룹3 (챌린저스)": {
          "메소": settings.cashItemRates.GROUP3.meso,
          "넥슨캐시": settings.cashItemRates.GROUP3.nx,
          "넥슨캐시→메소 거래 활성화": flattenedExchangeOptions.nxtomesotrade_g3
        }
      },
      
      // 메소마켓 시세
      "메소마켓 시세": {
        "그룹1+3 (일반섭+챌린저스)": {
          "시세 (메포/1억메소)": settings.mesoMarketRates.GROUP1_3,
          "메소→메포 거래 활성화": flattenedExchangeOptions.mesotomptrade_g1_3,
          "메포→메소 거래 활성화": flattenedExchangeOptions.mptomesotrade_g1_3
        },
        "그룹2 (에오스)": {
          "시세 (메포/1억메소)": settings.mesoMarketRates.GROUP2,
          "메소→메포 거래 활성화": flattenedExchangeOptions.mesotomptrade_g2,
          "메포→메소 거래 활성화": flattenedExchangeOptions.mptomesotrade_g2
        }
      },
      
      // 현금거래 시세
      "현금거래 시세": {
        "그룹1 (일반섭)": {
          "구매 시세 (원/1억메소)": settings.cashTradeRates.GROUP1.buy,
          "판매 시세 (원/1억메소)": settings.cashTradeRates.GROUP1.sell,
          "현금→메소 거래 활성화": flattenedExchangeOptions.krwtomesotrade_g1,
          "메소→현금 거래 활성화": flattenedExchangeOptions.mesotokrwtrade_g1
        },
        "그룹2 (에오스)": {
          "구매 시세 (원/1억메소)": settings.cashTradeRates.GROUP2.buy,
          "판매 시세 (원/1억메소)": settings.cashTradeRates.GROUP2.sell,
          "현금→메소 거래 활성화": flattenedExchangeOptions.krwtomesotrade_g2,
          "메소→현금 거래 활성화": flattenedExchangeOptions.mesotokrwtrade_g2
        },
        "그룹3 (챌린저스)": {
          "구매 시세 (원/1억메소)": settings.cashTradeRates.GROUP3.buy,
          "판매 시세 (원/1억메소)": settings.cashTradeRates.GROUP3.sell,
          "현금→메소 거래 활성화": flattenedExchangeOptions.krwtomesotrade_g3,
          "메소→현금 거래 활성화": flattenedExchangeOptions.mesotokrwtrade_g3
        }
      },
      
      // 솔 에르다 조각 거래
      "솔 에르다 조각 거래": {
        "그룹1 (일반섭)": {
          "현금거래 구매 시세 (원/솔 에르다)": settings.solTradeRates.cash.GROUP1.buy,
          "현금거래 판매 시세 (원/솔 에르다)": settings.solTradeRates.cash.GROUP1.sell,
          "메소거래 구매 시세 (메소/솔 에르다)": settings.solTradeRates.meso.GROUP1.buy,
          "메소거래 판매 시세 (메소/솔 에르다)": settings.solTradeRates.meso.GROUP1.sell,
          "현금→솔 에르다 거래 활성화": flattenedExchangeOptions.krwtosoltrade_g1,
          "솔 에르다→현금 거래 활성화": flattenedExchangeOptions.soltokrwtrade_g1,
          "메소→솔 에르다 거래 활성화": flattenedExchangeOptions.mesotosoltrade_g1,
          "솔 에르다→메소 거래 활성화": flattenedExchangeOptions.soltomesotrade_g1
        },
        "그룹2 (에오스)": {
          "현금거래 구매 시세 (원/솔 에르다)": settings.solTradeRates.cash.GROUP2.buy,
          "현금거래 판매 시세 (원/솔 에르다)": settings.solTradeRates.cash.GROUP2.sell,
          "메소거래 구매 시세 (메소/솔 에르다)": settings.solTradeRates.meso.GROUP2.buy,
          "메소거래 판매 시세 (메소/솔 에르다)": settings.solTradeRates.meso.GROUP2.sell,
          "현금→솔 에르다 거래 활성화": flattenedExchangeOptions.krwtosoltrade_g2,
          "솔 에르다→현금 거래 활성화": flattenedExchangeOptions.soltokrwtrade_g2,
          "메소→솔 에르다 거래 활성화": flattenedExchangeOptions.mesotosoltrade_g2,
          "솔 에르다→메소 거래 활성화": flattenedExchangeOptions.soltomesotrade_g2
        },
        "그룹3 (챌린저스)": {
          "현금거래 구매 시세 (원/솔 에르다)": settings.solTradeRates.cash.GROUP3.buy,
          "현금거래 판매 시세 (원/솔 에르다)": settings.solTradeRates.cash.GROUP3.sell,
          "메소거래 구매 시세 (메소/솔 에르다)": settings.solTradeRates.meso.GROUP3.buy,
          "메소거래 판매 시세 (메소/솔 에르다)": settings.solTradeRates.meso.GROUP3.sell,
          "현금→솔 에르다 거래 활성화": flattenedExchangeOptions.krwtosoltrade_g3,
          "솔 에르다→현금 거래 활성화": flattenedExchangeOptions.soltokrwtrade_g3,
          "메소→솔 에르다 거래 활성화": flattenedExchangeOptions.mesotosoltrade_g3,
          "솔 에르다→메소 거래 활성화": flattenedExchangeOptions.soltomesotrade_g3
        }
      },
      
      // 상품권 할인
      "상품권 할인": settings.voucherDiscounts
    };
    
    const dataStr = JSON.stringify(configData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('설정 파일 다운로드 완료:', filename);
  } catch (error) {
    console.error('설정 파일 다운로드 실패:', error.message);
  }
}

/**
 * 파일 입력을 통해 설정을 가져옵니다.
 * @returns {Promise<object|null>} 로드된 설정 객체 또는 null
 */
export function importSettingsFromFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) {
        resolve(null);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          console.log('설정 파일 가져오기 성공:', config.description || 'Unknown config');
          
          // 새로운 형식 (v1.1+)인지 확인
          if (config.version && parseFloat(config.version) >= 1.1) {
            // 한글 키 형식인지 확인
            if (config["캐시템 경매장"]) {
              // 새로운 한글 키 형식
              const flattenedOptions = {
                // 캐시템 경매장
                nxtomesotrade_g1: config["캐시템 경매장"]["그룹1 (일반섭)"]["넥슨캐시→메소 거래 활성화"],
                nxtomesotrade_g2: config["캐시템 경매장"]["그룹2 (에오스)"]["넥슨캐시→메소 거래 활성화"],
                nxtomesotrade_g3: config["캐시템 경매장"]["그룹3 (챌린저스)"]["넥슨캐시→메소 거래 활성화"],
                
                // 메소마켓
                mesotomptrade_g1_3: config["메소마켓 시세"]["그룹1+3 (일반섭+챌린저스)"]["메소→메포 거래 활성화"],
                mptomesotrade_g1_3: config["메소마켓 시세"]["그룹1+3 (일반섭+챌린저스)"]["메포→메소 거래 활성화"],
                mesotomptrade_g2: config["메소마켓 시세"]["그룹2 (에오스)"]["메소→메포 거래 활성화"],
                mptomesotrade_g2: config["메소마켓 시세"]["그룹2 (에오스)"]["메포→메소 거래 활성화"],
                
                // 현금거래
                krwtomesotrade_g1: config["현금거래 시세"]["그룹1 (일반섭)"]["현금→메소 거래 활성화"],
                mesotokrwtrade_g1: config["현금거래 시세"]["그룹1 (일반섭)"]["메소→현금 거래 활성화"],
                krwtomesotrade_g2: config["현금거래 시세"]["그룹2 (에오스)"]["현금→메소 거래 활성화"],
                mesotokrwtrade_g2: config["현금거래 시세"]["그룹2 (에오스)"]["메소→현금 거래 활성화"],
                krwtomesotrade_g3: config["현금거래 시세"]["그룹3 (챌린저스)"]["현금→메소 거래 활성화"],
                mesotokrwtrade_g3: config["현금거래 시세"]["그룹3 (챌린저스)"]["메소→현금 거래 활성화"],
                
                // 솔 에르다 거래
                krwtosoltrade_g1: config["솔 에르다 조각 거래"]["그룹1 (일반섭)"]["현금→솔 에르다 거래 활성화"],
                soltokrwtrade_g1: config["솔 에르다 조각 거래"]["그룹1 (일반섭)"]["솔 에르다→현금 거래 활성화"],
                mesotosoltrade_g1: config["솔 에르다 조각 거래"]["그룹1 (일반섭)"]["메소→솔 에르다 거래 활성화"],
                soltomesotrade_g1: config["솔 에르다 조각 거래"]["그룹1 (일반섭)"]["솔 에르다→메소 거래 활성화"],
                krwtosoltrade_g2: config["솔 에르다 조각 거래"]["그룹2 (에오스)"]["현금→솔 에르다 거래 활성화"],
                soltokrwtrade_g2: config["솔 에르다 조각 거래"]["그룹2 (에오스)"]["솔 에르다→현금 거래 활성화"],
                mesotosoltrade_g2: config["솔 에르다 조각 거래"]["그룹2 (에오스)"]["메소→솔 에르다 거래 활성화"],
                soltomesotrade_g2: config["솔 에르다 조각 거래"]["그룹2 (에오스)"]["솔 에르다→메소 거래 활성화"],
                krwtosoltrade_g3: config["솔 에르다 조각 거래"]["그룹3 (챌린저스)"]["현금→솔 에르다 거래 활성화"],
                soltokrwtrade_g3: config["솔 에르다 조각 거래"]["그룹3 (챌린저스)"]["솔 에르다→현금 거래 활성화"],
                mesotosoltrade_g3: config["솔 에르다 조각 거래"]["그룹3 (챌린저스)"]["메소→솔 에르다 거래 활성화"],
                soltomesotrade_g3: config["솔 에르다 조각 거래"]["그룹3 (챌린저스)"]["솔 에르다→메소 거래 활성화"]
              };
              
              const exchangeOptions = unflattenExchangeOptions(flattenedOptions);
              
              const settings = {
                mesoMarketRates: {
                  GROUP1_3: config["메소마켓 시세"]["그룹1+3 (일반섭+챌린저스)"]["시세 (메포/1억메소)"],
                  GROUP2: config["메소마켓 시세"]["그룹2 (에오스)"]["시세 (메포/1억메소)"]
                },
                cashTradeRates: {
                  GROUP1: {
                    buy: config["현금거래 시세"]["그룹1 (일반섭)"]["구매 시세 (원/1억메소)"],
                    sell: config["현금거래 시세"]["그룹1 (일반섭)"]["판매 시세 (원/1억메소)"]
                  },
                  GROUP2: {
                    buy: config["현금거래 시세"]["그룹2 (에오스)"]["구매 시세 (원/1억메소)"],
                    sell: config["현금거래 시세"]["그룹2 (에오스)"]["판매 시세 (원/1억메소)"]
                  },
                  GROUP3: {
                    buy: config["현금거래 시세"]["그룹3 (챌린저스)"]["구매 시세 (원/1억메소)"],
                    sell: config["현금거래 시세"]["그룹3 (챌린저스)"]["판매 시세 (원/1억메소)"]
                  }
                },
                solTradeRates: {
                  cash: {
                    GROUP1: {
                      buy: config["솔 에르다 조각 거래"]["그룹1 (일반섭)"]["현금거래 구매 시세 (원/솔 에르다)"],
                      sell: config["솔 에르다 조각 거래"]["그룹1 (일반섭)"]["현금거래 판매 시세 (원/솔 에르다)"]
                    },
                    GROUP2: {
                      buy: config["솔 에르다 조각 거래"]["그룹2 (에오스)"]["현금거래 구매 시세 (원/솔 에르다)"],
                      sell: config["솔 에르다 조각 거래"]["그룹2 (에오스)"]["현금거래 판매 시세 (원/솔 에르다)"]
                    },
                    GROUP3: {
                      buy: config["솔 에르다 조각 거래"]["그룹3 (챌린저스)"]["현금거래 구매 시세 (원/솔 에르다)"],
                      sell: config["솔 에르다 조각 거래"]["그룹3 (챌린저스)"]["현금거래 판매 시세 (원/솔 에르다)"]
                    }
                  },
                  meso: {
                    GROUP1: {
                      buy: config["솔 에르다 조각 거래"]["그룹1 (일반섭)"]["메소거래 구매 시세 (메소/솔 에르다)"],
                      sell: config["솔 에르다 조각 거래"]["그룹1 (일반섭)"]["메소거래 판매 시세 (메소/솔 에르다)"]
                    },
                    GROUP2: {
                      buy: config["솔 에르다 조각 거래"]["그룹2 (에오스)"]["메소거래 구매 시세 (메소/솔 에르다)"],
                      sell: config["솔 에르다 조각 거래"]["그룹2 (에오스)"]["메소거래 판매 시세 (메소/솔 에르다)"]
                    },
                    GROUP3: {
                      buy: config["솔 에르다 조각 거래"]["그룹3 (챌린저스)"]["메소거래 구매 시세 (메소/솔 에르다)"],
                      sell: config["솔 에르다 조각 거래"]["그룹3 (챌린저스)"]["메소거래 판매 시세 (메소/솔 에르다)"]
                    }
                  }
                },
                cashItemRates: {
                  GROUP1: {
                    meso: config["캐시템 경매장"]["그룹1 (일반섭)"]["메소"],
                    nx: config["캐시템 경매장"]["그룹1 (일반섭)"]["넥슨캐시"]
                  },
                  GROUP2: {
                    meso: config["캐시템 경매장"]["그룹2 (에오스)"]["메소"],
                    nx: config["캐시템 경매장"]["그룹2 (에오스)"]["넥슨캐시"]
                  },
                  GROUP3: {
                    meso: config["캐시템 경매장"]["그룹3 (챌린저스)"]["메소"],
                    nx: config["캐시템 경매장"]["그룹3 (챌린저스)"]["넥슨캐시"]
                  }
                },
                mvpGrade: config["MVP 등급"],
                voucherDiscounts: config["상품권 할인"],
                exchangeOptions: exchangeOptions
              };
              
              resolve(settings);
            } else {
              // 기존 영문 키 형식
              const flattenedOptions = {
                mesotomptrade_g1_3: config.mesotomptrade_g1_3,
                mptomesotrade_g1_3: config.mptomesotrade_g1_3,
                mesotomptrade_g2: config.mesotomptrade_g2,
                mptomesotrade_g2: config.mptomesotrade_g2,
                krwtomesotrade_g1: config.krwtomesotrade_g1,
                mesotokrwtrade_g1: config.mesotokrwtrade_g1,
                krwtomesotrade_g2: config.krwtomesotrade_g2,
                mesotokrwtrade_g2: config.mesotokrwtrade_g2,
                krwtomesotrade_g3: config.krwtomesotrade_g3,
                mesotokrwtrade_g3: config.mesotokrwtrade_g3,
                krwtosoltrade_g1: config.krwtosoltrade_g1,
                soltokrwtrade_g1: config.soltokrwtrade_g1,
                mesotosoltrade_g1: config.mesotosoltrade_g1,
                soltomesotrade_g1: config.soltomesotrade_g1,
                krwtosoltrade_g2: config.krwtosoltrade_g2,
                soltokrwtrade_g2: config.soltokrwtrade_g2,
                mesotosoltrade_g2: config.mesotosoltrade_g2,
                soltomesotrade_g2: config.soltomesotrade_g2,
                krwtosoltrade_g3: config.krwtosoltrade_g3,
                soltokrwtrade_g3: config.soltokrwtrade_g3,
                mesotosoltrade_g3: config.mesotosoltrade_g3,
                soltomesotrade_g3: config.soltomesotrade_g3,
                nxtomesotrade_g1: config.nxtomesotrade_g1,
                nxtomesotrade_g2: config.nxtomesotrade_g2,
                nxtomesotrade_g3: config.nxtomesotrade_g3
              };
              
              const exchangeOptions = unflattenExchangeOptions(flattenedOptions);
              
              const settings = {
                mesoMarketRates: config.mesoMarketRates,
                cashTradeRates: config.cashTradeRates,
                solTradeRates: config.solTradeRates,
                cashItemRates: config.cashItemRates,
                mvpGrade: config.mvpGrade,
                voucherDiscounts: config.voucherDiscounts,
                exchangeOptions: exchangeOptions
              };
              
              resolve(settings);
            }
          } else {
            // 기존 형식 (v1.0)
            resolve(config.settings || config);
          }
        } catch (error) {
          console.error('설정 파일 파싱 실패:', error.message);
          resolve(null);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  });
}