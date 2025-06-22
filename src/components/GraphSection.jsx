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
  selectedNode,
  selectedTarget,
  highlightedPath,
  onNodeSelect,
  onReset
}) => {
  return (
    <div className="graph-section">
      <h2>화폐 변환 네트워크</h2>
      
      <div className="graph-status">
        {selectedNode && !selectedTarget && (
          <p>시작점: <strong>{selectedNode.name}</strong> | 목표점을 클릭하세요</p>
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
          <p>시작 화폐를 클릭하세요</p>
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
        onNodeSelect={onNodeSelect}
        selectedNode={selectedNode}
        selectedTarget={selectedTarget}
        highlightedPath={highlightedPath}
      />
    </div>
  );
};

export default GraphSection;