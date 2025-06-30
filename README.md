# 🍁 메이플스토리 도구 모음

메이플스토리 게임을 위한 다양한 계산 도구들을 제공하는 웹 애플리케이션입니다.

## 🚀 라이브 데모

**GitHub Pages**: https://ahrrri.github.io/ahrrri-maple-tools/

## ✨ 주요 기능

### 💰 화폐 변환 계산기
- 🎯 **직관적인 그래프 시각화**: D3.js를 사용한 화폐 변환 네트워크
- 💰 **복합 화폐 시스템**: 현금, 넥슨캐시, 메이플포인트, 서버별 메소, 솔 에르다 조각
- 🔄 **실시간 경로 최적화**: 설정 변경 시 즉시 최적 경로 계산
- ⚙️ **고급 설정 관리**: 시세, MVP 등급, 상품권 할인 등 세부 설정
- 💾 **설정 저장/불러오기**: 브라우저 저장 및 파일 import/export

### 📜 주문서 강화 시뮬레이터
- 🎲 **다양한 전략 시뮬레이션**: 39%, 59%, 놀긍혼, 하이브리드 등 9가지 전략
- 📊 **상세한 통계 분석**: 비용-효율 분석, 성공률 통계, 주문서 사용량
- 📈 **시각화 차트**: 결과 분포 및 비교 분석
- ⚙️ **맞춤 설정**: 주문서 비용, 성공률, 전략 파라미터 조정
- 🏆 **전략 비교**: 여러 전략의 효율성 비교 분석

### 🎨 공통 기능
- 📱 **반응형 디자인**: 모든 디바이스에서 최적화된 UI
- 🎯 **직관적인 탭 인터페이스**: 기능별 쉬운 전환

## 🛠️ 기술 스택

- **Frontend**: React 19 + Vite
- **Visualization**: D3.js v7
- **Styling**: CSS Modules
- **Deployment**: GitHub Pages + GitHub Actions

## 🏗️ 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 📖 프로젝트 문서

상세한 프로젝트 정보는 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

## 🚀 배포

이 프로젝트는 GitHub Actions를 통해 자동으로 GitHub Pages에 배포됩니다.

1. `master` 브랜치에 푸시하면 자동 배포
2. 빌드 상태: ![Deploy Status](https://github.com/Ahrrri/ahrrri-maple-tools/actions/workflows/deploy.yml/badge.svg)

## 📄 라이선스

MIT License
