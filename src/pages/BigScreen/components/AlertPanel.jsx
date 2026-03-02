import React, { useEffect, useState } from 'react';
import { Badge, Tag, Tooltip } from 'antd';
import { WarningOutlined, ExclamationCircleOutlined, AlertOutlined, BellOutlined } from '@ant-design/icons';

const AlertPanel = ({ alerts, onAlertClick }) => {
  const [animatedAlerts, setAnimatedAlerts] = useState([]);

  // 添加动画效果，新的预警会闪烁
  useEffect(() => {
    setAnimatedAlerts(alerts.map(alert => ({
      ...alert,
      isNew: alert.level === 'high' // 高级预警会有闪烁效果
    })));

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
      <div className="panel-title">
        <BellOutlined style={{ marginRight: '8px', fontSize: '18px', color: '#333' }} />
        <span style={{ color: '#333', fontWeight: 'bold' }}>故障预警</span>
        <Badge
          count={alerts.filter(alert => alert.level === 'high').length}
          overflowCount={99}
          style={{
            backgroundColor: '#ff4d4f',
            marginLeft: 'auto'
          }}
        />
      </div>

      <div className="alert-list">
        {animatedAlerts.map((alert) => (
          <div
            key={alert.id}
            className={getAlertClassName(alert)}
            onClick={() => onAlertClick && onAlertClick({ id: alert.deviceId, name: alert.deviceName })}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getAlertIcon(alert.level)}
                <span style={{ fontWeight: 500, color: '#333' }}>{alert.deviceName}</span>
              </div>
              <Tag color={getAlertTagColor(alert.level)}>
                {getAlertLevelText(alert.level)}级预警
              </Tag>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#666' }}>
              <span>{alert.type}</span>
              <span style={{ fontSize: '12px' }}>{alert.time.split(' ')[1]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertPanel;
