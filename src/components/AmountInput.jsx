import React from 'react';
import './AmountInput.css';

const AmountInput = ({
  inputAmountDisplay,
  onAmountChange,
  selectedNode,
  getCurrencyName
}) => {
  return (
    <div className="input-section">
      <h2>변환할 금액</h2>
      <div className="amount-input-container">
        <input
          className="amount-input"
          type="text"
          value={inputAmountDisplay}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="수량 입력"
        />
        <span className="currency-unit">
          {selectedNode ? getCurrencyName(selectedNode.id) : '단위'}
        </span>
      </div>
      <p className="input-help-text">
        예: 10,000 (1만원), 100,000,000 (1억 메소)
      </p>
    </div>
  );
};

export default AmountInput;