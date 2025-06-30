// 주문서 강화 전략 클래스들
import { ScrollType, UpgradeState } from './scrollSimulation.js';

// 기본 전략 클래스
export class BaseEnhancementStrategy {
  constructor(enhancer, settings, debug = false) {
    this.enhancer = enhancer;
    this.settings = settings;
    this.debug = debug;
  }

  debugPrint(message) {
    if (this.debug) {
      console.log(message);
    }
  }

  // 주문서 강화 시도
  tryScroll(state, scrollType) {
    return this.enhancer.applyScroll(scrollType, state);
  }

  // 순백의 주문서로 성공할 때까지 복구 시도
  recoverWithWhite(state) {
    while (state.recoverableCount > 0) {
      if (this.enhancer.applyWhiteScroll(state)) {
        break;
      }
    }
  }

  // 황금망치 및 마지막 슬롯 강화
  executeFinalEnhancement(state, scrollType) {
    // 황금망치 시도
    if (!this.enhancer.applyGoldenHammer(state)) {
      this.recoverWithWhite(state);
    }

    // 마지막 슬롯 강화
    while (true) {
      const { success } = this.tryScroll(state, scrollType);
      if (success) {
        break;
      }
      this.recoverWithWhite(state);
    }
  }

  // 추상 메서드 - 각 전략에서 구현
  execute(state) {
    throw new Error('execute method must be implemented');
  }
}

// 39% 주문서 전용 전략
export class Simple39Strategy extends BaseEnhancementStrategy {
  constructor(enhancer, settings, debug = false, successThreshold = 4) {
    super(enhancer, settings, debug);
    this.successThreshold = successThreshold;
  }

  execute(state) {
    let attemptCount = 0;
    
    while (true) { // 이노센트 루프
      attemptCount++;
      this.debugPrint(`=== 시도 #${attemptCount} ===`);

      // 1. 처음 시도에서 threshold 이상 성공할 때까지
      for (let slot = 0; slot < this.settings.maxAttempts; slot++) {
        const { success } = this.tryScroll(state, ScrollType.STAT_39);
        this.debugPrint(`${slot + 1}번째 슬롯: ${success ? '성공' : '실패'}`);
      }

      this.debugPrint(`첫 시도 결과: ${state.successCount}회 성공`);

      // 2. 성공 횟수가 threshold 미만이면 이노센트
      if (state.successCount < this.successThreshold) {
        this.debugPrint(`성공 횟수 ${state.successCount}회로 기준치(${this.successThreshold}) 미달`);
        state.resetWithInnocent(this.settings.scrollCosts.innocent);
        continue;
      }

      this.debugPrint('기준치 달성! 남은 슬롯 채우기 시작');

      // 3. threshold는 넘었지만 나머지도 성공시켜야 함
      while (state.successCount < this.settings.maxAttempts) {
        this.debugPrint(`남은 슬롯 ${state.successCount + 1} 시도`);
        while (true) {
          this.recoverWithWhite(state);
          const { success } = this.tryScroll(state, ScrollType.STAT_39);
          if (success) {
            this.debugPrint('성공!');
            break;
          }
          this.debugPrint('실패, 순백으로 복구 후 재시도');
        }
      }

      this.executeFinalEnhancement(state, ScrollType.STAT_39);
      return true;
    }
  }
}

// 59% 주문서 전용 전략
export class Simple59Strategy extends BaseEnhancementStrategy {
  constructor(enhancer, settings, debug = false, successThreshold = 4) {
    super(enhancer, settings, debug);
    this.successThreshold = successThreshold;
  }

  execute(state) {
    let attemptCount = 0;
    
    while (true) { // 이노센트 루프
      attemptCount++;
      this.debugPrint(`=== 시도 #${attemptCount} ===`);

      // 1. 처음 시도에서 threshold 이상 성공할 때까지
      for (let slot = 0; slot < this.settings.maxAttempts; slot++) {
        const { success } = this.tryScroll(state, ScrollType.STAT_59);
        this.debugPrint(`${slot + 1}번째 슬롯: ${success ? '성공' : '실패'}`);
      }

      this.debugPrint(`첫 시도 결과: ${state.successCount}회 성공`);

      // 2. 성공 횟수가 threshold 미만이면 이노센트
      if (state.successCount < this.successThreshold) {
        this.debugPrint(`성공 횟수 ${state.successCount}회로 기준치(${this.successThreshold}) 미달`);
        state.resetWithInnocent(this.settings.scrollCosts.innocent);
        continue;
      }

      this.debugPrint('기준치 달성! 남은 슬롯 채우기 시작');

      // 3. threshold는 넘었지만 나머지도 성공시켜야 함
      while (state.successCount < this.settings.maxAttempts) {
        this.debugPrint(`남은 슬롯 ${state.successCount + 1} 시도`);
        while (true) {
          this.recoverWithWhite(state);
          const { success } = this.tryScroll(state, ScrollType.STAT_59);
          if (success) {
            this.debugPrint('성공!');
            break;
          }
          this.debugPrint('실패, 순백으로 복구 후 재시도');
        }
      }

      this.executeFinalEnhancement(state, ScrollType.STAT_59);
      return true;
    }
  }
}

