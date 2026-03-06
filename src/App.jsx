import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 导入页面组件
import Dashboard from './pages/Dashboard';
import DeviceMonitoring from './pages/DeviceMonitoring';
import HistoricalData from './pages/HistoricalData';
import MaintenanceSuggestions from './pages/MaintenanceSuggestions';
import IndustrialQA from './pages/IndustrialQA';
import Settings from './pages/Settings';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#0A1F3C',
          colorError: '#FF4D4F',
          colorSuccess: '#52C41A',
          colorWarning: '#FAAD14',
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="device-monitoring" element={<DeviceMonitoring />} />
            <Route path="historical-data" element={<HistoricalData />} />
            <Route path="maintenance-suggestions" element={<MaintenanceSuggestions />} />
            <Route path="industrial-qa" element={<IndustrialQA />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
