import React from 'react';
import './SettingsPanel.css';

const SettingsPanel = ({
  mesoMarketRates,
  setMesoMarketRates,
  cashTradeRates,
  setCashTradeRates,
  solTradeRates,
  setSolTradeRates,
  mvpGrade,
  setMvpGrade,
  voucherDiscounts,
  setVoucherDiscounts,
  exchangeOptions,
  setExchangeOptions
}) => {
  return (
    <div className="settings">
      <h2>설정</h2>
      
      {/* MVP 등급 선택 */}
      <div className="mvp-selection">
        <label>MVP 등급: </label>
        <select className="mvp-select" value={mvpGrade} onChange={(e) => setMvpGrade(e.target.value)}>
          <option value="NONE">실버 미만 (없음/브론즈)</option>
          <option value="SILVER_PLUS">실버 이상</option>
        </select>
      </div>
      
      {/* 메소마켓 시세 */}
      <h3 className="section-header">메소마켓 시세</h3>
      <div className="market-rate-row">
        <label>그룹1+3 (일반/챌린저스): </label>
        <input
          className="rate-input"
          type="text"
          value={mesoMarketRates.GROUP1_3.toLocaleString()}
          onChange={(e) => {
            const value = e.target.value.replace(/,/g, '');
            if (value === '' || /^\d+$/.test(value)) {
              setMesoMarketRates(prev => ({...prev, GROUP1_3: parseInt(value) || 0}));
            }
          }}
        />
        <span className="rate-unit"> 메포/1억메소</span>
        <div className="checkbox-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="meso-buy-g13"
              checked={exchangeOptions.mesomarketBuy_G13.enabled}
              onChange={(e) => {
                setExchangeOptions(prev => ({
                  ...prev,
                  mesomarketBuy_G13: { enabled: e.target.checked }
                }));
              }}
            />
            <label htmlFor="meso-buy-g13">메포→메소</label>
          </div>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="meso-sell-g13"
              checked={exchangeOptions.mesomarketSell_G13.enabled}
              onChange={(e) => {
                setExchangeOptions(prev => ({
                  ...prev,
                  mesomarketSell_G13: { enabled: e.target.checked }
                }));
              }}
            />
            <label htmlFor="meso-sell-g13">메소→메포</label>
          </div>
        </div>
      </div>
      
      <div className="market-rate-row">
        <label>그룹2 (에오스): </label>
        <input
          className="rate-input"
          type="text"
          value={mesoMarketRates.GROUP2.toLocaleString()}
          onChange={(e) => {
            const value = e.target.value.replace(/,/g, '');
            if (value === '' || /^\d+$/.test(value)) {
              setMesoMarketRates(prev => ({...prev, GROUP2: parseInt(value) || 0}));
            }
          }}
        />
        <span className="rate-unit"> 메포/1억메소</span>
        <div className="checkbox-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="meso-buy-g2"
              checked={exchangeOptions.mesomarketBuy_G2.enabled}
              onChange={(e) => {
                setExchangeOptions(prev => ({
                  ...prev,
                  mesomarketBuy_G2: { enabled: e.target.checked }
                }));
              }}
            />
            <label htmlFor="meso-buy-g2">메포→메소</label>
          </div>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="meso-sell-g2"
              checked={exchangeOptions.mesomarketSell_G2.enabled}
              onChange={(e) => {
                setExchangeOptions(prev => ({
                  ...prev,
                  mesomarketSell_G2: { enabled: e.target.checked }
                }));
              }}
            />
            <label htmlFor="meso-sell-g2">메소→메포</label>
          </div>
        </div>
      </div>
      
      {/* 현금거래 시세 */}
      <h3 className="section-header">현금거래 시세</h3>
      
      <div className="cash-trade-section">
        <h4 className="cash-trade-header">그룹1 (일반섭)</h4>
        <div className="cash-trade-content">
          <div className="group-row">
            <input
              className="rate-input"
              type="text"
              value={cashTradeRates.GROUP1.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setCashTradeRates(prev => ({...prev, GROUP1: parseInt(value) || 0}));
                }
              }}
            />
            <span className="rate-unit"> 원/1억메소</span>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cash-buy-g1"
                  checked={exchangeOptions.cashtradeBuy_G1.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      cashtradeBuy_G1: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="cash-buy-g1">현금→메소</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cash-sell-g1"
                  checked={exchangeOptions.cashtradeSell_G1.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      cashtradeSell_G1: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="cash-sell-g1">메소→현금</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="cash-trade-section">
        <h4 className="cash-trade-header">그룹2 (에오스)</h4>
        <div className="cash-trade-content">
          <div className="group-row">
            <input
              className="rate-input"
              type="text"
              value={cashTradeRates.GROUP2.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setCashTradeRates(prev => ({...prev, GROUP2: parseInt(value) || 0}));
                }
              }}
            />
            <span className="rate-unit"> 원/1억메소</span>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cash-buy-g2"
                  checked={exchangeOptions.cashtradeBuy_G2.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      cashtradeBuy_G2: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="cash-buy-g2">현금→메소</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cash-sell-g2"
                  checked={exchangeOptions.cashtradeSell_G2.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      cashtradeSell_G2: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="cash-sell-g2">메소→현금</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="cash-trade-section">
        <h4 className="cash-trade-header">그룹3 (챌린저스)</h4>
        <div className="cash-trade-content">
          <div className="group-row">
            <input
              className="rate-input"
              type="text"
              value={cashTradeRates.GROUP3.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setCashTradeRates(prev => ({...prev, GROUP3: parseInt(value) || 0}));
                }
              }}
            />
            <span className="rate-unit"> 원/1억메소</span>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cash-buy-g3"
                  checked={exchangeOptions.cashtradeBuy_G3.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      cashtradeBuy_G3: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="cash-buy-g3">현금→메소</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="cash-sell-g3"
                  checked={exchangeOptions.cashtradeSell_G3.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      cashtradeSell_G3: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="cash-sell-g3">메소→현금</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 솔 에르다 조각 거래 시세 */}
      <h3 className="section-header">솔 에르다 조각 거래 시세</h3>
      
      <div className="sol-trade-section">
        <h4 className="sol-trade-header">그룹1 (일반섭)</h4>
        <div className="sol-trade-content">
          <div className="group-row">
            <label className="sol-trade-label">현금거래: </label>
            <input
              className="sol-rate-input"
              type="text"
              value={solTradeRates.cash.GROUP1.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setSolTradeRates(prev => ({
                    ...prev,
                    cash: { ...prev.cash, GROUP1: parseInt(value) || 0 }
                  }));
                }
              }}
            />
            <span className="sol-unit"> 원/개</span>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="sol-cash-krw-to-sol-g1"
                  checked={exchangeOptions.solCashBuy_G1.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      solCashBuy_G1: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="sol-cash-krw-to-sol-g1">현금→솔 에르다 조각</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="sol-cash-sol-to-krw-g1"
                  checked={exchangeOptions.solCashSell_G1.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      solCashSell_G1: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="sol-cash-sol-to-krw-g1">솔 에르다 조각→현금</label>
              </div>
            </div>
          </div>
          <div className="group-row">
            <label className="sol-trade-label">메소거래: </label>
            <input
              className="sol-rate-input"
              type="text"
              value={solTradeRates.meso.GROUP1.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setSolTradeRates(prev => ({
                    ...prev,
                    meso: { ...prev.meso, GROUP1: parseInt(value) || 0 }
                  }));
                }
              }}
            />
            <span className="sol-unit"> 메소/개</span>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="sol-meso-meso-to-sol-g1"
                  checked={exchangeOptions.solMesoBuy_G1.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      solMesoBuy_G1: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="sol-meso-meso-to-sol-g1">메소→솔 에르다 조각</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="sol-meso-sol-to-meso-g1"
                  checked={exchangeOptions.solMesoSell_G1.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      solMesoSell_G1: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="sol-meso-sol-to-meso-g1">솔 에르다 조각→메소</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 그룹2 솔 에르다 설정 */}
      <div className="sol-trade-section">
        <h4 className="sol-trade-header">그룹2 (에오스)</h4>
        <div className="sol-trade-content">
          <div className="group-row">
            <label className="sol-trade-label">현금거래: </label>
            <input
              className="sol-rate-input"
              type="text"
              value={solTradeRates.cash.GROUP2.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setSolTradeRates(prev => ({
                    ...prev,
                    cash: { ...prev.cash, GROUP2: parseInt(value) || 0 }
                  }));
                }
              }}
            />
            <span className="sol-unit"> 원/개</span>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="sol-cash-krw-to-sol-g2"
                  checked={exchangeOptions.solCashBuy_G2.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      solCashBuy_G2: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="sol-cash-krw-to-sol-g2">현금→솔 에르다 조각</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="sol-cash-sol-to-krw-g2"
                  checked={exchangeOptions.solCashSell_G2.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      solCashSell_G2: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="sol-cash-sol-to-krw-g2">솔 에르다 조각→현금</label>
              </div>
            </div>
          </div>
          <div className="group-row">
            <label className="sol-trade-label">메소거래: </label>
            <input
              className="sol-rate-input"
              type="text"
              value={solTradeRates.meso.GROUP2.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setSolTradeRates(prev => ({
                    ...prev,
                    meso: { ...prev.meso, GROUP2: parseInt(value) || 0 }
                  }));
                }
              }}
            />
            <span className="sol-unit"> 메소/개</span>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="sol-meso-meso-to-sol-g2"
                  checked={exchangeOptions.solMesoBuy_G2.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      solMesoBuy_G2: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="sol-meso-meso-to-sol-g2">메소→솔 에르다 조각</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="sol-meso-sol-to-meso-g2"
                  checked={exchangeOptions.solMesoSell_G2.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      solMesoSell_G2: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="sol-meso-sol-to-meso-g2">솔 에르다 조각→메소</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 그룹3 솔 에르다 설정 */}
      <div className="sol-trade-section">
        <h4 className="sol-trade-header">그룹3 (챌린저스)</h4>
        <div className="sol-trade-content">
          <div className="group-row">
            <label className="sol-trade-label">현금거래: </label>
            <input
              className="sol-rate-input"
              type="text"
              value={solTradeRates.cash.GROUP3.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setSolTradeRates(prev => ({
                    ...prev,
                    cash: { ...prev.cash, GROUP3: parseInt(value) || 0 }
                  }));
                }
              }}
            />
            <span className="sol-unit"> 원/개</span>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="sol-cash-krw-to-sol-g3"
                  checked={exchangeOptions.solCashBuy_G3.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      solCashBuy_G3: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="sol-cash-krw-to-sol-g3">현금→솔 에르다 조각</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="sol-cash-sol-to-krw-g3"
                  checked={exchangeOptions.solCashSell_G3.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      solCashSell_G3: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="sol-cash-sol-to-krw-g3">솔 에르다 조각→현금</label>
              </div>
            </div>
          </div>
          <div className="group-row">
            <label className="sol-trade-label">메소거래: </label>
            <input
              className="sol-rate-input"
              type="text"
              value={solTradeRates.meso.GROUP3.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setSolTradeRates(prev => ({
                    ...prev,
                    meso: { ...prev.meso, GROUP3: parseInt(value) || 0 }
                  }));
                }
              }}
            />
            <span className="sol-unit"> 메소/개</span>
            <div className="checkbox-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="sol-meso-meso-to-sol-g3"
                  checked={exchangeOptions.solMesoBuy_G3.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      solMesoBuy_G3: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="sol-meso-meso-to-sol-g3">메소→솔 에르다 조각</label>
              </div>
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="sol-meso-sol-to-meso-g3"
                  checked={exchangeOptions.solMesoSell_G3.enabled}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      solMesoSell_G3: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor="sol-meso-sol-to-meso-g3">솔 에르다 조각→메소</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 직접 변환 */}
      <h3 className="section-header">직접 변환</h3>
      <div className="direct-conversion">
        <input
          type="checkbox"
          id="direct-exchange"
          checked={exchangeOptions.direct.enabled}
          onChange={(e) => {
            setExchangeOptions(prev => ({
              ...prev,
              direct: { ...prev.direct, enabled: e.target.checked }
            }));
          }}
        />
        <label htmlFor="direct-exchange">
          넥슨캐시 → 메이플포인트 (1:1 변환)
        </label>
      </div>
      
      {/* 상품권 할인 설정 */}
      <h3 className="section-header">상품권 할인 설정</h3>
      <div className="voucher-section">
        {Object.entries(voucherDiscounts).map(([key, voucher]) => (
          <div key={key} className="voucher-item">
            <input
              className="voucher-checkbox"
              type="checkbox"
              id={`voucher-${key}`}
              checked={voucher.enabled}
              onChange={(e) => {
                setVoucherDiscounts(prev => ({
                  ...prev,
                  [key]: { ...prev[key], enabled: e.target.checked }
                }));
              }}
            />
            <label className="voucher-label" htmlFor={`voucher-${key}`}>{voucher.name}</label>
            
            <input
              className="voucher-input"
              type="text"
              value={voucher.rate}
              onChange={(e) => {
                setVoucherDiscounts(prev => ({
                  ...prev,
                  [key]: { ...prev[key], rate: parseFloat(e.target.value) || 0 }
                }));
              }}
              disabled={!voucher.enabled}
            />
            <span className="voucher-unit">%</span>
            
            {voucher.limit > 0 && (
              <>
                <input
                  className="voucher-input"
                  type="text"
                  value={voucher.remainingLimit.toLocaleString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, '');
                    if (value === '' || /^\d+$/.test(value)) {
                      setVoucherDiscounts(prev => ({
                        ...prev,
                        [key]: { ...prev[key], remainingLimit: parseInt(value) || 0 }
                      }));
                    }
                  }}
                  disabled={!voucher.enabled}
                />
                <span className="voucher-limit-text">원 / {voucher.limit.toLocaleString()}원</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPanel;