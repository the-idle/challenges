import { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';
import { LineChartOutlined } from '@ant-design/icons';

const TimeSeriesChart = ({ data, timeRange, onTimeRangeChange, isDarkMode, showTimeRangeSelector = false }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // 处理时间范围按钮点击
  const handleTimeRangeClick = (range) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
  };

  const getOption = useCallback(() => {
    const textColor = isDarkMode ? '#a6b0c3' : '#595959';
    const splitLineColor = isDarkMode ? 'rgba(166, 176, 195, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const tooltipBg = isDarkMode ? 'rgba(10, 31, 60, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipBorder = isDarkMode ? '#00a8ff' : '#d9d9d9';
    const tooltipText = isDarkMode ? '#ffffff' : '#1f1f1f';

    const seriesList = Array.isArray(data.series) ? data.series : [];
    const legendData = seriesList.map(item => item.name);
    const yAxisList = seriesList.map((item, index) => ({
      type: 'value',
      name: item.unit ? `${item.name} (${item.unit})` : item.name,
      nameTextStyle: {
        color: textColor
      },
      min: 0,
      axisLine: {
        lineStyle: {
          color: textColor
        }
      },
      axisLabel: {
        color: textColor,
        formatter: item.unit ? `{value} ${item.unit}` : '{value}'
      },
      splitLine: {
        show: index === 0,
        lineStyle: {
          color: splitLineColor
        }
      }
    }));
    const chartSeries = seriesList.map((item, index) => ({
      name: item.name,
      type: 'line',
      yAxisIndex: index,
      data: item.values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      sampling: 'average',
      itemStyle: {
        color: item.color
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: item.areaStartColor || 'rgba(24, 144, 255, 0.4)' },
            { offset: 1, color: item.areaEndColor || 'rgba(24, 144, 255, 0.1)' }
          ]
        }
      },
      emphasis: {
        focus: 'series'
      }
    }));
    return {
      backgroundColor: 'transparent',
      animationDuration: 700,
      animationDurationUpdate: 0,
      animationEasingUpdate: 'linear',
      tooltip: {
        trigger: 'axis',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        textStyle: {
          color: tooltipText
        },
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: isDarkMode ? '#006cb8' : '#1890ff'
          }
        },
        formatter: function (params) {
          let result = `<div style="font-weight:bold;margin-bottom:5px;color:${tooltipText};">${params[0].axisValue}</div>`;
          params.forEach(param => {
            const matched = seriesList.find(item => item.name === param.seriesName);
            const unit = matched?.unit ? matched.unit : '';
            result += `<div style="display:flex;align-items:center;">
              <span style="display:inline-block;width:10px;height:10px;background-color:${param.color};margin-right:5px;"></span>
              <span style="color:${tooltipText};">${param.seriesName}: ${param.value}${unit ? unit : ''}</span>
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
        data: legendData,
        textStyle: {
          color: textColor
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
              color: textColor
            }
          },
          axisLabel: {
            color: textColor
          }
        }
      ],
      yAxis: yAxisList.length > 0 ? yAxisList : [{ type: 'value' }],
      series: chartSeries
    };
  }, [data, isDarkMode]);

  useEffect(() => {
    if (!chartRef.current) {
      return undefined;
    }

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;
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
    chartInstanceRef.current.setOption(getOption(), { notMerge: false, lazyUpdate: true });
  }, [getOption]);

  return (
    <div className="time-series-container" style={{ height: '100%' }}>
      <div className="chart-header">
        <div className="chart-title">
          <LineChartOutlined style={{ marginRight: '8px', fontSize: '18px', color: 'var(--primary-color)' }} />
          设备实时监控数据
        </div>
        {showTimeRangeSelector ? (
          <div className="time-range-selector">
            <button
              type="button"
              className={`time-range-button ${timeRange === '1h' ? 'active' : ''}`}
              onClick={() => handleTimeRangeClick('1h')}
            >
              1小时
            </button>
            <button
              type="button"
              className={`time-range-button ${timeRange === '1d' ? 'active' : ''}`}
              onClick={() => handleTimeRangeClick('1d')}
            >
              1天
            </button>
            <button
              type="button"
              className={`time-range-button ${timeRange === '1w' ? 'active' : ''}`}
              onClick={() => handleTimeRangeClick('1w')}
            >
              1周
            </button>
          </div>
        ) : null}
      </div>
      <div ref={chartRef} className="time-series-chart" />
    </div>
  );
};

export default TimeSeriesChart;
