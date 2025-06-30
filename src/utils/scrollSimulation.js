// 주문서 강화 시뮬레이션 핵심 로직

// 주문서 타입 정의
export const ScrollType = {
  CHAOS_60: 'CHAOS_60',
  CHAOS_100: 'CHAOS_100',
  STAT_39: 'STAT_39',
  STAT_59: 'STAT_59'
};

// 전략 타입 정의
export const StrategyType = {
  SIMPLE_39: 'simple_39',
  SIMPLE_59: 'simple_59',
  CHAOS60_ONLY: 'chaos60_only',
  CHAOS100_ONLY: 'chaos100_only',
  CHAOS60_100: 'chaos60_100',
  FIRST_SIX_CHAOS60: 'first_six_chaos60',
  FIRST_SIX_CHAOS100: 'first_six_chaos100',
  HYBRID_CHAOS60: 'hybrid_chaos60',
  HYBRID_CHAOS100: 'hybrid_chaos100'
};

// 주문서 결과 클래스
export class ScrollResult {
  constructor(success, attack, mainStat, subStat, cost) {
    this.success = success;
    this.attack = attack;
    this.mainStat = mainStat;
    this.subStat = subStat;
    this.cost = cost;
  }
}

// 강화 상태 클래스
export class UpgradeState {
  constructor(maxAttempts = 7) {
    // 스탯 관련
    this.attackPower = 0;
    this.mainStat = 0;
    this.subStat = 0;

    // 강화 시도 관련
    this.successCount = 0;
    this.remainingAttempts = maxAttempts;
    this.recoverableCount = 0; // 순백으로 복구 가능한 실패 횟수

    // 비용/사용 횟수 관련
    this.totalCost = 0;
    this.scrollSequence = [];
    this.scrollCounts = {
      [ScrollType.CHAOS_60]: 0,
      [ScrollType.CHAOS_100]: 0,
      [ScrollType.STAT_39]: 0,
      [ScrollType.STAT_59]: 0
    };
    this.innocentCount = 0;
    this.whiteCount = 0;
    this.hammerCount = 0;
  }

  // 전체 환산 스탯 계산 (공격력*3 + 주스탯 + 부스탯*0.1)
  get totalConvertedStat() {
    return this.mainStat + (this.attackPower * 3) + (this.subStat * 0.1);
  }

  // 성공당 평균 환산 스탯
  get avgConvertedStat() {
    if (this.successCount === 0) return 0;
    return this.totalConvertedStat / this.successCount;
  }

  // 스탯당 비용
  get costPerStat() {
    if (this.totalConvertedStat === 0) return Infinity;
    return this.totalCost / this.totalConvertedStat;
  }

  // 성공한 주문서 효과 적용
  applySuccessfulScroll(result, scrollType) {
    this.successCount++;
    this.remainingAttempts--;
    this.attackPower += result.attack;
    this.mainStat += result.mainStat;
    this.subStat += result.subStat;
    this.scrollSequence.push(scrollType);
  }

  // 실패한 주문서 처리
  applyFailedScroll(scrollType) {
    this.remainingAttempts--;
    this.recoverableCount++;
    this.scrollSequence.push(scrollType);
  }

  // 순백의 주문서 성공 처리
  applySuccessfulWhiteScroll(cost) {
    this.totalCost += cost;
    this.whiteCount++;
    this.remainingAttempts++;
    this.recoverableCount--;
  }

  // 순백의 주문서 실패 처리
  applyFailedWhiteScroll(cost) {
    this.totalCost += cost;
    this.whiteCount++;
  }

  // 이노센트로 초기화
  resetWithInnocent(cost) {
    this.totalCost += cost;
    this.innocentCount++;
    this.attackPower = 0;
    this.mainStat = 0;
    this.subStat = 0;
    this.successCount = 0;
    this.remainingAttempts = 7; // 기본값으로 재설정
    this.recoverableCount = 0;
    this.scrollSequence = [];
  }

  // 비용 업데이트
  updateCosts(cost) {
    this.totalCost += cost;
  }

  // 주문서 사용 횟수 증가
  incrementScrollCount(scrollType) {
    this.scrollCounts[scrollType]++;
  }

  // 황금망치 성공 처리
  applySuccessfulHammer(cost) {
    this.remainingAttempts++;
    this.totalCost += cost;
    this.hammerCount++;
  }

  // 황금망치 실패 처리
  applyFailedHammer(cost) {
    this.recoverableCount++;
    this.totalCost += cost;
    this.hammerCount++;
  }

