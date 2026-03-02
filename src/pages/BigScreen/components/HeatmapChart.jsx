import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const HeatmapChart = ({ data }) => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    const chart = echarts.init(chartRef.current);
    
    // 提取生产线和区域数据
    const productionLines = [...new Set(data.map(item => item[0]))];
    const areas = [...new Set(data.map(item => item[1]))];
    
    // 准备热力图数据
    const heatmapData = data.map(([productionLine, area, value]) => {
      return [
        productionLines.indexOf(productionLine),
        areas.indexOf(area),
        value
      ];
    });
    
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        position: 'top',
        formatter: function (params) {
          return `
            <div style="font-weight:bold;margin-bottom:5px;">${productionLines[params.data[0]]} - ${areas[params.data[1]]}</div>
            <div>故障频率: ${params.data[2].toFixed(1)}</div>
            <div>风险等级: ${
              params.data[2] > 8 ? '高风险' : 
              params.data[2] > 5 ? '中风险' : '低风险'
            }</div>
          `;
        }
      },
      grid: {
        top: '10%',
        left: '3%',
        right: '10%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: areas,
        splitArea: {
          show: true
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.7)',
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'category',
        data: productionLines,
        splitArea: {
          show: true
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      visualMap: {
        min: 0,
        max: 10,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        text: ['高风险', '低风险'],
        textStyle: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        inRange: {
          color: ['#52C41A', '#FAAD14', '#FF4D4F']
        }
      },
      series: [{
        name: '故障频率',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
    
    chart.setOption(option);
    
    // 添加点击事件
    chart.on('click', function(params) {
      const productionLine = productionLines[params.data[0]];
      const area = areas[params.data[1]];
      console.log(`点击了 ${productionLine} - ${area}, 风险值: ${params.data[2]}`);
      // 这里可以添加更多交互逻辑
    });
    
    // 响应式调整
    const handleResize = () => {
      chart.resize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);
  
  return (
    <div className="heatmap-container">
      <div className="chart-header">
        <div className="chart-title">生产线故障频率热力图</div>
      </div>
      <div ref={chartRef} className="heatmap-chart" />
    </div>
  );
};

export default HeatmapChart;