// 놀긍혼 60% 전용 전략
export class Chaos60OnlyStrategy extends BaseEnhancementStrategy {
  constructor(enhancer, settings, debug = false, successThreshold = 3, statThreshold = 7.0) {
    super(enhancer, settings, debug);
    this.successThreshold = successThreshold;
    this.statThreshold = statThreshold;
  }

  execute(state) {
    let attemptCount = 0;
    
    while (true) { // 이노센트 루프
      attemptCount++;
      this.debugPrint(`=== 놀긍혼 60% 전용 시도 #${attemptCount} ===`);

      // 1. 우선 놀긍혼 60%로 시도
      let chaosAttempts = 0;
      while (state.remainingAttempts > 0 && chaosAttempts < 4) { // 최대 4번까지 놀긍혼 시도
        const { success } = this.tryScroll(state, ScrollType.CHAOS_60);
        chaosAttempts++;
        this.debugPrint(`놀긍혼 60% ${chaosAttempts}번째: ${success ? '성공' : '실패'}`);
      }

      // 2. 성공 횟수와 평균 스탯 체크
      if (state.successCount < this.successThreshold) {
        this.debugPrint(`성공 횟수 ${state.successCount}회로 기준치(${this.successThreshold}) 미달`);
        state.resetWithInnocent(this.settings.scrollCosts.innocent);
        continue;
      }

      if (state.avgConvertedStat < this.statThreshold) {
        this.debugPrint(`평균 스탯 ${state.avgConvertedStat.toFixed(1)}로 기준치(${this.statThreshold}) 미달`);
        state.resetWithInnocent(this.settings.scrollCosts.innocent);
        continue;
      }

      this.debugPrint('기준치 달성! 39% 주문서로 나머지 채우기');

      // 3. 나머지는 39% 주문서로
      while (state.successCount < this.settings.maxAttempts) {
        this.debugPrint(`남은 슬롯 ${state.successCount + 1} 시도 (39%)`);
        while (true) {
          this.recoverWithWhite(state);
          const { success } = this.tryScroll(state, ScrollType.STAT_39);
          if (success) {
            this.debugPrint('39% 성공!');
            break;
          }
          this.debugPrint('39% 실패, 순백으로 복구 후 재시도');
        }
      }

      this.executeFinalEnhancement(state, ScrollType.STAT_39);
      return true;
    }
  }
}

// 첫 공6 (60%) 전략
export class FirstSixChaos60Strategy extends BaseEnhancementStrategy {
  constructor(enhancer, settings, debug = false) {
    super(enhancer, settings, debug);
  }

  execute(state) {
    this.debugPrint('=== 첫 공6 (60%) 전략 시작 ===');

    // 1. 첫 슬롯에 놀긍혼 60%로 공격력 6 시도
    let firstSlotSuccess = false;
    while (!firstSlotSuccess) {
      const { success, result } = this.tryScroll(state, ScrollType.CHAOS_60);
      if (success && result.attack >= 6) {
        this.debugPrint(`첫 슬롯 공격력 ${result.attack} 달성!`);
        firstSlotSuccess = true;
      } else if (success) {
        this.debugPrint(`첫 슬롯 공격력 ${result.attack} (6 미만), 이노센트 후 재시도`);
        state.resetWithInnocent(this.settings.scrollCosts.innocent);
      } else {
        this.debugPrint('첫 슬롯 실패, 순백으로 복구 후 재시도');
        this.recoverWithWhite(state);
      }
    }

    // 2. 나머지 슬롯은 39% 주문서로
    while (state.successCount < this.settings.maxAttempts) {
      this.debugPrint(`남은 슬롯 ${state.successCount + 1} 시도 (39%)`);
      while (true) {
        this.recoverWithWhite(state);
        const { success } = this.tryScroll(state, ScrollType.STAT_39);
        if (success) {
          this.debugPrint('39% 성공!');
          break;
        }
        this.debugPrint('39% 실패, 순백으로 복구 후 재시도');
      }
    }

    this.executeFinalEnhancement(state, ScrollType.STAT_39);
    return true;
  }
}

