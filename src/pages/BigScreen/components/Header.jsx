import React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const Header = ({ title, currentTime, apiStatus }) => {
  return (
    <div className="big-screen-header">
      <div className="header-time">
        {currentTime}
      </div>

      <div className="header-title">
        <h1>{title}</h1>
      </div>

      <div className="header-status">
        <span className="header-status-text" style={{ color: '#333' }}>API连接状态:</span>
        {apiStatus === 'connected' ? (
          <CheckCircleOutlined style={{ color: '#52C41A', fontSize: '18px', marginLeft: '5px' }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#FF4D4F', fontSize: '18px', marginLeft: '5px' }} />
        )}
      </div>
    </div>
  );
};

export default Header;
