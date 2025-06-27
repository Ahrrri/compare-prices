import React, { useState, useEffect } from 'react';
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
  availableMileage,
  setAvailableMileage,
  mileageRates,
  setMileageRates,
  resetToDefaults,
  onUpdateGraph,
  hasUnsavedChanges
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
  
  // 마일리지 계산기용 선택된 아이템 상태
  const [selectedMileageItems, setSelectedMileageItems] = useState({});

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
    exchangeOptions,
    availableMileage,
    mileageRates
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
    if (settings.availableMileage !== undefined) setAvailableMileage(settings.availableMileage);
    if (settings.mileageRates) setMileageRates(settings.mileageRates);
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
      // 파일 가져오기 후 자동 정렬
      setTimeout(() => sortAllCashItemsByEfficiency(), 100);
    } else {
      alert('설정 파일 불러오기에 실패했습니다.');
    }
  };

  // 모든 그룹의 캐시아이템을 효율순으로 정렬하는 함수
  const sortAllCashItemsByEfficiency = () => {
    setCashItemRates(prev => {
      const newRates = { ...prev };
      ['GROUP1', 'GROUP2', 'GROUP3'].forEach(group => {
        if (newRates[group]?.items) {
          const sortedItems = [...newRates[group].items].sort((a, b) => {
            const efficiencyA = a.meso / a.nx;
            const efficiencyB = b.meso / b.nx;
            return efficiencyB - efficiencyA;
          });
          newRates[group] = { ...newRates[group], items: sortedItems };
        }
      });
      return newRates;
    });
  };

  // 기본값으로 초기화
  const handleResetToDefaults = () => {
    if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      resetToDefaults();
      alert('설정이 초기화되었습니다.');
      // 초기화 후 자동 정렬
      setTimeout(() => sortAllCashItemsByEfficiency(), 100);
    }
  };

  // 초기 로드 시 캐시아이템 자동 정렬
  useEffect(() => {
    const timer = setTimeout(() => {
      sortAllCashItemsByEfficiency();
    }, 500); // 충분한 시간 후 정렬
    
    return () => clearTimeout(timer);
  }, []); // 한 번만 실행

  return (
    <div className="settings">
      <h2>설정</h2>
      
      {/* 설정 관리 버튼들 */}
      <div className="settings-management">
        <div className="settings-buttons-row">
          <button 
            className={`settings-btn graph-update-btn ${hasUnsavedChanges ? 'has-changes' : ''}`} 
            onClick={onUpdateGraph}
          >
            {hasUnsavedChanges ? '🔄 업데이트 필요' : '✅ 그래프 최신'}
          </button>
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
      
      {/* 보유 마일리지 입력 */}
      <div className="mileage-input-section">
        <div className="mileage-section-row">
          <div className="mileage-amount-row">
            <label htmlFor="available-mileage">보유 마일리지:</label>
            <div className="mileage-input-row">
              <input
                id="available-mileage"
                className="mileage-input"
                type="text"
                value={availableMileage.toLocaleString()}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  if (value === '' || /^\d+$/.test(value)) {
                    setAvailableMileage(parseInt(value) || 0);
                  }
                }}
                placeholder="0"
              />
              <span className="mileage-unit">마일리지</span>
            </div>
          </div>
          
          {/* 마일리지 변환 비율 설정 */}
          <div className="mileage-rates-section">
            <div className="mileage-rates-label">마일리지의 캐시 대비 변환 비율:</div>
            <div className="mileage-rates-inputs">
              {['GROUP1', 'GROUP2', 'GROUP3'].map((group, index) => (
                <div key={group} className="mileage-rate-item">
                  <label>{['일반섭', '에오스', '챌린저스'][index]}:</label>
                  <input
                    type="number"
                    className="mileage-rate-input"
                    value={mileageRates[group]}
                    min="0"
                    max="100"
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value >= 0 && value <= 100) {
                        setMileageRates(prev => ({
                          ...prev,
                          [group]: value
                        }));
                      }
                    }}
                  />
                  <span className="mileage-rate-unit">%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
                  
                  {/* 효율 표시 */}
                  {item.meso > 0 && item.nx > 0 && (
                    <div className="efficiency-display">
                      = {(item.nx * 100000000 / item.meso).toFixed(1)} 캐시/1억 메소
                    </div>
                  )}
                  
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
        마일리지 가치 계산기
      </h3>
      
      {expandedSections.mileageCalculator && (
        <div className="mileage-calculator">
          {['GROUP1', 'GROUP2', 'GROUP3'].map((group, index) => {
            const items = cashItemRates[group]?.items || [];
            // 모든 아이템을 캐시 100% 사용 기준으로 포함 (마일리지 사용 가능 아이템도 포함)
            const allItemsAsCashOnly = items
              .filter(item => item.meso > 0 && item.nx > 0)
              .map(item => ({
                ...item,
                efficiency: item.meso / item.nx // 100% 캐시 사용 시 효율
              }))
              .sort((a, b) => b.efficiency - a.efficiency); // 효율 순 정렬
            
            const mileageItems = items.filter(item => item.mileageRatio > 0 && item.meso > 0 && item.nx > 0);
            
            // 가장 효율 좋은 아이템 (기준 아이템)
            const bestEfficiencyItem = allItemsAsCashOnly.length > 0 ? allItemsAsCashOnly[0] : null;
            
            const selectedMileage = selectedMileageItems[group]?.mileage || (mileageItems.length > 0 ? mileageItems[0].id : null);
            
            const mileageItem = mileageItems.find(item => item.id === selectedMileage);
            
            // 가장 효율 좋은 아이템과 선택된 마일리지 아이템으로 마일리지 가치 계산
            let calculatedRate = 0;
            if (bestEfficiencyItem && mileageItem) {
              const mvpFeeRate = mvpGrade === 'SILVER_PLUS' ? 3 : 5;
              
              // 1개 아이템 기준으로 계산
              const bestEfficiencyMesoPerCash = bestEfficiencyItem.efficiency; // bestEfficiencyItem.meso / bestEfficiencyItem.nx
              const mileageCashPortion = mileageItem.nx * (100 - mileageItem.mileageRatio) / 100;
              const mileagePortion = mileageItem.nx * mileageItem.mileageRatio / 100;
              
              if (mileagePortion > 0) {
                const mileageMesoPerCash = mileageItem.meso / mileageCashPortion;
                
                // 마일리지를 사용했을 때 캐시 대비 메소 효율이 더 좋은 경우에만 가치 있음
                if (mileageMesoPerCash > bestEfficiencyMesoPerCash) {
                  // 1 마일리지가 절약해주는 캐시량
                  const cashSavedPerMileage = (mileageItem.meso / bestEfficiencyMesoPerCash - mileageCashPortion) / mileagePortion;
                  calculatedRate = Math.round(cashSavedPerMileage * 100);
                }
              }
            }
            
            // 가장 효율 좋은 아이템과 모든 마일리지 아이템의 비율 계산 (통계용)
            const allRates = [];
            if (bestEfficiencyItem) {
              mileageItems.forEach(mItem => {
                const mvpFeeRate = mvpGrade === 'SILVER_PLUS' ? 3 : 5;
                const bestEfficiencyMesoPerCash = bestEfficiencyItem.efficiency;
                const mileageCashPortion = mItem.nx * (100 - mItem.mileageRatio) / 100;
                const mileagePortion = mItem.nx * mItem.mileageRatio / 100;
                
                if (mileagePortion > 0) {
                  const mileageMesoPerCash = mItem.meso / mileageCashPortion;
                  
                  if (mileageMesoPerCash > bestEfficiencyMesoPerCash) {
                    const cashSavedPerMileage = (mItem.meso / bestEfficiencyMesoPerCash - mileageCashPortion) / mileagePortion;
                    const rate = Math.round(cashSavedPerMileage * 100);
                    allRates.push({
                      rate,
                      bestEfficiencyId: bestEfficiencyItem.id,
                      mileageId: mItem.id,
                      bestEfficiencyName: bestEfficiencyItem.name,
                      mileageName: mItem.name
                    });
                  }
                }
              });
            }
            
            // 비율별로 정렬
            allRates.sort((a, b) => b.rate - a.rate);
            const minRate = allRates.length > 0 ? allRates[allRates.length - 1].rate : 0;
            const maxRate = allRates.length > 0 ? allRates[0].rate : 0;
            
            return (
              <div key={group} className="mileage-group">
                <h4 className="mileage-group-header">
                  그룹{index + 1} ({['일반섭', '에오스', '챌린저스'][index]})
                </h4>
                
                {bestEfficiencyItem && mileageItems.length > 0 ? (
                  <>
                    <div className="mileage-item-selector">
                      <div className="selector-column">
                        <label>기준 품목 (최고 효율):</label>
                        <div className="fixed-item-display">
                          <div className="item-name">{bestEfficiencyItem.name}</div>
                          <div className="item-info">
                            <div>{bestEfficiencyItem.meso.toLocaleString()} 메소</div>
                            <div>{bestEfficiencyItem.nx.toLocaleString()} 캐시</div>
                            <div className="efficiency-display">
                              효율: {(100000000 / bestEfficiencyItem.efficiency).toFixed(1)} 캐시/1억 메소
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="selector-column">
                        <label>마일리지 사용 품목:</label>
                        <select
                          value={selectedMileage || ''}
                          onChange={(e) => {
                            setSelectedMileageItems(prev => ({
                              ...prev,
                              [group]: { ...prev[group], mileage: e.target.value }
                            }));
                          }}
                        >
                          {mileageItems.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                        {mileageItem && (
                          <div className="item-info">
                            <div>{mileageItem.meso.toLocaleString()} 메소</div>
                            <div>{mileageItem.nx.toLocaleString()} 캐시 ({mileageItem.mileageRatio}% 마일리지)</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mileage-result">
                      <div className="calculated-rate">
                        계산된 마일리지 변환 비율: <strong>{calculatedRate}%</strong>
                      </div>
                      <div className="rate-statistics">
                        <div>최소: {minRate}% | 최대: {maxRate}%</div>
                        {allRates.length > 0 && (
                          <input
                            type="range"
                            min={minRate}
                            max={maxRate}
                            value={calculatedRate}
                            onChange={(e) => {
                              const targetRate = parseInt(e.target.value);
                              const closestPair = allRates.reduce((prev, curr) => 
                                Math.abs(curr.rate - targetRate) < Math.abs(prev.rate - targetRate) ? curr : prev
                              );
                              setSelectedMileageItems(prev => ({
                                ...prev,
                                [group]: {
                                  noMileage: closestPair.noMileageId,
                                  mileage: closestPair.mileageId
                                }
                              }));
                            }}
                            className="rate-slider"
                          />
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-calculation">
                    {noMileageItems.length === 0 && "마일리지 미사용 아이템이 없습니다."}
                    {mileageItems.length === 0 && "마일리지 사용 아이템이 없습니다."}
                  </div>
                )}
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
              disabled={!exchangeOptions.mesomarketBuy_G13?.enabled}
            />
            <span className="rate-unit">메포/1억 메소</span>
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
              disabled={!exchangeOptions.mesomarketSell_G13?.enabled}
            />
            <span className="rate-unit">메포/1억 메소</span>
            <div className="checkbox-group">
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
              disabled={!exchangeOptions.mesomarketBuy_G2?.enabled}
            />
            <span className="rate-unit">메포/1억 메소</span>
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
              disabled={!exchangeOptions.mesomarketSell_G2?.enabled}
            />
            <span className="rate-unit">메포/1억 메소</span>
            <div className="checkbox-group">
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
                disabled={!exchangeOptions[`cashtradeBuy_G${index + 1}`]?.enabled}
              />
              <span className="rate-unit">원/1억 메소</span>
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
                disabled={!exchangeOptions[`cashtradeSell_G${index + 1}`]?.enabled}
              />
              <span className="rate-unit">원/1억 메소</span>
              <div className="checkbox-group">
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
            <div className="group-row">
              <input
                className="rate-input"
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
                disabled={!exchangeOptions[`solCashBuy_G${index + 1}`]?.enabled}
              />
              <span className="rate-unit">원/개</span>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id={`sol-cash-buy-${group.toLowerCase()}`}
                  checked={exchangeOptions[`solCashBuy_G${index + 1}`]?.enabled || false}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      [`solCashBuy_G${index + 1}`]: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor={`sol-cash-buy-${group.toLowerCase()}`}>현금→조각</label>
              </div>
            </div>
            <div className="group-row">
              <input
                className="rate-input"
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
                disabled={!exchangeOptions[`solCashSell_G${index + 1}`]?.enabled}
              />
              <span className="rate-unit">원/개</span>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id={`sol-cash-sell-${group.toLowerCase()}`}
                  checked={exchangeOptions[`solCashSell_G${index + 1}`]?.enabled || false}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      [`solCashSell_G${index + 1}`]: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor={`sol-cash-sell-${group.toLowerCase()}`}>조각→현금</label>
              </div>
            </div>
            <div className="group-row">
              <input
                className="rate-input"
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
                disabled={!exchangeOptions[`solMesoBuy_G${index + 1}`]?.enabled}
              />
              <span className="rate-unit">메소/개</span>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id={`sol-meso-buy-${group.toLowerCase()}`}
                  checked={exchangeOptions[`solMesoBuy_G${index + 1}`]?.enabled || false}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      [`solMesoBuy_G${index + 1}`]: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor={`sol-meso-buy-${group.toLowerCase()}`}>메소→조각</label>
              </div>
            </div>
            <div className="group-row">
              <input
                className="rate-input"
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
                disabled={!exchangeOptions[`solMesoSell_G${index + 1}`]?.enabled}
              />
              <span className="rate-unit">메소/개</span>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id={`sol-meso-sell-${group.toLowerCase()}`}
                  checked={exchangeOptions[`solMesoSell_G${index + 1}`]?.enabled || false}
                  onChange={(e) => {
                    setExchangeOptions(prev => ({
                      ...prev,
                      [`solMesoSell_G${index + 1}`]: { enabled: e.target.checked }
                    }));
                  }}
                />
                <label htmlFor={`sol-meso-sell-${group.toLowerCase()}`}>조각→메소</label>
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
          <label htmlFor="direct-conversion">넥슨캐시 → 메이플포인트 직접 변환 허용</label>
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