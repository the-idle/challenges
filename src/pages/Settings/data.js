// 系统设置页面 mock 数据

export const mockSystemSettings = {
  refreshInterval: 30,
  maxRetries: 3,
  logLevel: 'info',
  enablePrediction: true,
  enableNotification: true
};

export const mockThresholdSettings = [
  { id: '1', deviceType: '电机', paramName: '温度', warningThreshold: 75, dangerThreshold: 85, unit: '°C', enabled: true },
  { id: '2', deviceType: '电机', paramName: '振动', warningThreshold: 2.5, dangerThreshold: 3.5, unit: 'mm/s', enabled: true },
  { id: '3', deviceType: '泵', paramName: '压力', warningThreshold: 0.8, dangerThreshold: 1.0, unit: 'MPa', enabled: true },
  { id: '4', deviceType: '风机', paramName: '电流', warningThreshold: 15, dangerThreshold: 18, unit: 'A', enabled: true },
  { id: '5', deviceType: '压缩机', paramName: '温度', warningThreshold: 90, dangerThreshold: 105, unit: '°C', enabled: true },
  { id: '6', deviceType: '加热器', paramName: '温度', warningThreshold: 110, dangerThreshold: 130, unit: '°C', enabled: true },
  { id: '7', deviceType: 'PLC', paramName: '信号强度', warningThreshold: 90, dangerThreshold: 80, unit: '%', enabled: true }
];

export const mockUserList = [
  { id: '1', username: 'admin', name: '系统管理员', email: 'admin@example.com', role: 'admin', createdAt: '2024-01-01', status: 'active' },
  { id: '2', username: 'operator1', name: '张工', email: 'operator1@example.com', role: 'operator', createdAt: '2024-01-02', status: 'active' },
  { id: '3', username: 'viewer1', name: '李工', email: 'viewer1@example.com', role: 'viewer', createdAt: '2024-01-03', status: 'inactive' },
  { id: '4', username: 'operator2', name: '王工', email: 'operator2@example.com', role: 'operator', createdAt: '2024-01-04', status: 'active' },
  { id: '5', username: 'viewer2', name: '赵工', email: 'viewer2@example.com', role: 'viewer', createdAt: '2024-01-05', status: 'active' },
  { id: '6', username: 'maintainer', name: '钱工', email: 'maintainer@example.com', role: 'operator', createdAt: '2024-01-06', status: 'inactive' }
]; 