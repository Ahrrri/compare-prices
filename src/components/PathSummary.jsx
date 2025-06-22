import { useState } from 'react';
import './PathSummary.css';

const PathSummary = ({ 
  path, 
  selectedTarget, 
  targetCurrency, 
  formatNumber, 
  getCurrencyName, 
  getCurrencyType,
  onPathHighlight
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    // 경로 하이라이트 토글
    if (onPathHighlight) {
      onPathHighlight(isExpanded ? null : path.pathSteps);
    }
  };

  return (
    <div className="path-summary">
      <div className="path-summary-header" onClick={toggleExpanded}>
        <span className="path-name">{path.name}</span>
        <span className="path-result">
          최종: {formatNumber(path.finalAmount, getCurrencyType(selectedTarget?.id || targetCurrency))} {getCurrencyName(selectedTarget?.id || targetCurrency)}
        </span>
        <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
      </div>
      
      {isExpanded && (
        <div className="path-details">
          <div className="conversion-steps">
            {path.steps.map((step, stepIndex) => (
              <div key={stepIndex} className="conversion-step">
                <span className="amount">
                  {typeof step.amount === 'number' ? formatNumber(step.amount, getCurrencyType(step.from)) : step.amount}
                </span>
                <span className="currency">{getCurrencyName(step.from)}</span>
                <span className="arrow">→</span>
                <span className="amount">
                  {typeof step.result === 'number' ? formatNumber(step.result, getCurrencyType(step.to)) : step.result}
                </span>
                <span className="currency">{getCurrencyName(step.to)}</span>
                <span className="description">({step.description})</span>
              </div>
            ))}
          </div>
          
          {path.note && (
            <div className="note">{path.note}</div>
          )}
          
          {path.warning && (
            <div className="warning">{path.warning}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default PathSummary;