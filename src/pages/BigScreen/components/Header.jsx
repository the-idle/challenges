import React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Switch } from 'antd';

const Header = ({ title, currentTime, apiStatus, wsStatus, wsLatencyMs, isDarkMode, onThemeChange }) => {
  return (
    <div className="big-screen-header">
      <div className="header-time">
        {currentTime}
      </div>

      <div className="header-title">
        <h1>{title}</h1>
      </div>

      <div className="header-status">
        <div className="theme-switcher">
          <Switch
            checked={isDarkMode}
            onChange={onThemeChange}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
            className="custom-theme-switch"
          />
        </div>
        <div className="api-status">
          <span className="header-status-text">API:</span>
          {apiStatus === 'connected' ? (
            <CheckCircleOutlined style={{ color: '#52C41A', fontSize: '18px', marginLeft: '5px' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#FF4D4F', fontSize: '18px', marginLeft: '5px' }} />
          )}
        </div>
        <div className="ws-status">
          <span className="header-status-text">WS:</span>
          {wsStatus === 'connected' ? (
            <CheckCircleOutlined style={{ color: '#52C41A', fontSize: '18px', marginLeft: '5px' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#FF4D4F', fontSize: '18px', marginLeft: '5px' }} />
          )}
          <span className="ws-latency">{wsLatencyMs !== null ? `${wsLatencyMs}ms` : '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
