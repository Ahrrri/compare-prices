import { useState, useEffect } from 'react'
import './App.css'
import { createCurrencyGraph, findAllPaths, getBestPaths, formatNumber, detectArbitrage } from './utils/graphPathfinder'
import { useCurrencySettings } from './hooks/useCurrencySettings'
import SettingsPanel from './components/currency/SettingsPanel'
import AmountInput from './components/currency/AmountInput'
import GraphSection from './components/currency/GraphSection'
import ResultsSection from './components/currency/ResultsSection'
import ScrollSimulator from './components/scroll/ScrollSimulator'

function App() {
  const [activeTab, setActiveTab] = useState('currency')
  const [inputAmount, setInputAmount] = useState('')
  const [inputAmountDisplay, setInputAmountDisplay] = useState('')
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [calculationResults, setCalculationResults] = useState([])
  const [sourceCurrency, setSourceCurrency] = useState(null)
  const [targetCurrency, setTargetCurrency] = useState(null)
  const [highlightedPath, setHighlightedPath] = useState(null)
  const [arbitrageWarnings, setArbitrageWarnings] = useState([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 커스텀 훅에서 설정 상태들 가져오기
  const {
    mesoMarketRates,
    cashTradeRates,
    solTradeRates,
    cashItemRates,
    mvpGrade,
    voucherDiscounts,
    exchangeOptions,
    availableMileage,
    mileageRates,
    setMesoMarketRates,
    setCashTradeRates,
    setSolTradeRates,
    setCashItemRates,
    setMvpGrade,
    setVoucherDiscounts,
    setExchangeOptions,
    setAvailableMileage,
    setMileageRates,
    resetToDefaults
  } = useCurrencySettings();

  // selectedNode 변경 시 sourceCurrency 업데이트
  useEffect(() => {
    if (selectedNode) {
      setSourceCurrency(selectedNode.id);
    }
  }, [selectedNode]);

  // 숫자 입력 처리 함수
  const handleAmountChange = (value) => {
    const numericValue = value.replace(/,/g, '');
    if (numericValue === '' || /^\d+$/.test(numericValue)) {
      setInputAmount(numericValue);
      setInputAmountDisplay(numericValue ? parseInt(numericValue).toLocaleString() : '');
    }
  }

  // 노드 선택 핸들러
  const handleNodeSelect = (node) => {
    if (selectedNode && selectedTarget) {
      return;
    }
    
    if (!selectedNode) {
      setSelectedNode(node);
    } else if (selectedNode.id !== node.id && !selectedTarget) {
      setSelectedTarget(node);
      setTargetCurrency(node.id);
    }
  };

  // 초기화 핸들러
  const handleReset = () => {
    setSelectedNode(null);
    setSelectedTarget(null);
    setTargetCurrency(null);
    setCalculationResults([]);
    setHighlightedPath(null);
  };

  // 재화 이름 가져오기
  const getCurrencyName = (currency) => {
    const names = {
      KRW: '원',
      NX: '넥슨캐시',
      MP: '메이플포인트',
      MESO: '메소',
      ITEM: '캐시템',
      VOUCHER: '상품권',
      TOTAL: '총',
      MESO_G1: '일반섭 메소',
      MESO_G2: '에오스 메소',
      MESO_G3: '챌린저스 메소',
      SOL_G1: '일반섭 조각',
      SOL_G2: '에오스 조각',
      SOL_G3: '챌린저스 조각'
    };
    return names[currency] || currency;
  };

  // 재화 타입 결정
  const getCurrencyType = (currency) => {
    if (currency === 'MESO' || currency.startsWith('MESO_')) {
      return 'meso';
    } else if (currency.startsWith('SOL_')) {
      return 'sol';
    } else if (['KRW', 'NX', 'MP'].includes(currency)) {
      return 'currency';
    }
    return 'default';
  };

  // 수동 경로 계산 함수
  const handleCalculatePath = () => {
    if (selectedNode && selectedTarget && inputAmount) {
      const settings = {
        mesoMarketRates,
        cashTradeRates,
        solTradeRates,
        cashItemRates,
        mvpGrade,
        voucherDiscounts,
        exchangeOptions,
        availableMileage,
        mileageRates
      };

      const graph = createCurrencyGraph(settings);
      const amount = parseInt(inputAmount);
      const allPaths = findAllPaths(graph, selectedNode.id, selectedTarget.id, null, amount);
      
      const bestPaths = getBestPaths(allPaths);

      const formattedResults = bestPaths.map(path => ({
        name: `${path.steps.length}단계 변환`,
        steps: path.steps,
        finalAmount: path.finalAmount,
        actualInput: path.actualInput,
        nominalInput: path.nominalInput,
        pathSteps: path.steps
      }));

      setCalculationResults(formattedResults);
    } else {
      setCalculationResults([]);
    }
  };

  // 그래프 업데이트 및 무한동력 감지 통합 함수
  const handleUpdateGraphAndDetectArbitrage = () => {
    const settings = {
      mesoMarketRates,
      cashTradeRates,
      solTradeRates,
      cashItemRates,
      mvpGrade,
      voucherDiscounts,
      exchangeOptions,
      availableMileage,
      mileageRates
    };

    const graph = createCurrencyGraph(settings);
    
    // 무한동력 감지
    const arbitrageOpportunities = detectArbitrage(graph, 1000000); // 100만원으로 테스트
    
    if (arbitrageOpportunities.length > 0) {
      console.warn('무한동력 기회 감지:', arbitrageOpportunities);
      setArbitrageWarnings(arbitrageOpportunities);
    } else {
      setArbitrageWarnings([]);
    }
    
    // 변경사항 저장됨 표시
    setHasUnsavedChanges(false);
    
    console.log('그래프가 업데이트되고 무한동력 감지가 완료되었습니다.');
  };

  // 설정 변경 추적 (초기 로드 제외)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    setHasUnsavedChanges(true);
  }, [mesoMarketRates, cashTradeRates, solTradeRates, cashItemRates, mvpGrade, voucherDiscounts, exchangeOptions, availableMileage, mileageRates]);

  const renderCurrencyCalculator = () => (
    <div className="main-container">
      <div className="settings-panel">
        <SettingsPanel
          mesoMarketRates={mesoMarketRates}
          setMesoMarketRates={setMesoMarketRates}
          cashTradeRates={cashTradeRates}
          setCashTradeRates={setCashTradeRates}
          solTradeRates={solTradeRates}
          setSolTradeRates={setSolTradeRates}
          cashItemRates={cashItemRates}
          setCashItemRates={setCashItemRates}
          mvpGrade={mvpGrade}
          setMvpGrade={setMvpGrade}
          voucherDiscounts={voucherDiscounts}
          setVoucherDiscounts={setVoucherDiscounts}
          exchangeOptions={exchangeOptions}
          setExchangeOptions={setExchangeOptions}
          availableMileage={availableMileage}
          setAvailableMileage={setAvailableMileage}
          mileageRates={mileageRates}
          setMileageRates={setMileageRates}
          resetToDefaults={resetToDefaults}
          onUpdateGraph={handleUpdateGraphAndDetectArbitrage}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </div>

      <div className="graph-panel">
        <AmountInput
          inputAmountDisplay={inputAmountDisplay}
          onAmountChange={handleAmountChange}
          selectedNode={selectedNode}
          getCurrencyName={getCurrencyName}
          onCalculatePath={handleCalculatePath}
        />
        
        <GraphSection
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
          selectedNode={selectedNode}
          selectedTarget={selectedTarget}
          highlightedPath={highlightedPath}
          arbitrageWarnings={arbitrageWarnings}
          onNodeSelect={handleNodeSelect}
          onReset={handleReset}
        />
        
        {/* 무한동력 경고 */}
        {arbitrageWarnings.length > 0 && (
          <div className="arbitrage-warning">
            <h3>⚠️ 무한동력 감지</h3>
            <p>현재 설정에서 순환 거래로 이익을 낼 수 있는 경로가 감지되었습니다:</p>
            {arbitrageWarnings.slice(0, 3).map((warning, index) => (
              <div 
                key={index} 
                className={`arbitrage-item ${highlightedPath === `arbitrage-${index}` ? 'highlighted' : ''}`}
                onClick={() => {
                  const pathId = `arbitrage-${index}`;
                  setHighlightedPath(highlightedPath === pathId ? null : pathId);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="arbitrage-header">
                  <strong>{warning.startNodeDisplay}</strong>에서 시작하여 <strong>{warning.profitRate}%</strong> 이익 
                  ({formatNumber(warning.profit, 'currency')}원 수익)
                </div>
                <div className="arbitrage-path">
                  경로: {warning.pathDescription}
                </div>
                <div className="arbitrage-details">
                  {formatNumber(warning.startAmount, 'currency')}원 → {formatNumber(warning.finalAmount, 'currency')}원
                </div>
              </div>
            ))}
            {arbitrageWarnings.length > 3 && (
              <p>...외 {arbitrageWarnings.length - 3}개 더</p>
            )}
          </div>
        )}
        
        <ResultsSection
          calculationResults={calculationResults}
          selectedSource={selectedNode}
          sourceCurrency={sourceCurrency}
          selectedTarget={selectedTarget}
          targetCurrency={targetCurrency}
          formatNumber={formatNumber}
          getCurrencyName={getCurrencyName}
          getCurrencyType={getCurrencyType}
          onPathHighlight={setHighlightedPath}
        />
      </div>
    </div>
  );

  return (
    <div className="app">
      <h1>메이플스토리 도구 모음</h1>
      
      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'currency' ? 'active' : ''}`}
          onClick={() => setActiveTab('currency')}
        >
          💰 재화 변환 계산기
        </button>
        <button 
          className={`tab-button ${activeTab === 'scroll' ? 'active' : ''}`}
          onClick={() => setActiveTab('scroll')}
        >
          📜 주문서 강화 시뮬레이터
        </button>
      </div>

      {/* 탭별 설명 */}
      <div className="tab-description">
        {activeTab === 'currency' && (
          <p className="app-subtitle">
            금액을 입력하고 노드를 클릭하여 변환 경로를 탐색하세요
          </p>
        )}
        {activeTab === 'scroll' && (
          <p className="app-subtitle">
            주문서 강화 전략을 시뮬레이션하고 최적 전략을 찾아보세요
          </p>
        )}
      </div>
      
      {/* 탭 컨텐츠 */}
      <div className="tab-content">
        {activeTab === 'currency' && renderCurrencyCalculator()}
        {activeTab === 'scroll' && <ScrollSimulator />}
      </div>
    </div>
  );
}

export default App;