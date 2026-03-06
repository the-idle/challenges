import React from 'react';
import { HistoryOutlined, CheckCircleOutlined, WarningOutlined, StopOutlined } from '@ant-design/icons';

const EventFlow = ({ events, packageStats }) => {
  // 根据事件类型获取图标
  const getEventIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52C41A' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#FAAD14' }} />;
      case 'error':
        return <StopOutlined style={{ color: '#FF4D4F' }} />;
      default:
        return <CheckCircleOutlined style={{ color: '#52C41A' }} />;
    }
  };

  // 根据事件类型获取样式类名
  const getEventClassName = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return '';
    }
  };

  return (
    <div className="event-flow-container">
      <div className="event-flow-title">
        <HistoryOutlined />
        <span>药包抓取统计</span>
      </div>

      <div className="package-stats-grid">
        <div className="package-stat-item">
          <div className="package-stat-label">抓取总数</div>
          <div className="package-stat-value">{packageStats.total}</div>
        </div>
        <div className="package-stat-item">
          <div className="package-stat-label">合格包数</div>
          <div className="package-stat-value success">{packageStats.ok}</div>
        </div>
        <div className="package-stat-item">
          <div className="package-stat-label">异常包数</div>
          <div className="package-stat-value warning">{packageStats.abnormal}</div>
        </div>
        <div className="package-stat-item">
          <div className="package-stat-label">合格率</div>
          <div className="package-stat-value">{packageStats.passRate}%</div>
        </div>
      </div>

      <div className="event-flow-list">
        <div className="event-flow-line" />
        {events.map((event, index) => (
          <div
            key={index}
            className={`event-flow-item ${getEventClassName(event.type)}`}
          >
            <div className="event-flow-item-time">{event.time}</div>
            <div className="event-flow-item-content">
              {getEventIcon(event.type)}
              <span className="event-flow-item-message">
                <span className="event-flow-item-id">{event.packageId || event.deviceId}</span>
                {event.content}
              </span>
            </div>
            {event.station ? (
              <div className="event-flow-item-meta">
                工位：{event.station}，重量：{event.weight}g
              </div>
            ) : null}
          </div>
        ))}
        {events.length === 0 ? (
          <div className="event-flow-empty">等待并联机器人抓取数据...</div>
        ) : null}
      </div>
    </div>
  );
};

export default EventFlow;
