import React from 'react';
import PathSummary from './PathSummary';
import './ResultsSection.css';

const ResultsSection = ({
  calculationResults,
  selectedTarget,
  targetCurrency,
  formatNumber,
  getCurrencyName,
  getCurrencyType,
  onPathHighlight
}) => {
  if (calculationResults.length === 0) {
    return null;
  }

  return (
    <div className="results-section">
      <h2>변환 경로 분석</h2>
      {calculationResults.map((path, index) => (
        <PathSummary 
          key={index} 
          path={path} 
          selectedTarget={selectedTarget}
          targetCurrency={targetCurrency}
          formatNumber={formatNumber}
          getCurrencyName={getCurrencyName}
          getCurrencyType={getCurrencyType}
          onPathHighlight={onPathHighlight}
        />
      ))}
    </div>
  );
};

export default ResultsSection;