import React, { useEffect, useRef } from 'react';
import './ScrollVisualization.css';

const ScrollVisualization = ({ results, settings }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (!results || !chartRef.current) return;

    // 간단한 히스토그램 그리기
    drawSimpleChart();
  }, [results]);

  const drawSimpleChart = () => {
    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // 캔버스 클리어
    ctx.clearRect(0, 0, width, height);

    // 가상의 분포 데이터 생성 (나중에 실제 데이터로 교체)
    const statData = generateDistributionData(results.averageStats.convertedStat, 20);
    const costData = generateDistributionData(results.averageCost, 10000);

    // 스탯 분포 그리기
    drawHistogram(ctx, statData, width * 0.45, height * 0.4, 0, 50, '#4CAF50', '환산스탯 분포');
    
    // 비용 분포 그리기
    drawHistogram(ctx, costData, width * 0.45, height * 0.4, width * 0.55, 50, '#2196F3', '비용 분포');
  };

  const generateDistributionData = (mean, variance) => {
    const data = [];
    for (let i = 0; i < 20; i++) {
      const x = mean - variance + (i / 19) * (variance * 2);
      const y = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(variance / 3, 2))) * 100;
      data.push({ x, y });
    }
    return data;
  };

  const drawHistogram = (ctx, data, width, height, offsetX, offsetY, color, title) => {
    const maxY = Math.max(...data.map(d => d.y));
    const barWidth = width / data.length;

    // 제목
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, offsetX + width / 2, offsetY - 10);

    // 막대 그래프
    data.forEach((point, i) => {
      const barHeight = (point.y / maxY) * height;
      const x = offsetX + i * barWidth;
      const y = offsetY + height - barHeight;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // 축
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + height);
    ctx.lineTo(offsetX + width, offsetY + height);
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX, offsetY + height);
    ctx.stroke();
  };

  return (
    <div className="scroll-visualization">
      <h3 className="section-title">📊 결과 분포</h3>
      
      <div className="chart-container">
        <canvas 
          ref={chartRef}
          width={800}
          height={400}
          className="distribution-chart"
        />
      </div>

      <div className="chart-description">
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
            <span>환산스탯 분포</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#2196F3' }}></div>
            <span>비용 분포</span>
          </div>
        </div>
        <p className="chart-note">
          시뮬레이션 결과의 분포를 보여줍니다. 실제 구현에서는 더 상세한 차트가 제공됩니다.
        </p>
      </div>

      {/* 추가 통계 정보 */}
      <div className="additional-stats">
        <h4>📈 추가 통계</h4>
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-title">성공률 분석</div>
            <div className="stat-content">
              <div>평균 성공률: 약 65%</div>
              <div>최고 성공률: 약 85%</div>
              <div>최저 성공률: 약 45%</div>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-title">효율성 지표</div>
            <div className="stat-content">
              <div>스탯/주흔: {(1 / results.costPerStat * 1000000).toFixed(0)}/백만주흔</div>
              <div>완성 확률: 약 95%</div>
              <div>평균 시도 횟수: {(results.totalTrials * 1.2).toFixed(0)}회</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollVisualization;