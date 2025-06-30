// 주문서 시뮬레이션 실행 및 분석
import { UpgradeState, EquipmentEnhancer } from './scrollSimulation.js';
import { StrategyFactory } from './scrollStrategies.js';

// 시뮬레이션 실행 함수
export async function runScrollSimulation(settings) {
  const { 
    trials, 
    selectedStrategy, 
    strategyParams,
    maxAttempts,
    scrollCosts,
    successRates,
    scrollStats,
    attackStatRatio,
    subStatRatio
  } = settings;

  // 강화기 설정 구성
  const enhancerSettings = {
    maxAttempts,
    scrollCosts,
    successRates,
    scrollStats,
    attackStatRatio,
    subStatRatio
  };

  const enhancer = new EquipmentEnhancer(enhancerSettings, false);
  const strategy = StrategyFactory.createStrategy(
    selectedStrategy, 
    enhancer, 
    enhancerSettings, 
    false, 
    strategyParams
  );

  const results = [];
  
  // 진행률 시뮬레이션을 위한 Promise
  return new Promise((resolve) => {
    let completed = 0;
    
    const runBatch = (batchSize = 100) => {
      for (let i = 0; i < batchSize && completed < trials; i++) {
        const state = new UpgradeState(maxAttempts);
        
        try {
          strategy.execute(state);
          results.push(state);
        } catch (error) {
          console.error('시뮬레이션 오류:', error);
          // 오류가 발생해도 빈 상태로라도 결과에 포함
          results.push(new UpgradeState(maxAttempts));
        }
        
        completed++;
      }
      
      // 다음 배치 예약 또는 완료
      if (completed < trials) {
        setTimeout(() => runBatch(batchSize), 0);
      } else {
        // 결과 분석 및 반환
        const analysis = analyzeResults(results, enhancerSettings);
        resolve(analysis);
      }
    };
    
    // 첫 배치 시작
    runBatch();
  });
}

// 결과 분석 함수
function analyzeResults(results, settings) {
  if (results.length === 0) {
    throw new Error('분석할 결과가 없습니다.');
  }

  // 기본 통계 계산
  const stats = {
    attack: results.map(r => r.attackPower),
    mainStat: results.map(r => r.mainStat),
    subStat: results.map(r => r.subStat),
    convertedStat: results.map(r => r.totalConvertedStat),
    totalCost: results.map(r => r.totalCost),
    costPerStat: results.map(r => r.costPerStat).filter(c => isFinite(c))
  };

  // 평균값 계산
  const averageStats = {
    attack: average(stats.attack),
    mainStat: average(stats.mainStat),
    subStat: average(stats.subStat),
    convertedStat: average(stats.convertedStat)
  };

  const averageCost = average(stats.totalCost);
  const averageCostPerStat = average(stats.costPerStat);

  // 주문서 사용량 통계
  const scrollUsage = calculateScrollUsage(results, settings);

  // 분포 데이터 생성
  const distributions = {
    finalStats: stats.convertedStat.sort((a, b) => a - b),
    costs: stats.totalCost.sort((a, b) => a - b)
  };

  return {
    totalTrials: results.length,
    averageStats,
    averageCost,
    costPerStat: averageCostPerStat,
    scrollUsage,
    distributions,
    rawResults: results // 필요시 원본 데이터 접근용
  };
}

// 주문서 사용량 통계 계산
function calculateScrollUsage(results, settings) {
  const scrollTypes = ['chaos60', 'chaos100', 'stat39', 'stat59', 'whiteScroll', 'innocent', 'goldenHammer'];
  const usage = {};

  scrollTypes.forEach(scrollType => {
    const counts = results.map(r => getScrollCount(r, scrollType));
    const totalCount = sum(counts);
    const avgCount = average(counts);

    usage[scrollType] = {
      avg: avgCount,
      total: totalCount,
      min: Math.min(...counts),
      max: Math.max(...counts),
      median: median(counts)
    };
  });

  return usage;
}

// 결과에서 특정 주문서 사용 횟수 추출
function getScrollCount(result, scrollType) {
  switch (scrollType) {
    case 'chaos60':
      return result.scrollCounts.CHAOS_60 || 0;
    case 'chaos100':
      return result.scrollCounts.CHAOS_100 || 0;
    case 'stat39':
      return result.scrollCounts.STAT_39 || 0;
    case 'stat59':
      return result.scrollCounts.STAT_59 || 0;
    case 'whiteScroll':
      return result.whiteCount || 0;
    case 'innocent':
      return result.innocentCount || 0;
    case 'goldenHammer':
      return result.hammerCount || 0;
    default:
      return 0;
  }
}

// 유틸리티 함수들
function average(arr) {
  return arr.length > 0 ? sum(arr) / arr.length : 0;
}

function sum(arr) {
  return arr.reduce((total, val) => total + val, 0);
}

function median(arr) {
  if (arr.length === 0) return 0;
  
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// 디버그용 단일 시뮬레이션 실행
export function runSingleSimulation(settings, debug = true) {
  const enhancerSettings = {
    maxAttempts: settings.maxAttempts,
    scrollCosts: settings.scrollCosts,
    successRates: settings.successRates,
    scrollStats: settings.scrollStats,
    attackStatRatio: settings.attackStatRatio,
    subStatRatio: settings.subStatRatio
  };

  const enhancer = new EquipmentEnhancer(enhancerSettings, debug);
  const strategy = StrategyFactory.createStrategy(
    settings.selectedStrategy, 
    enhancer, 
    enhancerSettings, 
    debug, 
    settings.strategyParams
  );

  const state = new UpgradeState(settings.maxAttempts);
  strategy.execute(state);
  
  return state;
}

// 전략 비교 함수
export async function compareStrategies(strategiesToCompare, baseSettings) {
  const comparisons = [];
  
  for (const strategyConfig of strategiesToCompare) {
    const settings = {
      ...baseSettings,
      selectedStrategy: strategyConfig.strategy,
      strategyParams: strategyConfig.params || {}
    };
    
    const results = await runScrollSimulation(settings);
    
    comparisons.push({
      name: strategyConfig.name || strategyConfig.strategy,
      strategy: strategyConfig.strategy,
      results
    });
  }
  
  return comparisons;
}