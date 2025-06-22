import { useState, useEffect } from 'react'
import './App.css'
import { formatNumber } from './utils/currencyConverter'
import { createCurrencyGraph, findAllPaths, getBestPaths } from './utils/graphPathfinder'
import { useCurrencySettings } from './hooks/useCurrencySettings'
import SettingsPanel from './components/SettingsPanel'
import AmountInput from './components/AmountInput'
import GraphSection from './components/GraphSection'
import ResultsSection from './components/ResultsSection'

function App() {
  const [inputAmount, setInputAmount] = useState('')
  const [inputAmountDisplay, setInputAmountDisplay] = useState('')
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [calculationResults, setCalculationResults] = useState([])
  const [targetCurrency, setTargetCurrency] = useState(null)
  const [highlightedPath, setHighlightedPath] = useState(null)

  // 커스텀 훅에서 설정 상태들 가져오기
  const {
    mesoMarketRates,
    cashTradeRates,
    solTradeRates,
    mvpGrade,
    voucherDiscounts,
    exchangeOptions,
    setMesoMarketRates,
    setCashTradeRates,
    setSolTradeRates,
    setMvpGrade,
    setVoucherDiscounts,
    setExchangeOptions
  } = useCurrencySettings();

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

  // 화폐 이름 가져오기
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
      SOL_G1: '일반섭 솔 에르다 조각',
      SOL_G2: '에오스 솔 에르다 조각',
      SOL_G3: '챌린저스 솔 에르다 조각'
    };
    return names[currency] || currency;
  };

  // 화폐 타입 결정
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

  // 계산 로직
  useEffect(() => {
    if (selectedNode && selectedTarget && inputAmount) {
      const settings = {
        mesoMarketRates,
        cashTradeRates,
        solTradeRates,
        mvpGrade,
        voucherDiscounts,
        exchangeOptions
      };

      const graph = createCurrencyGraph(settings);
      const amount = parseInt(inputAmount);
      const allPaths = findAllPaths(graph, selectedNode.id, selectedTarget.id, 4, amount);
      
      const bestPaths = getBestPaths(allPaths);

      const formattedResults = bestPaths.map(path => ({
        name: `${path.steps.length}단계 변환`,
        steps: path.steps,
        finalAmount: path.finalAmount,
        pathSteps: path.steps
      }));

      setCalculationResults(formattedResults);
    } else {
      setCalculationResults([]);
    }
  }, [selectedNode, selectedTarget, inputAmount, mesoMarketRates, cashTradeRates, solTradeRates, mvpGrade, voucherDiscounts, exchangeOptions]);

  return (
    <div className="app">
      <h1>메이플스토리 화폐 변환 계산기</h1>
      <p className="app-subtitle">
        금액을 입력하고 노드를 클릭하여 변환 경로를 탐색하세요
      </p>
      
      <div className="main-container">
        <div className="settings-panel">
          <SettingsPanel
            mesoMarketRates={mesoMarketRates}
            setMesoMarketRates={setMesoMarketRates}
            cashTradeRates={cashTradeRates}
            setCashTradeRates={setCashTradeRates}
            solTradeRates={solTradeRates}
            setSolTradeRates={setSolTradeRates}
            mvpGrade={mvpGrade}
            setMvpGrade={setMvpGrade}
            voucherDiscounts={voucherDiscounts}
            setVoucherDiscounts={setVoucherDiscounts}
            exchangeOptions={exchangeOptions}
            setExchangeOptions={setExchangeOptions}
          />
        </div>

        <div className="graph-panel">
          <AmountInput
            inputAmountDisplay={inputAmountDisplay}
            onAmountChange={handleAmountChange}
            selectedNode={selectedNode}
            getCurrencyName={getCurrencyName}
          />
          
          <GraphSection
            inputAmount={inputAmount}
            mesoMarketRates={mesoMarketRates}
            cashTradeRates={cashTradeRates}
            solTradeRates={solTradeRates}
            mvpGrade={mvpGrade}
            voucherDiscounts={voucherDiscounts}
            exchangeOptions={exchangeOptions}
            selectedNode={selectedNode}
            selectedTarget={selectedTarget}
            highlightedPath={highlightedPath}
            onNodeSelect={handleNodeSelect}
            onReset={handleReset}
          />
          
          <ResultsSection
            calculationResults={calculationResults}
            selectedTarget={selectedTarget}
            targetCurrency={targetCurrency}
            formatNumber={formatNumber}
            getCurrencyName={getCurrencyName}
            getCurrencyType={getCurrencyType}
            onPathHighlight={setHighlightedPath}
          />
        </div>
      </div>
    </div>
  );
}

export default App;