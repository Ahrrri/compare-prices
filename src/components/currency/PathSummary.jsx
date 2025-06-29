import './PathSummary.css';
import { calculateEfficiencyRatio } from '../../utils/graphPathfinder';

const PathSummary = ({ 
  path, 
  index,
  isExpanded,
  selectedSource,
  sourceCurrency,
  selectedTarget, 
  targetCurrency, 
  formatNumber, 
  getCurrencyName, 
  getCurrencyType,
  onPathToggle
}) => {
  const toggleExpanded = () => {
    if (onPathToggle) {
      onPathToggle(index, path.pathSteps);
    }
  };

  return (
    <div className="path-summary">
      <div className="path-summary-header" onClick={toggleExpanded}>
        <span className="path-name">{path.name}</span>
        <span className="path-result">
          {/* 실제 투입량이 명목 투입량과 다른 경우 표시 */}
          {path.actualInput && path.actualInput !== path.nominalInput ? (
            <>
              <div style={{marginBottom: '0.2rem'}}>
                <strong>실제: {formatNumber(path.actualInput, getCurrencyType(selectedSource?.id || sourceCurrency))} {getCurrencyName(selectedSource?.id || sourceCurrency)} → {formatNumber(path.finalAmount, getCurrencyType(selectedTarget?.id || targetCurrency))} {getCurrencyName(selectedTarget?.id || targetCurrency)} ⚠️</strong>
              </div>
              <div style={{fontSize: '0.8rem', color: '#666'}}>
                효율: {calculateEfficiencyRatio(selectedSource?.id || sourceCurrency, path.actualInput, selectedTarget?.id || targetCurrency, path.finalAmount).text}
              </div>
            </>
          ) : (
            <>
              <div style={{marginBottom: '0.2rem'}}>
                <strong>{formatNumber(path.finalAmount, getCurrencyType(selectedTarget?.id || targetCurrency))} {getCurrencyName(selectedTarget?.id || targetCurrency)}</strong>
              </div>
              <div style={{fontSize: '0.8rem', color: '#666'}}>
                효율: {calculateEfficiencyRatio(selectedSource?.id || sourceCurrency, path.actualInput || path.steps[0]?.inputAmount || 1, selectedTarget?.id || targetCurrency, path.finalAmount).text}
              </div>
            </>
          )}
        </span>
        <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
      </div>
      
      {isExpanded && (
        <div className="path-details">
          <div className="conversion-steps">
            {path.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="conversion-step">
                  <div>
                    <span className="amount">
                      {typeof step.inputAmount === 'number' && step.inputAmount !== null && !isNaN(step.inputAmount) 
                        ? formatNumber(step.inputAmount, getCurrencyType(step.from)) 
                        : (step.inputAmount || '0')}
                    </span>
                    <span className="currency">{getCurrencyName(step.from) || step.from}</span>
                    <span className="arrow">→</span>
                    <span className="amount">
                      {typeof step.outputAmount === 'number' && step.outputAmount !== null && !isNaN(step.outputAmount)
                        ? formatNumber(step.outputAmount, getCurrencyType(step.to))
                        : (step.outputAmount || '0')}
                    </span>
                    <span className="currency">{getCurrencyName(step.to) || step.to}</span>
                    <span className="description">({step.description || ''})</span>
                  </div>
                  
                  {/* 캐시템 상세 정보 표시 */}
                  {step.cashItemDetails && (
                    <div className="cashitem-details">
                      <div className="usage-info">
                        캐시 사용: {formatNumber(step.cashItemDetails.usedCash, 'currency')} / {formatNumber(step.inputAmount, 'currency')}
                        {step.cashItemDetails.usedMileage > 0 && (
                          <span>, 마일리지 사용: {formatNumber(step.cashItemDetails.usedMileage, 'currency')}</span>
                        )}
                        {step.cashItemDetails.earnedMileage > 0 && (
                          <span>, 마일리지 적립: {formatNumber(step.cashItemDetails.earnedMileage, 'currency')}</span>
                        )}
                      </div>
                      
                      {/* 순 비용 정보 */}
                      {step.cashItemDetails.netCashCost !== undefined && (
                        <div className="net-cost-info">
                          순 비용: {formatNumber(step.cashItemDetails.netCashCost, 'currency')} 캐시 상당
                          {step.cashItemDetails.netMileageUsed !== 0 && (
                            <span> (마일리지 순소모: {formatNumber(step.cashItemDetails.netMileageUsed, 'currency')})</span>
                          )}
                        </div>
                      )}
                      
                      {/* 사용된 아이템 조합 표시 */}
                      {step.cashItemDetails.itemCombination && step.cashItemDetails.itemCombination.length > 0 && (
                        <div className="item-combination">
                          <div className="combination-header">사용된 아이템 조합:</div>
                          <div className="combination-list">
                            {step.cashItemDetails.itemCombination.map((item, index) => (
                              <div key={index} className="combination-item">
                                <span className="item-name">{item.name}</span>
                                <span className="item-quantity">{item.quantity}개</span>
                                {item.usedMileage && (
                                  <span className="item-mileage">(마일리지 {formatNumber(item.mileageUsed, 'currency')})</span>
                                )}
                                <span className="item-result">→ {formatNumber(item.mesoGained, 'meso')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(step.cashItemDetails.remainingCash > 0 || step.cashItemDetails.remainingMileage > 0) && (
                        <div className="remaining-info">
                          {step.cashItemDetails.remainingCash > 0 && (
                            <span>캐시 잔여: {formatNumber(step.cashItemDetails.remainingCash, 'currency')}</span>
                          )}
                          {step.cashItemDetails.remainingMileage > 0 && step.cashItemDetails.remainingCash > 0 && <span>, </span>}
                          {step.cashItemDetails.remainingMileage > 0 && (
                            <span>마일리지 잔여: {formatNumber(step.cashItemDetails.remainingMileage, 'currency')}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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