  // 복사본 생성
  clone() {
    const newState = new UpgradeState();
    Object.assign(newState, {
      attackPower: this.attackPower,
      mainStat: this.mainStat,
      subStat: this.subStat,
      successCount: this.successCount,
      remainingAttempts: this.remainingAttempts,
      recoverableCount: this.recoverableCount,
      totalCost: this.totalCost,
      scrollSequence: [...this.scrollSequence],
      scrollCounts: { ...this.scrollCounts },
      innocentCount: this.innocentCount,
      whiteCount: this.whiteCount,
      hammerCount: this.hammerCount
    });
    return newState;
  }
}

// 장비 강화기 클래스
export class EquipmentEnhancer {
  constructor(settings, debug = false) {
    this.settings = settings;
    this.debug = debug;
  }

  // 놀긍혼 성공 시 수치 결정
  rollChaosScroll() {
    const possibilities = [0, 1, 2, 3, 4, 6];
    const probabilities = [0.1838, 0.3301, 0.2387, 0.1387, 0.0494, 0.0593];
    
    const attack = this.weightedRandomChoice(possibilities, probabilities);
    const mainStat = this.weightedRandomChoice(possibilities, probabilities);
    const subStat = this.weightedRandomChoice(possibilities, probabilities);
    
    return { attack, mainStat, subStat };
  }

  // 가중치 랜덤 선택
  weightedRandomChoice(choices, weights) {
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < choices.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        return choices[i];
      }
    }
    
    return choices[choices.length - 1];
  }

  // 주문서 적용
  applyScroll(scrollType, state) {
    const cost = this.settings.scrollCosts[this.getScrollCostKey(scrollType)];
    state.totalCost += cost;
    state.scrollCounts[scrollType]++;

    // 성공 판정
    const successRate = this.settings.successRates[this.getSuccessRateKey(scrollType)];
    const success = Math.random() < successRate;

    if (!success) {
      // 실패 처리
      state.applyFailedScroll(scrollType);
      return { success: false, result: new ScrollResult(false, 0, 0, 0, cost) };
    }

    // 성공 처리
    let result;
    if (scrollType === ScrollType.CHAOS_60 || scrollType === ScrollType.CHAOS_100) {
      // 놀긍혼 성공
      const { attack, mainStat, subStat } = this.rollChaosScroll();
      result = new ScrollResult(true, attack, mainStat, subStat, cost);
    } else {
      // 일반 주문서 성공
      const attackBonus = state.successCount === 3 ? 1 : 0; // 4번째 성공 시 공격력 +1
      const stat = this.settings.scrollStats[this.getScrollStatKey(scrollType)];
      result = new ScrollResult(true, attackBonus, stat, 0, cost);
    }

    state.applySuccessfulScroll(result, scrollType);
    return { success: true, result };
  }

  // 황금망치 적용
  applyGoldenHammer(state) {
    const cost = this.settings.scrollCosts.goldenHammer;
    const success = Math.random() < 1.0; // 100% 성공률 (설정에 따라 변경 가능)

    if (success) {
      state.applySuccessfulHammer(cost);
    } else {
      state.applyFailedHammer(cost);
    }

    return success;
  }

  // 순백의 주문서 적용
  applyWhiteScroll(state) {
    if (state.recoverableCount <= 0) {
      return false;
    }

    const cost = this.settings.scrollCosts.whiteScroll;
    const success = Math.random() < 1.0; // 100% 성공률

    if (success) {
      state.applySuccessfulWhiteScroll(cost);
    } else {
      state.applyFailedWhiteScroll(cost);
    }

    return success;
  }

  // 도구 메서드들
  getScrollCostKey(scrollType) {
    const mapping = {
      [ScrollType.CHAOS_60]: 'chaos60',
      [ScrollType.CHAOS_100]: 'chaos100',
      [ScrollType.STAT_39]: 'stat39',
      [ScrollType.STAT_59]: 'stat59'
    };
    return mapping[scrollType];
  }

  getSuccessRateKey(scrollType) {
    const mapping = {
      [ScrollType.CHAOS_60]: 'chaos60',
      [ScrollType.CHAOS_100]: 'chaos100',
      [ScrollType.STAT_39]: 'stat39',
      [ScrollType.STAT_59]: 'stat59'
    };
    return mapping[scrollType];
  }

  getScrollStatKey(scrollType) {
    const mapping = {
      [ScrollType.STAT_39]: 'stat39',
      [ScrollType.STAT_59]: 'stat59'
    };
    return mapping[scrollType];
  }
}