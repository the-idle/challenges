import React from 'react';
import { HistoryOutlined, CheckCircleOutlined, WarningOutlined, StopOutlined } from '@ant-design/icons';

const EventFlow = ({ events }) => {
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
        <span>设备事件流</span>
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
              <span>
                <span style={{ fontWeight: 500, marginRight: '8px' }}>{event.deviceId}</span>
                {event.content}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventFlow;
