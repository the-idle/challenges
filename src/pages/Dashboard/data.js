// 系统概览页面 mock 数据

export const mockDashboardStats = {
  totalDevices: 256,
  onlineDevices: 230,
  warningDevices: 18,
  offlineDevices: 8,
  maintenanceCount: 22,
  predictionAccuracy: 96.8
};

export const mockDevicePerformance = {
  categories: ['电机', '泵', '阀门', '传感器', '控制器', '变频器', 'PLC', '风机', '压缩机', '加热器'],
  data: [
    { name: '正常运行', value: 180 },
    { name: '轻微异常', value: 48 },
    { name: '需要维护', value: 28 }
  ]
};

export const mockAlarmStatistics = {
  total: 56,
  critical: 11,
  warning: 31,
  info: 14,
  trend: [
    { date: '2024-01-01', count: 6 },
    { date: '2024-01-02', count: 8 },
    { date: '2024-01-03', count: 7 },
    { date: '2024-01-04', count: 10 },
    { date: '2024-01-05', count: 5 },
    { date: '2024-01-06', count: 9 },
    { date: '2024-01-07', count: 11 }
  ]
};

export const mockWarningList = [
  {
    id: 1,
    deviceName: '电机A-001',
    type: '温度过高',
    level: 'critical',
    value: '92°C',
    threshold: '80°C',
    time: '2024-01-07 14:30:00'
  },
  {
    id: 2,
    deviceName: '泵B-002',
    type: '振动异常',
    level: 'warning',
    value: '3.5mm/s',
    threshold: '2.5mm/s',
    time: '2024-01-07 14:25:00'
  },
  {
    id: 3,
    deviceName: '阀门C-003',
    type: '压力过低',
    level: 'warning',
    value: '0.4MPa',
    threshold: '0.8MPa',
    time: '2024-01-07 13:50:00'
  },
  {
    id: 4,
    deviceName: '传感器D-004',
    type: '信号丢失',
    level: 'critical',
    value: '--',
    threshold: '--',
    time: '2024-01-07 13:20:00'
  },
  {
    id: 5,
    deviceName: '风机E-005',
    type: '电流异常',
    level: 'warning',
    value: '18A',
    threshold: '15A',
    time: '2024-01-07 12:50:00'
  },
  {
    id: 6,
    deviceName: '压缩机F-006',
    type: '温度过高',
    level: 'critical',
    value: '105°C',
    threshold: '90°C',
    time: '2024-01-07 12:30:00'
  }
];

export const mockRegionalDeviceData = [
  { region: 'A区', total: 70, online: 65, warning: 3, offline: 2 },
  { region: 'B区', total: 62, online: 58, warning: 2, offline: 2 },
  { region: 'C区', total: 64, online: 58, warning: 4, offline: 2 },
  { region: 'D区', total: 60, online: 49, warning: 9, offline: 2 }
];
