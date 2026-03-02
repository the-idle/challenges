// 前端模拟告警数据，移除后端请求依赖

const mockAlarms = [
  { id: 'A001', deviceId: 'D-002', deviceName: '泵B-002', type: '温度预警', level: 'warning', time: '2025-10-10 10:15:20', status: 'active' },
  { id: 'A002', deviceId: 'D-005', deviceName: '风机E-005', type: '振动异常', level: 'warning', time: '2025-10-10 10:10:05', status: 'active' },
  { id: 'A003', deviceId: 'D-003', deviceName: '阀门C-003', type: '设备故障', level: 'error', time: '2025-10-10 09:58:42', status: 'active' },
];

export const getAlarmList = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ code: 200, rows: mockAlarms }), 200);
  });
};

export const getAlarmDetail = (id) => {
  return new Promise((resolve) => {
    const found = mockAlarms.find(a => a.id === id) || mockAlarms[0];
    setTimeout(() => resolve({ code: 200, data: found }), 200);
  });
};
