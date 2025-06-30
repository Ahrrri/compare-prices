import React, { useState } from 'react';
import PathSummary from './PathSummary';
import './ResultsSection.css';

const ResultsSection = ({
  calculationResults,
  selectedSource,
  sourceCurrency,
  selectedTarget,
  targetCurrency,
  formatNumber,
  getCurrencyName,
  getCurrencyType,
  onPathHighlight
}) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (calculationResults.length === 0) {
    return null;
  }

  const handlePathToggle = (index, pathSteps) => {
    if (expandedIndex === index) {
      // 이미 확장된 항목을 클릭하면 접기
      setExpandedIndex(null);
      onPathHighlight(null);
    } else {
      // 다른 항목을 클릭하면 그것만 확장
      setExpandedIndex(index);
      onPathHighlight(pathSteps);
    }
  };

  return (
    <div className="results-section">
      <h2>변환 경로 분석</h2>
      {calculationResults.map((path, index) => (
        <PathSummary 
          key={index} 
          path={path} 
          index={index}
          isExpanded={expandedIndex === index}
          selectedSource={selectedSource}
          sourceCurrency={sourceCurrency}
          selectedTarget={selectedTarget}
          targetCurrency={targetCurrency}
          formatNumber={formatNumber}
          getCurrencyName={getCurrencyName}
          getCurrencyType={getCurrencyType}
          onPathToggle={handlePathToggle}
        />
      ))}
    </div>
  );
};

export default ResultsSection;