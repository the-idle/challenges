import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { LineChartOutlined } from '@ant-design/icons';

const TimeSeriesChart = ({ data, timeRange, onTimeRangeChange }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // 处理时间范围按钮点击
  const handleTimeRangeClick = (range) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
  };

  const getOption = () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function (params) {
          let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>`;
          params.forEach(param => {
            const unit = param.seriesName === '温度' ? '°C' : 'm/s²';
            result += `<div style="display:flex;align-items:center;">
              <span style="display:inline-block;width:10px;height:10px;background-color:${param.color};margin-right:5px;"></span>
              <span>${param.seriesName}: ${param.value}${unit}</span>
            </div>`;
          });
          return result;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      legend: {
        data: ['温度', '振动'],
        textStyle: {
          color: '#333'
        },
        right: 10,
        top: 0
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: data.timestamps,
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          axisLabel: {
            color: '#333'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '温度 (°C)',
          nameTextStyle: {
            color: '#333'
          },
          min: 0,
          max: 100,
          interval: 20,
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          axisLabel: {
            color: '#333',
            formatter: '{value} °C'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(51, 51, 51, 0.2)'
            }
          }
        },
        {
          type: 'value',
          name: '振动 (m/s²)',
          nameTextStyle: {
            color: '#333'
          },
          min: 0,
          max: 10,
          interval: 2,
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          },
          axisLabel: {
            color: '#333',
            formatter: '{value} m/s²'
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: '温度',
          type: 'line',
          yAxisIndex: 0,
          data: data.temperature,
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          sampling: 'average',
          itemStyle: {
            color: '#1890FF'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.4)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
              ]
            }
          },
          emphasis: {
            focus: 'series'
          }
        },
        {
          name: '振动',
          type: 'line',
          yAxisIndex: 1,
          data: data.vibration,
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          sampling: 'average',
          itemStyle: {
            color: '#FAAD14'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(250, 173, 20, 0.4)' },
                { offset: 1, color: 'rgba(250, 173, 20, 0.1)' }
              ]
            }
          },
          emphasis: {
            focus: 'series'
          }
        }
      ]
    });

  useEffect(() => {
    if (!chartRef.current) {
      return undefined;
    }

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;
    chart.setOption(getOption(), { notMerge: true });

    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current) {
      return;
    }
    chartInstanceRef.current.setOption(
      {
        xAxis: [
          {
            data: data.timestamps
          }
        ],
        series: [
          { data: data.temperature },
          { data: data.vibration }
        ]
      },
      { notMerge: false, lazyUpdate: true }
    );
  }, [data]);

  return (
    <div className="time-series-container" style={{ height: '100%' }}>
      <div className="chart-header">
        <div className="chart-title">
          <LineChartOutlined style={{ marginRight: '8px', fontSize: '18px', color: '#4fc3f7' }} />
          设备实时监控数据
        </div>
        <div className="time-range-selector">
          <div
            className={`time-range-button ${timeRange === '1h' ? 'active' : ''}`}
            onClick={() => handleTimeRangeClick('1h')}
          >
            1小时
          </div>
          <div
            className={`time-range-button ${timeRange === '1d' ? 'active' : ''}`}
            onClick={() => handleTimeRangeClick('1d')}
          >
            1天
          </div>
          <div
            className={`time-range-button ${timeRange === '1w' ? 'active' : ''}`}
            onClick={() => handleTimeRangeClick('1w')}
          >
            1周
          </div>
        </div>
      </div>
      <div ref={chartRef} className="time-series-chart" />
    </div>
  );
};

export default TimeSeriesChart;
