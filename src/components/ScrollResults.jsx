import React, { useState } from 'react';
import './ScrollResults.css';

const ScrollResults = ({ results, settings }) => {
  const [activeTab, setActiveTab] = useState('summary');

  const formatNumber = (num, type = 'default') => {
    if (type === 'currency') {
      return num.toLocaleString() + ' 주흔';
    } else if (type === 'percent') {
      return (num * 100).toFixed(1) + '%';
    } else if (type === 'decimal') {
      return num.toFixed(1);
    }
    return num.toLocaleString();
  };

  const renderSummary = () => (
    <div className="results-summary">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{formatNumber(results.averageStats.convertedStat, 'decimal')}</div>
          <div className="stat-label">평균 환산스탯</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{formatNumber(results.averageCost, 'currency')}</div>
          <div className="stat-label">평균 총비용</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{formatNumber(results.costPerStat, 'currency')}</div>
          <div className="stat-label">스탯당 비용</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{formatNumber(results.totalTrials)}</div>
          <div className="stat-label">시뮬레이션 횟수</div>
        </div>
      </div>

      <div className="detailed-stats">
        <h4>📊 상세 스탯 정보</h4>
        <div className="stat-breakdown">
          <div className="stat-item">
            <span className="stat-name">평균 공격력:</span>
            <span className="stat-number">{formatNumber(results.averageStats.attack, 'decimal')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-name">평균 주스탯:</span>
            <span className="stat-number">{formatNumber(results.averageStats.mainStat, 'decimal')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-name">평균 부스탯:</span>
            <span className="stat-number">{formatNumber(results.averageStats.subStat, 'decimal')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScrollUsage = () => (
    <div className="scroll-usage">
      <h4>📜 주문서 사용 통계</h4>
      <div className="usage-grid">
        {Object.entries(results.scrollUsage).map(([scrollType, usage]) => {
          const scrollNames = {
            chaos60: '놀긍혼 60%',
            chaos100: '놀긍혼 100%',
            stat39: '스탯 39%',
            stat59: '스탯 59%',
            whiteScroll: '순백의 주문서',
            innocent: '이노센트',
            goldenHammer: '황금망치'
          };

          const scrollCosts = {
            chaos60: settings.scrollCosts.chaos60,
            chaos100: settings.scrollCosts.chaos100,
            stat39: settings.scrollCosts.stat39,
            stat59: settings.scrollCosts.stat59,
            whiteScroll: settings.scrollCosts.whiteScroll,
            innocent: settings.scrollCosts.innocent,
            goldenHammer: settings.scrollCosts.goldenHammer
          };

          const totalCost = usage.avg * scrollCosts[scrollType];
          const costPercentage = (totalCost / results.averageCost * 100);

          return (
            <div key={scrollType} className="usage-card">
              <div className="usage-header">
                <span className="scroll-name">{scrollNames[scrollType]}</span>
                <span className="usage-avg">{formatNumber(usage.avg, 'decimal')}회</span>
              </div>
              <div className="usage-details">
                <div className="usage-cost">
                  비용: {formatNumber(totalCost, 'currency')} ({costPercentage.toFixed(1)}%)
                </div>
                <div className="usage-total">
                  총 사용: {formatNumber(usage.total)}회
                </div>
              </div>
              <div className="usage-bar">
                <div 
                  className="usage-fill" 
                  style={{ width: `${Math.min(costPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderComparison = () => (
    <div className="strategy-comparison">
      <h4>⚖️ 전략 비교</h4>
      <div className="comparison-note">
        <p>다른 전략과의 비교를 위해 여러 전략으로 시뮬레이션을 실행해보세요.</p>
        <p>현재 전략: <strong>{getStrategyName(settings.selectedStrategy)}</strong></p>
      </div>
      
      {/* 15% 완작 기준 비교 */}
      <div className="baseline-comparison">
        <h5>🎯 15% 완작 대비 효율</h5>
        <div className="efficiency-comparison">
          <div className="efficiency-item">
            <span>현재 전략 효율:</span>
            <span className="efficiency-value">
              {(110.0 / results.costPerStat * 1000).toFixed(0)} 스탯/백만주흔
            </span>
          </div>
          <div className="efficiency-item">
            <span>15% 완작 효율:</span>
            <span className="efficiency-value baseline">
              {(110.0 / 500 * 1000).toFixed(0)} 스탯/백만주흔
            </span>
          </div>
          <div className="efficiency-ratio">
            효율 비율: <strong>{(500 / results.costPerStat * 100).toFixed(1)}%</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const getStrategyName = (strategy) => {
    const strategyNames = {
      simple_39: '39% 주문서 전용',
      simple_59: '59% 주문서 전용',
      chaos60_only: '놀긍혼 60% 전용',
      chaos100_only: '놀긍혼 100% 전용',
      chaos60_100: '놀긍혼 60%+100%',
      first_six_chaos60: '첫 공6 (60%)',
      first_six_chaos100: '첫 공6 (100%)',
      hybrid_chaos60: '하이브리드 (60%)',
      hybrid_chaos100: '하이브리드 (100%)'
    };
    return strategyNames[strategy] || strategy;
  };

  return (
    <div className="scroll-results">
      <div className="results-header">
        <h3>📈 시뮬레이션 결과</h3>
        <div className="results-tabs">
          <button 
            className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            요약
          </button>
          <button 
            className={`tab-btn ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            주문서 사용량
          </button>
          <button 
            className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            전략 비교
          </button>
        </div>
      </div>

      <div className="results-content">
        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'usage' && renderScrollUsage()}
        {activeTab === 'comparison' && renderComparison()}
      </div>
    </div>
  );
};

export default ScrollResults;