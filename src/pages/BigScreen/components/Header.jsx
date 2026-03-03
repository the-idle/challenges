import React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Switch } from 'antd';

const Header = ({ title, currentTime, apiStatus, isDarkMode, onThemeChange }) => {
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
          <span className="header-status-text">主题:</span>
          <Switch
            checked={isDarkMode}
            onChange={onThemeChange}
            checkedChildren="暗"
            unCheckedChildren="亮"
            size="small"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="header-status-text">API连接状态:</span>
          {apiStatus === 'connected' ? (
            <CheckCircleOutlined style={{ color: '#52C41A', fontSize: '18px', marginLeft: '5px' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#FF4D4F', fontSize: '18px', marginLeft: '5px' }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
