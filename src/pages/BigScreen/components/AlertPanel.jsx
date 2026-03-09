import React, { useEffect, useRef, useState } from 'react';
import { Badge, Tag } from 'antd';
import { WarningOutlined, ExclamationCircleOutlined, AlertOutlined, BellOutlined } from '@ant-design/icons';

const AlertPanel = ({ alerts, onAlertClick }) => {
  const [animatedAlerts, setAnimatedAlerts] = useState([]);
  const seenAlertIdsRef = useRef(new Set());

  // 添加动画效果，新的预警会闪烁
  useEffect(() => {
    setAnimatedAlerts(alerts.map((alert) => {
      const isNewAlert = !seenAlertIdsRef.current.has(alert.id);
      seenAlertIdsRef.current.add(alert.id);
      return {
        ...alert,
        isNew: alert.level === 'high' && isNewAlert
      };
    }));

    // 5秒后停止闪烁
    const timer = setTimeout(() => {
      setAnimatedAlerts(prev => prev.map(alert => ({
        ...alert,
        isNew: false
      })));
    }, 5000);

    return () => clearTimeout(timer);
  }, [alerts]);

  // 根据预警等级获取图标
  const getAlertIcon = (level) => {
    switch (level) {
      case 'high':
        return <ExclamationCircleOutlined style={{ color: '#FF4D4F', fontSize: '16px' }} />;
      case 'medium':
        return <WarningOutlined style={{ color: '#FAAD14', fontSize: '16px' }} />;
      case 'low':
        return <AlertOutlined style={{ color: '#52C41A', fontSize: '16px' }} />;
      default:
        return <WarningOutlined style={{ fontSize: '16px' }} />;
    }
  };

  // 根据预警等级获取标签颜色
  const getAlertTagColor = (level) => {
    switch (level) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // 获取告警卡片的类名
  const getAlertClassName = (alert) => {
    const classes = ['alert-item'];
    if (alert.level) classes.push(`${alert.level}-alert`);
    if (alert.isNew) classes.push('new-alert');
    return classes.join(' ');
  };

  // 根据预警等级获取文本
  const getAlertLevelText = (level) => {
    switch (level) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '未知';
    }
  };

  return (
    <div className="alert-panel-container">
      <div className="panel-title alert-panel-title">
        <BellOutlined className="panel-icon" />
        <span className="panel-text">故障预警</span>
        <Badge
          count={alerts.filter(alert => alert.level === 'high').length}
          overflowCount={99}
          className="alert-badge"
        />
      </div>

      <div className="alert-list">
        {animatedAlerts.map((alert) => (
          <div
            key={alert.id}
            className={getAlertClassName(alert)}
            onClick={() => onAlertClick && onAlertClick(alert)}
          >
            <div className="alert-header">
              <div className="alert-device-info">
                {getAlertIcon(alert.level)}
                <span className="alert-device-name">{alert.deviceName}</span>
              </div>
              <Tag color={getAlertTagColor(alert.level)}>
                {getAlertLevelText(alert.level)}级预警
              </Tag>
            </div>

            <div className="alert-body">
              <span className="alert-summary">{alert.summary || alert.type}</span>
              <span className="alert-time">{alert.time?.includes(' ') ? alert.time.split(' ')[1] : alert.time}</span>
            </div>
            {alert.rootCause ? (
              <div className="alert-footer">
                根因：{alert.rootCause}
              </div>
            ) : null}
          </div>
        ))}
        {animatedAlerts.length === 0 ? (
          <div className="alert-empty-state">等待设备报警数据...</div>
        ) : null}
      </div>
    </div>
  );
};

export default AlertPanel;
