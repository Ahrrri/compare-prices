import React from 'react';
import './ScrollSettings.css';

const ScrollSettings = ({ settings, onSettingsChange, onRunSimulation, isSimulating }) => {
  const updateSettings = (path, value) => {
    const newSettings = { ...settings };
    const keys = path.split('.');
    let current = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onSettingsChange(newSettings);
  };

  const strategies = [
    { value: 'simple_39', label: '39% 주문서 전용', desc: '15% 완작 전략' },
    { value: 'simple_59', label: '59% 주문서 전용', desc: '30% 완작 전략' },
    { value: 'chaos60_only', label: '놀긍혼 60% 전용', desc: '60% 놀긍 떡작 전략' },
    { value: 'chaos100_only', label: '놀긍혼 100% 전용', desc: '100% 놀긍 완작 전략' },
    { value: 'chaos60_100', label: '놀긍혼 60%+100%', desc: '60% 떡작 후 100% 완작' },
    { value: 'first_six_chaos60', label: '첫 공6 (60%)', desc: '첫 슬롯 놀긍혼 공6 (60%)' },
    { value: 'first_six_chaos100', label: '첫 공6 (100%)', desc: '첫 슬롯 놀긍혼 공6 (100%)' },
    { value: 'hybrid_chaos60', label: '하이브리드 (60%)', desc: '놀긍혼 60% + 39% 혼합' },
    { value: 'hybrid_chaos100', label: '하이브리드 (100%)', desc: '놀긍혼 100% + 39% 혼합' }
  ];

  return (
    <div className="scroll-settings">
      <h3 className="section-title">⚙️ 시뮬레이션 설정</h3>
      
      {/* 기본 설정 */}
      <div className="setting-group">
        <label className="setting-label">시뮬레이션 횟수</label>
        <input
          type="number"
          className="setting-input"
          value={settings.trials}
          onChange={(e) => updateSettings('trials', parseInt(e.target.value) || 1000)}
          min="100"
          max="100000"
          step="100"
        />
      </div>

      <div className="setting-group">
        <label className="setting-label">최대 강화 시도 횟수</label>
        <input
          type="number"
          className="setting-input"
          value={settings.maxAttempts}
          onChange={(e) => updateSettings('maxAttempts', parseInt(e.target.value) || 7)}
          min="5"
          max="10"
        />
      </div>

      {/* 전략 선택 */}
      <div className="setting-group">
        <label className="setting-label">강화 전략</label>
        <select
          className="setting-select"
          value={settings.selectedStrategy}
          onChange={(e) => updateSettings('selectedStrategy', e.target.value)}
        >
          {strategies.map(strategy => (
            <option key={strategy.value} value={strategy.value}>
              {strategy.label}
            </option>
          ))}
        </select>
        <div className="strategy-description">
          {strategies.find(s => s.value === settings.selectedStrategy)?.desc}
        </div>
      </div>

      {/* 전략별 세부 파라미터 */}
      {(settings.selectedStrategy.includes('simple') || 
        settings.selectedStrategy.includes('chaos60_only') ||
        settings.selectedStrategy.includes('chaos60_100')) && (
        <div className="setting-group">
          <label className="setting-label">성공 임계값</label>
          <input
            type="number"
            className="setting-input"
            value={settings.strategyParams.successThreshold}
            onChange={(e) => updateSettings('strategyParams.successThreshold', parseInt(e.target.value) || 4)}
            min="1"
            max="7"
          />
          <div className="setting-hint">이 횟수 이상 성공해야 계속 진행</div>
        </div>
      )}

      {(settings.selectedStrategy.includes('chaos') && 
        !settings.selectedStrategy.includes('first_six')) && (
        <div className="setting-group">
          <label className="setting-label">스탯 임계값</label>
          <input
            type="number"
            className="setting-input"
            value={settings.strategyParams.statThreshold}
            onChange={(e) => updateSettings('strategyParams.statThreshold', parseFloat(e.target.value) || 7.0)}
            min="0"
            max="20"
            step="0.1"
          />
          <div className="setting-hint">평균 스탯이 이 값 이상이면 15% 작으로 전환</div>
        </div>
      )}

      {settings.selectedStrategy.includes('hybrid') && (
        <div className="setting-group">
          <label className="setting-label">스탯 차이 임계값</label>
          <input
            type="number"
            className="setting-input"
            value={settings.strategyParams.statDiffThreshold}
            onChange={(e) => updateSettings('strategyParams.statDiffThreshold', parseFloat(e.target.value) || 5.0)}
            min="0"
            max="15"
            step="0.1"
          />
          <div className="setting-hint">15% 작 대비 이 만큼 앞서면 15% 작으로 전환</div>
        </div>
      )}

      {/* 주문서 비용 설정 */}
      <h4 className="subsection-title">💰 주문서 비용 (주흔)</h4>
      
      <div className="cost-grid">
        <div className="setting-group">
          <label className="setting-label">놀긍혼 60%</label>
          <input
            type="number"
            className="setting-input"
            value={settings.scrollCosts.chaos60}
            onChange={(e) => updateSettings('scrollCosts.chaos60', parseInt(e.target.value) || 100)}
            min="0"
            step="10"
          />
        </div>

        <div className="setting-group">
          <label className="setting-label">놀긍혼 100%</label>
          <input
            type="number"
            className="setting-input"
            value={settings.scrollCosts.chaos100}
            onChange={(e) => updateSettings('scrollCosts.chaos100', parseInt(e.target.value) || 8000)}
            min="0"
            step="100"
          />
        </div>

        <div className="setting-group">
          <label className="setting-label">스탯 39%</label>
          <input
            type="number"
            className="setting-input"
            value={settings.scrollCosts.stat39}
            onChange={(e) => updateSettings('scrollCosts.stat39', parseInt(e.target.value) || 700)}
            min="0"
            step="10"
          />
        </div>

        <div className="setting-group">
          <label className="setting-label">스탯 59%</label>
          <input
            type="number"
            className="setting-input"
            value={settings.scrollCosts.stat59}
            onChange={(e) => updateSettings('scrollCosts.stat59', parseInt(e.target.value) || 470)}
            min="0"
            step="10"
          />
        </div>

        <div className="setting-group">
          <label className="setting-label">순백의 주문서</label>
          <input
            type="number"
            className="setting-input"
            value={settings.scrollCosts.whiteScroll}
            onChange={(e) => updateSettings('scrollCosts.whiteScroll', parseInt(e.target.value) || 20000)}
            min="0"
            step="1000"
          />
        </div>

        <div className="setting-group">
          <label className="setting-label">이노센트</label>
          <input
            type="number"
            className="setting-input"
            value={settings.scrollCosts.innocent}
            onChange={(e) => updateSettings('scrollCosts.innocent', parseInt(e.target.value) || 24000)}
            min="0"
            step="1000"
          />
        </div>
      </div>

      {/* 시뮬레이션 실행 버튼 */}
      <button
        className="primary-button"
        onClick={onRunSimulation}
        disabled={isSimulating}
      >
        {isSimulating ? (
          <>
            <div className="loading-spinner"></div>
            시뮬레이션 실행 중...
          </>
        ) : (
          '🎯 시뮬레이션 실행'
        )}
      </button>
    </div>
  );
};

export default ScrollSettings;