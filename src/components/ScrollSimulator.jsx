import React, { useState, useEffect } from 'react';
import './ScrollSimulator.css';
import ScrollSettings from './ScrollSettings';
import ScrollResults from './ScrollResults';
import ScrollVisualization from './ScrollVisualization';

const ScrollSimulator = () => {
  const [settings, setSettings] = useState({
    // 시뮬레이션 설정
    trials: 1000,
    maxAttempts: 7,
    
    // 전략 설정
    selectedStrategy: 'simple_39',
    strategyParams: {
      successThreshold: 4,
      statThreshold: 7.0,
      statDiffThreshold: 5.0
    },
    
    // 주문서 비용 설정 (주흔 단위)
    scrollCosts: {
      chaos60: 100,
      chaos100: 8000,
      stat39: 700,
      stat59: 470,
      whiteScroll: 20000,
      innocent: 24000,
      goldenHammer: 24000
    },
    
    // 주문서 성공률
    successRates: {
      chaos60: 0.60,
      chaos100: 1.00,
      stat39: 0.39,
      stat59: 0.59
    },
    
    // 주문서 스탯
    scrollStats: {
      stat39: 10,
      stat59: 7
    },
    
    // 기타 설정
    attackStatRatio: 3,
    subStatRatio: 0.1
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(null);

  // 시뮬레이션 실행
  const runSimulation = async () => {
    setIsSimulating(true);
    
    try {
      // 여기서 시뮬레이션 로직 실행
      const simulationResults = await simulateScrollEnhancement(settings);
      setResults(simulationResults);
    } catch (error) {
      console.error('시뮬레이션 오류:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="scroll-simulator">
      <div className="simulator-container">
        {/* 설정 패널 */}
        <div className="settings-section">
          <ScrollSettings 
            settings={settings}
            onSettingsChange={setSettings}
            onRunSimulation={runSimulation}
            isSimulating={isSimulating}
          />
        </div>

        {/* 결과 섹션 */}
        <div className="results-section">
          {results ? (
            <>
              <ScrollResults results={results} settings={settings} />
              <ScrollVisualization results={results} settings={settings} />
            </>
          ) : (
            <div className="no-results">
              <h3>📊 시뮬레이션 결과</h3>
              <p>설정을 조정하고 '시뮬레이션 실행' 버튼을 눌러주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 실제 시뮬레이션 함수
const simulateScrollEnhancement = async (settings) => {
  const { runScrollSimulation } = await import('../utils/scrollRunner.js');
  
  try {
    const results = await runScrollSimulation(settings);
    return results;
  } catch (error) {
    console.error('시뮬레이션 실행 오류:', error);
    throw error;
  }
};

export default ScrollSimulator;