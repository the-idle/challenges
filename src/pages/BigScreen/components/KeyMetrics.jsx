import React, { useState, useEffect, useRef } from 'react';
import { Progress } from 'antd';
import { DashboardOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const KeyMetrics = ({ metrics }) => {
  const [animatedMetrics, setAnimatedMetrics] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    setAnimatedMetrics((prevMetrics) => {
      if (prevMetrics.length === 0) {
        return metrics.map((metric) => ({
          ...metric,
          animatedValue: metric.value
        }));
      }

      return metrics.map((metric) => {
        const prevMetric = prevMetrics.find((item) => item.id === metric.id);
        return {
          ...metric,
          animatedValue: prevMetric ? prevMetric.animatedValue : metric.value
        };
      });
    });

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setAnimatedMetrics((prevMetrics) => {
        const nextMetrics = prevMetrics.map((metric) => {
          const targetMetric = metrics.find((item) => item.id === metric.id);
          const target = targetMetric ? targetMetric.value : metric.animatedValue;
          const diff = target - metric.animatedValue;
          if (Math.abs(diff) < 0.05) {
            return { ...metric, animatedValue: target };
          }
          const step = diff / 8;
          return { ...metric, animatedValue: metric.animatedValue + step };
        });

        const finished = nextMetrics.every((metric) => {
          const targetMetric = metrics.find((item) => item.id === metric.id);
          const target = targetMetric ? targetMetric.value : metric.animatedValue;
          return Math.abs(metric.animatedValue - target) < 0.05;
        });

        if (finished) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return metrics.map((metric) => ({
            ...metric,
            animatedValue: metric.value
          }));
        }

        return nextMetrics;
      });
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [metrics]);

  // 根据指标值和阈值确定状态
  const getStatusClass = (metric) => {
    if (metric.status) {
      return metric.status;
    }
    if (metric.title.includes('温度') || metric.title.includes('振动') || metric.title.includes('故障')) {
      // 对于温度、振动和故障率，值越高越危险
      return metric.value > metric.threshold ? 'error' :
        metric.value > metric.threshold * 0.8 ? 'warning' : 'normal';
    } else {
      // 对于设备在线率等，值越低越危险
      return metric.value < metric.threshold ? 'error' :
        metric.value < metric.threshold * 1.2 ? 'warning' : 'normal';
    }
  };

  // 根据状态确定进度条颜色
  const getProgressColor = (status) => {
    switch (status) {
      case 'error':
        return '#FF4D4F';
      case 'warning':
        return '#FAAD14';
      default:
        return '#52C41A';
    }
  };

  return (
    <div className="key-metrics-container">
      {animatedMetrics.map((metric, index) => {
        const status = getStatusClass(metric);
        const progressPercent = metric.title.includes('率')
          ? metric.animatedValue
          : Math.min(100, (metric.animatedValue / metric.threshold) * 100);
        const safeProgressPercent = Math.max(0, Math.min(100, progressPercent));

        // 确定指标的图标
        const getMetricIcon = () => {
          if (metric.title.includes('在线率')) return <DashboardOutlined className="metric-icon" />;
          if (metric.title.includes('温度')) return <span className="metric-icon">℃</span>;
          if (metric.title.includes('振动')) return <span className="metric-icon">~</span>;
          if (metric.title.includes('故障')) return <span className="metric-icon">!</span>;
          return <DashboardOutlined className="metric-icon" />;
        };

        // 确定趋势指示器
        const getTrendIndicator = () => {
          if (status === 'error') {
            return metric.title.includes('在线率')
              ? <ArrowDownOutlined style={{ color: '#FF4D4F' }} />
              : <ArrowUpOutlined style={{ color: '#FF4D4F' }} />;
          }
          if (status === 'warning') {
            return <span style={{ color: '#FAAD14' }}>•</span>;
          }
          return <span style={{ color: '#52C41A' }}>•</span>;
        };

        return (
          <div
            key={metric.id}
            className="metric-card metric-card-enter"
            style={{ animationDelay: `${index * 120}ms` }}
            title={`阈值: ${metric.threshold}${metric.unit}`}
          >
            <div className="metric-header">
              {getMetricIcon()}
              <div className="metric-title">{metric.title}</div>
              {getTrendIndicator()}
            </div>

            <div className="metric-value-container">
              <div className="metric-value">
                {metric.displayValue !== undefined && metric.displayValue !== null
                  ? metric.displayValue
                  : Math.round(metric.animatedValue * 10) / 10}
                {metric.displayValue ? '' : metric.unit}
              </div>
            </div>

            <Progress
              className="metric-progress"
              percent={safeProgressPercent}
              size="small"
              strokeColor={getProgressColor(status)}
              trailColor="rgba(255, 255, 255, 0.1)"
              showInfo={false}
            />
          </div>
        );
      })}
    </div>
  );
};

export default KeyMetrics;
