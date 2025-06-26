import React, { useState } from 'react';
import './SettingsPanel.css';
import { downloadSettingsAsFile, importSettingsFromFile } from '../utils/configLoader';

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
  setExchangeOptions,
  cashItemRates,
  setCashItemRates,
  resetToDefaults
}) => {
  // 섹션 접기/펼치기 상태
  const [expandedSections, setExpandedSections] = useState({
    cashItem: true,
    cashItemG1: true,
    cashItemG2: true,
    cashItemG3: true,
    mileageCalculator: true,
    mesoMarket: true,
    cashTrade: true,
    solTrade: true,
    direct: true,
    voucher: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 캐시템 아이템 관리 함수들
  const addCashItem = (group) => {
    const newItem = {
      id: `item_${Date.now()}`,
      name: '새 아이템',
      meso: 50000000,
      nx: 1000,
      mileageRatio: 0,
      remainingLimit: 5
    };
    
    setCashItemRates(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        items: [...(prev[group].items || []), newItem]
      }
    }));
  };

  const removeCashItem = (group, itemId) => {
    setCashItemRates(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        items: (prev[group].items || []).filter(item => item.id !== itemId)
      }
    }));
  };

  const updateCashItem = (group, itemId, field, value) => {
    setCashItemRates(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        items: (prev[group].items || []).map(item =>
          item.id === itemId ? { ...item, [field]: value } : item
        )
      }
    }));
  };
  // 현재 설정을 객체로 수집
  const getCurrentSettings = () => ({
    mesoMarketRates,
    cashTradeRates,
    solTradeRates,
    cashItemRates,
    mvpGrade,
    voucherDiscounts,
    exchangeOptions
  });

  // 설정을 적용하는 함수
  const applySettings = (settings) => {
    if (settings.mesoMarketRates) setMesoMarketRates(settings.mesoMarketRates);
    if (settings.cashTradeRates) setCashTradeRates(settings.cashTradeRates);
    if (settings.solTradeRates) setSolTradeRates(settings.solTradeRates);
    if (settings.cashItemRates) setCashItemRates(settings.cashItemRates);
    if (settings.mvpGrade) setMvpGrade(settings.mvpGrade);
    if (settings.voucherDiscounts) setVoucherDiscounts(settings.voucherDiscounts);
    if (settings.exchangeOptions) setExchangeOptions(settings.exchangeOptions);
  };


  // 파일로 내보내기
  const handleExportToFile = () => {
    downloadSettingsAsFile(getCurrentSettings());
  };

  // 파일에서 가져오기
  const handleImportFromFile = async () => {
    const settings = await importSettingsFromFile();
    if (settings) {
      applySettings(settings);
      alert('설정 파일을 불러왔습니다.');
    } else {
      alert('설정 파일 불러오기에 실패했습니다.');
    }
  };

  // 기본값으로 초기화
  const handleResetToDefaults = () => {
    if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      resetToDefaults();
      alert('설정이 초기화되었습니다.');
    }
  };
  return (
    <div className="settings">
      <h2>설정</h2>
      
      {/* 설정 관리 버튼들 */}
      <div className="settings-management">
        <div className="settings-buttons-row">
          <button className="settings-btn export-btn" onClick={handleExportToFile}>
            📤 파일로 내보내기
          </button>
          <button className="settings-btn import-btn" onClick={handleImportFromFile}>
            📥 파일에서 가져오기
          </button>
          <button className="settings-btn reset-btn" onClick={handleResetToDefaults}>
            🔄 기본값으로 초기화
          </button>
        </div>
      </div>
      
      {/* MVP 등급 선택 */}
      <div className="mvp-selection">
        <label>MVP 등급: </label>
        <select className="mvp-select" value={mvpGrade} onChange={(e) => setMvpGrade(e.target.value)}>
          <option value="NONE">실버 미만 (없음/브론즈)</option>
          <option value="SILVER_PLUS">실버 이상</option>
        </select>
      </div>
      
      {/* 캐시템 경매장 시세 */}
      <h3 className="section-header collapsible" onClick={() => toggleSection('cashItem')}>
        <span className={`arrow ${expandedSections.cashItem ? 'expanded' : ''}`}>▶</span>
        캐시템 경매장 시세
      </h3>
      
      {expandedSections.cashItem && (
      <>
      {['GROUP1', 'GROUP2', 'GROUP3'].map((group, index) => {
        const sectionKey = `cashItemG${index + 1}`;
        return (
        <div key={group} className="cash-item-section">
          <div className="cash-item-header-row">
            <h4 className="cash-item-header collapsible" onClick={() => toggleSection(sectionKey)}>
              <span className={`arrow ${expandedSections[sectionKey] ? 'expanded' : ''}`}>▶</span>
              그룹{index + 1} ({['일반섭', '에오스', '챌린저스'][index]})
            </h4>
            <div className="cash-item-controls">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id={`cash-item-${group.toLowerCase()}`}
                  checked={exchangeOptions[`cashItem_G${index + 1}`]?.enabled || false}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      [`cashItem_G${index + 1}`]: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor={`cash-item-${group.toLowerCase()}`}>캐시→메소 활성화</label>
              </div>
              <button
                className="sort-btn"
                onClick={() => {
                  const sortedItems = [...(cashItemRates[group]?.items || [])].sort((a, b) => {
                    const efficiencyA = a.meso / a.nx;
                    const efficiencyB = b.meso / b.nx;
                    return efficiencyB - efficiencyA;
                  });
                  setCashItemRates(prev => ({
                    ...prev,
                    [group]: { ...prev[group], items: sortedItems }
                  }));
                }}
                disabled={!exchangeOptions[`cashItem_G${index + 1}`]?.enabled}
              >
                효율순 정렬 ↓
              </button>
            </div>
          </div>
          
          {expandedSections[sectionKey] && (
          <div className="cash-item-content">
            <div className="cash-item-items">
              {(cashItemRates[group]?.items || []).map((item) => (
                <div key={item.id} className="cash-item-row">
                  <input
                    type="text"
                    className="item-name-input"
                    value={item.name}
                    placeholder="아이템 이름"
                    onChange={(e) => updateCashItem(group, item.id, 'name', e.target.value)}
                    disabled={!exchangeOptions[`cashItem_G${index + 1}`]?.enabled}
                  />
                  
                  <div className="item-rates">
                    <input
                      className="rate-input"
                      type="text"
                      value={item.meso.toLocaleString()}
                      placeholder="메소"
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        if (value === '' || /^\d+$/.test(value)) {
                          updateCashItem(group, item.id, 'meso', parseInt(value) || 0);
                        }
                      }}
                      disabled={!exchangeOptions[`cashItem_G${index + 1}`]?.enabled}
                    />
                    <span className="cash-item-unit">메소 / </span>
                    <input
                      className="rate-input small"
                      type="text"
                      value={item.nx.toLocaleString()}
                      placeholder="캐시"
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        if (value === '' || /^\d+$/.test(value)) {
                          updateCashItem(group, item.id, 'nx', parseInt(value) || 0);
                        }
                      }}
                      disabled={!exchangeOptions[`cashItem_G${index + 1}`]?.enabled}
                    />
                    <span className="cash-item-unit">캐시</span>
                  </div>
                  
                  <div className="mileage-ratio">
                    <label>마일리지:</label>
                    <select
                      className="ratio-select"
                      value={item.mileageRatio}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        updateCashItem(group, item.id, 'mileageRatio', value);
                      }}
                      disabled={!exchangeOptions[`cashItem_G${index + 1}`]?.enabled}
                    >
                      <option value={0}>사용불가</option>
                      <option value={30}>30%</option>
                      <option value={100}>100%</option>
                    </select>
                  </div>
                  
                  <div className="item-limits">
                    <label>잔여:</label>
                    <input
                      className="limit-input"
                      type="number"
                      min="0"
                      value={item.remainingLimit}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateCashItem(group, item.id, 'remainingLimit', value);
                      }}
                      disabled={!exchangeOptions[`cashItem_G${index + 1}`]?.enabled}
                    />
                    <span className="limit-unit">개</span>
                  </div>
                  
                  <button
                    className="remove-item-btn"
                    onClick={() => removeCashItem(group, item.id)}
                    disabled={!exchangeOptions[`cashItem_G${index + 1}`]?.enabled}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
            
            <button
              className="add-item-btn"
              onClick={() => addCashItem(group)}
              disabled={!exchangeOptions[`cashItem_G${index + 1}`]?.enabled}
            >
              + 아이템 추가
            </button>
          </div>
          )}
        </div>
        );
      })}
      </>
      )}
      
      {/* 마일리지 가치 계산 */}
      <h3 className="section-header collapsible" onClick={() => toggleSection('mileageCalculator')}>
        <span className={`arrow ${expandedSections.mileageCalculator ? 'expanded' : ''}`}>▶</span>
        마일리지 가치 계산
      </h3>
      
      {expandedSections.mileageCalculator && (
        <div className="mileage-calculator">
          {['GROUP1', 'GROUP2', 'GROUP3'].map((group, index) => {
            const items = cashItemRates[group]?.items || [];
            
            // 마일리지 사용 불가 아이템 중 최고 효율 찾기
            const noMileageItems = items.filter(item => item.mileageRatio === 0 && item.meso > 0 && item.nx > 0);
            const bestNoMileage = noMileageItems.length > 0 
              ? noMileageItems.reduce((max, item) => (item.meso / item.nx) > (max.meso / max.nx) ? item : max)
              : null;
            
            // 마일리지 사용 가능 아이템 중 최고 효율 찾기
            const mileageItems = items.filter(item => item.mileageRatio > 0 && item.meso > 0 && item.nx > 0);
            const bestMileage = mileageItems.length > 0
              ? mileageItems.reduce((max, item) => (item.meso / item.nx) > (max.meso / max.nx) ? item : max)
              : null;
            
            // 마일리지 가치 계산
            let mileageValue = 0;
            let calculation = "계산 불가";
            
            if (bestNoMileage && bestMileage) {
              const mvpFeeRate = mvpGrade === 'SILVER_PLUS' ? 3 : 5;
              const noMileageEfficiency = (bestNoMileage.meso / bestNoMileage.nx) * (1 - mvpFeeRate / 100);
              
              // 동일한 캐시로 비교 (마일리지 사용 가능 아이템의 캐시 부분)
              const cashPortion = bestMileage.nx * (100 - bestMileage.mileageRatio) / 100;
              const noMileageEquivalent = cashPortion * noMileageEfficiency;
              const mileageResult = bestMileage.meso * (1 - mvpFeeRate / 100);
              
              if (mileageResult > noMileageEquivalent) {
                const mileageAmount = bestMileage.nx * bestMileage.mileageRatio / 100;
                mileageValue = (mileageResult - noMileageEquivalent) / mileageAmount;
                calculation = `${mileageAmount.toLocaleString()}마일리지 = ${(mileageResult - noMileageEquivalent).toLocaleString()}메소`;
              }
            }
            
            return (
              <div key={group} className="mileage-group">
                <h4 className="mileage-group-header">
                  그룹{index + 1} ({['일반섭', '에오스', '챌린저스'][index]})
                </h4>
                <div className="mileage-calculation">
                  {bestNoMileage && bestMileage ? (
                    <>
                      <div className="calculation-row">
                        <span className="label">마일리지 미사용 최고효율:</span>
                        <span className="value">{bestNoMileage.name} ({(bestNoMileage.meso / bestNoMileage.nx).toFixed(0)} 메소/캐시)</span>
                      </div>
                      <div className="calculation-row">
                        <span className="label">마일리지 사용 최고효율:</span>
                        <span className="value">{bestMileage.name} ({(bestMileage.meso / bestMileage.nx).toFixed(0)} 메소/캐시, {bestMileage.mileageRatio}% 마일리지)</span>
                      </div>
                      <div className="calculation-row result">
                        <span className="label">마일리지 가치:</span>
                        <span className="value">{mileageValue > 0 ? `1 마일리지 = ${mileageValue.toFixed(2)} 메소` : '이득 없음'}</span>
                      </div>
                      <div className="calculation-detail">
                        {calculation}
                      </div>
                    </>
                  ) : (
                    <div className="no-calculation">
                      {!bestNoMileage && "마일리지 미사용 아이템이 없습니다."}
                      {!bestMileage && "마일리지 사용 아이템이 없습니다."}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* 메소마켓 시세 */}
      <h3 className="section-header collapsible" onClick={() => toggleSection('mesoMarket')}>
        <span className={`arrow ${expandedSections.mesoMarket ? 'expanded' : ''}`}>▶</span>
        메소마켓 시세
      </h3>
      
      {expandedSections.mesoMarket && (
      <>
      <div className="group-section">
        <h4 className="group-header">그룹1+3 (일반/챌린저스)</h4>
        <div className="group-content">
          <div className="trade-row">
            <input
              className="rate-input"
              type="text"
              value={mesoMarketRates.GROUP1_3.sell.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setMesoMarketRates(prev => ({
                    ...prev,
                    GROUP1_3: { ...prev.GROUP1_3, sell: parseInt(value) || 0 }
                  }));
                }
              }}
            />
            <span className="rate-unit">메포/억메소</span>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="mp-to-meso-g13"
                checked={exchangeOptions.mesomarketBuy_G13?.enabled || false}
                onChange={(e) => {
                  setExchangeOptions(prev => ({
                    ...prev,
                    mesomarketBuy_G13: { enabled: e.target.checked }
                  }));
                }}
              />
              <label htmlFor="mp-to-meso-g13">메포→메소</label>
              <input
                type="checkbox"
                id="meso-to-mp-g13"
                checked={exchangeOptions.mesomarketSell_G13?.enabled || false}
                onChange={(e) => {
                  setExchangeOptions(prev => ({
                    ...prev,
                    mesomarketSell_G13: { enabled: e.target.checked }
                  }));
                }}
              />
              <label htmlFor="meso-to-mp-g13">메소→메포</label>
            </div>
          </div>
          <div className="trade-row">
            <input
              className="rate-input"
              type="text"
              value={mesoMarketRates.GROUP1_3.buy.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setMesoMarketRates(prev => ({
                    ...prev,
                    GROUP1_3: { ...prev.GROUP1_3, buy: parseInt(value) || 0 }
                  }));
                }
              }}
            />
            <span className="rate-unit">메포/억메소</span>
          </div>
        </div>
      </div>

      <div className="group-section">
        <h4 className="group-header">그룹2 (에오스)</h4>
        <div className="group-content">
          <div className="trade-row">
            <input
              className="rate-input"
              type="text"
              value={mesoMarketRates.GROUP2.sell.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setMesoMarketRates(prev => ({
                    ...prev,
                    GROUP2: { ...prev.GROUP2, sell: parseInt(value) || 0 }
                  }));
                }
              }}
            />
            <span className="rate-unit">메포/억메소</span>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="mp-to-meso-g2"
                checked={exchangeOptions.mesomarketBuy_G2?.enabled || false}
                onChange={(e) => {
                  setExchangeOptions(prev => ({
                    ...prev,
                    mesomarketBuy_G2: { enabled: e.target.checked }
                  }));
                }}
              />
              <label htmlFor="mp-to-meso-g2">메포→메소</label>
              <input
                type="checkbox"
                id="meso-to-mp-g2"
                checked={exchangeOptions.mesomarketSell_G2?.enabled || false}
                onChange={(e) => {
                  setExchangeOptions(prev => ({
                    ...prev,
                    mesomarketSell_G2: { enabled: e.target.checked }
                  }));
                }}
              />
              <label htmlFor="meso-to-mp-g2">메소→메포</label>
            </div>
          </div>
          <div className="trade-row">
            <input
              className="rate-input"
              type="text"
              value={mesoMarketRates.GROUP2.buy.toLocaleString()}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '');
                if (value === '' || /^\d+$/.test(value)) {
                  setMesoMarketRates(prev => ({
                    ...prev,
                    GROUP2: { ...prev.GROUP2, buy: parseInt(value) || 0 }
                  }));
                }
              }}
            />
            <span className="rate-unit">메포/억메소</span>
          </div>
        </div>
      </div>
      </>
      )}

      {/* 현금거래 시세 */}
      <h3 className="section-header collapsible" onClick={() => toggleSection('cashTrade')}>
        <span className={`arrow ${expandedSections.cashTrade ? 'expanded' : ''}`}>▶</span>
        현금거래 시세
      </h3>
      
      {expandedSections.cashTrade && (
      <>
      {['GROUP1', 'GROUP2', 'GROUP3'].map((group, index) => (
        <div key={group} className="cash-trade-section">
          <h4 className="cash-trade-header">그룹{index + 1} ({['일반섭', '에오스', '챌린저스'][index]})</h4>
          <div className="cash-trade-content">
            <div className="group-row">
              <input
                className="rate-input"
                type="text"
                value={cashTradeRates[group].buy.toLocaleString()}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  if (value === '' || /^\d+$/.test(value)) {
                    setCashTradeRates(prev => ({
                      ...prev,
                      [group]: { ...prev[group], buy: parseInt(value) || 0 }
                    }));
                  }
                }}
              />
              <span className="rate-unit">원/억메소</span>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id={`cash-buy-${group.toLowerCase()}`}
                  checked={exchangeOptions[`cashtradeBuy_G${index + 1}`]?.enabled || false}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      [`cashtradeBuy_G${index + 1}`]: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor={`cash-buy-${group.toLowerCase()}`}>현금→메소</label>
                <input
                  type="checkbox"
                  id={`cash-sell-${group.toLowerCase()}`}
                  checked={exchangeOptions[`cashtradeSell_G${index + 1}`]?.enabled || false}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      [`cashtradeSell_G${index + 1}`]: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor={`cash-sell-${group.toLowerCase()}`}>메소→현금</label>
              </div>
            </div>
            <div className="group-row">
              <input
                className="rate-input"
                type="text"
                value={cashTradeRates[group].sell.toLocaleString()}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  if (value === '' || /^\d+$/.test(value)) {
                    setCashTradeRates(prev => ({
                      ...prev,
                      [group]: { ...prev[group], sell: parseInt(value) || 0 }
                    }));
                  }
                }}
              />
              <span className="rate-unit">원/억메소</span>
            </div>
          </div>
        </div>
      ))}
      </>
      )}

      {/* 조각 거래 시세 */}
      <h3 className="section-header collapsible" onClick={() => toggleSection('solTrade')}>
        <span className={`arrow ${expandedSections.solTrade ? 'expanded' : ''}`}>▶</span>
        조각 거래 시세
      </h3>
      
      {expandedSections.solTrade && (
      <>
      {['GROUP1', 'GROUP2', 'GROUP3'].map((group, index) => (
        <div key={group} className="sol-trade-section">
          <h4 className="sol-trade-header">그룹{index + 1} ({['일반섭', '에오스', '챌린저스'][index]})</h4>
          <div className="sol-trade-content">
            <div className="sol-subsection">
              <div className="sol-subsection-title">현금 거래</div>
              <div className="trade-row">
                <input
                  className="sol-rate-input"
                  type="text"
                  value={solTradeRates.cash[group].buy.toLocaleString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, '');
                    if (value === '' || /^\d+$/.test(value)) {
                      setSolTradeRates(prev => ({
                        ...prev,
                        cash: {
                          ...prev.cash,
                          [group]: { ...prev.cash[group], buy: parseInt(value) || 0 }
                        }
                      }));
                    }
                  }}
                />
                <span className="sol-unit">원/개</span>
                <input
                  type="checkbox"
                  className="sol-checkbox"
                  id={`sol-cash-buy-${group.toLowerCase()}`}
                  checked={exchangeOptions[`solCashBuy_G${index + 1}`]?.enabled || false}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      [`solCashBuy_G${index + 1}`]: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor={`sol-cash-buy-${group.toLowerCase()}`} className="sol-checkbox-label">현금→조각</label>
                <input
                  type="checkbox"
                  className="sol-checkbox"
                  id={`sol-cash-sell-${group.toLowerCase()}`}
                  checked={exchangeOptions[`solCashSell_G${index + 1}`]?.enabled || false}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      [`solCashSell_G${index + 1}`]: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor={`sol-cash-sell-${group.toLowerCase()}`} className="sol-checkbox-label-last">조각→현금</label>
              </div>
              <div className="trade-row">
                <input
                  className="sol-rate-input"
                  type="text"
                  value={solTradeRates.cash[group].sell.toLocaleString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, '');
                    if (value === '' || /^\d+$/.test(value)) {
                      setSolTradeRates(prev => ({
                        ...prev,
                        cash: {
                          ...prev.cash,
                          [group]: { ...prev.cash[group], sell: parseInt(value) || 0 }
                        }
                      }));
                    }
                  }}
                />
                <span className="sol-unit">원/개</span>
              </div>
            </div>
            
            <div className="sol-subsection">
              <div className="sol-subsection-title">메소 거래</div>
              <div className="trade-row">
                <input
                  className="sol-rate-input"
                  type="text"
                  value={solTradeRates.meso[group].buy.toLocaleString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, '');
                    if (value === '' || /^\d+$/.test(value)) {
                      setSolTradeRates(prev => ({
                        ...prev,
                        meso: {
                          ...prev.meso,
                          [group]: { ...prev.meso[group], buy: parseInt(value) || 0 }
                        }
                      }));
                    }
                  }}
                />
                <span className="sol-unit">메소/개</span>
                <input
                  type="checkbox"
                  className="sol-checkbox"
                  id={`sol-meso-buy-${group.toLowerCase()}`}
                  checked={exchangeOptions[`solMesoBuy_G${index + 1}`]?.enabled || false}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      [`solMesoBuy_G${index + 1}`]: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor={`sol-meso-buy-${group.toLowerCase()}`} className="sol-checkbox-label">메소→조각</label>
                <input
                  type="checkbox"
                  className="sol-checkbox"
                  id={`sol-meso-sell-${group.toLowerCase()}`}
                  checked={exchangeOptions[`solMesoSell_G${index + 1}`]?.enabled || false}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      [`solMesoSell_G${index + 1}`]: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor={`sol-meso-sell-${group.toLowerCase()}`} className="sol-checkbox-label-last">조각→메소</label>
              </div>
              <div className="trade-row">
                <input
                  className="sol-rate-input"
                  type="text"
                  value={solTradeRates.meso[group].sell.toLocaleString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, '');
                    if (value === '' || /^\d+$/.test(value)) {
                      setSolTradeRates(prev => ({
                        ...prev,
                        meso: {
                          ...prev.meso,
                          [group]: { ...prev.meso[group], sell: parseInt(value) || 0 }
                        }
                      }));
                    }
                  }}
                />
                <span className="sol-unit">메소/개</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      </>
      )}

      {/* 직접 변환 옵션 */}
      <h3 className="section-header collapsible" onClick={() => toggleSection('direct')}>
        <span className={`arrow ${expandedSections.direct ? 'expanded' : ''}`}>▶</span>
        직접 변환
      </h3>
      
      {expandedSections.direct && (
        <div className="direct-conversion">
          <input
            type="checkbox"
            id="direct-conversion"
            checked={exchangeOptions.direct?.enabled || false}
            onChange={(e) => {
              setExchangeOptions(prev => ({
                ...prev,
                direct: { enabled: e.target.checked }
              }));
            }}
          />
          <label htmlFor="direct-conversion">현금 → 넥슨캐시 → 메이플포인트 직접 변환 허용</label>
        </div>
      )}

      {/* 상품권 할인 */}
      <h3 className="section-header collapsible" onClick={() => toggleSection('voucher')}>
        <span className={`arrow ${expandedSections.voucher ? 'expanded' : ''}`}>▶</span>
        상품권 할인
      </h3>
      
      {expandedSections.voucher && (
      <div className="voucher-section">
        {Object.entries(voucherDiscounts).map(([key, voucher]) => (
          <div key={key} className="voucher-item">
            <input
              type="checkbox"
              className="voucher-checkbox"
              id={`voucher-${key}`}
              checked={voucher.enabled}
              onChange={(e) => {
                setVoucherDiscounts(prev => ({
                  ...prev,
                  [key]: { ...prev[key], enabled: e.target.checked }
                }));
              }}
            />
            <label htmlFor={`voucher-${key}`} className="voucher-label">{voucher.name}</label>
            <input
              className="voucher-input"
              type="text"
              value={voucher.rate}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setVoucherDiscounts(prev => ({
                  ...prev,
                  [key]: { ...prev[key], rate: value }
                }));
              }}
              disabled={!voucher.enabled}
            />
            <span className="voucher-unit">% 할인</span>
            <span className="voucher-limit-text">(월 한도: {voucher.limit.toLocaleString()}원)</span>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default SettingsPanel;