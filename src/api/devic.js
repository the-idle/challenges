// 前端模拟设备数据，移除后端请求依赖

// 统一使用与页面期望一致的数据结构：
// - deviceId: string
// - deviceName: string
// - status: '预警' | '故障' | 其他(视为正常)
// - temperature?: number
// - vibration?: number
// - 其他字段页面会在各自处所扩充

const mockDevices = [
  { deviceId: 'D-001', deviceName: '电机A-001', status: '正常', temperature: 65, vibration: 2.1 },
  { deviceId: 'D-002', deviceName: '泵B-002', status: '预警', temperature: 78, vibration: 2.8 },
  { deviceId: 'D-003', deviceName: '阀门C-003', status: '故障', temperature: 45, vibration: 1.1 },
  { deviceId: 'D-004', deviceName: '传感器D-004', status: '正常', temperature: 30, vibration: 0.8 },
  { deviceId: 'D-005', deviceName: '风机E-005', status: '预警', temperature: 72, vibration: 2.6 },
  { deviceId: 'D-006', deviceName: '压缩机F-006', status: '正常', temperature: 90, vibration: 3.1 },
  { deviceId: 'D-007', deviceName: '加热器G-007', status: '正常', temperature: 110, vibration: 1.5 },
  { deviceId: 'D-008', deviceName: 'PLC-H-008', status: '正常', temperature: 40, vibration: 0.5 },
  { deviceId: 'D-009', deviceName: '变频器I-009', status: '预警', temperature: 70, vibration: 2.7 },
  { deviceId: 'D-010', deviceName: '控制器J-010', status: '故障', temperature: 50, vibration: 1.0 }
];

export const getDeviceList = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: 200, rows: mockDevices });
    }, 300);
  });
};

export const getDeviceDetail = (id) => {
  return new Promise((resolve) => {
    const base = mockDevices.find(d => d.deviceId === id) || mockDevices[0];
    const detail = {
      ...base,
      model: 'Y2-280M-4',
      manufacturer: '西门子',
      lastMaintenance: '2025-09-20',
      metrics: {
        temperature: { current: base.temperature || 60, warning: 75, danger: 85 },
        vibration: { current: base.vibration || 1.5, warning: 2.5, danger: 3.5 },
      }
    };
    setTimeout(() => resolve({ code: 200, data: detail }), 300);
  });
};