// 하이브리드 전략 (놀긍혼 60% + 39%)
export class HybridChaos60Strategy extends BaseEnhancementStrategy {
  constructor(enhancer, settings, debug = false, statDiffThreshold = 5.0) {
    super(enhancer, settings, debug);
    this.statDiffThreshold = statDiffThreshold;
    this.target15PercentStat = 110.0; // 15% 완작 목표 스탯
  }

  execute(state) {
    this.debugPrint('=== 하이브리드 (60%) 전략 시작 ===');

    // 놀긍혼으로 시작해서 일정 수준 이상 나오면 39%로 전환
    while (state.successCount < this.settings.maxAttempts && state.remainingAttempts > 0) {
      // 현재 상태에서 15% 완작과 비교
      const currentProjected = this.projectFinalStat(state, ScrollType.STAT_39);
      const advantage = currentProjected - this.target15PercentStat;

      if (advantage >= this.statDiffThreshold) {
        this.debugPrint(`스탯 우위 ${advantage.toFixed(1)} 달성, 39%로 전환`);
        break;
      }

      // 놀긍혼 60% 시도
      const { success } = this.tryScroll(state, ScrollType.CHAOS_60);
      this.debugPrint(`놀긍혼 60% ${success ? '성공' : '실패'}, 현재 우위: ${advantage.toFixed(1)}`);
    }

    // 나머지는 39% 주문서로
    while (state.successCount < this.settings.maxAttempts) {
      this.debugPrint(`남은 슬롯 ${state.successCount + 1} 시도 (39%)`);
      while (true) {
        this.recoverWithWhite(state);
        const { success } = this.tryScroll(state, ScrollType.STAT_39);
        if (success) {
          this.debugPrint('39% 성공!');
          break;
        }
        this.debugPrint('39% 실패, 순백으로 복구 후 재시도');
      }
    }

    this.executeFinalEnhancement(state, ScrollType.STAT_39);
    return true;
  }

  // 특정 주문서로 나머지를 채웠을 때의 예상 스탯 계산
  projectFinalStat(state, scrollType) {
    const remainingSlots = this.settings.maxAttempts - state.successCount;
    if (remainingSlots <= 0) return state.totalConvertedStat;

    let projectedStat = state.totalConvertedStat;
    
    if (scrollType === ScrollType.STAT_39) {
      projectedStat += remainingSlots * 10; // 39% 주문서 = +10 스탯
      if (state.successCount < 4 && state.successCount + remainingSlots >= 4) {
        projectedStat += 3; // 4번째 성공 시 공격력 +1 = 환산 +3
      }
    } else if (scrollType === ScrollType.STAT_59) {
      projectedStat += remainingSlots * 7; // 59% 주문서 = +7 스탯
      if (state.successCount < 4 && state.successCount + remainingSlots >= 4) {
        projectedStat += 3; // 4번째 성공 시 공격력 +1 = 환산 +3
      }
    }

    return projectedStat;
  }
}

// 전략 팩토리
export class StrategyFactory {
  static createStrategy(strategyType, enhancer, settings, debug = false, params = {}) {
    switch (strategyType) {
      case 'simple_39':
        return new Simple39Strategy(
          enhancer, 
          settings, 
          debug, 
          params.successThreshold || 4
        );
      
      case 'simple_59':
        return new Simple59Strategy(
          enhancer, 
          settings, 
          debug, 
          params.successThreshold || 4
        );
      
      case 'chaos60_only':
        return new Chaos60OnlyStrategy(
          enhancer, 
          settings, 
          debug, 
          params.successThreshold || 3,
          params.statThreshold || 7.0
        );
      
      case 'first_six_chaos60':
        return new FirstSixChaos60Strategy(enhancer, settings, debug);
      
      case 'hybrid_chaos60':
        return new HybridChaos60Strategy(
          enhancer, 
          settings, 
          debug, 
          params.statDiffThreshold || 5.0
        );
      
      default:
        throw new Error(`Unknown strategy type: ${strategyType}`);
    }
  }
}