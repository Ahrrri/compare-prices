import React from 'react';
import CurrencyGraph from './CurrencyGraph';
import './GraphSection.css';

const GraphSection = ({
  inputAmount,
  mesoMarketRates,
  cashTradeRates,
  solTradeRates,
  cashItemRates,
  mvpGrade,
  voucherDiscounts,
  exchangeOptions,
  availableMileage,
  mileageRates,
  selectedNode,
  selectedTarget,
  highlightedPath,
  arbitrageWarnings,
  onNodeSelect,
  onReset
}) => {
  return (
    <div className="graph-section">
      <h2>재화 변환 네트워크</h2>
      
      <div className="graph-status">
        {selectedNode && !selectedTarget && (
          <p>
            시작점: <strong>{selectedNode.name}</strong> | 목표점을 클릭하세요
            <button 
              className="reset-button"
              onClick={onReset}
            >
              초기화
            </button>
          </p>
        )}
        {selectedNode && selectedTarget && (
          <p>
            <strong>{selectedNode.name}</strong> → <strong>{selectedTarget.name}</strong> 
            <button 
              className="reset-button"
              onClick={onReset}
            >
              초기화
            </button>
          </p>
        )}
        {!selectedNode && (
          <p>시작 재화를 클릭하세요</p>
        )}
      </div>
      
      <CurrencyGraph
        inputAmount={inputAmount}
        mesoMarketRates={mesoMarketRates}
        cashTradeRates={cashTradeRates}
        solTradeRates={solTradeRates}
        cashItemRates={cashItemRates}
        mvpGrade={mvpGrade}
        voucherDiscounts={voucherDiscounts}
        exchangeOptions={exchangeOptions}
        availableMileage={availableMileage}
        mileageRates={mileageRates}
        onNodeSelect={onNodeSelect}
        selectedNode={selectedNode}
        selectedTarget={selectedTarget}
        highlightedPath={highlightedPath}
        arbitrageWarnings={arbitrageWarnings}
      />
    </div>
  );
};

export default GraphSection;