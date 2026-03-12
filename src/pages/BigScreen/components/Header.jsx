import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Switch } from 'antd';

const Header = ({ title, currentTime, apiStatus, wsStatus, wsLatencyMs, isDarkMode, onThemeChange }) => {
  const [stableWsStatus, setStableWsStatus] = useState(wsStatus);
  const wsStatusTimerRef = useRef(null);

  useEffect(() => {
    if (wsStatus === 'connected') {
      if (wsStatusTimerRef.current) {
        clearTimeout(wsStatusTimerRef.current);
        wsStatusTimerRef.current = null;
      }
      setStableWsStatus('connected');
      return;
    }
    if (wsStatusTimerRef.current) {
      clearTimeout(wsStatusTimerRef.current);
    }
    wsStatusTimerRef.current = setTimeout(() => {
      setStableWsStatus('disconnected');
      wsStatusTimerRef.current = null;
    }, 1200);
    return () => {
      if (wsStatusTimerRef.current) {
        clearTimeout(wsStatusTimerRef.current);
        wsStatusTimerRef.current = null;
      }
    };
  }, [wsStatus]);

  const wsLatencyText = useMemo(() => {
    if (wsLatencyMs === null || wsLatencyMs === undefined || !Number.isFinite(Number(wsLatencyMs))) {
      return '--ms';
    }
    return `${Math.max(0, Math.round(Number(wsLatencyMs)))}ms`;
  }, [wsLatencyMs]);

  return (
    <div className="big-screen-header">
      <div className="header-time">
        {currentTime}
      </div>

      <div className="header-title">
        <SafetyCertificateOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />
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
          {stableWsStatus === 'connected' ? (
            <CheckCircleOutlined style={{ color: '#52C41A', fontSize: '18px', marginLeft: '5px' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#FF4D4F', fontSize: '18px', marginLeft: '5px' }} />
          )}
          <span className="ws-latency">{wsLatencyText}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
