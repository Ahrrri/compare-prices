// 외부 설정 파일 로더
import { mergeSettings } from '../config/defaultSettings';



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
    
    // 조각 거래 (현금->조각, 조각->현금, 메소->조각, 조각->메소)
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
  
  // 조각 거래
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
      version: "3.0",
      exportedAt: new Date().toISOString(),
      
      // MVP 등급
      "MVP 등급": settings.mvpGrade,
      
      // 캐시템 경매장 (웹에서 첫 번째로 나오는 섹션)
      "캐시템 경매장": {
        "그룹1 (일반섭)": {
          "아이템 목록": settings.cashItemRates.GROUP1.items || [],
          "enabled": flattenedExchangeOptions.nxtomesotrade_g1
        },
        "그룹2 (에오스)": {
          "아이템 목록": settings.cashItemRates.GROUP2.items || [],
          "enabled": flattenedExchangeOptions.nxtomesotrade_g2
        },
        "그룹3 (챌린저스)": {
          "아이템 목록": settings.cashItemRates.GROUP3.items || [],
          "enabled": flattenedExchangeOptions.nxtomesotrade_g3
        }
      },
      
      // 메소마켓 시세
      "메소마켓 시세": {
        "그룹1+3 (일반섭+챌린저스)": {
          "메포→메소 (메포/1억메소)": {
            "price": settings.mesoMarketRates.GROUP1_3.sell,
            "enabled": flattenedExchangeOptions.mptomesotrade_g1_3
          },
          "메소→메포 (메포/1억메소)": {
            "price": settings.mesoMarketRates.GROUP1_3.buy,
            "enabled": flattenedExchangeOptions.mesotomptrade_g1_3
          }
        },
        "그룹2 (에오스)": {
          "메포→메소 (메포/1억메소)": {
            "price": settings.mesoMarketRates.GROUP2.sell,
            "enabled": flattenedExchangeOptions.mptomesotrade_g2
          },
          "메소→메포 (메포/1억메소)": {
            "price": settings.mesoMarketRates.GROUP2.buy,
            "enabled": flattenedExchangeOptions.mesotomptrade_g2
          }
        }
      },
      
      // 현금거래 시세
      "현금거래 시세": {
        "그룹1 (일반섭)": {
          "현금→메소 (원/1억메소)": {
            "price": settings.cashTradeRates.GROUP1.buy,
            "enabled": flattenedExchangeOptions.krwtomesotrade_g1
          },
          "메소→현금 (원/1억메소)": {
            "price": settings.cashTradeRates.GROUP1.sell,
            "enabled": flattenedExchangeOptions.mesotokrwtrade_g1
          }
        },
        "그룹2 (에오스)": {
          "현금→메소 (원/1억메소)": {
            "price": settings.cashTradeRates.GROUP2.buy,
            "enabled": flattenedExchangeOptions.krwtomesotrade_g2
          },
          "메소→현금 (원/1억메소)": {
            "price": settings.cashTradeRates.GROUP2.sell,
            "enabled": flattenedExchangeOptions.mesotokrwtrade_g2
          }
        },
        "그룹3 (챌린저스)": {
          "현금→메소 (원/1억메소)": {
            "price": settings.cashTradeRates.GROUP3.buy,
            "enabled": flattenedExchangeOptions.krwtomesotrade_g3
          },
          "메소→현금 (원/1억메소)": {
            "price": settings.cashTradeRates.GROUP3.sell,
            "enabled": flattenedExchangeOptions.mesotokrwtrade_g3
          }
        }
      },
      
      // 조각 거래
      "조각 거래": {
        "그룹1 (일반섭)": {
          "현금→조각 (원/개)": {
            "price": settings.solTradeRates.cash.GROUP1.buy,
            "enabled": flattenedExchangeOptions.krwtosoltrade_g1
          },
          "조각→현금 (원/개)": {
            "price": settings.solTradeRates.cash.GROUP1.sell,
            "enabled": flattenedExchangeOptions.soltokrwtrade_g1
          },
          "메소→조각 (메소/개)": {
            "price": settings.solTradeRates.meso.GROUP1.buy,
            "enabled": flattenedExchangeOptions.mesotosoltrade_g1
          },
          "조각→메소 (메소/개)": {
            "price": settings.solTradeRates.meso.GROUP1.sell,
            "enabled": flattenedExchangeOptions.soltomesotrade_g1
          }
        },
        "그룹2 (에오스)": {
          "현금→조각 (원/개)": {
            "price": settings.solTradeRates.cash.GROUP2.buy,
            "enabled": flattenedExchangeOptions.krwtosoltrade_g2
          },
          "조각→현금 (원/개)": {
            "price": settings.solTradeRates.cash.GROUP2.sell,
            "enabled": flattenedExchangeOptions.soltokrwtrade_g2
          },
          "메소→조각 (메소/개)": {
            "price": settings.solTradeRates.meso.GROUP2.buy,
            "enabled": flattenedExchangeOptions.mesotosoltrade_g2
          },
          "조각→메소 (메소/개)": {
            "price": settings.solTradeRates.meso.GROUP2.sell,
            "enabled": flattenedExchangeOptions.soltomesotrade_g2
          }
        },
        "그룹3 (챌린저스)": {
          "현금→조각 (원/개)": {
            "price": settings.solTradeRates.cash.GROUP3.buy,
            "enabled": flattenedExchangeOptions.krwtosoltrade_g3
          },
          "조각→현금 (원/개)": {
            "price": settings.solTradeRates.cash.GROUP3.sell,
            "enabled": flattenedExchangeOptions.soltokrwtrade_g3
          },
          "메소→조각 (메소/개)": {
            "price": settings.solTradeRates.meso.GROUP3.buy,
            "enabled": flattenedExchangeOptions.mesotosoltrade_g3
          },
          "조각→메소 (메소/개)": {
            "price": settings.solTradeRates.meso.GROUP3.sell,
            "enabled": flattenedExchangeOptions.soltomesotrade_g3
          }
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
          
          // 새로운 형식 (v3.0+)인지 확인
          if (config.version && parseFloat(config.version) >= 3.0) {
              const flattenedOptions = {
                // 캐시템 경매장
                nxtomesotrade_g1: config["캐시템 경매장"]["그룹1 (일반섭)"]["넥슨캐시→메소"]["enabled"],
                nxtomesotrade_g2: config["캐시템 경매장"]["그룹2 (에오스)"]["넥슨캐시→메소"]["enabled"],
                nxtomesotrade_g3: config["캐시템 경매장"]["그룹3 (챌린저스)"]["넥슨캐시→메소"]["enabled"],
                
                // 메소마켓
                mesotomptrade_g1_3: config["메소마켓 시세"]["그룹1+3 (일반섭+챌린저스)"]["메소→메포 (메포/1억메소)"]["enabled"],
                mptomesotrade_g1_3: config["메소마켓 시세"]["그룹1+3 (일반섭+챌린저스)"]["메포→메소 (메포/1억메소)"]["enabled"],
                mesotomptrade_g2: config["메소마켓 시세"]["그룹2 (에오스)"]["메소→메포 (메포/1억메소)"]["enabled"],
                mptomesotrade_g2: config["메소마켓 시세"]["그룹2 (에오스)"]["메포→메소 (메포/1억메소)"]["enabled"],
                
                // 현금거래
                krwtomesotrade_g1: config["현금거래 시세"]["그룹1 (일반섭)"]["현금→메소 (원/1억메소)"]["enabled"],
                mesotokrwtrade_g1: config["현금거래 시세"]["그룹1 (일반섭)"]["메소→현금 (원/1억메소)"]["enabled"],
                krwtomesotrade_g2: config["현금거래 시세"]["그룹2 (에오스)"]["현금→메소 (원/1억메소)"]["enabled"],
                mesotokrwtrade_g2: config["현금거래 시세"]["그룹2 (에오스)"]["메소→현금 (원/1억메소)"]["enabled"],
                krwtomesotrade_g3: config["현금거래 시세"]["그룹3 (챌린저스)"]["현금→메소 (원/1억메소)"]["enabled"],
                mesotokrwtrade_g3: config["현금거래 시세"]["그룹3 (챌린저스)"]["메소→현금 (원/1억메소)"]["enabled"],
                
                // 조각 거래
                krwtosoltrade_g1: config["조각 거래"]["그룹1 (일반섭)"]["현금→조각 (원/개)"]["enabled"],
                soltokrwtrade_g1: config["조각 거래"]["그룹1 (일반섭)"]["조각→현금 (원/개)"]["enabled"],
                mesotosoltrade_g1: config["조각 거래"]["그룹1 (일반섭)"]["메소→조각 (메소/개)"]["enabled"],
                soltomesotrade_g1: config["조각 거래"]["그룹1 (일반섭)"]["조각→메소 (메소/개)"]["enabled"],
                krwtosoltrade_g2: config["조각 거래"]["그룹2 (에오스)"]["현금→조각 (원/개)"]["enabled"],
                soltokrwtrade_g2: config["조각 거래"]["그룹2 (에오스)"]["조각→현금 (원/개)"]["enabled"],
                mesotosoltrade_g2: config["조각 거래"]["그룹2 (에오스)"]["메소→조각 (메소/개)"]["enabled"],
                soltomesotrade_g2: config["조각 거래"]["그룹2 (에오스)"]["조각→메소 (메소/개)"]["enabled"],
                krwtosoltrade_g3: config["조각 거래"]["그룹3 (챌린저스)"]["현금→조각 (원/개)"]["enabled"],
                soltokrwtrade_g3: config["조각 거래"]["그룹3 (챌린저스)"]["조각→현금 (원/개)"]["enabled"],
                mesotosoltrade_g3: config["조각 거래"]["그룹3 (챌린저스)"]["메소→조각 (메소/개)"]["enabled"],
                soltomesotrade_g3: config["조각 거래"]["그룹3 (챌린저스)"]["조각→메소 (메소/개)"]["enabled"]
              };
              
              const exchangeOptions = unflattenExchangeOptions(flattenedOptions);
              
              // 파일에서 읽은 설정 (일부만 있을 수 있음)
              const fileSettings = {};
              
              // 메소마켓 시세
              if (config["메소마켓 시세"]) {
                fileSettings.mesoMarketRates = {};
                if (config["메소마켓 시세"]["그룹1+3 (일반섭+챌린저스)"]) {
                  fileSettings.mesoMarketRates.GROUP1_3 = {
                    buy: config["메소마켓 시세"]["그룹1+3 (일반섭+챌린저스)"]["메소→메포 (메포/1억메소)"]?.["price"],
                    sell: config["메소마켓 시세"]["그룹1+3 (일반섭+챌린저스)"]["메포→메소 (메포/1억메소)"]?.["price"]
                  };
                }
                if (config["메소마켓 시세"]["그룹2 (에오스)"]) {
                  fileSettings.mesoMarketRates.GROUP2 = {
                    buy: config["메소마켓 시세"]["그룹2 (에오스)"]["메소→메포 (메포/1억메소)"]?.["price"],
                    sell: config["메소마켓 시세"]["그룹2 (에오스)"]["메포→메소 (메포/1억메소)"]?.["price"]
                  };
                }
              }
              
              // 현금거래 시세
              if (config["현금거래 시세"]) {
                fileSettings.cashTradeRates = {};
                if (config["현금거래 시세"]["그룹1 (일반섭)"]) {
                  fileSettings.cashTradeRates.GROUP1 = {
                    buy: config["현금거래 시세"]["그룹1 (일반섭)"]["현금→메소 (원/1억메소)"]?.["price"],
                    sell: config["현금거래 시세"]["그룹1 (일반섭)"]["메소→현금 (원/1억메소)"]?.["price"]
                  };
                }
                if (config["현금거래 시세"]["그룹2 (에오스)"]) {
                  fileSettings.cashTradeRates.GROUP2 = {
                    buy: config["현금거래 시세"]["그룹2 (에오스)"]["현금→메소 (원/1억메소)"]?.["price"],
                    sell: config["현금거래 시세"]["그룹2 (에오스)"]["메소→현금 (원/1억메소)"]?.["price"]
                  };
                }
                if (config["현금거래 시세"]["그룹3 (챌린저스)"]) {
                  fileSettings.cashTradeRates.GROUP3 = {
                    buy: config["현금거래 시세"]["그룹3 (챌린저스)"]["현금→메소 (원/1억메소)"]?.["price"],
                    sell: config["현금거래 시세"]["그룹3 (챌린저스)"]["메소→현금 (원/1억메소)"]?.["price"]
                  };
                }
              }
              
              // 조각 거래 시세
              if (config["조각 거래"]) {
                fileSettings.solTradeRates = { cash: {}, meso: {} };
                
                // 각 그룹별로 처리
                ["그룹1 (일반섭)", "그룹2 (에오스)", "그룹3 (챌린저스)"].forEach((groupName, index) => {
                  const groupKey = `GROUP${index + 1}`;
                  if (config["조각 거래"][groupName]) {
                    fileSettings.solTradeRates.cash[groupKey] = {
                      buy: config["조각 거래"][groupName]["현금→조각 (원/개)"]?.["price"],
                      sell: config["조각 거래"][groupName]["조각→현금 (원/개)"]?.["price"]
                    };
                    fileSettings.solTradeRates.meso[groupKey] = {
                      buy: config["조각 거래"][groupName]["메소→조각 (메소/개)"]?.["price"],
                      sell: config["조각 거래"][groupName]["조각→메소 (메소/개)"]?.["price"]
                    };
                  }
                });
              }
              
              // 캐시템 경매장
              if (config["캐시템 경매장"]) {
                fileSettings.cashItemRates = {};
                if (config["캐시템 경매장"]["그룹1 (일반섭)"]) {
                  fileSettings.cashItemRates.GROUP1 = {
                    items: config["캐시템 경매장"]["그룹1 (일반섭)"]["아이템 목록"] || []
                  };
                }
                if (config["캐시템 경매장"]["그룹2 (에오스)"]) {
                  fileSettings.cashItemRates.GROUP2 = {
                    items: config["캐시템 경매장"]["그룹2 (에오스)"]["아이템 목록"] || []
                  };
                }
                if (config["캐시템 경매장"]["그룹3 (챌린저스)"]) {
                  fileSettings.cashItemRates.GROUP3 = {
                    items: config["캐시템 경매장"]["그룹3 (챌린저스)"]["아이템 목록"] || []
                  };
                }
              }
              
              // MVP 등급
              if (config["MVP 등급"]) {
                fileSettings.mvpGrade = config["MVP 등급"];
              }
              
              // 상품권 할인
              if (config["상품권 할인"]) {
                fileSettings.voucherDiscounts = config["상품권 할인"];
              }
              
              // 교환 옵션
              if (exchangeOptions) {
                fileSettings.exchangeOptions = exchangeOptions;
              }
              
              // 기본값과 병합
              const mergedSettings = mergeSettings(fileSettings);
              resolve(mergedSettings);
          } else {
            console.error('지원하지 않는 설정 파일 버전입니다. v3.0 이상 파일만 지원됩니다.');
            resolve(null);
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